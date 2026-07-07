// Mirrors SchaleDB's CharacterStats (common.js) for Standard stat growth so
// displayed numbers match theirs exactly. The toFixed(4) round-trip is part of
// the formula — do not simplify it away.

import { equipmentStats } from '@/constants/equipmentStats';

// Current in-game caps: student level 90; unique weapon 1–4★, each star
// raising the weapon level cap by 10 (1★→30 … 4★→60 aka "UE60").
export const STUDENT_MAX_LEVEL = 90;
export const WEAPON_MAX_STARS = 4;
export const BOND_MAX_LEVEL = 100; // stat gains stop at 50, but rank goes to 100
export const POTENTIAL_MAX = 25;   // per track (MaxHP / AttackPower / HealPower)

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

// SchaleDB's interpolateStat: level lerp with the toFixed(4) truncations,
// rounded — no star transcendence, no ceil.
function interpolateStat(stat1: number, stat100: number, level: number): number {
  const levelScale = Number(((level - 1) / 99).toFixed(4));
  return Math.round(Number((stat1 + (stat100 - stat1) * levelScale).toFixed(4)));
}

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
  return Math.ceil(Number((interpolateStat(stat1, stat100, level) * transcendence).toFixed(4)));
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

// --- Stat buff combination (SchaleDB CharacterStats) ---------------------
// Each stat accumulates flat and coefficient buffs; the total is
//   round(((base + flat) * (1 + coefficient)).toFixed(4))
// so percent (gear) buffs multiply AFTER weapon/bond/potential flats.

export type StatBuffs = Record<string, { flat: number; coefficient: number }>;

// statType is a SchaleDB stat name with an optional _Base/_Coefficient suffix
// (bond FavorStatType names come plain — those are flat). Coefficient values
// are in basis points (10000 = +100%).
export function addBuff(buffs: StatBuffs, statType: string, value: number): void {
  const isCoefficient = statType.endsWith('_Coefficient');
  const stat = statType.replace(/_(Base|Coefficient)$/, '');
  const entry = (buffs[stat] ??= { flat: 0, coefficient: 0 });
  if (isCoefficient) entry.coefficient += value / 10000;
  else entry.flat += value;
}

export function combineStat(base: number, buffs: StatBuffs, stat: string): number {
  const buff = buffs[stat];
  if (!buff) return base;
  // SchaleDB floors the multiplier at 0.2 for debuffs; kept for fidelity even
  // though this UI only produces positive buffs.
  const coefficient = Math.max(1 + buff.coefficient, 0.2);
  return Math.round(Number(((base + buff.flat) * coefficient).toFixed(4)));
}

// Flat bond-rank bonuses for the student's two FavorStatType stats
// (SchaleDB getBondStats). Gains stop at bond 50; level 1 grants nothing.
export function calcBondStats(favorStatValue: number[][], level: number): [number, number] {
  let stat1 = 0;
  let stat2 = 0;
  for (let i = 1; i < Math.min(level, 50); i++) {
    const row = i < 20
      ? favorStatValue[Math.floor(i / 5)]
      : favorStatValue[2 + Math.floor(i / 10)];
    stat1 += row[0];
    stat2 += row[1];
  }
  return [stat1, stat2];
}

// Flat talent/potential bonus: 0.2% of the level-lerped base (no
// transcendence) per potential level, rounded.
export function calcPotentialStat(
  stat1: number,
  stat100: number,
  level: number,
  potentialLevel: number,
): number {
  if (potentialLevel <= 0) return 0;
  return Math.round(interpolateStat(stat1, stat100, level) * (potentialLevel * 0.002));
}

// Accumulates one gear slot's bonuses (tier 0 = nothing equipped).
export function addEquipmentBuffs(buffs: StatBuffs, category: string, tier: number): void {
  if (tier <= 0) return;
  const gear = equipmentStats[category]?.[tier - 1];
  if (!gear) return;
  gear.statType.forEach((statType, i) => addBuff(buffs, statType, gear.statValue[i]));
}
