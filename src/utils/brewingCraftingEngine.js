import { MINECRAFT_ITEMS, getPotionSprite } from '../data/minecraftItemIcons.js';

/**
 * Checks a 3x3 crafting grid (array of 9 items: { itemId, count } or null)
 * Returns the matching recipe output { itemId, count, name, sprite, isPotion } or null
 */
export function checkCraftingRecipe(grid) {
  if (!grid || grid.length !== 9) return null;

  const items = grid.map((slot) => (slot ? slot.itemId : null));

  // Count total non-empty slots
  const filledIndices = [];
  for (let i = 0; i < 9; i++) {
    if (items[i]) filledIndices.push(i);
  }

  if (filledIndices.length === 0) return null;

  // 1. Single-slot shapeless recipes (exactly 1 item anywhere in grid)
  if (filledIndices.length === 1) {
    const idx = filledIndices[0];
    const singleItemRecipes = {
      blaze_rod: ['blaze_powder', 2],
      breeze_rod: ['wind_charge', 4],
      sugar_cane: ['sugar', 1],
      gold_ingot: ['gold_nugget', 9],
      gold_block: ['gold_ingot', 9],
      slime_block: ['slime_ball', 9],
      melon_block: ['melon_slice', 9],
      melon_slice: ['melon_seeds', 1],
      redstone_block: ['redstone', 9],
      glowstone_block: ['glowstone', 4],
      cobweb: ['string', 1],
      bamboo_block: ['bamboo', 9],
    };
    const recipe = singleItemRecipes[items[idx]];
    if (recipe) {
      const [itemId, count] = recipe;
      return { ...MINECRAFT_ITEMS[itemId], itemId, count };
    }
  }

  // 2. 2-slot patterns
  if (filledIndices.length === 2) {
    // Magma Cream (Blaze Powder + Slime Ball), shapeless
    const hasBlaze = filledIndices.some((i) => items[i] === 'blaze_powder');
    const hasSlime = filledIndices.some((i) => items[i] === 'slime_ball');
    if (hasBlaze && hasSlime) {
      return {
        ...MINECRAFT_ITEMS.magma_cream,
        itemId: 'magma_cream',
        count: 1
      };
    }
    // 2-slot vertical patterns (top over bottom in same column)
    const [top, bottom] = filledIndices;
    if (bottom === top + 3) {
      if (items[top] === 'bamboo' && items[bottom] === 'bamboo') {
        return { ...MINECRAFT_ITEMS.stick, itemId: 'stick', count: 1 };
      }
      if (items[top] === 'stick' && items[bottom] === 'stone') {
        return { ...MINECRAFT_ITEMS.lever, itemId: 'lever', count: 1 };
      }
      if (items[top] === 'redstone' && items[bottom] === 'stick') {
        return { ...MINECRAFT_ITEMS.redstone_torch, itemId: 'redstone_torch', count: 1 };
      }
    }
  }

  // 3. 3-slot patterns
  if (filledIndices.length === 3) {
    // Glass Bottles (3 Glass in V-shape)
    // Standard V: 3, 7, 5; High V: 0, 4, 2
    const isStandardV = items[3] === 'glass' && items[7] === 'glass' && items[5] === 'glass';
    const isHighV = items[0] === 'glass' && items[4] === 'glass' && items[2] === 'glass';
    if (isStandardV || isHighV) {
      return {
        ...MINECRAFT_ITEMS.glass_bottle,
        itemId: 'glass_bottle',
        count: 3
      };
    }

    // Fermented Spider Eye: Spider Eye + Brown Mushroom + Sugar (shapeless)
    const hasSpiderEye = filledIndices.some((i) => items[i] === 'spider_eye');
    const hasMushroom = filledIndices.some((i) => items[i] === 'brown_mushroom');
    const hasSugar = filledIndices.some((i) => items[i] === 'sugar');
    if (hasSpiderEye && hasMushroom && hasSugar) {
      return {
        ...MINECRAFT_ITEMS.fermented_spider_eye,
        itemId: 'fermented_spider_eye',
        count: 1
      };
    }

    // Paper: 3 Sugar Cane horizontal row ([0,1,2], [3,4,5], [6,7,8])
    const paperRows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
    const isPaper = paperRows.some(row => row.every(idx => items[idx] === 'sugar_cane'));
    if (isPaper) {
      return {
        ...MINECRAFT_ITEMS.paper,
        itemId: 'paper',
        count: 3
      };
    }
  }

  // 4. 4-slot patterns
  if (filledIndices.length === 4) {
    // 2x2 square in any of the 4 quadrants:
    // [0, 1, 3, 4], [1, 2, 4, 5], [3, 4, 6, 7], [4, 5, 7, 8]
    const quadrants = [
      [0, 1, 3, 4],
      [1, 2, 4, 5],
      [3, 4, 6, 7],
      [4, 5, 7, 8]
    ];
    for (const quad of quadrants) {
      if (quad.every(idx => items[idx] === 'glowstone')) {
        return { ...MINECRAFT_ITEMS.glowstone_block, itemId: 'glowstone_block', count: 1 };
      }
      if (quad.every(idx => items[idx] === 'string')) {
        return { ...MINECRAFT_ITEMS.white_wool, itemId: 'white_wool', count: 1 };
      }
      if (quad.every(idx => items[idx] === 'stone')) {
        return { ...MINECRAFT_ITEMS.stone_bricks, itemId: 'stone_bricks', count: 4 };
      }
    }

    // Brewing Stand: Blaze Rod centered above 3 Stone in a row
    // High stand: Blaze rod at 1, Stone at [3, 4, 5]
    // Low stand: Blaze rod at 4, Stone at [6, 7, 8]
    const isHighBrewingStand = items[1] === 'blaze_rod' && [3, 4, 5].every(idx => items[idx] === 'stone');
    const isLowBrewingStand = items[4] === 'blaze_rod' && [6, 7, 8].every(idx => items[idx] === 'stone');
    if (isHighBrewingStand || isLowBrewingStand) {
      return { ...MINECRAFT_ITEMS.brewing_stand, itemId: 'brewing_stand', count: 1 };
    }
  }

  // 5. 5-slot patterns: Turtle shell (three scutes across top, one below each outer scute)
  if (filledIndices.length === 5) {
    const matchesHelmet = [0, 3].some(offset =>
      [0, 1, 2, 3, 5].every(index => items[index + offset] === 'turtle_scute')
    );
    if (matchesHelmet) {
      return { ...MINECRAFT_ITEMS.turtle_shell, itemId: 'turtle_shell', count: 1 };
    }
  }

  // 6. 6-slot patterns: Glass Pane (6 glass in two horizontal rows)
  // Top two rows: [0, 1, 2, 3, 4, 5]
  // Bottom two rows: [3, 4, 5, 6, 7, 8]
  if (filledIndices.length === 6) {
    const isTopGlassPane = [0, 1, 2, 3, 4, 5].every(idx => items[idx] === 'glass');
    const isBottomGlassPane = [3, 4, 5, 6, 7, 8].every(idx => items[idx] === 'glass');
    if (isTopGlassPane || isBottomGlassPane) {
      return { ...MINECRAFT_ITEMS.glass_pane, itemId: 'glass_pane', count: 16 };
    }
  }

  // 7. 9-slot patterns
  if (filledIndices.length === 9) {
    const allSame = id => items.every(item => item === id);
    if (allSame('slime_ball')) {
      return { ...MINECRAFT_ITEMS.slime_block, itemId: 'slime_block', count: 1 };
    }
    if (allSame('gold_nugget')) {
      return { ...MINECRAFT_ITEMS.gold_ingot, itemId: 'gold_ingot', count: 1 };
    }
    if (allSame('gold_ingot')) {
      return { ...MINECRAFT_ITEMS.gold_block, itemId: 'gold_block', count: 1 };
    }
    if (allSame('melon_slice')) {
      return { ...MINECRAFT_ITEMS.melon_block, itemId: 'melon_block', count: 1 };
    }
    if (allSame('redstone')) {
      return { ...MINECRAFT_ITEMS.redstone_block, itemId: 'redstone_block', count: 1 };
    }
    if (allSame('bamboo')) {
      return { ...MINECRAFT_ITEMS.bamboo_block, itemId: 'bamboo_block', count: 1 };
    }

    const center = items[4];
    const outerAllNuggets = [0, 1, 2, 3, 5, 6, 7, 8].every(
      (idx) => items[idx] === 'gold_nugget'
    );

    if (outerAllNuggets) {
      if (center === 'carrot') {
        return {
          ...MINECRAFT_ITEMS.golden_carrot,
          itemId: 'golden_carrot',
          count: 1
        };
      }
      if (center === 'melon_slice') {
        return {
          ...MINECRAFT_ITEMS.glistering_melon,
          itemId: 'glistering_melon',
          count: 1
        };
      }
    }
  }

  return null;
}

