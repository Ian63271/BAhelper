import { InventoryItem } from '@/constants/inventoryPresets';

// Monte Carlo solver for the inventory-management minigame: sample item
// placements consistent with everything revealed so far, count per-cell
// occupancy. Approach follows jozsefsallai/ba-tools' Go engine (MIT), extended
// to condition on revealed item cells (typed hits), not just revealed-empty
// cells — so found items never need manual bookkeeping.

export const CELL_UNKNOWN = -1;
export const CELL_EMPTY = -2;
// Values >= 0 mean the cell is a revealed part of items[value].

/** cells[y][x] — CELL_UNKNOWN, CELL_EMPTY, or an item index. */
export type CellGrid = number[][];

export interface InventorySimResult {
  successes: number;
  attempts: number;
  /** P(cell contains any item), per cell [y][x]. */
  prob: number[][];
  /** Unknown cells tied for the highest probability. */
  best: { x: number; y: number; p: number }[];
}

export function emptyCellGrid(width: number, height: number): CellGrid {
  return Array.from({ length: height }, () => Array(width).fill(CELL_UNKNOWN));
}

// Same PRNG as studentUtils' daily pick — seeded so a given board state
// always yields the same probabilities (no flicker across re-renders).
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

function hashState(items: InventoryItem[], cells: CellGrid): number {
  const str = items.map((i) => `${i.width}x${i.height}x${i.count}`).join(';') + '|' + cells.flat().join(',');
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface Placement {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function simulateInventory(
  width: number,
  height: number,
  items: InventoryItem[],
  cells: CellGrid,
  targetSuccesses = 3000,
  maxAttempts = 30000
): InventorySimResult | null {
  const rng = mulberry32(hashState(items, cells));

  // Revealed cells of each item type, for the coverage constraint.
  const revealedByItem: { x: number; y: number }[][] = items.map(() => []);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cells[y][x];
      if (c >= 0 && c < items.length) revealedByItem[c].push({ x, y });
    }
  }

  const counts = Array.from({ length: height }, () => Array(width).fill(0));
  const occupied = Array.from({ length: height }, () => Array(width).fill(false));

  // All placements a w×h footprint could occupy given only the revealed-state
  // constraints (ignores other items; those are checked per simulation).
  const footprintOk = (itemIdx: number, x: number, y: number, w: number, h: number) => {
    if (x + w > width || y + h > height) return false;
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        const c = cells[yy][xx];
        if (c === CELL_EMPTY || (c >= 0 && c !== itemIdx)) return false;
        if (occupied[yy][xx]) return false;
      }
    }
    return true;
  };

  const candidatePlacements = (itemIdx: number, needCoverage: { x: number; y: number }[]): Placement[] => {
    const item = items[itemIdx];
    const shapes =
      item.width === item.height
        ? [[item.width, item.height]]
        : [
            [item.width, item.height],
            [item.height, item.width],
          ];
    const result: Placement[] = [];
    for (const [w, h] of shapes) {
      for (let y = 0; y + h <= height; y++) {
        for (let x = 0; x + w <= width; x++) {
          if (!footprintOk(itemIdx, x, y, w, h)) continue;
          if (
            needCoverage.length > 0 &&
            !needCoverage.some((c) => c.x >= x && c.x < x + w && c.y >= y && c.y < y + h)
          ) {
            continue;
          }
          result.push({ x, y, w, h });
        }
      }
    }
    return result;
  };

  const tryPlaceAll = (order: number[]): boolean => {
    for (let y = 0; y < height; y++) occupied[y].fill(false);
    for (const itemIdx of order) {
      const item = items[itemIdx];
      const uncovered = revealedByItem[itemIdx].filter((c) => !occupied[c.y][c.x]);
      for (let copy = 0; copy < item.count; copy++) {
        // Cover the revealed hits of this type first; remaining copies go anywhere.
        const stillUncovered = uncovered.filter((c) => !occupied[c.y][c.x]);
        const placements = candidatePlacements(itemIdx, stillUncovered);
        if (placements.length === 0) return false;
        const p = placements[Math.floor(rng() * placements.length)];
        for (let yy = p.y; yy < p.y + p.h; yy++) {
          for (let xx = p.x; xx < p.x + p.w; xx++) occupied[yy][xx] = true;
        }
      }
      // Copies ran out before covering every revealed hit of this type.
      if (revealedByItem[itemIdx].some((c) => !occupied[c.y][c.x])) return false;
    }
    return true;
  };

  // Largest-first placement fails less often on tight boards (ba-tools does
  // the same as its fallback attempt).
  const largestFirst = items
    .map((item, i) => ({ i, area: item.width * item.height }))
    .sort((a, b) => b.area - a.area)
    .map((o) => o.i);

  let successes = 0;
  let attempts = 0;
  while (successes < targetSuccesses && attempts < maxAttempts) {
    // A contradictory board never succeeds — stop probing early.
    if (attempts >= 3000 && successes === 0) break;
    attempts++;
    const order = [...largestFirst];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (tryPlaceAll(order) || tryPlaceAll(largestFirst)) {
      successes++;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (occupied[y][x]) counts[y][x]++;
        }
      }
    }
  }

  if (successes === 0) return null;

  const prob = counts.map((row) => row.map((c) => c / successes));
  let maxP = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (cells[y][x] === CELL_UNKNOWN && prob[y][x] > maxP) maxP = prob[y][x];
    }
  }
  const best: InventorySimResult['best'] = [];
  if (maxP > 0) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (cells[y][x] === CELL_UNKNOWN && prob[y][x] >= maxP - 1e-9) best.push({ x, y, p: prob[y][x] });
      }
    }
  }
  return { successes, attempts, prob, best };
}
