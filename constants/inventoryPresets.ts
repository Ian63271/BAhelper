// Inventory-management minigame ("Balancing Schale's Books") round presets.
// Item shapes/counts are in-game facts, re-entered from the event rounds;
// preset structure follows jozsefsallai/ba-tools (MIT), the reference tool.

export interface InventoryItem {
  name: string;
  width: number;
  height: number;
  count: number;
}

export interface InventoryPreset {
  id: string;
  /** Full event name. */
  name: string;
  /** Short label for picker chips. */
  label: string;
  rounds: [InventoryItem, InventoryItem, InventoryItem][];
}

export const INVENTORY_GRID_WIDTH = 9;
export const INVENTORY_GRID_HEIGHT = 5;

type ItemShape = Omit<InventoryItem, 'count'>;

const item = (shape: ItemShape, count: number): InventoryItem => ({ ...shape, count });

// Aoi / General Student Council events
const shoppingBag: ItemShape = { name: 'Shopping Bag', width: 3, height: 2 };
const receipt: ItemShape = { name: 'Receipt', width: 3, height: 1 };
const fountainPen: ItemShape = { name: 'Luxury Fountain Pen', width: 2, height: 1 };
const toyBox: ItemShape = { name: 'Toy Box', width: 4, height: 2 };
const pollackSnack: ItemShape = { name: 'Pollack Roe Flavored Snack', width: 2, height: 2 };
const gamingMagazine: ItemShape = { name: 'Gaming Magazine', width: 3, height: 3 };
const umbrella: ItemShape = { name: 'Umbrella', width: 4, height: 1 };

// Kisaki & Reijo event
const dragonsBeardCandy: ItemShape = { name: "Dragon's Beard Candy", width: 3, height: 2 };
const ludagun: ItemShape = { name: 'Ludagun', width: 3, height: 1 };
const mooncake: ItemShape = { name: 'Mooncake', width: 2, height: 1 };
const mahua: ItemShape = { name: 'Mahua', width: 4, height: 2 };
const almondTofu: ItemShape = { name: 'Almond Tofu', width: 2, height: 2 };
const banji: ItemShape = { name: 'Banji', width: 3, height: 3 };
const tanghulu: ItemShape = { name: 'Tanghulu', width: 4, height: 1 };

// PJ Seminar event
const slippers: ItemShape = { name: 'Slippers', width: 3, height: 2 };
const toothbrush: ItemShape = { name: 'Character Toothbrush', width: 3, height: 1 };
const purpleScarf: ItemShape = { name: 'Purple Scarf', width: 2, height: 1 };
const kivopoly: ItemShape = { name: 'Board Game "KIVOPOLY"', width: 4, height: 2 };
const dakimakura: ItemShape = { name: 'Dakimakura', width: 4, height: 1 };
const characterCushion: ItemShape = { name: 'Character Cushion', width: 3, height: 3 };
const hairband: ItemShape = { name: 'Hairband', width: 2, height: 2 };

// Swimsuit Hyakkaryouran event
const waterRifle: ItemShape = { name: 'Water Rifle', width: 3, height: 2 };
const phoneCase: ItemShape = { name: 'Waterproof Phone Case', width: 3, height: 1 };
const sunscreen: ItemShape = { name: 'Sunscreen', width: 2, height: 1 };
const surfboard: ItemShape = { name: 'Surfboard', width: 4, height: 2 };
const parasol: ItemShape = { name: 'Parasol', width: 4, height: 1 };
const swimFloaty: ItemShape = { name: 'Swim Floaty', width: 3, height: 3 };
const bandana: ItemShape = { name: 'Bandana', width: 2, height: 2 };

