import { MINECRAFT_ITEMS } from './minecraftItemIcons.js';

// Ready brewing ingredients and crafting materials with inclusive quantity ranges.
// Reroll quantities, stack splits and randomized positions when the station is mounted.
const GUARANTEED_BREWING_SUPPLIES = [
  // Stand fuel & fire rods (guaranteed)
  ['blaze_powder', 8, 24],
  ['blaze_rod', 8, 24],

  // Base vessels & potions (individual bottles capped so they don't overfill)
  ['water_bottle', 6, 8],
  ['awkward_potion', 3, 5],
  ['splash_water_bottle', 1, 1],
  ['lingering_water_bottle', 1, 1],
  ['glass_bottle', 12, 32],

  // Primary base reagent
  ['nether_wart', 16, 48],

  // Modifiers & Enhancers
  ['redstone', 12, 36],
  ['glowstone', 12, 36],
  ['gunpowder', 8, 32],
  ['dragons_breath', 2, 6],
  ['fermented_spider_eye', 2, 6],

  // All 16 Effect Reagents
  ['sugar', 6, 20],
  ['golden_carrot', 2, 6],
  ['glistering_melon', 2, 6],
  ['magma_cream', 2, 6],
  ['ghast_tear', 2, 6],
  ['spider_eye', 4, 16],
  ['pufferfish', 2, 6],
  ['rabbit_foot', 2, 6],
  ['phantom_membrane', 2, 6],
  ['turtle_shell', 1, 2],
  ['slime_block', 2, 6],
  ['cobweb', 2, 6],
  ['stone', 8, 20],
  ['breeze_rod', 2, 8],

  // Raw crafting components to make reagents in the 3x3 table
  ['glass', 6, 18],
  ['sugar_cane', 4, 16],
  ['brown_mushroom', 3, 12],
  ['slime_ball', 8, 24],
  ['gold_nugget', 16, 40],
  ['gold_ingot', 6, 18],
  ['carrot', 3, 12],
  ['melon_slice', 4, 16],
  ['turtle_scute', 5, 12],
  ['stick', 4, 12],
  ['bamboo', 6, 20],
];

// Optional non-essential flavor items (paper, wool, string, etc.) that can randomly appear
const OPTIONAL_FLAVOR_ITEMS = [
  ['white_wool', 1, 4, 0.35],
  ['string', 2, 6, 0.35],
  ['paper', 2, 6, 0.35],
  ['melon_seeds', 1, 4, 0.25],
  ['wind_charge', 2, 6, 0.30],
];

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle(values) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Builds a randomized authentic inventory:
 * - All essential brewing items (blaze powder, blaze rods, nether wart, reagents, bottles) are guaranteed
 * - Duplicate stack splitting: identical items (e.g. blaze rods, gold ingots, nether wart) appear
 *   in separate slots across different ends of the inventory with random counts
 * - Guarantees at least 14 free slots out of 72 for crafting and brewed potions
 */
export function buildInitialInventory() {
  const itemEntries = [];

  // 1. Guaranteed supplies
  for (const [itemId, min, max] of GUARANTEED_BREWING_SUPPLIES) {
    const count = randomInt(min, max);
    itemEntries.push([itemId, count]);
  }

  // 2. Optional flavor supplies
  for (const [itemId, min, max, chance] of OPTIONAL_FLAVOR_ITEMS) {
    if (Math.random() < chance) {
      const count = randomInt(min, max);
      itemEntries.push([itemId, count]);
    }
  }

  // Convert entries to item stacks respecting maxStack
  const stacks = itemEntries.flatMap(([itemId, count]) => {
    const definition = MINECRAFT_ITEMS[itemId];
    if (!definition) return [];
    const maxStack = definition.maxStack || 64;
    const result = [];
    let remaining = count;
    while (remaining > 0) {
      const stackCount = Math.min(remaining, maxStack);
      result.push({ ...definition, itemId, count: stackCount });
      remaining -= stackCount;
    }
    return result;
  });

  // Target total occupied slots: up to 58 (leaving at least 14 empty slots in the 72-slot inventory)
  const MAX_OCCUPIED = 58;

  // Items that are ALWAYS split into multiple stacks (blaze rods, gold ingots)
  const ALWAYS_SPLIT = ['blaze_rod', 'gold_ingot'];
  const OTHER_SPLIT = [
    'nether_wart',
    'blaze_powder',
    'redstone',
    'glowstone',
    'gold_nugget',
    'sugar',
    'glass_bottle',
    'gunpowder',
    'slime_ball',
  ];

  const splitOrder = [
    ...ALWAYS_SPLIT,
    ...shuffle(OTHER_SPLIT)
  ];

  // 1. Guaranteed split for priority items (e.g. 7 blaze rods here, 3 there)
  for (const itemId of splitOrder) {
    if (stacks.length >= MAX_OCCUPIED) break;
    const target = stacks.find(item => item.itemId === itemId && item.count >= 3);
    if (!target) continue;

    // Split target into two random non-zero stacks
    const separateCount = randomInt(1, target.count - 2);
    target.count -= separateCount;
    stacks.push({ ...target, count: separateCount });

    // If target has enough items (>= 12) and we have room, occasionally split into a 3rd stack!
    if (stacks.length < MAX_OCCUPIED && target.count >= 6 && Math.random() < 0.5) {
      const thirdCount = randomInt(1, Math.floor(target.count / 2));
      target.count -= thirdCount;
      stacks.push({ ...target, count: thirdCount });
    }
  }

  // 2. Random split for any remaining stackable items with count >= 4
  const otherCandidates = shuffle(stacks.filter(item => (item.maxStack || 64) > 1 && item.count >= 4));
  for (const item of otherCandidates) {
    if (stacks.length >= MAX_OCCUPIED) break;
    if (Math.random() < 0.4) {
      const separateCount = randomInt(1, item.count - 2);
      item.count -= separateCount;
      stacks.push({ ...item, count: separateCount });
    }
  }

  // Randomize placement across all 72 slots (shuffled layout)
  const inventory = new Array(72).fill(null);
  const positions = shuffle(Array.from({ length: 72 }, (_, index) => index));
  stacks.slice(0, MAX_OCCUPIED).forEach((item, index) => {
    inventory[positions[index]] = item;
  });

  return inventory;
}
