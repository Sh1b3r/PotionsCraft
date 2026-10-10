const pattern = entries => Array.from({ length: 9 }, (_, index) => entries[index] || null);

export const STATION_CRAFTING_RECIPES = [
  { id: 'golden_carrot', grid: pattern({ 0: 'gold_nugget', 1: 'gold_nugget', 2: 'gold_nugget', 3: 'gold_nugget', 4: 'carrot', 5: 'gold_nugget', 6: 'gold_nugget', 7: 'gold_nugget', 8: 'gold_nugget' }) },
  { id: 'glistering_melon', grid: pattern({ 0: 'gold_nugget', 1: 'gold_nugget', 2: 'gold_nugget', 3: 'gold_nugget', 4: 'melon_slice', 5: 'gold_nugget', 6: 'gold_nugget', 7: 'gold_nugget', 8: 'gold_nugget' }) },
  { id: 'blaze_powder', grid: pattern({ 0: 'blaze_rod' }) },
  { id: 'sugar', grid: pattern({ 0: 'sugar_cane' }) },
  { id: 'gold_nugget', grid: pattern({ 0: 'gold_ingot' }) },
  { id: 'fermented_spider_eye', grid: pattern({ 0: 'spider_eye', 1: 'brown_mushroom', 2: 'sugar' }) },
  { id: 'magma_cream', grid: pattern({ 0: 'slime_ball', 1: 'blaze_powder' }) },
  { id: 'glass_bottle', grid: pattern({ 0: 'glass', 2: 'glass', 4: 'glass' }) },
  { id: 'turtle_shell', grid: pattern({ 0: 'turtle_scute', 1: 'turtle_scute', 2: 'turtle_scute', 3: 'turtle_scute', 5: 'turtle_scute' }) },
  { id: 'slime_block', grid: Array(9).fill('slime_ball') },
  { id: 'slime_ball', grid: pattern({ 0: 'slime_block' }) },
  { id: 'gold_ingot', grid: Array(9).fill('gold_nugget') },
  { id: 'stick', grid: pattern({ 0: 'bamboo', 3: 'bamboo' }) },
];

export function canFillStationRecipe(recipe, items) {
  const totals = {};
  items.forEach(item => { if (item) totals[item.itemId] = (totals[item.itemId] || 0) + item.count; });
  for (const id of recipe.grid) {
    if (!id) continue;
    if (!totals[id]) return false;
    totals[id]--;
  }
  return true;
}
