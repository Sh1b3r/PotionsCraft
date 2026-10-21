import { MINECRAFT_ITEMS, getPotionSprite } from './minecraftItemIcons.js';

export const BASE_POTION_CONFIGS = [
  { id: 'water_bottle', catalogId: 'water_bottle', name: 'Пляшечка води', color: '#385dc6' },
  { id: 'awkward_potion', catalogId: 'awkward_potion', name: 'Незграбне зілля', color: '#5b5ee6' },
  { id: 'thick_potion', catalogId: 'thick_potion', name: 'Густе зілля', color: '#5b5ee6' },
  { id: 'mundane_potion', catalogId: 'mundane_potion', name: 'Звичайне зілля', color: '#5b5ee6' }
];

export const POTION_CONFIGS = [
  { id: 'potion_swiftness', catalogId: 'swiftness', name: 'Зілля швидкості', extendable: true, upgradable: true },
  { id: 'potion_fire_resistance', catalogId: 'fire_resistance', name: 'Зілля вогнестійкості', extendable: true, upgradable: false },
  { id: 'potion_night_vision', catalogId: 'night_vision', name: 'Зілля нічного бачення', extendable: true, upgradable: false },
  { id: 'potion_healing', catalogId: 'healing', name: 'Зілля зцілення', extendable: false, upgradable: true },
  { id: 'potion_poison', catalogId: 'poison', name: 'Зілля отруєння', extendable: true, upgradable: true },
  { id: 'potion_regeneration', catalogId: 'regeneration', name: 'Зілля регенерації', extendable: true, upgradable: true },
  { id: 'potion_strength', catalogId: 'strength', name: 'Зілля сили', extendable: true, upgradable: true },
  { id: 'potion_slowness', catalogId: 'slowness', name: 'Зілля сповільнення', extendable: true, upgradable: true, levelLabel: 'IV' },
  { id: 'potion_harming', catalogId: 'harming', name: 'Зілля шкоди', extendable: false, upgradable: true },
  { id: 'potion_invisibility', catalogId: 'invisibility', name: 'Зілля невидимості', extendable: true, upgradable: false },
  { id: 'potion_water_breathing', catalogId: 'water_breathing', name: 'Зілля підводного дихання', extendable: true, upgradable: false },
  { id: 'potion_leaping', catalogId: 'leaping', name: 'Зілля стрибучості', extendable: true, upgradable: true },
  { id: 'potion_weakness', catalogId: 'weakness', name: 'Зілля слабкості', extendable: true, upgradable: false },
  { id: 'potion_slow_falling', catalogId: 'slow_falling', name: 'Зілля повільного падіння', extendable: true, upgradable: false },
  { id: 'potion_turtle_master', catalogId: 'turtle_master', name: 'Зілля майстра черепахи', extendable: true, upgradable: true },
  { id: 'potion_oozing', catalogId: 'oozing', name: 'Зілля сочіння', extendable: false, upgradable: false },
  { id: 'potion_weaving', catalogId: 'weaving', name: 'Зілля плетіння', extendable: false, upgradable: false },
  { id: 'potion_infestation', catalogId: 'infestation', name: 'Зілля зараження', extendable: false, upgradable: false },
  { id: 'potion_wind_charging', catalogId: 'wind_charging', name: 'Зілля заряду вітру', extendable: false, upgradable: false }
];

const DELIVERIES = [
  { id: 'regular', label: 'Звичайне', prefix: '' },
  { id: 'splash', label: 'Вибухове', prefix: 'Вибухове ' },
  { id: 'lingering', label: 'Осідальне', prefix: 'Осідальне ' }
];

/**
 * Builds the canonical list of all 135 possible brewable potion variations:
 * - 4 base foundations (Water bottle, Awkward, Thick, Mundane) x 3 delivery types = 12 variants
 * - 19 unique effect potions with all their tiers x 3 delivery types = 123 variants
 * Total = 135 brewable potions
 */
