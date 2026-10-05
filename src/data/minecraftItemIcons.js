// Authentic Minecraft Items Database for Brewing & Crafting Station
// Contains Ukrainian localization, lore, categories, and pixel-art sprites.

export const MINECRAFT_ITEMS = {
  glass: {
    id: 'glass',
    name: 'Скло',
    sprite: '/items/glass.png',
    maxStack: 64,
  },
  stick: {
    id: 'stick',
    name: 'Палиця',
    sprite: '/items/stick.png',
    maxStack: 64,
  },
  blaze_rod: {
    id: 'blaze_rod',
    name: 'Вогняний стрижень',
    sprite: '/items/blaze_rod.png',
    maxStack: 64,
  },
  spider_eye: {
    id: 'spider_eye',
    name: 'Око павука',
    sprite: '/items/spider_eye.png',
    maxStack: 64,
  },
  brown_mushroom: {
    id: 'brown_mushroom',
    name: 'Коричневий гриб',
    sprite: '/items/brown_mushroom.png',
    maxStack: 64,
  },
  sugar: {
    id: 'sugar',
    name: 'Цукор',
    sprite: '/items/sugar.png',
    maxStack: 64,
  },
  gold_nugget: {
    id: 'gold_nugget',
    name: 'Золотий самородок',
    sprite: '/items/gold_nugget.png',
    maxStack: 64,
  },
  carrot: {
    id: 'carrot',
    name: 'Морква',
    sprite: '/items/carrot.png',
    maxStack: 64,
  },
  melon_slice: {
    id: 'melon_slice',
    name: 'Скибка кавуна',
    sprite: '/items/melon_slice.png',
    maxStack: 64,
  },
  ghast_tear: {
    id: 'ghast_tear',
    name: 'Сльоза ґаста',
    sprite: '/items/ghast_tear.png',
    maxStack: 64,
  },
  magma_cream: {
    id: 'magma_cream',
    name: 'Лавовий слиз',
    sprite: '/items/magma_cream.png',
    maxStack: 64,
  },
  nether_wart: {
    id: 'nether_wart',
    name: 'Пекельний наріст',
    sprite: '/items/nether_wart.png',
    maxStack: 64,
  },
  redstone: {
    id: 'redstone',
    name: 'Редстоун',
    sprite: '/items/redstone.png',
    maxStack: 64,
  },
  glowstone: {
    id: 'glowstone',
    name: 'Світлопил',
    sprite: '/items/glowstone.png',
    maxStack: 64,
  },
  gunpowder: {
    id: 'gunpowder',
    name: 'Порох',
    sprite: '/items/gunpowder.png',
    maxStack: 64,
  },
  dragons_breath: {
    id: 'dragons_breath',
    name: 'Подих дракона',
    sprite: "/Dragon's_Breath_JE2_BE2.png",
    maxStack: 64,
  },
  water_bottle: {
    id: 'water_bottle',
    name: 'Пляшечка води',
    sprite: '/items/water_bottle.png',
    maxStack: 1,
    isPotion: true,
  },
  splash_water_bottle: {
    id: 'splash_water_bottle',
    name: 'Вибухова пляшечка води',
    sprite: '/items/splash_water_bottle.png',
    maxStack: 1,
    isPotion: true,
    isSplash: true,
  },
  lingering_water_bottle: {
    id: 'lingering_water_bottle',
    name: 'Осідальна пляшечка води',
    sprite: '/items/lingering_water_bottle.png',
    maxStack: 1,
    isPotion: true,
    isSplash: true,
    isLingering: true,
  },
  glass_bottle: {
    id: 'glass_bottle',
    name: 'Скляна пляшечка',
    sprite: '/items/glass_bottle.png',
    maxStack: 64,
  },
  blaze_powder: {
    id: 'blaze_powder',
    name: 'Вогняний порошок',
    sprite: '/items/blaze_powder.png',
    maxStack: 64,
  },
  fermented_spider_eye: {
    id: 'fermented_spider_eye',
    name: 'Мариноване око павука',
    sprite: '/items/fermented_spider_eye.png',
    maxStack: 64,
  },
  golden_carrot: {
    id: 'golden_carrot',
    name: 'Золота морква',
    sprite: '/items/golden_carrot.png',
    maxStack: 64,
  },
  glistering_melon: {
    id: 'glistering_melon',
    name: 'Іскристий кавун',
    sprite: '/items/glistering_melon.png',
    maxStack: 64,
  },
  pufferfish: {
    id: 'pufferfish',
    name: 'Риба-фугу',
    sprite: '/items/pufferfish_gui.png',
    maxStack: 64,
  },

  // Brewed Potions
  awkward_potion: {
    id: 'awkward_potion',
    name: 'Незграбне зілля',
    sprite: '/items/water_bottle.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#5b5ee6',
  },
  potion_swiftness: {
    id: 'potion_swiftness',
    catalogId: 'swiftness',
    name: 'Зілля швидкості',
    sprite: '/Potion_of_Swiftness_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#7caafc',
  },
  potion_fire_resistance: {
    id: 'potion_fire_resistance',
    catalogId: 'fire_resistance',
    name: 'Зілля вогнестійкості',
    sprite: '/Potion_of_Fire_Resistance_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#e49a3a',
  },
  potion_night_vision: {
    id: 'potion_night_vision',
    catalogId: 'night_vision',
    name: 'Зілля нічного бачення',
    sprite: '/Potion_of_Night_Vision_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#2836ab',
  },
  potion_regeneration: {
    id: 'potion_regeneration',
    catalogId: 'regeneration',
    name: 'Зілля регенерації',
    sprite: '/Potion_of_Regeneration_JE2_BE2.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#cd5cab',
  },
  potion_strength: {
    id: 'potion_strength',
    catalogId: 'strength',
    name: 'Зілля сили',
    sprite: '/Potion_of_Strength_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#932423',
  },
  potion_healing: {
    id: 'potion_healing',
    catalogId: 'healing',
    name: 'Зілля зцілення',
    sprite: '/Potion_of_Healing_JE2_BE2.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#f82423',
  },
  potion_poison: {
    id: 'potion_poison',
    catalogId: 'poison',
    name: 'Зілля отруєння',
    sprite: '/Potion_of_Poison_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#4e9331',
  },
  potion_slowness: {
    id: 'potion_slowness',
    catalogId: 'slowness',
    name: 'Зілля сповільнення',
    sprite: '/Potion_of_Slowness_JE3.webp',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#5a6c81',
  },
  potion_harming: {
    id: 'potion_harming',
    catalogId: 'harming',
    name: 'Зілля шкоди',
    sprite: '/Potion_of_Harming_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#430a09',
  },
  potion_invisibility: {
    id: 'potion_invisibility',
    catalogId: 'invisibility',
    name: 'Зілля невидимості',
    sprite: '/Potion_of_Invisibility_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#7f8392',
  },
  potion_weakness: {
    id: 'potion_weakness',
    catalogId: 'weakness',
    name: 'Зілля слабкості',
    sprite: '/Potion_of_Weakness_JE2_BE2.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#484d48',
  },
  potion_water_breathing: {
    id: 'potion_water_breathing',
    catalogId: 'water_breathing',
    name: 'Зілля підводного дихання',
    sprite: '/Potion_of_Water_Breathing_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#2e5299',
  },
  potion_leaping: {
    id: 'potion_leaping',
    catalogId: 'leaping',
    name: 'Зілля стрибучості',
    sprite: '/Potion_of_Leaping_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#22ff4c',
  },
  potion_slow_falling: {
    id: 'potion_slow_falling',
    catalogId: 'slow_falling',
    name: 'Зілля повільного падіння',
    sprite: '/Potion_of_Slow_Falling_JE4_BE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#f7f4d5',
  },
  potion_turtle_master: {
    id: 'potion_turtle_master',
    catalogId: 'turtle_master',
    name: 'Зілля майстра черепахи',
    sprite: '/Potion_of_the_Turtle_Master_JE3.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#8a4299',
  },
  potion_oozing: {
    id: 'potion_oozing',
    catalogId: 'oozing',
    name: 'Зілля сочіння',
    sprite: '/Potion_of_Oozing_JE1_BE1.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#96eb7b',
  },
  potion_weaving: {
    id: 'potion_weaving',
    catalogId: 'weaving',
    name: 'Зілля плетіння',
    sprite: '/Potion_of_Weaving_JE1_BE1.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#766a5c',
  },
  potion_infestation: {
    id: 'potion_infestation',
    catalogId: 'infestation',
    name: 'Зілля зараження',
    sprite: '/Potion_of_Infestation_JE1_BE1.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#899183',
  },
  potion_wind_charging: {
    id: 'potion_wind_charging',
    catalogId: 'wind_charging',
    name: 'Зілля заряду вітру',
    sprite: '/Potion_of_Wind_Charging_JE1_BE1.png',
    maxStack: 1,
    isPotion: true,
    potionEffectColor: '#c2ddf0',
  },

  // Additional Brewing Ingredients
  turtle_shell: {
    id: 'turtle_shell',
    name: 'Панцир черепахи',
    sprite: '/items/turtle_shell.png',
    maxStack: 64,
  },
  slime_block: {
    id: 'slime_block',
    name: 'Слизовий блок',
    sprite: '/items/slime_block.png',
    maxStack: 64,
  },
  cobweb: {
    id: 'cobweb',
    name: 'Павутиння',
    sprite: '/items/cobweb.png',
    maxStack: 64,
  },
  stone: {
    id: 'stone',
    name: 'Камінь',
    sprite: '/items/stone.png',
    maxStack: 64,
  },
  breeze_rod: {
    id: 'breeze_rod',
    name: 'Стрижень вітреня',
    sprite: '/items/breeze_rod.png',
    maxStack: 64,
  },
  dragon_breath: {
    id: 'dragon_breath',
    name: 'Дихання дракона',
    sprite: "/Dragon's_Breath_JE2_BE2.png",
    maxStack: 64,
  },
  echo_shard: {
    id: 'echo_shard',
    name: 'Осколок відлуння',
    sprite: '/items/echo_shard.png',
    maxStack: 64,
  },
  sculk_catalyst: {
    id: 'sculk_catalyst',
    name: 'Скалковий каталізатор',
    sprite: '/items/sculk_catalyst.png',
    maxStack: 64,
  }
};

/**
 * Returns authentic pixel-perfect sprite path for normal, splash, or lingering potions
 */
export function getPotionSprite(itemId, isSplash = false, isLingering = false) {
  if (!itemId || itemId === 'water_bottle') {
    if (isLingering) return '/items/lingering_water_bottle.png';
    if (isSplash) return '/items/splash_water_bottle.png';
    return '/items/water_bottle.png';
  }
  if (itemId === 'splash_water_bottle') {
    if (isLingering) return '/items/lingering_water_bottle.png';
    return '/items/splash_water_bottle.png';
  }
  if (itemId === 'lingering_water_bottle') {
    return '/items/lingering_water_bottle.png';
  }
  const cleanKey = itemId.startsWith('potion_') ? itemId.replace('potion_', '') : itemId;
  if (isLingering) {
    return `/items/lingering/lingering_${cleanKey}.png`;
  }
  if (isSplash) {
    return `/items/splash/splash_${cleanKey}.png`;
  }
  return MINECRAFT_ITEMS[itemId]?.sprite || '/items/water_bottle.png';
}
