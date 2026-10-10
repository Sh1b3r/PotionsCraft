import { MINECRAFT_ITEMS } from './minecraftItemIcons';

// Ready ingredients plus raw materials for additional crafting. Quantities stay
// constant; stack sizes and positions change only when the station is mounted.
const STARTING_SUPPLIES = [
  ['water_bottle', 12], ['awkward_potion', 6],
  ['splash_water_bottle', 1], ['lingering_water_bottle', 1],
  ['nether_wart', 32], ['blaze_powder', 6], ['blaze_rod', 8],
  ['sugar', 4], ['sugar_cane', 16],
  ['redstone', 16], ['glowstone', 16], ['gunpowder', 16],
  ['golden_carrot', 2], ['carrot', 8],
  ['glistering_melon', 2], ['melon_slice', 8],
  ['gold_nugget', 16], ['gold_ingot', 12],
  ['fermented_spider_eye', 2], ['spider_eye', 12], ['brown_mushroom', 8],
  ['magma_cream', 2], ['slime_ball', 24], ['slime_block', 2],
  ['turtle_shell', 2], ['turtle_scute', 10],
  ['ghast_tear', 4], ['pufferfish', 4], ['rabbit_foot', 4], ['phantom_membrane', 4],
  ['cobweb', 4], ['stone', 8], ['breeze_rod', 4], ['dragons_breath', 4],
  ['glass_bottle', 6], ['glass', 12], ['stick', 4], ['bamboo', 16],
];

function shuffle(values) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

export function buildInitialInventory() {
  const stacks = STARTING_SUPPLIES.flatMap(([itemId, count]) => {
    const definition = MINECRAFT_ITEMS[itemId];
    const result = [];
    for (let remaining = count; remaining > 0;) {
      const stackCount = Math.min(remaining, definition.maxStack);
      result.push({ ...definition, itemId, count: stackCount });
      remaining -= stackCount;
    }
    return result;
  });

  // Always separate blaze rods; split other supplies at random too. Keep at
  // least 12 slots free for crafting and brewed potions, including the hotbar.
  const candidates = shuffle(stacks.filter(item => item.maxStack > 1 && item.count > 1));
  const rods = candidates.find(item => item.itemId === 'blaze_rod');
  const splitOrder = [rods, ...candidates.filter(item => item !== rods)];
  for (const item of splitOrder) {
    if (stacks.length >= 60) break;
    if (item !== rods && Math.random() < 0.25) continue;
    const separateCount = 1 + Math.floor(Math.random() * (item.count - 1));
    item.count -= separateCount;
    stacks.push({ ...item, count: separateCount });
  }

  const inventory = new Array(72).fill(null);
  const positions = shuffle(Array.from({ length: 72 }, (_, index) => index));
  stacks.forEach((item, index) => { inventory[positions[index]] = item; });
  return inventory;
}
