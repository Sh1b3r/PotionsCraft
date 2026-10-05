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

  // 1. 1 Blaze Rod -> 2 Blaze Powder
  if (filledIndices.length === 1) {
    const idx = filledIndices[0];
    if (items[idx] === 'blaze_rod') {
      return {
        itemId: 'blaze_powder',
        count: 2,
        ...MINECRAFT_ITEMS.blaze_powder
      };
    }
  }

  // 2. 3 Glass in "V" shape -> 3 Glass Bottles
  // Standard V: row 1 col 0 (3), row 2 col 1 (7), row 1 col 2 (5)
  // Higher V: row 0 col 0 (0), row 1 col 1 (4), row 0 col 2 (2)
  if (filledIndices.length === 3) {
    const isStandardV =
      items[3] === 'glass' && items[7] === 'glass' && items[5] === 'glass';
    const isHighV =
      items[0] === 'glass' && items[4] === 'glass' && items[2] === 'glass';

    if (isStandardV || isHighV) {
      return {
        itemId: 'glass_bottle',
        count: 3,
        ...MINECRAFT_ITEMS.glass_bottle
      };
    }

    // 3. Fermented Spider Eye: Spider Eye + Brown Mushroom + Sugar (shapeless 3 items)
    const hasSpiderEye = filledIndices.some((i) => items[i] === 'spider_eye');
    const hasMushroom = filledIndices.some((i) => items[i] === 'brown_mushroom');
    const hasSugar = filledIndices.some((i) => items[i] === 'sugar');

    if (hasSpiderEye && hasMushroom && hasSugar) {
      return {
        itemId: 'fermented_spider_eye',
        count: 1,
        ...MINECRAFT_ITEMS.fermented_spider_eye
      };
    }
  }

  // Magma Cream (Blaze Powder + Slime Block)
  if (filledIndices.length === 2) {
    const hasBlaze = filledIndices.some((i) => items[i] === 'blaze_powder');
    const hasSlime = filledIndices.some((i) => items[i] === 'slime_block');
    if (hasBlaze && hasSlime) {
      return {
        itemId: 'magma_cream',
        count: 1,
        ...MINECRAFT_ITEMS.magma_cream
      };
    }
  }

  // 4. Golden Carrot (8 Gold Nuggets surrounding 1 Carrot)
  // 5. Glistering Melon (8 Gold Nuggets surrounding 1 Melon Slice)
  if (filledIndices.length === 9) {
    const center = items[4];
    const outerAllNuggets = [0, 1, 2, 3, 5, 6, 7, 8].every(
      (idx) => items[idx] === 'gold_nugget'
    );

    if (outerAllNuggets) {
      if (center === 'carrot') {
        return {
          itemId: 'golden_carrot',
          count: 1,
          ...MINECRAFT_ITEMS.golden_carrot
        };
      }
      if (center === 'melon_slice') {
        return {
          itemId: 'glistering_melon',
          count: 1,
          ...MINECRAFT_ITEMS.glistering_melon
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
      case 'fermented_spider_eye':
        baseRes = { itemId: 'potion_weakness', count: 1, ...MINECRAFT_ITEMS.potion_weakness };
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
    if (bId === 'potion_swiftness' || bId === 'potion_leaping') {
      invRes = {
        itemId: 'potion_slowness',
        count: 1,
        isExtended,
        isLevel2,
        isSplash,
        isLingering,
        ...MINECRAFT_ITEMS.potion_slowness
      };
    } else if (bId === 'potion_healing' || bId === 'potion_poison') {
      invRes = {
        itemId: 'potion_harming',
        count: 1,
        isExtended,
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
      'potion_turtle_master',
      'potion_oozing',
      'potion_weaving',
      'potion_infestation',
      'potion_wind_charging'
    ];
    if (extendable.includes(bId)) {
      const baseDef = MINECRAFT_ITEMS[bId];
      return {
        ...bottleItem,
        isExtended: true,
        name: `${bottleItem.name} (Подовжене)`,
        description: `${baseDef.description} (Подовжений час дії: 8:00)`
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
      'potion_turtle_master'
    ];
    if (upgradable.includes(bId)) {
      const baseDef = MINECRAFT_ITEMS[bId];
      return {
        ...bottleItem,
        isLevel2: true,
        name: `${bottleItem.name} II`,
        description: `${baseDef.description} (Посилена дія II рівня)`
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
    const cleanKey = bId.startsWith('potion_') ? bId.replace('potion_', '') : bId;
    return {
      ...bottleItem,
      isSplash: true,
      sprite: `/items/splash/splash_${cleanKey}.png`,
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
    const cleanKey = bId.startsWith('potion_') ? bId.replace('potion_', '') : bId;
    return {
      ...bottleItem,
      isLingering: true,
      sprite: `/items/lingering/lingering_${cleanKey}.png`,
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
