// Affection (bond) EXP data, sourced from https://bluearchive.wiki/wiki/Affection_Exp_table
// BOND_XP_TO_NEXT[i] = EXP needed to go from level i+1 to level i+2.
export const BOND_XP_TO_NEXT: number[] = [
  15, 30, 30, 35, 35, 35, 40, 40, 40, 60, 90, 105, 120, 140, 160, 180, 205, 230, 255, 285, 315, 345, 375, 410, 445, 480, 520, 560, 600, 645, 690, 735, 780, 830, 880, 930, 985, 1040, 1095, 1155, 1215, 1275, 1335, 1400, 1465, 1530, 1600, 1670, 1740, 1815, 1890, 1965, 2040, 2120, 2200, 2280, 2365, 2450, 2535, 2625, 2715, 2805, 2895, 2990, 3085, 3180, 3280, 3380, 3480, 3585, 3690, 3795, 3900, 4010, 4120, 4230, 4345, 4460, 4575, 4695, 4815, 4935, 5055, 5180, 5305, 5430, 5560, 5690, 5820, 5955, 6090, 6225, 6360, 6500, 6640, 6780, 6925, 7070, 7215, 7365,
];

export const BOND_MAX_LEVEL = 100;

export interface BondSource { label: string; xp: number }

export const BOND_SOURCES: BondSource[] = [
  { label: 'Headpat (cafe)', xp: 15 },
  { label: 'Normal gift', xp: 20 },
  { label: 'SR liked gift', xp: 40 },
  { label: 'SR favorite gift', xp: 60 },
  { label: 'SR beloved gift', xp: 80 },
  { label: 'SSR liked gift', xp: 120 },
  { label: 'SSR favorite gift', xp: 180 },
  { label: 'SSR beloved gift', xp: 240 },
];
