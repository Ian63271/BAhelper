import AsyncStorage from '@react-native-async-storage/async-storage';

import bundledManifest from '@/data/manifest.json';
import { BannerData } from '@/types/banners';
import { Students } from '@/types/students';
import { bannerData } from '@/utils/bannerUtils';
import { loadJson, saveJson, STORAGE_KEYS } from '@/utils/storage';
import { allStudents, studentById } from '@/utils/studentUtils';

// Remote copies of the tracked data files. A newer `dataVersion` in the
// remote manifest is the only trigger for a download, so a stale remote
// (e.g. unpushed local commits) can never downgrade the bundled data.
const RAW_BASE = 'https://raw.githubusercontent.com/Ian63271/BAhelper/master/data';

export const BUNDLED_DATA_VERSION: number = (bundledManifest as { dataVersion: number }).dataVersion;

export interface DataMeta {
  dataVersion: number;
  syncedAt: number;
}

export type UpdateCheckResult = 'updated' | 'current' | 'unreachable' | 'invalid';

// Snapshots taken before any remote data is applied, so downloaded data can
// be reverted without an app restart. (`bannerData` is the imported JSON
// module object itself — its original fields are gone once overwritten.)
const bundledStudents: Students[] = [...allStudents];
const bundledBanners: BannerData = { ...bannerData };

function isValidStudents(data: unknown): data is Students[] {
  return (
    Array.isArray(data) &&
    data.length >= 200 &&
    data.every((s) => s && typeof s.id === 'number' && typeof s.name === 'string')
  );
}

function isValidBanners(data: unknown): data is BannerData {
  const b = data as BannerData;
  return !!b && typeof b.generatedAt === 'number' && Array.isArray(b.banners);
}

// Swaps the new data into the module-level exports in place, so every
// consumer of `allStudents`/`studentById`/`bannerData` sees it on the next
// render (the DataSyncProvider bumps its version state to trigger one).
function applyData(students: Students[] | null, banners: BannerData | null): void {
  if (students) {
    allStudents.splice(0, allStudents.length, ...students);
    studentById.clear();
    for (const s of students) studentById.set(s.id, s);
  }
  if (banners) {
    bannerData.generatedAt = banners.generatedAt;
    bannerData.offsetDays = banners.offsetDays;
    bannerData.banners = banners.banners;
  }
}

export function restoreBundledData(): void {
  applyData(bundledStudents, bundledBanners);
}

export async function clearDownloadedData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.dataMeta, STORAGE_KEYS.dataStudents, STORAGE_KEYS.dataBanners]);
  } catch {
    // Best-effort; the restored in-memory data is what matters this session.
  }
}

/**
 * Applies previously downloaded data if it's newer than the bundle.
 * Returns the applied meta, or null when the bundle is authoritative.
 */
export async function hydrateFromCache(): Promise<DataMeta | null> {
  const meta = await loadJson<DataMeta | null>(STORAGE_KEYS.dataMeta, null);
  if (!meta || typeof meta.dataVersion !== 'number' || meta.dataVersion <= BUNDLED_DATA_VERSION) {
    // An app update shipped newer data than the cache — drop the cache.
    if (meta) clearDownloadedData();
    return null;
  }
  const [students, banners] = await Promise.all([
    loadJson<Students[] | null>(STORAGE_KEYS.dataStudents, null),
    loadJson<BannerData | null>(STORAGE_KEYS.dataBanners, null),
  ]);
  const validStudents = isValidStudents(students) ? students : null;
  const validBanners = isValidBanners(banners) ? banners : null;
  if (!validStudents && !validBanners) return null;
  applyData(validStudents, validBanners);
  return meta;
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Checks the remote manifest and, when it's newer than `activeVersion`,
 * downloads + validates + applies + caches the data files.
 */
export async function checkForUpdates(
  activeVersion: number
): Promise<{ result: UpdateCheckResult; meta?: DataMeta }> {
  let manifest: unknown;
  try {
    manifest = await fetchJson(`${RAW_BASE}/manifest.json`, 15000);
  } catch {
    return { result: 'unreachable' };
  }
  const remoteVersion = (manifest as { dataVersion?: unknown })?.dataVersion;
  if (typeof remoteVersion !== 'number') return { result: 'invalid' };
  if (remoteVersion <= activeVersion) return { result: 'current' };

  let students: unknown;
  let banners: unknown;
  try {
    [students, banners] = await Promise.all([
      fetchJson(`${RAW_BASE}/students.json`, 60000),
      fetchJson(`${RAW_BASE}/banners.json`, 60000),
    ]);
  } catch {
    return { result: 'unreachable' };
  }
  if (!isValidStudents(students) || !isValidBanners(banners)) return { result: 'invalid' };

  applyData(students, banners);
  const meta: DataMeta = { dataVersion: remoteVersion, syncedAt: Date.now() };
  await Promise.all([
    saveJson(STORAGE_KEYS.dataStudents, students),
    saveJson(STORAGE_KEYS.dataBanners, banners),
    saveJson(STORAGE_KEYS.dataMeta, meta),
  ]);
  return { result: 'updated', meta };
}
