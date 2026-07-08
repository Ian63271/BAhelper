import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  BUNDLED_DATA_VERSION,
  checkForUpdates,
  clearDownloadedData,
  hydrateFromCache,
  restoreBundledData,
  UpdateCheckResult,
} from '@/utils/dataSync';

export type SyncStatus = 'idle' | 'checking' | UpdateCheckResult;

interface DataSyncValue {
  /**
   * Version (unix ms) of the game data currently applied. Also serves as the
   * re-render/memo dependency for screens that derive lists from
   * `allStudents`/`bannerData`, which are swapped in place on update.
   */
  activeVersion: number;
  source: 'bundled' | 'downloaded';
  /** When the downloaded data was fetched; null when running on the bundle. */
  syncedAt: number | null;
  status: SyncStatus;
  refresh: () => Promise<void>;
  clearDownloaded: () => Promise<void>;
}

const DataSyncContext = createContext<DataSyncValue | null>(null);

export function DataSyncProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeVersion, setActiveVersion] = useState(BUNDLED_DATA_VERSION);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  // Mirror for async callbacks (avoids re-creating refresh on every update).
  const activeVersionRef = useRef(BUNDLED_DATA_VERSION);
  const checkInFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (checkInFlight.current) return;
    checkInFlight.current = true;
    setStatus('checking');
    try {
      const { result, meta } = await checkForUpdates(activeVersionRef.current);
      if (result === 'updated' && meta) {
        activeVersionRef.current = meta.dataVersion;
        setActiveVersion(meta.dataVersion);
        setSyncedAt(meta.syncedAt);
      }
      setStatus(result);
    } catch {
      setStatus('unreachable');
    } finally {
      checkInFlight.current = false;
    }
  }, []);

  const clearDownloaded = useCallback(async () => {
    await clearDownloadedData();
    restoreBundledData();
    activeVersionRef.current = BUNDLED_DATA_VERSION;
    setActiveVersion(BUNDLED_DATA_VERSION);
    setSyncedAt(null);
    setStatus('idle');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const meta = await hydrateFromCache();
      if (cancelled) return;
      if (meta) {
        activeVersionRef.current = meta.dataVersion;
        setActiveVersion(meta.dataVersion);
        setSyncedAt(meta.syncedAt);
      }
      setIsHydrated(true);
      // Background check; failures are silent here and only surface when the
      // user checks manually from Settings.
      refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const value = useMemo<DataSyncValue>(
    () => ({
      activeVersion,
      source: syncedAt === null ? 'bundled' : 'downloaded',
      syncedAt,
      status,
      refresh,
      clearDownloaded,
    }),
    [activeVersion, syncedAt, status, refresh, clearDownloaded]
  );

  // Hold the first frame until cached data (if any) is applied, so screens
  // never derive lists from the bundle and re-memo on stale inputs.
  if (!isHydrated) return null;

  return <DataSyncContext.Provider value={value}>{children}</DataSyncContext.Provider>;
}

export function useDataSync(): DataSyncValue {
  const ctx = useContext(DataSyncContext);
  if (!ctx) throw new Error('useDataSync must be used inside DataSyncProvider');
  return ctx;
}
