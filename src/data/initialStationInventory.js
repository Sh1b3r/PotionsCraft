import { MINECRAFT_ITEMS } from './minecraftItemIcons.js';

// 1. Guaranteed brewing supplies: ALWAYS present in every generated inventory!
// Contains fuel (blaze powder), bases, all 16 reagents, modifiers, and raw materials.
const GUARANTEED_BREWING_SUPPLIES = [
  // Stand fuel & fire rods (guaranteed, blaze powder is NEVER missing)
  ['blaze_powder', 8, 32],
  ['blaze_rod', 4, 16],

  // Base vessels & potions (individual bottles capped so they don't overfill)
  ['water_bottle', 6, 10],
  ['awkward_potion', 3, 5],
  ['splash_water_bottle', 1, 2],
  ['lingering_water_bottle', 1, 2],
  ['glass_bottle', 12, 36],

  // Primary base reagent
  ['nether_wart', 16, 48],

  // Modifiers & Enhancers
  ['redstone', 12, 36],
  ['glowstone', 12, 36],
  ['gunpowder', 8, 32],
  ['dragons_breath', 2, 8],
  ['fermented_spider_eye', 2, 8],

  // All 16 Effect Reagents
  ['sugar', 6, 24],
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
  ['slime_ball', 6, 18],
  ['gold_nugget', 12, 36],
  ['gold_ingot', 2, 8],
  ['carrot', 3, 12],
  ['melon_slice', 4, 16],
  ['turtle_scute', 5, 12],
];

// 2. Optional non-essential items ("то были то нет" - appear randomly with ~35% chance)
// Brings authentic Minecraft player-inventory flavor without crowding out brewing essentials.
const OPTIONAL_FLAVOR_ITEMS = [
  ['white_wool', 1, 4, 0.35],
  ['string', 2, 8, 0.35],
  ['paper', 2, 6, 0.35],
  ['bamboo', 4, 16, 0.35],
  ['stick', 2, 8, 0.35],
  ['lever', 1, 2, 0.30],
  ['stone_bricks', 2, 6, 0.30],
  ['melon_seeds', 1, 4, 0.25],
  ['wind_charge', 2, 8, 0.35],
  // Occasional pre-brewed potion finds
  ['potion_swiftness', 1, 1, 0.30],
  ['potion_healing', 1, 1, 0.30],
  ['potion_night_vision', 1, 1, 0.30],
  ['potion_poison', 1, 1, 0.30],
  ['potion_regeneration', 1, 1, 0.30],
  ['mundane_potion', 1, 1, 0.30],
  ['thick_potion', 1, 1, 0.30],
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
 * - All essential brewing items (blaze powder, nether wart, reagents, bottles) are guaranteed
 * - Optional flavor items (wool, string, paper, bamboo, etc.) have a random chance to appear or not
 * - Stack counts and positions across the 72 slots are completely randomized (shuffled)
 * - Guarantees at least 12 free slots for player brewing/crafting outputs
 */
export function buildInitialInventory() {
  const itemEntries = [];

  // 1. Guaranteed supplies (always added)
  for (const [itemId, min, max] of GUARANTEED_BREWING_SUPPLIES) {
    const count = randomInt(min, max);
    itemEntries.push([itemId, count]);
  }

  // 2. Optional supplies ("то были то нет" based on random roll)
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

  // Random stack splitting (e.g. blaze rods, gold ingots, nether wart)
  // Ensure we keep at least 12 slots free (max 60 occupied slots out of 72)
  const candidates = shuffle(stacks.filter(item => (item.maxStack || 64) > 1 && item.count > 1));
  const alwaysSplit = new Set(['blaze_rod', 'gold_ingot']);
  const splitOrder = [
    ...candidates.filter(item => alwaysSplit.has(item.itemId)),
    ...candidates.filter(item => !alwaysSplit.has(item.itemId)),
  ];

  for (const item of splitOrder) {
    if (stacks.length >= 60) break;
    if (!alwaysSplit.has(item.itemId) && Math.random() < 0.25) continue;
    const separateCount = randomInt(1, Math.max(1, item.count - 1));
    if (item.count - separateCount >= 1) {
      item.count -= separateCount;
      stacks.push({ ...item, count: separateCount });
    }
  }

  // Randomize placement across all 72 slots (shuffled layout like before)
  const inventory = new Array(72).fill(null);
  const positions = shuffle(Array.from({ length: 72 }, (_, index) => index));
  stacks.slice(0, 60).forEach((item, index) => {
    inventory[positions[index]] = item;
  });

  return inventory;
}