export const inventoryPresets: InventoryPreset[] = [
  {
    id: 'aoi7',
    name: "Balancing Schale's Books with the General Student Council (S7)",
    label: 'GSC S7',
    rounds: [
      [item(shoppingBag, 1), item(receipt, 3), item(fountainPen, 5)],
      [item(toyBox, 1), item(pollackSnack, 2), item(receipt, 3)],
      [item(gamingMagazine, 1), item(umbrella, 2), item(fountainPen, 4)],
      [item(shoppingBag, 1), item(receipt, 3), item(fountainPen, 5)],
      [item(toyBox, 1), item(pollackSnack, 2), item(receipt, 3)],
      [item(gamingMagazine, 1), item(umbrella, 2), item(fountainPen, 4)],
      [item(pollackSnack, 2), item(receipt, 3), item(fountainPen, 6)],
    ],
  },
  {
    id: 'aoi8',
    name: "Balancing Schale's Books with the General Student Council (S8)",
    label: 'GSC S8',
    rounds: [
      [item(pollackSnack, 2), item(shoppingBag, 2), item(toyBox, 1)],
      [item(receipt, 2), item(shoppingBag, 2), item(gamingMagazine, 1)],
      [item(fountainPen, 5), item(receipt, 3), item(umbrella, 2)],
      [item(pollackSnack, 2), item(shoppingBag, 2), item(toyBox, 1)],
      [item(receipt, 2), item(shoppingBag, 2), item(gamingMagazine, 1)],
      [item(fountainPen, 5), item(receipt, 3), item(umbrella, 2)],
      [item(shoppingBag, 2), item(toyBox, 1), item(gamingMagazine, 1)],
    ],
  },
  {
    id: 'kisaki',
    name: 'The Senses Descend (Kisaki & Reijo Event)',
    label: 'Kisaki',
    rounds: [
      [item(dragonsBeardCandy, 1), item(ludagun, 5), item(mooncake, 2)],
      [item(mahua, 1), item(almondTofu, 2), item(ludagun, 3)],
      [item(banji, 1), item(tanghulu, 3), item(mooncake, 2)],
      [item(dragonsBeardCandy, 1), item(ludagun, 5), item(mooncake, 2)],
      [item(mahua, 1), item(almondTofu, 2), item(ludagun, 3)],
      [item(banji, 1), item(tanghulu, 3), item(mooncake, 2)],
      [item(almondTofu, 2), item(ludagun, 3), item(mooncake, 6)],
    ],
  },
  {
    id: 'pajama',
    name: 'Secret Midnight Party: The Chimes of Tag (PJ Seminar Event)',
    label: 'PJ Seminar',
    rounds: [
      [item(slippers, 2), item(toothbrush, 5), item(purpleScarf, 2)],
      [item(kivopoly, 1), item(dakimakura, 2), item(toothbrush, 5)],
      [item(characterCushion, 1), item(hairband, 4), item(purpleScarf, 3)],
      [item(slippers, 2), item(toothbrush, 5), item(purpleScarf, 2)],
      [item(kivopoly, 1), item(dakimakura, 2), item(toothbrush, 5)],
      [item(characterCushion, 1), item(hairband, 4), item(purpleScarf, 3)],
      [item(kivopoly, 2), item(toothbrush, 3), item(purpleScarf, 6)],
    ],
  },
  {
    id: 'aoi12',
    name: "Balancing Schale's Books with the General Student Council (S12)",
    label: 'GSC S12',
    rounds: [
      [item(pollackSnack, 3), item(shoppingBag, 2), item(toyBox, 1)],
      [item(receipt, 2), item(shoppingBag, 3), item(gamingMagazine, 1)],
      [item(fountainPen, 6), item(receipt, 4), item(umbrella, 2)],
      [item(pollackSnack, 3), item(shoppingBag, 2), item(toyBox, 1)],
      [item(receipt, 2), item(shoppingBag, 3), item(gamingMagazine, 1)],
      [item(fountainPen, 6), item(receipt, 4), item(umbrella, 2)],
      [item(shoppingBag, 2), item(toyBox, 1), item(gamingMagazine, 1)],
    ],
  },
  {
    id: 'shyakka',
    name: 'Hyakkaryouran: Fair and Square Aquatic Showdown',
    label: 'Hyakka',
    rounds: [
      [item(waterRifle, 2), item(phoneCase, 5), item(sunscreen, 2)],
      [item(surfboard, 1), item(parasol, 2), item(phoneCase, 5)],
      [item(swimFloaty, 1), item(bandana, 4), item(sunscreen, 3)],
      [item(waterRifle, 2), item(phoneCase, 5), item(sunscreen, 2)],
      [item(surfboard, 1), item(parasol, 2), item(phoneCase, 5)],
      [item(swimFloaty, 1), item(bandana, 4), item(sunscreen, 3)],
      [item(surfboard, 2), item(phoneCase, 3), item(sunscreen, 6)],
    ],
  },
  {
    id: 'aoi15',
    name: "Balancing Schale's Books with the General Student Council (S15)",
    label: 'GSC S15',
    rounds: [
      [item(pollackSnack, 3), item(shoppingBag, 2), item(toyBox, 1)],
      [item(fountainPen, 7), item(receipt, 3), item(umbrella, 2)],
      [item(pollackSnack, 3), item(shoppingBag, 2), item(toyBox, 1)],
      [item(fountainPen, 7), item(receipt, 3), item(umbrella, 2)],
      [item(shoppingBag, 2), item(toyBox, 1), item(gamingMagazine, 1)],
    ],
  },
];
