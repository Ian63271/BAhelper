import { studentIcons, studentPortraits } from '@/types/imageMap';

// Bundled art first; students that arrived via a remote data update (and so
// aren't in the static image bundle) fall back to SchaleDB's CDN.
type ImageSource = number | { uri: string };

export function studentIconSource(id: number): ImageSource {
  return studentIcons[id] ?? { uri: `https://schaledb.com/images/student/icon/${id}.webp` };
}

export function studentPortraitSource(id: number): ImageSource {
  return studentPortraits[id] ?? { uri: `https://schaledb.com/images/student/portrait/${id}.webp` };
}
