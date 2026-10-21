import { MINECRAFT_ITEMS } from './minecraftItemIcons.js';

// Ready ingredients and raw materials, with inclusive quantity ranges.
// Reroll quantities, stack splits and positions only when the station is mounted.
// Non-stackable supplies are capped so there is room for duplicate stacks and
// at least 12 free inventory slots. Raw-material minima allow their recipes.
const STARTING_SUPPLIES = [
  ['water_bottle', 14, 16], ['awkward_potion', 5, 7],
  ['splash_water_bottle', 1, 1], ['lingering_water_bottle', 1, 1],
  ['nether_wart', 24, 48], ['blaze_powder', 6, 16], ['blaze_rod', 6, 24],
  ['sugar', 6, 16], ['sugar_cane', 8, 32],
  ['redstone', 8, 32], ['glowstone', 8, 32], ['gunpowder', 8, 32],
  ['golden_carrot', 2, 6], ['carrot', 6, 16],
  ['glistering_melon', 2, 6], ['melon_slice', 6, 16],
  ['gold_nugget', 16, 48], ['gold_ingot', 6, 24],
  ['fermented_spider_eye', 4, 8], ['spider_eye', 6, 16], ['brown_mushroom', 6, 16],
  ['magma_cream', 2, 6], ['slime_ball', 12, 48], ['slime_block', 2, 4],
  ['turtle_shell', 1, 2], ['turtle_scute', 5, 20],
  ['ghast_tear', 2, 8], ['pufferfish', 2, 8], ['rabbit_foot', 2, 8], ['phantom_membrane', 2, 8],
  ['cobweb', 2, 8], ['stone', 6, 16], ['breeze_rod', 3, 12], ['dragons_breath', 2, 8],
  ['glass_bottle', 4, 12], ['glass', 6, 24], ['stick', 4, 16], ['bamboo', 6, 32],
];

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle(values) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

export function buildInitialInventory() {
  const stacks = STARTING_SUPPLIES.flatMap(([itemId, min, max]) => {
    const count = randomInt(min, max);
    const definition = MINECRAFT_ITEMS[itemId];
    if (!definition) return [];
    const result = [];
    for (let remaining = count; remaining > 0;) {
      const stackCount = Math.min(remaining, definition.maxStack);
      result.push({ ...definition, itemId, count: stackCount });
      remaining -= stackCount;
    }
    return result;
  });

  // Always separate blaze rods and gold ingots; split other supplies too. Keep at
  // least 14 slots free for crafting and brewed potions, including the hotbar.
  const candidates = shuffle(stacks.filter(item => item.maxStack > 1 && item.count > 1));
  const alwaysSplit = new Set(['blaze_rod', 'gold_ingot']);
  const splitOrder = [
    ...candidates.filter(item => alwaysSplit.has(item.itemId)),
    ...candidates.filter(item => !alwaysSplit.has(item.itemId)),
  ];
  for (const item of splitOrder) {
    if (stacks.length >= 57) break;
    if (!alwaysSplit.has(item.itemId) && Math.random() < 0.25) continue;
    const separateCount = randomInt(1, item.count - 1);
    item.count -= separateCount;
    stacks.push({ ...item, count: separateCount });
  }

  const inventory = new Array(72).fill(null);
  const positions = shuffle(Array.from({ length: 72 }, (_, index) => index));
  stacks.forEach((item, index) => { inventory[positions[index]] = item; });
  return inventory;
}
