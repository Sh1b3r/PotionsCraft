import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  ITEM_NAMES,
  POTIONS_LOCALIZED,
  MODIFIER_AFTER_DESCRIPTIONS
} from './translations';
import { POTIONS_DATA } from '../data/potionsData';

export function getDetectedLanguage() {
  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryLang = urlParams.get('lang')?.toLowerCase();
      if (queryLang && SUPPORTED_LANGUAGES[queryLang]) {
        return queryLang;
      }

      const browserLangs = navigator.languages || [navigator.language || 'en'];
      for (const raw of browserLangs) {
        if (!raw) continue;
        const normalized = raw.toLowerCase().replace('_', '-');
        if (SUPPORTED_LANGUAGES[normalized]) return normalized;
        const prefix = normalized.split('-')[0];
        if (SUPPORTED_LANGUAGES[prefix]) return prefix;
      }
    }
  } catch {}
  return 'en';
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getDetectedLanguage);

  useEffect(() => {
    // Keep html lang attribute in sync
    document.documentElement.lang = lang;

    // Listen for language change events on the window if user changes OS preferences
    const handleLanguageChange = () => {
      setLang(getDetectedLanguage());
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [lang]);

  const t = useMemo(() => {
    return (key, params = {}) => {
      const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en || {};
      let text = dict[key] ?? UI_TRANSLATIONS.en[key] ?? UI_TRANSLATIONS.uk[key] ?? key;
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
      return text;
    };
  }, [lang]);

  const getItemName = useMemo(() => {
    return (itemKey) => {
      if (!itemKey) return '';
      const normKey = String(itemKey).toLowerCase().replace(/[\s'-]/g, '_');
      const found = ITEM_NAMES[normKey] || ITEM_NAMES[itemKey];
      if (found) {
        return found[lang] || found.en || found.uk || itemKey;
      }
      return itemKey;
    };
  }, [lang]);

  const getPotion = useMemo(() => {
    return (potionId) => {
      const base = POTIONS_DATA.find((p) => p.id === potionId);
      if (!base) return null;

      const loc = POTIONS_LOCALIZED[potionId]?.[lang] ||
        POTIONS_LOCALIZED[potionId]?.en ||
        POTIONS_LOCALIZED[potionId]?.uk || {};

      const baseItemLoc = getItemName(base.id === 'turtle_master' ? 'awkward_potion' : (base.base?.toLowerCase().includes('water') ? 'water_bottle' : 'awkward_potion'));
      const ingredientItemLoc = getItemName(base.ingredient);

      return {
        ...base,
        name: loc.name || base.name,
        effectName: loc.effect || base.effectName,
        nominativeTitle: loc.nominative || loc.effect || loc.name || base.name,
        ingredient: ingredientItemLoc || base.ingredient,
        base: baseItemLoc || base.base,
      };
    };
  }, [lang, getItemName]);

  const localizedPotions = useMemo(() => {
    return POTIONS_DATA.map((potion) => {
      const loc = POTIONS_LOCALIZED[potion.id]?.[lang] ||
        POTIONS_LOCALIZED[potion.id]?.en ||
        POTIONS_LOCALIZED[potion.id]?.uk || {};

      const baseItemLoc = getItemName(potion.id === 'turtle_master' ? 'awkward_potion' : (potion.base?.toLowerCase().includes('water') || potion.base === 'Незграбне зілля' ? 'awkward_potion' : 'water_bottle'));
      const ingredientItemLoc = getItemName(potion.ingredient);

      return {
        ...potion,
        name: loc.name || potion.name,
        effectName: loc.effect || potion.effectName,
        nominativeTitle: loc.nominative || loc.effect || loc.name || potion.name,
        ingredient: ingredientItemLoc || potion.ingredient,
        base: baseItemLoc || potion.base,
      };
    });
  }, [lang, getItemName]);

  const getDeliveryLabel = useMemo(() => {
    return (delivery) => {
      if (delivery === 'splash') return t('deliv_splash');
      if (delivery === 'lingering') return t('deliv_lingering');
      return t('deliv_regular');
    };
  }, [t]);

  const getVariantName = useMemo(() => {
    return (variant) => {
      if (!variant) return '';
      const locPotion = POTIONS_LOCALIZED[variant.catalogId]?.[lang] ||
                        POTIONS_LOCALIZED[variant.catalogId]?.en ||
                        POTIONS_LOCALIZED[variant.catalogId]?.uk;

      if (variant.isBase) {
        if (variant.potionId === 'water_bottle') {
          const waterBottleTranslations = {
            regular: {
              ru: 'Бутылочка воды', uk: 'Пляшечка води', en: 'Water Bottle', de: 'Wasserflasche',
              fr: "Fiole d'eau", es: 'Botella con agua', pl: 'Butelka wody', pt: 'Frasco de Água',
              it: "Ampolla d'acqua", zh: '水瓶', ja: '水入り瓶', ko: '물병'
            },
            splash: {
              ru: 'Взрывная бутылочка воды', uk: 'Вибухова пляшечка води', en: 'Splash Water Bottle', de: 'Wurfwasserflasche',
              fr: "Fiole d'eau jetable", es: 'Botella arrojadiza con agua', pl: 'Rzucana butelka wody', pt: 'Frasco de Água Arremessável',
              it: "Ampolla da lancio d'acqua", zh: '喷溅型水瓶', ja: 'スプラッシュ水入り瓶', ko: '투척용 물병'
            },
            lingering: {
              ru: 'Оседающая бутылочка воды', uk: 'Осідальна пляшечка води', en: 'Lingering Water Bottle', de: 'Verweilwasserflasche',
              fr: "Fiole d'eau persistante", es: 'Botella con agua persistente', pl: 'Trwała butelka wody', pt: 'Frasco de Água Prolongado',
              it: "Ampolla persistente d'acqua", zh: '滞留型水瓶', ja: '残留水入り瓶', ko: '잔류형 물병'
            }
          };
          return waterBottleTranslations[variant.delivery]?.[lang] ||
                 waterBottleTranslations[variant.delivery]?.en ||
                 waterBottleTranslations[variant.delivery]?.uk ||
                 variant.name;
        }

        const baseItemName = getItemName(variant.potionId || variant.catalogId);
        if (variant.delivery === 'regular') return baseItemName;
        if (lang === 'ru') {
          return variant.delivery === 'splash'
            ? `Взрывное ${baseItemName.toLowerCase()}`
            : `Оседающее ${baseItemName.toLowerCase()}`;
        }
        if (lang === 'uk') {
          return variant.delivery === 'splash'
            ? `Вибухове ${baseItemName.toLowerCase()}`
            : `Осідальне ${baseItemName.toLowerCase()}`;
        }
        if (lang === 'en') {
          return variant.delivery === 'splash'
            ? `Splash ${baseItemName}`
            : `Lingering ${baseItemName}`;
        }
        return `${getDeliveryLabel(variant.delivery)} ${baseItemName}`;
      }

      let formatted = locPotion?.name || variant.baseName || variant.name;

      if (variant.delivery === 'splash') {
        if (lang === 'ru') {
          formatted = formatted.replace(/^Зелье\s+/i, 'Взрывное зелье ');
          if (!formatted.startsWith('Взрывн')) formatted = `Взрывное ${formatted}`;
        } else if (lang === 'uk') {
          formatted = formatted.replace(/^Зілля\s+/i, 'Вибухове зілля ');
          if (!formatted.startsWith('Вибухов')) formatted = `Вибухове ${formatted}`;
        } else if (lang === 'en') {
          formatted = formatted.replace(/^Potion of\s+/i, 'Splash Potion of ');
          if (!formatted.startsWith('Splash')) formatted = `Splash ${formatted}`;
        } else {
          formatted = `${getDeliveryLabel('splash')} ${formatted}`;
        }
      } else if (variant.delivery === 'lingering') {
        if (lang === 'ru') {
          formatted = formatted.replace(/^Зелье\s+/i, 'Оседающее зелье ');
          if (!formatted.startsWith('Оседающ')) formatted = `Оседающее ${formatted}`;
        } else if (lang === 'uk') {
          formatted = formatted.replace(/^Зілля\s+/i, 'Осідальне зілля ');
          if (!formatted.startsWith('Осідальн')) formatted = `Осідальне ${formatted}`;
        } else if (lang === 'en') {
          formatted = formatted.replace(/^Potion of\s+/i, 'Lingering Potion of ');
          if (!formatted.startsWith('Lingering')) formatted = `Lingering ${formatted}`;
        } else {
          formatted = `${getDeliveryLabel('lingering')} ${formatted}`;
        }
      }

      if (variant.tier === 'extended') {
        const extMap = {
          ru: ' (продлённое)', uk: ' (Подовжене)', en: ' (Extended)', de: ' (Verlängert)',
          fr: ' (Rallongée)', es: ' (Prolongada)', pl: ' (Przedłużona)', pt: ' (Prolongada)',
          it: ' (Prolungata)', zh: ' (延长)', ja: ' (延長)', ko: ' (연장)'
        };
        formatted += extMap[lang] || ' (Extended)';
      } else if (variant.tier === 'level2') {
        const lvl = variant.levelLabel || 'II';
        formatted += ` ${lvl}`;
      }

      return formatted;
    };
  }, [lang, getItemName, getDeliveryLabel]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    getItemName,
    getPotion,
    localizedPotions,
    modifierDescriptions: MODIFIER_AFTER_DESCRIPTIONS,
    getDeliveryLabel,
    getVariantName,
  }), [lang, t, getItemName, getPotion, localizedPotions, getDeliveryLabel, getVariantName]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const defaultLang = getDetectedLanguage();
    const t = (key, params = {}) => {
      const dict = UI_TRANSLATIONS[defaultLang] || UI_TRANSLATIONS.en || {};
      let text = dict[key] ?? UI_TRANSLATIONS.en[key] ?? UI_TRANSLATIONS.uk[key] ?? key;
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
      return text;
    };
    return {
      lang: defaultLang,
      t,
      getItemName: (key) => key,
      getPotion: (id) => POTIONS_DATA.find(p => p.id === id),
      localizedPotions: POTIONS_DATA,
      modifierDescriptions: MODIFIER_AFTER_DESCRIPTIONS,
    };
  }
  return ctx;
}
