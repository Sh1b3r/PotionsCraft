import React, { useMemo } from 'react';
import { TooltipTrigger } from './MinecraftTooltip';
import { useI18n } from '../i18n';

export default function BaseModifiersTable() {
  const { t, lang, getItemName, getPotion, modifierDescriptions } = useI18n();

  const rows = useMemo(() => {
    const weaknessPotion = getPotion('weakness');
    const splashWaterName = (() => {
      const splashPrefix = lang === 'ru' ? 'Взрывная ' : lang === 'uk' ? 'Вибухова ' : 'Splash ';
      const waterName = getItemName('water_bottle');
      if (lang === 'en') return 'Splash Water Bottle';
      if (lang === 'ru') return 'Взрывная бутылочка воды';
      if (lang === 'uk') return 'Вибухова пляшка води';
      return `${splashPrefix}${waterName}`;
    })();

    const lingeringWaterName = (() => {
      if (lang === 'en') return 'Lingering Water Bottle';
      if (lang === 'ru') return 'Оседающая бутылочка воды';
      if (lang === 'uk') return 'Осідальна пляшка води';
      return getItemName('water_bottle');
    })();

    return [
      {
        key: 'nether_wart',
        name: getItemName('nether_wart'),
        anchor: 'Nether_Wart',
        icon: '/items/nether_wart.png',
        waterName: getItemName('awkward_potion'),
        waterTip: `&7${t('minetip_no_effects')}`,
        afterModifier: modifierDescriptions.nether_wart[lang] || modifierDescriptions.nether_wart.en,
      },
      {
        key: 'redstone',
        name: getItemName('redstone'),
        anchor: 'Redstone',
        icon: '/items/redstone.png',
        waterName: getItemName('mundane_potion'),
        waterTip: `&7${t('minetip_no_effects')}`,
        afterModifier: modifierDescriptions.redstone[lang] || modifierDescriptions.redstone.en,
      },
      {
        key: 'glowstone',
        name: getItemName('glowstone'),
        anchor: 'Glowstone',
        icon: '/items/glowstone.png',
        waterName: getItemName('thick_potion'),
        waterTip: `&7${t('minetip_no_effects')}`,
        afterModifier: modifierDescriptions.glowstone[lang] || modifierDescriptions.glowstone.en,
      },
      {
        key: 'fermented_spider_eye',
        name: getItemName('fermented_spider_eye'),
        anchor: 'Fermented_Spider_Eye',
        icon: '/items/fermented_spider_eye.png',
        waterName: weaknessPotion ? weaknessPotion.name : 'Potion of Weakness',
        waterTip: '&c' + (weaknessPotion?.effectName || 'Weakness') + ' (1:30)',
        afterModifier: modifierDescriptions.fermented_spider_eye[lang] || modifierDescriptions.fermented_spider_eye.en,
      },
      {
        key: 'gunpowder',
        name: getItemName('gunpowder'),
        anchor: 'Gunpowder',
        icon: '/items/gunpowder.png',
        waterName: splashWaterName,
        waterTip: `&7${t('minetip_no_effects')}`,
        afterModifier: modifierDescriptions.gunpowder[lang] || modifierDescriptions.gunpowder.en,
      },
      {
        key: 'dragon_breath',
        name: getItemName('dragon_breath'),
        anchor: 'Dragon_Breath',
        icon: '/Dragon\'s_Breath_JE2_BE2.png',
        waterName: (
          <>
            <span className="wiki-potion-link">{lingeringWaterName}</span>
            <br />
            <small className="table-subtext">{t('table_sub_splash_note')}</small>
          </>
        ),
        waterTip: `&7${t('minetip_no_effects')}`,
        afterModifier: modifierDescriptions.dragon_breath[lang] || modifierDescriptions.dragon_breath.en,
      },
    ];
  }, [lang, t, getItemName, getPotion, modifierDescriptions]);

  return (
    <section className="wiki-section-container">
      <div className="wiki-section-header">
        <h2 className="wiki-section-title">{t('table_title')}</h2>
      </div>

      <div className="wiki-section-intro">
        <p>{t('table_intro_1')}</p>
        <p>{t('table_intro_2')}</p>
      </div>

      <div className="wiki-table-wrapper">
        <table className="wikitable minecraft-styled-table" style={{ textAlign: 'center' }} data-description="Bases and modifiers">
          <thead>
            <tr>
              <th>{t('table_col_name')}</th>
              <th>{t('table_col_icon')}</th>
              <th>{t('table_col_water')}</th>
              <th>{t('table_col_modifier')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row" className="table-item-name">
                  <span className="anchor" id={row.anchor}></span>
                  <a href={`#${row.anchor}`} className="wiki-name-link">{row.name}</a>
                </th>
                <td className="table-icon-cell">
                  <TooltipTrigger
                    title={row.name}
                    lore={row.waterTip}
                  >
                    <span className="invslot">
                      <span className="invslot-item invslot-item-image">
                        <img
                          src={row.icon}
                          alt={row.name}
                          className="table-item-img"
                          width="32"
                          height="32"
                          loading="lazy"
                        />
                      </span>
                    </span>
                  </TooltipTrigger>
                </td>
                <td className="table-water-cell">
                  {typeof row.waterName === 'string' ? (
                    <TooltipTrigger title={row.waterName} lore={row.waterTip}>
                      <span className="wiki-potion-link">{row.waterName}</span>
                    </TooltipTrigger>
                  ) : (
                    row.waterName
                  )}
                </td>
                <td className="table-modifier-cell">
                  {row.afterModifier}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

