import React, { useEffect, useState, useMemo } from 'react';
import { POTIONS_DATA } from '../data/potionsData';
import { POTION_VARIANTS, TOTAL_VARIANTS_COUNT, getVariantStats } from '../data/potionVariantsData';
import { playButtonClickSound } from '../utils/soundEffects';
import { useI18n } from '../i18n';

export function getAchievementsState() {
  try {
    const hasLocalBrewery =
      localStorage.getItem('potionscraft_achievement_local_brewery') === 'true' ||
      localStorage.getItem('potionscraft_achievement_local_brew') === 'true' ||
      localStorage.getItem('potionscraft_achievement_mistseva_brovarnya') === 'true' ||
      JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').local_brewery === true;

    const hasMasterAlchemist =
      localStorage.getItem('potionscraft_achievement_master_alchemist') === 'true' ||
      localStorage.getItem('potionscraft_achievement_master_zillya') === 'true' ||
      localStorage.getItem('potionscraft_achievement_potion_master') === 'true' ||
      localStorage.getItem('potionscraft_achievement_master_potion') === 'true' ||
      JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').master_alchemist === true ||
      JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').master_zillya === true;

    const hasTrueAlchemist =
      localStorage.getItem('potionscraft_achievement_true_alchemist') === 'true' ||
      JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').true_alchemist === true;

    const hasPotionOverlord =
      localStorage.getItem('potionscraft_achievement_potion_overlord') === 'true' ||
      localStorage.getItem('potionscraft_achievement_volodar_zillyavarinnya') === 'true' ||
      JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').potion_overlord === true ||
      JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').volodar_zillyavarinnya === true;

    const totalBrewed = parseInt(localStorage.getItem('potionscraft_total_potions_brewed') || '0', 10) || 0;
    const history = JSON.parse(localStorage.getItem('potionscraft_brewed_potions_history') || '[]');
    const manualBrewed = JSON.parse(localStorage.getItem('potionscraft_manual_brewed_potions') || '[]');
    const brewedVariants = JSON.parse(localStorage.getItem('potionscraft_brewed_variants') || '[]');

    return {
      hasLocalBrewery,
      hasMasterAlchemist,
      hasTrueAlchemist,
      hasPotionOverlord,
      totalBrewed,
      history: Array.isArray(history) ? history : [],
      manualBrewed: Array.isArray(manualBrewed) ? manualBrewed : [],
      brewedVariants: Array.isArray(brewedVariants) ? brewedVariants : []
    };
  } catch {
    return {
      hasLocalBrewery: false,
      hasMasterAlchemist: false,
      hasTrueAlchemist: false,
      hasPotionOverlord: false,
      totalBrewed: 0,
      history: [],
      manualBrewed: [],
      brewedVariants: []
    };
  }
}

