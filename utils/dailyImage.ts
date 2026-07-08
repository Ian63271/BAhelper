import { Students } from '@/types/students';
import { loadJson, saveJson, STORAGE_KEYS } from '@/utils/storage';
import { getBaseName, mulberry32 } from '@/utils/studentUtils';

// Daily fan-art picks come from safebooru.org's gelbooru-style JSON API:
// no key or login needed, danbooru-style character tags, SFW-curated board.
// (danbooru.donmai.us and gelbooru.com both wall off anonymous API access.)
// Note: the endpoint sends no CORS headers, so on web the fetch is blocked
// by the browser and the card silently hides — native is the target here.
const API_BASE = 'https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1';

export interface DailyImagePost {
  id: number;
  /** Downscaled sample when the board has one, else the full image. */
  imageUrl: string;
  width: number;
  height: number;
  /** Original upload source (usually a pixiv/twitter URL); may be empty. */
  source: string;
}

interface BooruPost {
  id: number;
  file_url?: string;
  sample_url?: string;
  sample?: boolean;
  sample_width?: number;
  sample_height?: number;
  width?: number;
  height?: number;
  rating?: string;
  image?: string;
  source?: string;
}

export function postPageUrl(post: DailyImagePost): string {
  return `https://safebooru.org/index.php?page=post&s=view&id=${post.id}`;
}

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '_');

/**
 * Booru character tag for a student: "Aru (New Year)" →
 * `aru_(new_year)_(blue_archive)`. Collab students (multi-word base names
 * like "Hatsune Miku") use their plain franchise tag without the suffix.
 */
export function studentBooruTag(student: Students): string {
  const base = getBaseName(student);
  if (base.includes(' ')) return normalize(base);
  const variant = /\((.+)\)\s*$/.exec(student.name)?.[1];
  return variant
    ? `${normalize(base)}_(${normalize(variant)})_(blue_archive)`
    : `${normalize(base)}_(blue_archive)`;
}

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function usablePosts(data: unknown): BooruPost[] {
  if (!Array.isArray(data)) return [];
  return (data as BooruPost[]).filter(
    (p) =>
      p &&
      typeof p.id === 'number' &&
      typeof p.file_url === 'string' &&
      IMAGE_EXT.test(p.file_url) &&
      (p.rating === 'general' || p.rating === 'safe') &&
      (p.width ?? 0) > 0 &&
      (p.height ?? 0) > 0
  );
}

async function fetchPosts(tag: string): Promise<BooruPost[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${API_BASE}&limit=100&tags=${encodeURIComponent(tag)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return usablePosts(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

interface DailyImageCache {
  day: number;
  studentId: number;
  /** null = the lookup genuinely found nothing for this day (don't retry). */
  post: DailyImagePost | null;
}

/**
 * Deterministic art pick for a student on a given BA day, cached for the day.
 * Returns null when no suitable post exists; throws on network failure
 * (which is NOT cached, so a later mount retries).
 */
export async function getDailyImage(student: Students, day: number): Promise<DailyImagePost | null> {
  const cached = await loadJson<DailyImageCache | null>(STORAGE_KEYS.dailyImage, null);
  if (cached && cached.day === day && cached.studentId === student.id) return cached.post;

  let posts = await fetchPosts(studentBooruTag(student));
  if (posts.length === 0 && student.name.includes(' (')) {
    // Alt costumes can be sparsely tagged — fall back to the base character.
    posts = await fetchPosts(`${normalize(getBaseName(student))}_(blue_archive)`);
  }

  let post: DailyImagePost | null = null;
  if (posts.length > 0) {
    const rng = mulberry32((day * 2654435761) ^ student.id);
    const p = posts[Math.floor(rng() * posts.length)];
    const useSample = p.sample && p.sample_url && (p.sample_width ?? 0) > 0;
    post = {
      id: p.id,
      imageUrl: useSample ? p.sample_url! : p.file_url!,
      width: useSample ? p.sample_width! : p.width!,
      height: useSample ? p.sample_height! : p.height!,
      source: p.source ?? '',
    };
  }
  await saveJson(STORAGE_KEYS.dailyImage, { day, studentId: student.id, post } satisfies DailyImageCache);
  return post;
}
