import studentsData from '@/data/students.json';
import { Students } from '@/types/students';
import { DAILY_RESET_UTC_HOUR } from '@/constants/theme';

export const allStudents = studentsData as unknown as Students[];

export const studentById = new Map<number, Students>(
  allStudents.map((s) => [s.id, s])
);

// ---------- Daily student ----------

const DAY_MS = 24 * 60 * 60 * 1000;

// A "BA day" flips at the in-game daily reset (19:00 UTC) instead of local
// midnight, so the student of the day changes together with the server.
export function getBADayNumber(date: Date = new Date()): number {
  return Math.floor((date.getTime() - DAILY_RESET_UTC_HOUR * 60 * 60 * 1000) / DAY_MS);
}

export function getNextResetDate(from: Date = new Date()): Date {
  const next = new Date(from);
  next.setUTCHours(DAILY_RESET_UTC_HOUR, 0, 0, 0);
  if (next.getTime() <= from.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

// Small deterministic PRNG so consecutive days don't pick neighboring
// indices (a plain modulo would walk the list in order).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDailyStudent(pool: Students[], date: Date = new Date()): Students | null {
  if (pool.length === 0) return null;
  const rng = mulberry32(getBADayNumber(date) * 2654435761);
  return pool[Math.floor(rng() * pool.length)];
}

export function getRandomStudent(pool: Students[]): Students | null {
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------- Alts ----------

// Alts are named like "Aru (New Year)" — the base name groups a character
// with all of their variants.
export function getBaseName(student: Students): string {
  const idx = student.name.indexOf(' (');
  return idx === -1 ? student.name : student.name.slice(0, idx);
}

export function isAlt(student: Students): boolean {
  return student.name.includes(' (');
}

// One representative per character: the non-alt version when it exists,
// otherwise the earliest variant.
export function collapseAlts(students: Students[]): Students[] {
  const groups = new Map<string, Students>();
  for (const s of students) {
    const key = getBaseName(s);
    const current = groups.get(key);
    if (!current) {
      groups.set(key, s);
    } else if (isAlt(current) && (!isAlt(s) || s.defaultOrder < current.defaultOrder)) {
      groups.set(key, s);
    }
  }
  return [...groups.values()];
}

export function getAltFamily(student: Students): Students[] {
  const base = getBaseName(student);
  return allStudents
    .filter((s) => getBaseName(s) === base)
    .sort((a, b) => a.defaultOrder - b.defaultOrder);
}

// ---------- Birthdays ----------

export interface UpcomingBirthday {
  students: Students[]; // variants of the same character share the entry
  month: number;
  day: number;
  daysUntil: number;
}

export function parseBdayNum(bdayNum?: string): { month: number; day: number } | null {
  if (!bdayNum) return null;
  const [m, d] = bdayNum.split('/').map((n) => parseInt(n, 10));
  if (!m || !d) return null;
  return { month: m, day: d };
}

export function getDaysUntilBirthday(bdayNum: string | undefined, from: Date = new Date()): number | null {
  const parsed = parseBdayNum(bdayNum);
  if (!parsed) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(from.getFullYear(), parsed.month - 1, parsed.day);
  if (next < today) {
    next = new Date(from.getFullYear() + 1, parsed.month - 1, parsed.day);
  }
  return Math.round((next.getTime() - today.getTime()) / DAY_MS);
}

export function getUpcomingBirthdays(from: Date = new Date(), count = 6): UpcomingBirthday[] {
  const byCharacter = new Map<string, UpcomingBirthday>();

  for (const s of allStudents) {
    const parsed = parseBdayNum(s.bdayNum);
    if (!parsed) continue;
    const daysUntil = getDaysUntilBirthday(s.bdayNum, from);
    if (daysUntil === null) continue;

    const key = getBaseName(s);
    const existing = byCharacter.get(key);
    if (existing) {
      existing.students.push(s);
    } else {
      byCharacter.set(key, { students: [s], ...parsed, daysUntil });
    }
  }

  return [...byCharacter.values()]
    .sort((a, b) => a.daysUntil - b.daysUntil || a.students[0].name.localeCompare(b.students[0].name))
    .slice(0, count);
}

// ---------- Search / filter / sort ----------

export interface RosterFilters {
  search: string;
  schools: string[];
  damageTypes: string[];
  armorTypes: string[];
  roles: string[];
  positions: string[];
  weaponTypes: string[];
  stars: number[];
  ownedOnly: boolean;
  favoritesOnly: boolean;
}

export const emptyFilters: RosterFilters = {
  search: '',
  schools: [],
  damageTypes: [],
  armorTypes: [],
  roles: [],
  positions: [],
  weaponTypes: [],
  stars: [],
  ownedOnly: false,
  favoritesOnly: false,
};

export function countActiveFilters(f: RosterFilters): number {
  return (
    f.schools.length +
    f.damageTypes.length +
    f.armorTypes.length +
    f.roles.length +
    f.positions.length +
    f.weaponTypes.length +
    f.stars.length +
    (f.ownedOnly ? 1 : 0) +
    (f.favoritesOnly ? 1 : 0)
  );
}

export function filterStudents(
  students: Students[],
  filters: RosterFilters,
  owned: Set<number>,
  favorites: Set<number>
): Students[] {
  const query = filters.search.trim().toLowerCase();
  return students.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query) && !s.fullName.toLowerCase().includes(query)) return false;
    if (filters.schools.length && !filters.schools.includes(s.school)) return false;
    if (filters.damageTypes.length && (!s.damageType || !filters.damageTypes.includes(s.damageType))) return false;
    if (filters.armorTypes.length && (!s.armorType || !filters.armorTypes.includes(s.armorType))) return false;
    if (filters.roles.length && (!s.role || !filters.roles.includes(s.role))) return false;
    if (filters.positions.length && (!s.position || !filters.positions.includes(s.position))) return false;
    if (filters.weaponTypes.length && (!s.weaponType || !filters.weaponTypes.includes(s.weaponType))) return false;
    if (filters.stars.length && (!s.baseStars || !filters.stars.includes(s.baseStars))) return false;
    if (filters.ownedOnly && !owned.has(s.id)) return false;
    if (filters.favoritesOnly && !favorites.has(s.id)) return false;
    return true;
  });
}

export type SortMode = 'default' | 'name' | 'school' | 'stars' | 'birthday';

export const sortModeLabels: Record<SortMode, string> = {
  default: 'Default',
  name: 'Name',
  school: 'School',
  stars: 'Stars',
  birthday: 'Birthday',
};

export function sortStudents(students: Students[], mode: SortMode, now: Date = new Date()): Students[] {
  const copy = [...students];
  switch (mode) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'school':
      return copy.sort((a, b) => a.school.localeCompare(b.school) || a.name.localeCompare(b.name));
    case 'stars':
      return copy.sort((a, b) => (b.baseStars ?? 0) - (a.baseStars ?? 0) || a.name.localeCompare(b.name));
    case 'birthday':
      return copy.sort((a, b) => {
        const da = getDaysUntilBirthday(a.bdayNum, now) ?? 999;
        const db = getDaysUntilBirthday(b.bdayNum, now) ?? 999;
        return da - db || a.name.localeCompare(b.name);
      });
    default:
      return copy.sort((a, b) => a.defaultOrder - b.defaultOrder);
  }
}

// Distinct values for building filter chip rows.
export function distinctValues(field: (s: Students) => string | undefined): string[] {
  const values = new Set<string>();
  for (const s of allStudents) {
    const v = field(s);
    if (v) values.add(v);
  }
  return [...values].sort();
}