export default function AchievementsModal({ isOpen, onClose, isDark }) {
  const { t, getPotion, getVariantName, getDeliveryLabel } = useI18n();
  const [data, setData] = useState(getAchievementsState);
  const [checklistTab, setChecklistTab] = useState('variants'); // 'variants' | 'base'
  const [baseFilter, setBaseFilter] = useState('all'); // 'all' | 'brewed' | 'remaining'
  const [variantStatusFilter, setVariantStatusFilter] = useState('all'); // 'all' | 'brewed' | 'remaining'
  const [variantTypeFilter, setVariantTypeFilter] = useState('all'); // 'all' | 'regular' | 'splash' | 'lingering' | 'extended' | 'level2'

  useEffect(() => {
    if (isOpen) {
      setData(getAchievementsState());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        playButtonClickSound();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Base 19 catalog potions status
  const basePotionsStatusList = useMemo(() => {
    return POTIONS_DATA.map((p) => {
      const isBrewed = data.history.some((h) => {
        if (typeof h === 'string') return h.toLowerCase().includes(p.name.toLowerCase());
        return h.catalogId === p.id || h.name === p.name;
      });
      const isManual = data.manualBrewed.includes(p.id);
      return { ...p, isBrewed, isManual };
    });
  }, [data.history, data.manualBrewed]);

  const baseBrewedCount = basePotionsStatusList.filter((p) => p.isBrewed).length;
  const baseManualCount = basePotionsStatusList.filter((p) => p.isManual).length;
  const isTrueAlchemistComplete = baseManualCount >= POTIONS_DATA.length || data.hasTrueAlchemist;

  const displayedBasePotions = useMemo(() => {
    return basePotionsStatusList.filter((p) => {
      if (baseFilter === 'brewed') return p.isBrewed;
      if (baseFilter === 'remaining') return !p.isBrewed;
      return true;
    });
  }, [basePotionsStatusList, baseFilter]);

  // All 123 variants statistics and status
  const variantStats = useMemo(() => {
    return getVariantStats(data.brewedVariants);
  }, [data.brewedVariants]);

  const isOverlordComplete = variantStats.isComplete || data.hasPotionOverlord;

  const variantsStatusList = useMemo(() => {
    const brewedSet = new Set(data.brewedVariants);
    return POTION_VARIANTS.map((v) => ({
      ...v,
      isBrewed: brewedSet.has(v.key)
    }));
  }, [data.brewedVariants]);

  const displayedVariants = useMemo(() => {
    return variantsStatusList.filter((v) => {
      if (variantStatusFilter === 'brewed' && !v.isBrewed) return false;
      if (variantStatusFilter === 'remaining' && v.isBrewed) return false;
      if (variantTypeFilter !== 'all') {
        if (variantTypeFilter === 'regular' && v.delivery !== 'regular') return false;
        if (variantTypeFilter === 'splash' && v.delivery !== 'splash') return false;
        if (variantTypeFilter === 'lingering' && v.delivery !== 'lingering') return false;
        if (variantTypeFilter === 'extended' && v.tier !== 'extended') return false;
        if (variantTypeFilter === 'level2' && v.tier !== 'level2') return false;
        if (variantTypeFilter === 'base' && !v.isBase) return false;
      }
      return true;
    });
  }, [variantsStatusList, variantStatusFilter, variantTypeFilter]);

  if (!isOpen) return null;

  return (
    <div
      className="mc-achievements-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('achievements_title')}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playButtonClickSound();
          onClose();
        }
      }}
    >
      <div className={`mc-achievements-window ${isDark ? 'dark-theme' : 'light-theme'}`}>
        {/* Header */}
        <div className="mc-achievements-header">
          <div className="mc-achievements-header-title">
            <img src="/items/advancements_book.svg" alt="" className="mc-achievements-title-icon" />
            <h2>{t('achievements_title')}</h2>
          </div>
          <button
            type="button"
            className="mc-achievements-close-btn"
            onClick={() => {
              playButtonClickSound();
              onClose();
            }}
            aria-label={t('achievements_close')}
          >
            ✕
          </button>
        </div>

        {/* Global Stats Overview Banner */}
        <div className="mc-achievements-stats-bar">
          <div className="mc-ach-stat">
            <span className="mc-ach-stat-label">{t('achievements_total_brewed')}</span>
            <span className="mc-ach-stat-val">{data.totalBrewed}</span>
          </div>
          <div className="mc-ach-stat">
            <span className="mc-ach-stat-label">{t('achievements_tab_base')}:</span>
            <span className="mc-ach-stat-val highlight">{baseBrewedCount} / {POTIONS_DATA.length}</span>
          </div>
          <div className="mc-ach-stat">
            <span className="mc-ach-stat-label">{t('achievements_tab_variants')}:</span>
            <span className="mc-ach-stat-val gold">{variantStats.brewedCount} / {TOTAL_VARIANTS_COUNT}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="mc-achievements-body">
          {/* Main Achievements Section */}
          <div className="mc-achievements-section-title">{t('achievements_title')}</div>
          <div className="mc-achievements-cards-row">
            {/* 1. Місцева броварня */}
            <div className={`mc-ach-card ${data.hasLocalBrewery ? 'is-unlocked' : 'is-locked'}`}>
              <div className="mc-ach-card-icon-box">
                <img src="/items/brewing_stand.png" alt={t('ach_local_brewery_title')} />
              </div>
              <div className="mc-ach-card-content">
                <div className="mc-ach-card-name">{t('ach_local_brewery_title')}</div>
                <div className="mc-ach-card-desc">{t('ach_local_brewery_desc')}</div>
                <div className="mc-ach-card-status">
                  {data.hasLocalBrewery ? <span className="unlocked-text">✓</span> : <span className="locked-text">🔒</span>}
                </div>
              </div>
            </div>

            {/* 2. Майстер зілля */}
            <div className={`mc-ach-card ${data.hasMasterAlchemist ? 'is-unlocked' : 'is-locked'}`}>
              <div className="mc-ach-card-icon-box">
                <img src="/Potion_of_Swiftness_JE3.png" alt={t('ach_master_alchemist_title')} />
              </div>
              <div className="mc-ach-card-content">
                <div className="mc-ach-card-name">{t('ach_master_alchemist_title')}</div>
                <div className="mc-ach-card-desc">{t('ach_master_alchemist_desc')}</div>
                <div className="mc-ach-card-status">
                  {data.hasMasterAlchemist ? <span className="unlocked-text">✓</span> : <span className="locked-text">🔒</span>}
                </div>
              </div>
            </div>

            {/* 3. Істинний зіллєвар */}
            <div className={`mc-ach-card ${isTrueAlchemistComplete ? 'is-unlocked' : 'is-locked'}`}>
              <div className="mc-ach-card-icon-box">
                <img src="/Potion_of_Healing_JE2_BE2.png" alt={t('ach_true_alchemist_title')} />
              </div>
              <div className="mc-ach-card-content">
                <div className="mc-ach-card-name">{t('ach_true_alchemist_title')}</div>
                <div className="mc-ach-card-desc">{t('ach_true_alchemist_desc')}</div>
                <div className="mc-ach-card-status">
                  {isTrueAlchemistComplete ? (
                    <span className="unlocked-text gold-text">✓ ({POTIONS_DATA.length}/{POTIONS_DATA.length})</span>
                  ) : (
                    <span className="locked-text">🔒 {baseManualCount} / {POTIONS_DATA.length}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grand Ultimate Achievement: "Володар зіллєваріння" */}
          <div className="mc-achievements-section-title overlord-section-title">{t('ach_potion_overlord_title')}</div>
          <div className={`mc-ach-card overlord-card ${isOverlordComplete ? 'is-unlocked' : 'is-locked'}`}>
            <div className="mc-ach-card-icon-box overlord-icon-box">
              <img
                src="/Potion_of_the_Turtle_Master_JE3.png"
                alt={t('ach_potion_overlord_title')}
                onError={(e) => { e.currentTarget.src = '/items/brewing_stand.png'; }}
              />
              {isOverlordComplete && <span className="overlord-crown">👑</span>}
            </div>
            <div className="mc-ach-card-content">
              <div className="mc-ach-card-name overlord-name">
                {t('ach_potion_overlord_title')}
                {isOverlordComplete && <span className="overlord-tag">100%</span>}
              </div>
              <div className="mc-ach-card-desc">
                {t('ach_potion_overlord_desc')}
              </div>

              {/* Progress bar */}
              <div className="mc-ach-progress-bar-wrap overlord-progress-wrap">
                <div
                  className="mc-ach-progress-bar-fill overlord-progress-fill"
                  style={{ width: `${Math.min(100, (variantStats.brewedCount / TOTAL_VARIANTS_COUNT) * 100)}%` }}
                />
              </div>

              {/* Category sub-stats pills */}
              <div className="mc-ach-chips-row">
                <span className={`mc-ach-chip ${variantStats.regularCount >= (variantStats.totalRegular || 45) ? 'done' : ''}`} title={t('achievements_filter_regular')}>
                  {t('ach_chip_regular', { count: variantStats.regularCount, total: variantStats.totalRegular || 45 })}
                </span>
                <span className={`mc-ach-chip ${variantStats.splashCount >= (variantStats.totalSplash || 45) ? 'done' : ''}`} title={t('achievements_filter_splash')}>
                  {t('ach_chip_splash', { count: variantStats.splashCount, total: variantStats.totalSplash || 45 })}
                </span>
                <span className={`mc-ach-chip ${variantStats.lingeringCount >= (variantStats.totalLingering || 45) ? 'done' : ''}`} title={t('achievements_filter_lingering')}>
                  {t('ach_chip_lingering', { count: variantStats.lingeringCount, total: variantStats.totalLingering || 45 })}
                </span>
                <span className={`mc-ach-chip ${variantStats.extendedCount >= (variantStats.totalExtended || 39) ? 'done' : ''}`} title={t('achievements_filter_extended')}>
                  {t('ach_chip_redstone', { count: variantStats.extendedCount, total: variantStats.totalExtended || 39 })}
                </span>
                <span className={`mc-ach-chip ${variantStats.level2Count >= (variantStats.totalLevel2 || 27) ? 'done' : ''}`} title={t('achievements_filter_level2')}>
                  {t('ach_chip_glowstone', { count: variantStats.level2Count, total: variantStats.totalLevel2 || 27 })}
                </span>
              </div>

              <div className="mc-ach-card-status">
                {isOverlordComplete ? (
                  <span className="unlocked-text gold-text">
                    {t('ach_overlord_unlocked', { count: TOTAL_VARIANTS_COUNT })}
                  </span>
                ) : (
                  <span className="locked-text">
                    {t('ach_overlord_progress_line', {
                      count: variantStats.brewedCount,
                      total: TOTAL_VARIANTS_COUNT,
                      percent: variantStats.percentage
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Checklist Navigation Tabs */}
          <div className="mc-ach-checklist-nav">
            <button
              type="button"
              className={`mc-ach-nav-tab ${checklistTab === 'variants' ? 'active' : ''}`}
              onClick={() => {
                playButtonClickSound();
                setChecklistTab('variants');
              }}
            >
              {t('achievements_tab_variants')} ({variantStats.brewedCount} / {TOTAL_VARIANTS_COUNT})
            </button>
            <button
              type="button"
              className={`mc-ach-nav-tab ${checklistTab === 'base' ? 'active' : ''}`}
              onClick={() => {
                playButtonClickSound();
                setChecklistTab('base');
              }}
            >
              {t('achievements_tab_base')} ({baseBrewedCount} / {POTIONS_DATA.length})
            </button>
          </div>

          {/* TAB 1: ALL 123 VARIANTS CHECKLIST */}
          {checklistTab === 'variants' && (
            <div className="mc-ach-variants-section">
              <div className="mc-ach-variants-toolbar">
                {/* Status filter: All / Brewed / Remaining */}
                <div className="mc-ach-filters">
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${variantStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setVariantStatusFilter('all')}
                  >
                    {t('achievements_filter_all')} ({TOTAL_VARIANTS_COUNT})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${variantStatusFilter === 'brewed' ? 'active' : ''}`}
                    onClick={() => setVariantStatusFilter('brewed')}
                  >
                    {t('achievements_filter_brewed')} ({variantStats.brewedCount})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${variantStatusFilter === 'remaining' ? 'active' : ''}`}
                    onClick={() => setVariantStatusFilter('remaining')}
                  >
                    {t('achievements_filter_remaining')} ({TOTAL_VARIANTS_COUNT - variantStats.brewedCount})
                  </button>
                </div>

                {/* Subcategory filter pills */}
                <div className="mc-ach-type-filters">
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('all')}
                  >
                    {t('ach_all_types')}
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'regular' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('regular')}
                  >
                    {t('ach_pill_regular')}
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'splash' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('splash')}
                  >
                    {t('ach_pill_splash')}
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'lingering' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('lingering')}
                  >
                    {t('ach_pill_lingering')}
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'extended' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('extended')}
                  >
                    {t('ach_pill_extended')}
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'level2' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('level2')}
                  >
                    {t('ach_pill_level2')}
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'base' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('base')}
                  >
                    {t('ach_pill_base')}
                  </button>
                </div>
              </div>

              {/* Grid of 123 Potion Variations */}
              <div className="mc-ach-variants-grid">
                {displayedVariants.map((v) => {
                  const localizedVariantName = getVariantName(v);
                  return (
                    <div
                      key={v.key}
                      className={`mc-ach-variant-item ${v.isBrewed ? 'brewed' : 'unbrewed'}`}
                      title={localizedVariantName}
                    >
                      <div className="mc-ach-variant-icon-box">
                        <img
                          src={v.sprite}
                          alt={localizedVariantName}
                          className="mc-ach-variant-icon"
                          draggable="false"
                          onError={(e) => { e.currentTarget.src = '/items/water_bottle.png'; }}
                        />
                        {v.isBrewed && <span className="mc-ach-variant-check">✓</span>}
                      </div>
                      <div className="mc-ach-variant-details">
                        <div className="mc-ach-variant-name">{localizedVariantName}</div>
                        <div className="mc-ach-variant-tags">
                          <span className={`tag-del tag-${v.delivery}`}>{getDeliveryLabel(v.delivery)}</span>
                          {v.tier !== 'base' && (
                            <span className={`tag-tier tag-${v.tier}`}>
                              {v.tier === 'extended' ? t('tag_plus_redstone') : t('tag_plus_glowstone')}
                            </span>
                          )}
                          {v.isBrewed ? (
                            <span className="tag-status brewed">✓ {t('tag_brewed')}</span>
                          ) : (
                            <span className="tag-status unbrewed">{t('tag_waiting')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BASE 19 POTIONS CHECKLIST */}
          {checklistTab === 'base' && (
            <div className="mc-ach-base-section">
              <div className="mc-achievements-potions-header">
                <div className="mc-ach-filters">
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${baseFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setBaseFilter('all')}
                  >
                    {t('achievements_filter_all')} ({POTIONS_DATA.length})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${baseFilter === 'brewed' ? 'active' : ''}`}
                    onClick={() => setBaseFilter('brewed')}
                  >
                    {t('achievements_filter_brewed')} ({baseBrewedCount})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${baseFilter === 'remaining' ? 'active' : ''}`}
                    onClick={() => setBaseFilter('remaining')}
                  >
                    {t('achievements_filter_remaining')} ({POTIONS_DATA.length - baseBrewedCount})
                  </button>
                </div>
              </div>

              <div className="mc-ach-potions-grid">
                {displayedBasePotions.map((potion) => {
                  const locP = getPotion(potion.id) || potion;
                  return (
                    <div
                      key={potion.id}
                      className={`mc-ach-potion-item ${potion.isBrewed ? 'brewed' : 'unbrewed'}`}
                      title={locP.name}
                    >
                      <div className="mc-ach-potion-icon-box">
                        <img
                          src={potion.icon}
                          alt={locP.name}
                          className="mc-ach-potion-icon"
                          draggable="false"
                        />
                        {potion.isBrewed && <span className="mc-ach-potion-check" title={t('tag_brewed')}>✓</span>}
                        {potion.isManual && <span className="mc-ach-potion-manual" title={t('tag_manual')}>★</span>}
                      </div>
                      <div className="mc-ach-potion-details">
                        <div className="mc-ach-potion-name">{locP.name}</div>
                        <div className="mc-ach-potion-tag">
                          {potion.isBrewed ? (
                            <span className="tag-brewed">{potion.isManual ? `${t('tag_manual')} ✓` : `${t('tag_brewed')} ✓`}</span>
                          ) : (
                            <span className="tag-unbrewed">{t('tag_unbrewed')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mc-achievements-footer">
          <button
            type="button"
            className="mc-brewing-ref-btn mc-ach-done-btn"
            onClick={() => {
              playButtonClickSound();
              onClose();
            }}
          >
            {t('achievements_close')}
          </button>
        </div>
      </div>
    </div>
  );
}