/**
 * Checks what a specific potion bottle will become with a given brewing ingredient.
 * Returns null if this potion cannot be brewed with this ingredient.
 */
export function getBrewingResult(bottleItem, ingredientId) {
  if (!bottleItem || !ingredientId) return null;

  const bId = bottleItem.itemId;
  const isExtended = !!bottleItem.isExtended;
  const isLevel2 = !!bottleItem.isLevel2;
  const isSplash = !!bottleItem.isSplash;
  const isLingering = !!bottleItem.isLingering;

  // Vanilla addStartMix registers water -> mundane alongside awkward -> effect.
  // Verified against PotionBrewing / Builder in Mojang's Java 1.21.1 client.
  if (['water_bottle', 'splash_water_bottle', 'lingering_water_bottle'].includes(bId)) {
    const mundaneReagents = ['redstone', 'breeze_rod', 'slime_block', 'stone', 'cobweb',
      'magma_cream', 'rabbit_foot', 'sugar', 'glistering_melon', 'spider_eye', 'ghast_tear', 'blaze_powder'];
    const baseId = ingredientId === 'glowstone' ? 'thick_potion' : mundaneReagents.includes(ingredientId) ? 'mundane_potion' : null;
    if (baseId) {
      const lingering = isLingering || bId === 'lingering_water_bottle';
      const splash = isSplash || bId === 'splash_water_bottle' || lingering;
      return { ...MINECRAFT_ITEMS[baseId], itemId: baseId, count: 1, isSplash: splash,
        isLingering: lingering, sprite: getPotionSprite(baseId, splash, lingering) };
    }
  }

  // 1. Water Bottle + Nether Wart -> Awkward Potion
  if ((bId === 'water_bottle' || bId === 'splash_water_bottle' || bId === 'lingering_water_bottle') && ingredientId === 'nether_wart') {
    const isThisLingering = isLingering || bId === 'lingering_water_bottle';
    const isThisSplash = isSplash || bId === 'splash_water_bottle' || isThisLingering;
    const res = {
      itemId: 'awkward_potion',
      count: 1,
      ...MINECRAFT_ITEMS.awkward_potion,
      isSplash: isThisSplash,
      isLingering: isThisLingering
    };
    if (isThisLingering) {
      res.sprite = getPotionSprite('awkward_potion', true, true);
    } else if (isThisSplash) {
      res.sprite = getPotionSprite('awkward_potion', true, false);
    }
    return res;
  }

  // Water Bottle + Gunpowder -> Splash Water Bottle
  if (bId === 'water_bottle' && ingredientId === 'gunpowder' && !isSplash) {
    return {
      itemId: 'splash_water_bottle',
      count: 1,
      ...MINECRAFT_ITEMS.splash_water_bottle,
      isPotion: true,
      isSplash: true
    };
  }

  // Splash Water Bottle + Dragon's Breath -> Lingering Water Bottle
  if ((bId === 'splash_water_bottle' || (bId === 'water_bottle' && isSplash)) && (ingredientId === 'dragons_breath' || ingredientId === 'dragon_breath') && !isLingering) {
    return {
      itemId: 'lingering_water_bottle',
      count: 1,
      ...MINECRAFT_ITEMS.lingering_water_bottle,
      isPotion: true,
      isSplash: true,
      isLingering: true
    };
  }

  // 2. Base potions from Awkward Potion
  if (bId === 'awkward_potion') {
    let baseRes = null;
    switch (ingredientId) {
      case 'sugar':
        baseRes = { itemId: 'potion_swiftness', count: 1, ...MINECRAFT_ITEMS.potion_swiftness };
        break;
      case 'magma_cream':
        baseRes = { itemId: 'potion_fire_resistance', count: 1, ...MINECRAFT_ITEMS.potion_fire_resistance };
        break;
      case 'golden_carrot':
        baseRes = { itemId: 'potion_night_vision', count: 1, ...MINECRAFT_ITEMS.potion_night_vision };
        break;
      case 'ghast_tear':
        baseRes = { itemId: 'potion_regeneration', count: 1, ...MINECRAFT_ITEMS.potion_regeneration };
        break;
      case 'blaze_powder':
        baseRes = { itemId: 'potion_strength', count: 1, ...MINECRAFT_ITEMS.potion_strength };
        break;
      case 'glistering_melon':
        baseRes = { itemId: 'potion_healing', count: 1, ...MINECRAFT_ITEMS.potion_healing };
        break;
      case 'spider_eye':
        baseRes = { itemId: 'potion_poison', count: 1, ...MINECRAFT_ITEMS.potion_poison };
        break;
      case 'pufferfish':
        baseRes = { itemId: 'potion_water_breathing', count: 1, ...MINECRAFT_ITEMS.potion_water_breathing };
        break;
      case 'rabbit_foot':
        baseRes = { itemId: 'potion_leaping', count: 1, ...MINECRAFT_ITEMS.potion_leaping };
        break;
      case 'phantom_membrane':
        baseRes = { itemId: 'potion_slow_falling', count: 1, ...MINECRAFT_ITEMS.potion_slow_falling };
        break;
      case 'turtle_shell':
        baseRes = { itemId: 'potion_turtle_master', count: 1, ...MINECRAFT_ITEMS.potion_turtle_master };
        break;
      case 'slime_block':
        baseRes = { itemId: 'potion_oozing', count: 1, ...MINECRAFT_ITEMS.potion_oozing };
        break;
      case 'cobweb':
        baseRes = { itemId: 'potion_weaving', count: 1, ...MINECRAFT_ITEMS.potion_weaving };
        break;
      case 'stone':
        baseRes = { itemId: 'potion_infestation', count: 1, ...MINECRAFT_ITEMS.potion_infestation };
        break;
      case 'breeze_rod':
        baseRes = { itemId: 'potion_wind_charging', count: 1, ...MINECRAFT_ITEMS.potion_wind_charging };
        break;
      default:
        break;
    }

    if (baseRes) {
      if (isLingering) {
        baseRes.isLingering = true;
        baseRes.isSplash = true;
        baseRes.sprite = getPotionSprite(baseRes.itemId, true, true);
        baseRes.name = `Осідальне ${baseRes.name.toLowerCase()}`;
      } else if (isSplash) {
        baseRes.isSplash = true;
        baseRes.sprite = getPotionSprite(baseRes.itemId, true, false);
        baseRes.name = `Вибухове ${baseRes.name.toLowerCase()}`;
      }
      return baseRes;
    }
  }

  // 3. Water Bottle + Fermented Spider Eye -> Potion of Weakness
  if ((bId === 'water_bottle' || bId === 'splash_water_bottle' || bId === 'lingering_water_bottle') && ingredientId === 'fermented_spider_eye') {
    const isThisLingering = isLingering || bId === 'lingering_water_bottle';
    const isThisSplash = isSplash || bId === 'splash_water_bottle' || isThisLingering;
    const res = {
      itemId: 'potion_weakness',
      count: 1,
      ...MINECRAFT_ITEMS.potion_weakness,
      isSplash: isThisSplash,
      isLingering: isThisLingering
    };
    if (isThisLingering) {
      res.sprite = getPotionSprite('potion_weakness', true, true);
      res.name = `Осідальне ${res.name.toLowerCase()}`;
    } else if (isThisSplash) {
      res.sprite = getPotionSprite('potion_weakness', true, false);
      res.name = `Вибухове ${res.name.toLowerCase()}`;
    }
    return res;
  }

  // 4. Inversion via Fermented Spider Eye
  if (ingredientId === 'fermented_spider_eye') {
    let invRes = null;
    if ((bId === 'potion_swiftness' || bId === 'potion_leaping') && !isLevel2) {
      invRes = {
        itemId: 'potion_slowness',
        count: 1,
        isExtended,
        isLevel2: false,
        isSplash,
        isLingering,
        ...MINECRAFT_ITEMS.potion_slowness
      };
    } else if (bId === 'potion_healing' || bId === 'potion_poison') {
      invRes = {
        itemId: 'potion_harming',
        count: 1,
        isExtended: false,
        isLevel2,
        isSplash,
        isLingering,
        ...MINECRAFT_ITEMS.potion_harming
      };
    } else if (bId === 'potion_night_vision') {
      invRes = {
        itemId: 'potion_invisibility',
        count: 1,
        isExtended,
        isLevel2,
        isSplash,
        isLingering,
        ...MINECRAFT_ITEMS.potion_invisibility
      };
    }

    if (invRes) {
      if (invRes.isLevel2) invRes.name += ' II';
      if (invRes.isExtended) invRes.name += ' (Подовжене)';
      if (isLingering) {
        invRes.sprite = getPotionSprite(invRes.itemId, true, true);
        invRes.name = `Осідальне ${invRes.name.toLowerCase()}`;
      } else if (isSplash) {
        invRes.sprite = getPotionSprite(invRes.itemId, true, false);
        invRes.name = `Вибухове ${invRes.name.toLowerCase()}`;
      }
      return invRes;
    }
  }

  // 5. Redstone modifier (Extended duration, mutually exclusive with Level II)
  if (ingredientId === 'redstone' && !isExtended && !isLevel2) {
    const extendable = [
      'potion_swiftness',
      'potion_fire_resistance',
      'potion_night_vision',
      'potion_slowness',
      'potion_invisibility',
      'potion_regeneration',
      'potion_strength',
      'potion_poison',
      'potion_weakness',
      'potion_water_breathing',
      'potion_leaping',
      'potion_slow_falling',
      'potion_turtle_master'
    ];
    if (extendable.includes(bId)) {
      const baseDef = MINECRAFT_ITEMS[bId];
      return {
        ...bottleItem,
        isExtended: true,
        name: `${bottleItem.name} (Подовжене)`,
        description: `${baseDef.description} (Подовжений час дії)`
      };
    }
  }

  // 6. Glowstone modifier (Level II, mutually exclusive with Extended)
  if (ingredientId === 'glowstone' && !isLevel2 && !isExtended) {
    const upgradable = [
      'potion_healing',
      'potion_harming',
      'potion_swiftness',
      'potion_strength',
      'potion_regeneration',
      'potion_poison',
      'potion_leaping',
      'potion_turtle_master',
      'potion_slowness'
    ];
    if (upgradable.includes(bId)) {
      const baseDef = MINECRAFT_ITEMS[bId];
      return {
        ...bottleItem,
        isLevel2: true,
        name: `${bottleItem.name} ${bId === 'potion_slowness' ? 'IV' : 'II'}`,
        description: `${baseDef.description} (Посилена дія ${bId === 'potion_slowness' ? 'IV' : 'II'} рівня)`
      };
    }
  }

  // 7. Gunpowder modifier (Splash Potion)
  if (ingredientId === 'gunpowder' && !isSplash && (bottleItem.isPotion || bId === 'water_bottle')) {
    if (bId === 'water_bottle') {
      return {
        itemId: 'splash_water_bottle',
        count: 1,
        ...MINECRAFT_ITEMS.splash_water_bottle,
        isPotion: true,
        isSplash: true
      };
    }
    return {
      ...bottleItem,
      isSplash: true,
      sprite: getPotionSprite(bId, true, false),
      name: `Вибухове ${bottleItem.name.toLowerCase()}`
    };
  }

  // 8. Dragon's Breath modifier (Lingering Potion)
  if ((ingredientId === 'dragon_breath' || ingredientId === 'dragons_breath') && (isSplash || bId === 'splash_water_bottle') && !bottleItem.isLingering) {
    if (bId === 'splash_water_bottle' || bId === 'water_bottle') {
      return {
        itemId: 'lingering_water_bottle',
        count: 1,
        ...MINECRAFT_ITEMS.lingering_water_bottle,
        isPotion: true,
        isSplash: true,
        isLingering: true
      };
    }
    return {
      ...bottleItem,
      isLingering: true,
      sprite: getPotionSprite(bId, true, true),
      name: `Осідальне ${bottleItem.name.replace('Вибухове ', '').toLowerCase()}`
    };
  }

  return null;
}

/**
 * Checks if the brewing stand can start brewing right now.
 */
export function canBrew(ingredientSlot, bottleSlots, fuelCount) {
  if (fuelCount <= 0 || !ingredientSlot || !ingredientSlot.itemId) return false;

  const ingredientId = ingredientSlot.itemId;
  // At least one bottle must be convertible
  return bottleSlots.some((slot) => {
    if (!slot) return false;
    return getBrewingResult(slot, ingredientId) !== null;
  });
}
