// BAhelper design tokens — Blue Archive flavored palette.

export const colors = {
  // Core palette
  primary: '#128AFA',        // BA sky blue
  primaryDark: '#0B6BC4',
  primarySoft: '#E3F0FE',    // light blue tint for chips/selected states
  accent: '#FFC928',         // halo yellow
  background: '#F2F6FB',     // near-white blue tint
  surface: '#FFFFFF',
  surfaceAlt: '#F7FAFD',
  border: '#DCE6F2',

  // Text
  text: '#1B2A41',           // dark navy
  textSecondary: '#5A6E8C',
  textOnPrimary: '#FFFFFF',
  textMuted: '#8CA0B8',

  // Feedback
  danger: '#E4405F',
  success: '#2BB673',

  // Dark hero sections (home header, detail header)
  heroBg: '#1B2A41',
  heroText: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// In-game color conventions: each damage type is strong against the armor
// type that shares its color.
export const damageTypeColors: Record<string, string> = {
  Explosion: '#A70C19',
  Pierce: '#B26D1F',
  Mystic: '#216F9C',
  Sonic: '#9431A5',
};

export const armorTypeColors: Record<string, string> = {
  LightArmor: '#A70C19',
  HeavyArmor: '#B26D1F',
  Unarmed: '#216F9C',
  ElasticArmor: '#9431A5',
  CompositeArmor: '#4B5563',
};

export const damageTypeLabels: Record<string, string> = {
  Explosion: 'Explosive',
  Pierce: 'Piercing',
  Mystic: 'Mystic',
  Sonic: 'Sonic',
};

export const armorTypeLabels: Record<string, string> = {
  LightArmor: 'Light',
  HeavyArmor: 'Heavy',
  Unarmed: 'Special',
  ElasticArmor: 'Elastic',
  CompositeArmor: 'Composite',
};

export const roleLabels: Record<string, string> = {
  DamageDealer: 'Dealer',
  Tanker: 'Tank',
  Supporter: 'Support',
  Healer: 'Healer',
  Vehicle: 'Vehicle',
};

export const schoolLabels: Record<string, string> = {
  Abydos: 'Abydos',
  Arius: 'Arius',
  ETC: 'Others',
  Gehenna: 'Gehenna',
  Highlander: 'Highlander',
  Hyakkiyako: 'Hyakkiyako',
  Millennium: 'Millennium',
  RedWinter: 'Red Winter',
  Sakugawa: 'Sakugawa',
  Shanhaijing: 'Shanhaijing',
  SRT: 'SRT',
  Tokiwadai: 'Tokiwadai',
  Trinity: 'Trinity',
  Valkyrie: 'Valkyrie',
  WildHunt: 'Wild Hunt',
};

// Adaptation values (mood array) map to in-game letter grades.
export const adaptationGrades = ['D', 'C', 'B', 'A', 'S', 'SS'] as const;

// Daily reset is 04:00 JST = 19:00 UTC on both Global and JP servers.
export const DAILY_RESET_UTC_HOUR = 19;