function buildAllPotionVariants() {
  const variants = [];

  // 1. Add 4 Base Foundations (12 variants)
  for (const base of BASE_POTION_CONFIGS) {
    for (const del of DELIVERIES) {
      const key = `${base.id}:base:${del.id}`;
      const isSplash = del.id === 'splash' || del.id === 'lingering';
      const isLingering = del.id === 'lingering';

      let formattedName = '';
      if (base.id === 'water_bottle') {
        if (del.id === 'regular') formattedName = 'Пляшечка води';
        else if (del.id === 'splash') formattedName = 'Вибухова пляшечка води';
        else formattedName = 'Осідальна пляшечка води';
      } else {
        if (del.id === 'regular') formattedName = base.name;
        else formattedName = `${del.prefix}${base.name.toLowerCase()}`;
      }

      const sprite = getPotionSprite(base.id, isSplash, isLingering);

      variants.push({
        key,
        potionId: base.id,
        catalogId: base.catalogId,
        baseName: base.name,
        name: formattedName,
        tier: 'base',
        tierLabel: 'Базове',
        delivery: del.id,
        deliveryLabel: del.label,
        isBase: true,
        isSplash,
        isLingering,
        isExtended: false,
        isLevel2: false,
        sprite,
        color: base.color
      });
    }
  }

  // 2. Add 19 Effect Potions with all tiers (123 variants)
  for (const config of POTION_CONFIGS) {
    const tiers = [{ id: 'base', label: 'Базове', suffix: '' }];
    if (config.extendable) {
      tiers.push({ id: 'extended', label: 'Подовжене (+редстоун)', suffix: ' (Подовжене)' });
    }
    if (config.upgradable) {
      const lvl = config.levelLabel || 'II';
      tiers.push({ id: 'level2', label: `Посилене ${lvl} (+світлопил)`, suffix: ` ${lvl}` });
    }

    for (const tier of tiers) {
      for (const del of DELIVERIES) {
        const key = `${config.id}:${tier.id}:${del.id}`;
        const isSplash = del.id === 'splash' || del.id === 'lingering';
        const isLingering = del.id === 'lingering';
        const isExtended = tier.id === 'extended';
        const isLevel2 = tier.id === 'level2';

        let formattedName = '';
        if (del.id === 'regular') {
          formattedName = `${config.name}${tier.suffix}`;
        } else {
          formattedName = `${del.prefix}${config.name.toLowerCase()}${tier.suffix}`;
        }

        const sprite = getPotionSprite(config.id, isSplash, isLingering);
        const color = MINECRAFT_ITEMS[config.id]?.potionEffectColor || '#7caafc';

        variants.push({
          key,
          potionId: config.id,
          catalogId: config.catalogId,
          baseName: config.name,
          name: formattedName,
          tier: tier.id,
          tierLabel: tier.label,
          delivery: del.id,
          deliveryLabel: del.label,
          isBase: false,
          isSplash,
          isLingering,
          isExtended,
          isLevel2,
          sprite,
          color
        });
      }
    }
  }

  return variants;
}

export const POTION_VARIANTS = buildAllPotionVariants();

export const POTION_VARIANTS_MAP = Object.fromEntries(
  POTION_VARIANTS.map(v => [v.key, v])
);

export const TOTAL_VARIANTS_COUNT = POTION_VARIANTS.length; // 135

/**
 * Identifies the exact variant key for any potion item object
 */
export function identifyPotionVariant(item) {
  if (!item) return null;
  const baseId = item.itemId;
  if (!baseId) return null;

  // 1. Water bottle and its delivery forms
  if (baseId === 'water_bottle' || baseId === 'splash_water_bottle' || baseId === 'lingering_water_bottle') {
    const delivery = (baseId === 'lingering_water_bottle' || item.isLingering)
      ? 'lingering'
      : (baseId === 'splash_water_bottle' || item.isSplash)
      ? 'splash'
      : 'regular';
    const key = `water_bottle:base:${delivery}`;
    return POTION_VARIANTS_MAP[key] ? key : null;
  }

  // 2. Base non-effect potions (awkward, thick, mundane)
  if (baseId === 'awkward_potion' || baseId === 'thick_potion' || baseId === 'mundane_potion') {
    const delivery = item.isLingering ? 'lingering' : item.isSplash ? 'splash' : 'regular';
    const key = `${baseId}:base:${delivery}`;
    return POTION_VARIANTS_MAP[key] ? key : null;
  }

  // 3. Effect potions
  if (baseId.startsWith('potion_')) {
    const delivery = item.isLingering ? 'lingering' : item.isSplash ? 'splash' : 'regular';
    const tier = item.isLevel2 ? 'level2' : item.isExtended ? 'extended' : 'base';
    const key = `${baseId}:${tier}:${delivery}`;
    return POTION_VARIANTS_MAP[key] ? key : null;
  }

  return null;
}

/**
 * Calculates detailed statistics for unlocked variants
 */
export function getVariantStats(brewedVariantKeys = []) {
  const set = new Set(brewedVariantKeys);
  const brewedList = POTION_VARIANTS.filter(v => set.has(v.key));

  const totalRegular = POTION_VARIANTS.filter(v => v.delivery === 'regular').length;
  const totalSplash = POTION_VARIANTS.filter(v => v.delivery === 'splash').length;
  const totalLingering = POTION_VARIANTS.filter(v => v.delivery === 'lingering').length;
  const totalExtended = POTION_VARIANTS.filter(v => v.tier === 'extended').length;
  const totalLevel2 = POTION_VARIANTS.filter(v => v.tier === 'level2').length;

  return {
    total: POTION_VARIANTS.length,
    brewedCount: brewedList.length,
    percentage: Math.round((brewedList.length / POTION_VARIANTS.length) * 100),
    isComplete: brewedList.length >= POTION_VARIANTS.length,
    // Delivery stats
    regularCount: brewedList.filter(v => v.delivery === 'regular').length,
    totalRegular,
    splashCount: brewedList.filter(v => v.delivery === 'splash').length,
    totalSplash,
    lingeringCount: brewedList.filter(v => v.delivery === 'lingering').length,
    totalLingering,
    // Tier stats
    baseCount: brewedList.filter(v => v.tier === 'base').length,
    extendedCount: brewedList.filter(v => v.tier === 'extended').length,
    totalExtended,
    level2Count: brewedList.filter(v => v.tier === 'level2').length,
    totalLevel2,
  };
}
