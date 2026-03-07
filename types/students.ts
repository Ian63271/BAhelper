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
  weapon?: {             // Nested object
    name: string;
    desc: string;
  };
  summons?: any[];       // SchaleDB uses this for Tactical Support vehicles
  limited?: number[];      // 0 = Permanent, 1 = Limited, 2 = Event

  // --- CAFE & AFFECTION (Optional for NPCs) ---
  l2d?: number;
  bondGear?: {           // Nested object
    released: boolean[];
    name: string;
    desc: string;
  };
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