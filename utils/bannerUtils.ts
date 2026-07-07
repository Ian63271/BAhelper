import bannersJson from '@/data/banners.json';
import { Banner, BannerData, BannerStudent, BannerType, BannerWindow } from '@/types/banners';

export const bannerData = bannersJson as BannerData;

// The permanent "Archive" pickup spans years — it's not a rotation banner and
// stays out of current/upcoming lists.
const MAX_BANNER_DURATION_MS = 60 * 24 * 60 * 60 * 1000;

export type BannerStatus = 'current' | 'upcoming' | 'predicted';

// One display card: banners of the same type sharing a Global window (the
// wiki tracks each rateup as its own run, but concurrent pickups read as one
// banner wave in-game).
export interface BannerGroup {
  key: string;
  status: BannerStatus;
  type: BannerType;
  /** True when every run in the group is a rerun. */
  allRerun: boolean;
  start: number;
  end: number;
  students: BannerStudent[];
}

function windowFor(banner: Banner, now: number): { status: BannerStatus; win: BannerWindow } | null {
  if (banner.global) {
    if (banner.global.end - banner.global.start > MAX_BANNER_DURATION_MS) return null;
    if (banner.global.end < now) return null;
    return { status: banner.global.start <= now ? 'current' : 'upcoming', win: banner.global };
  }
  if (banner.predictedGlobal) {
    if (banner.predictedGlobal.end < now) return null;
    return { status: 'predicted', win: banner.predictedGlobal };
  }
  return null;
}

// Current and future Global banners, grouped into display cards: running
// banners first (soonest to end), then confirmed/predicted by start date.
export function getBannerGroups(now: number = Date.now()): BannerGroup[] {
  const groups = new Map<string, BannerGroup>();
  for (const banner of bannerData.banners) {
    const placed = windowFor(banner, now);
    if (!placed) continue;
    const { status, win } = placed;
    const key = `${status}:${banner.type}:${win.start}:${win.end}`;
    const existing = groups.get(key);
    if (existing) {
      existing.allRerun = existing.allRerun && banner.rerun;
      for (const s of banner.students) {
        if (!existing.students.some((e) => e.name === s.name)) existing.students.push(s);
      }
    } else {
      groups.set(key, {
        key,
        status,
        type: banner.type,
        allRerun: banner.rerun,
        start: win.start,
        end: win.end,
        students: [...banner.students],
      });
    }
  }
  return [...groups.values()].sort((a, b) => {
    const aCurrent = a.status === 'current';
    const bCurrent = b.status === 'current';
    if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
    return aCurrent ? a.end - b.end : a.start - b.start || a.type.localeCompare(b.type);
  });
}

export const bannerTypeLabels: Record<string, string> = {
  PickupGacha: 'Pickup',
  LimitedGacha: 'Limited',
  FesGacha: 'Fes',
  SelectPickupGacha: 'Selector',
  SelectPickupLimitedGacha: 'Limited Selector',
  SelectPickupFesGacha: 'Fes Selector',
};

// Plain pickups don't need a badge; Limited/Fes/Selector do.
export function isSpecialBannerType(type: BannerType): boolean {
  return type !== 'PickupGacha';
}

// ---------- Formatting ----------

const DAY_MS = 24 * 60 * 60 * 1000;

export function formatBannerDate(ms: number, now: number = Date.now()): string {
  const date = new Date(ms);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

export function formatBannerRange(start: number, end: number, now: number = Date.now()): string {
  return `${formatBannerDate(start, now)} – ${formatBannerDate(end, now)}`;
}

// Day-granularity countdown label for a group: how long a running banner
// lasts, or how far off an upcoming one is.
export function bannerCountdownLabel(group: BannerGroup, now: number = Date.now()): string {
  if (group.status === 'current') {
    const days = Math.ceil((group.end - now) / DAY_MS);
    return days <= 1 ? 'Ends today' : `Ends in ${days}d`;
  }
  const days = Math.ceil((group.start - now) / DAY_MS);
  const label = days <= 1 ? 'Tomorrow' : `In ${days}d`;
  return group.status === 'predicted' ? `~${label.toLowerCase()}` : label;
}
