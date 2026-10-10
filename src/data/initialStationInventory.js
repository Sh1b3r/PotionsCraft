import { MINECRAFT_ITEMS } from './minecraftItemIcons';

// Ready ingredients and raw materials, with inclusive quantity ranges.
// Reroll quantities, stack splits and positions only when the station is mounted.
// Non-stackable supplies are capped so there is room for duplicate stacks and
// at least 12 free inventory slots. Raw-material minima allow their recipes.
const STARTING_SUPPLIES = [
  ['water_bottle', 6, 12], ['awkward_potion', 3, 6],
  ['splash_water_bottle', 1, 2], ['lingering_water_bottle', 1, 2],
  ['nether_wart', 8, 48], ['blaze_powder', 2, 12], ['blaze_rod', 4, 24],
  ['sugar', 2, 16], ['sugar_cane', 4, 32],
  ['redstone', 4, 32], ['glowstone', 4, 32], ['gunpowder', 4, 32],
  ['golden_carrot', 1, 4], ['carrot', 2, 16],
  ['glistering_melon', 1, 4], ['melon_slice', 2, 16],
  ['gold_nugget', 8, 48], ['gold_ingot', 3, 32],
  ['fermented_spider_eye', 1, 4], ['spider_eye', 2, 16], ['brown_mushroom', 2, 16],
  ['magma_cream', 1, 4], ['slime_ball', 9, 48], ['slime_block', 1, 4],
  ['turtle_shell', 1, 2], ['turtle_scute', 5, 20],
  ['ghast_tear', 1, 8], ['pufferfish', 1, 8], ['rabbit_foot', 1, 8], ['phantom_membrane', 1, 8],
  ['cobweb', 1, 8], ['stone', 2, 16], ['breeze_rod', 2, 12], ['dragons_breath', 1, 8],
  ['glass_bottle', 3, 12], ['glass', 3, 24], ['stick', 2, 16], ['bamboo', 4, 32],
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
    const result = [];
    for (let remaining = count; remaining > 0;) {
      const stackCount = Math.min(remaining, definition.maxStack);
      result.push({ ...definition, itemId, count: stackCount });
      remaining -= stackCount;
    }
    return result;
  });

  // Always separate blaze rods and gold ingots; split other supplies too. Keep at
  // least 12 slots free for crafting and brewed potions, including the hotbar.
  const candidates = shuffle(stacks.filter(item => item.maxStack > 1 && item.count > 1));
  const alwaysSplit = new Set(['blaze_rod', 'gold_ingot']);
  const splitOrder = [
    ...candidates.filter(item => alwaysSplit.has(item.itemId)),
    ...candidates.filter(item => !alwaysSplit.has(item.itemId)),
  ];
  for (const item of splitOrder) {
    if (stacks.length >= 60) break;
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
