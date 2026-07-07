export interface Skill {
  name: string;
  desc: string;          // May contain <?N> parameter and <b|d|c|s:Buff> tags — see utils/skillText.ts
  parameters?: string[][]; // [placeholder][skillLevel - 1]
  icon: string;          // Key into skillIcons in types/imageMap.ts
}

export interface StudentStats {
  maxHP1: number;
  maxHP100: number;
  attack1: number;
  attack100: number;
  defense1: number;
  defense100: number;
  heal1: number;
  heal100: number;
  stability: number;
  dodge: number;
  accuracy: number;
  crit: number;
  critDamage: number;    // Displayed as value / 100 percent (20000 -> 200%)
  ammoCount: number;
  ammoCost: number;
  range: number;
  regenCost: number;
}

export interface Students {
  // --- CORE & IDENTITY (Mandatory) ---
  id: number;
  defaultOrder: number;
  name: string;
  fullName: string;
  playable: boolean;
  imagePath: string;
  icon: string;
  halo?: string;      // Mandatory: Students only
  school: string;    // Mandatory: Everyone belongs to a school/faction
  hasAlts: number[]; // Mandatory: Default to []

  // --- LORE & PROFILE (Optional for unreleased/NPCs) ---
  alt?: string;
  club?: string;
  year?: string;     // Updated to string (e.g., "2nd Year")
  age?: string;
  birthday?: string;
  bdayNum?: string;
  height?: string;
  hobbies?: string;
  profile?: string;
  newQuote?: string;
  background?: string;

  // --- GAMEPLAY & COMBAT (Optional for NPCs) ---
  baseStars?: number;
  damageType?: string;
  armorType?: string;
  combatClass?: string;
  role?: string;
  position?: string;
  mood?: number[];       // Array of 3 numbers: [Urban, Outdoor, Indoor]
  equipment?: string[];  // Array of 3 strings: e.g., ["Hat", "Hairpin", "Watch"]
  weaponType?: string;
  weaponImg?: string;
  weapon?: {             // Unique weapon: lore + flat stat bonuses (see utils/statCalc.ts)
    name: string;
    desc: string;
    attack1?: number;
    attack100?: number;
    maxHP1?: number;
    maxHP100?: number;
    heal1?: number;
    heal100?: number;
    growthType?: string;       // 'Standard' | 'LateBloom' | 'Premature'
    adaptationType?: string;   // Terrain improved at UE 3★ (Street/Outdoor/Indoor)
    adaptationValue?: number;
  };
  summons?: any[];       // SchaleDB uses this for Tactical Support vehicles
  limited?: number[];      // 0 = Permanent, 1 = Limited, 2 = Event
  stats?: StudentStats;
  skills?: {
    ex?: Skill & { cost: number[] }; // EX levels 1-5; cost per level
    public?: Skill;        // Basic Skill (levels 1-10, like the rest below)
    gearPublic?: Skill;    // Basic Skill+ (bond-gear upgrade)
    passive?: Skill;       // Enhanced Skill
    weaponPassive?: Skill; // Enhanced Skill+ (unique-weapon upgrade)
    extraPassive?: Skill;  // Sub Skill
  };

  // --- CAFE & AFFECTION (Optional for NPCs) ---
  l2d?: number;
  bondGear?: {           // Nested object; absent when the student has no bond gear yet
    released: boolean[];
    name: string;
    desc: string;
    statType?: string[];   // e.g. ["CriticalDamageRate_Base"] — applied flat when gear is active
    statValue?: number[][]; // [i][1] is the applied value (T2 gear)
  };
  favorStatType?: string[];   // Two stat names buffed by bond rank (flat), e.g. ["AttackPower", "MaxHP"]
  favorStatValue?: number[][]; // 7-row tier table consumed by calcBondStats (utils/statCalc.ts)
  favoriteGifts?: string[]; // Kept in case you add them manually later
  likedGifts?: string[];    // Kept in case you add them manually later

  // --- META & MEDIA (Optional) ---
  designer?: string;
  illustrator?: string;
  lobbyIllustrator?: string;
  voice?: string;
  releaseJP?: string;
  releaseGL?: string;
}