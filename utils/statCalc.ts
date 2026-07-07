// Mirrors SchaleDB's CharacterStats (common.js) for Standard stat growth so
// displayed numbers match theirs exactly. The toFixed(4) round-trip is part of
// the formula — do not simplify it away.

// Current in-game caps: student level 90; unique weapon 1–4★, each star
// raising the weapon level cap by 10 (1★→30 … 4★→60 aka "UE60").
export const STUDENT_MAX_LEVEL = 90;
export const WEAPON_MAX_STARS = 4;

export function weaponMaxLevel(weaponStars: number): number {
  return 20 + weaponStars * 10;
}

export type ScaledStatKind = 'attack' | 'hp' | 'heal' | 'defense';

// Per-star transcendence bonuses in basis points, summed cumulatively over the
// first `starGrade` entries. Defense does not scale with stars.
const TRANSCENDENCE: Record<ScaledStatKind, number[]> = {
  attack: [0, 1000, 1200, 1400, 1700],
  hp: [0, 500, 700, 900, 1400],
  heal: [0, 750, 1000, 1200, 1500],
  defense: [0, 0, 0, 0, 0],
};

export function calcStat(
  stat1: number,
  stat100: number,
  level: number,
  starGrade: number,
  kind: ScaledStatKind,
): number {
  let transcendence = 1;
  for (let i = 0; i < starGrade; i++) {
    transcendence += (TRANSCENDENCE[kind][i] ?? 0) / 10000;
  }
  const levelScale = Number(((level - 1) / 99).toFixed(4));
  const atLevel = Math.round(Number((stat1 + (stat100 - stat1) * levelScale).toFixed(4)));
  return Math.ceil(Number((atLevel * transcendence).toFixed(4)));
}

// Unique-weapon bonus, added flat to the character's ATK/HP/Healing (SchaleDB's
// addWeaponBonuses). Only the Standard growth type truncates the level scale.
export function calcWeaponStat(
  stat1: number | undefined,
  stat100: number | undefined,
  level: number,
  growthType: string | undefined,
): number {
  if (stat1 === undefined || stat100 === undefined) return 0;
  let levelScale = (level - 1) / 99;
  if (growthType === 'Standard') levelScale = Number(levelScale.toFixed(4));
  return Math.round(stat1 + (stat100 - stat1) * levelScale);
}
