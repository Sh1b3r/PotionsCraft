import React, { useEffect, useState, useMemo } from 'react';
import { POTIONS_DATA } from '../data/potionsData';
import { POTION_VARIANTS, TOTAL_VARIANTS_COUNT, getVariantStats } from '../data/potionVariantsData';
import { playButtonClickSound } from '../utils/soundEffects';

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
      aria-label="Досягнення зіллєваріння"
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
            <h2>Досягнення зіллєваріння</h2>
          </div>
          <button
            type="button"
            className="mc-achievements-close-btn"
            onClick={() => {
              playButtonClickSound();
              onClose();
            }}
            aria-label="Закрити"
          >
            ✕
          </button>
        </div>

        {/* Global Stats Overview Banner */}
        <div className="mc-achievements-stats-bar">
          <div className="mc-ach-stat">
            <span className="mc-ach-stat-label">Зварено всього:</span>
            <span className="mc-ach-stat-val">{data.totalBrewed}</span>
          </div>
          <div className="mc-ach-stat">
            <span className="mc-ach-stat-label">Основних видів:</span>
            <span className="mc-ach-stat-val highlight">{baseBrewedCount} / {POTIONS_DATA.length}</span>
          </div>
          <div className="mc-ach-stat">
            <span className="mc-ach-stat-label">Всіх варіацій:</span>
            <span className="mc-ach-stat-val gold">{variantStats.brewedCount} / {TOTAL_VARIANTS_COUNT}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="mc-achievements-body">
          {/* Main Achievements Section */}
          <div className="mc-achievements-section-title">Основні досягнення</div>
          <div className="mc-achievements-cards-row">
            {/* 1. Місцева броварня */}
            <div className={`mc-ach-card ${data.hasLocalBrewery ? 'is-unlocked' : 'is-locked'}`}>
              <div className="mc-ach-card-icon-box">
                <img src="/items/brewing_stand.png" alt="Місцева броварня" />
              </div>
              <div className="mc-ach-card-content">
                <div className="mc-ach-card-name">Місцева броварня</div>
                <div className="mc-ach-card-desc">Зваріть своє перше зілля на варильній стійці</div>
                <div className="mc-ach-card-status">
                  {data.hasLocalBrewery ? <span className="unlocked-text">✓ Здобуто!</span> : <span className="locked-text">🔒 Заблоковано</span>}
                </div>
              </div>
            </div>

            {/* 2. Майстер зілля */}
            <div className={`mc-ach-card ${data.hasMasterAlchemist ? 'is-unlocked' : 'is-locked'}`}>
              <div className="mc-ach-card-icon-box">
                <img src="/Potion_of_Swiftness_JE3.png" alt="Майстер зілля" />
              </div>
              <div className="mc-ach-card-content">
                <div className="mc-ach-card-name">Майстер зілля</div>
                <div className="mc-ach-card-desc">Зваріть 3 будь-які зілля одночасно на одній стійці</div>
                <div className="mc-ach-card-status">
                  {data.hasMasterAlchemist ? <span className="unlocked-text">✓ Здобуто!</span> : <span className="locked-text">🔒 Заблоковано</span>}
                </div>
              </div>
            </div>

            {/* 3. Істинний зіллєвар */}
            <div className={`mc-ach-card ${isTrueAlchemistComplete ? 'is-unlocked' : 'is-locked'}`}>
              <div className="mc-ach-card-icon-box">
                <img src="/Potion_of_Healing_JE2_BE2.png" alt="Істинний зіллєвар" />
              </div>
              <div className="mc-ach-card-content">
                <div className="mc-ach-card-name">Істинний зіллєвар</div>
                <div className="mc-ach-card-desc">Приготуйте всі {POTIONS_DATA.length} основних видів власноруч</div>
                <div className="mc-ach-card-status">
                  {isTrueAlchemistComplete ? (
                    <span className="unlocked-text gold-text">✓ Здобуто! ({POTIONS_DATA.length}/{POTIONS_DATA.length})</span>
                  ) : (
                    <span className="locked-text">🔒 {baseManualCount} / {POTIONS_DATA.length} видів</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grand Ultimate Achievement: "Володар зіллєваріння" */}
          <div className="mc-achievements-section-title overlord-section-title">Гранд-досягнення</div>
          <div className={`mc-ach-card overlord-card ${isOverlordComplete ? 'is-unlocked' : 'is-locked'}`}>
            <div className="mc-ach-card-icon-box overlord-icon-box">
              <img
                src="/Potion_of_the_Turtle_Master_JE3.png"
                alt="Володар зіллєваріння"
                onError={(e) => { e.currentTarget.src = '/items/brewing_stand.png'; }}
              />
              {isOverlordComplete && <span className="overlord-crown">👑</span>}
            </div>
            <div className="mc-ach-card-content">
              <div className="mc-ach-card-name overlord-name">
                Володар зіллєваріння
                {isOverlordComplete && <span className="overlord-tag">ВИКОНАНО 100%</span>}
              </div>
              <div className="mc-ach-card-desc">
                Приготуйте всі <strong>{TOTAL_VARIANTS_COUNT}</strong> варіанти зілля (і звичайні, і вибухові, і осідальні, подовжені редстоуном та посилені світлопилом). Прогрес зберігається між сесіями.
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
                <span className={`mc-ach-chip ${variantStats.regularCount >= 41 ? 'done' : ''}`} title="Звичайні питні зілля">
                  🧪 Звичайні: {variantStats.regularCount}/41
                </span>
                <span className={`mc-ach-chip ${variantStats.splashCount >= 41 ? 'done' : ''}`} title="Вибухові зілля (з порохом)">
                  💥 Вибухові: {variantStats.splashCount}/41
                </span>
                <span className={`mc-ach-chip ${variantStats.lingeringCount >= 41 ? 'done' : ''}`} title="Осідальні зілля (з диханням дракона)">
                  💨 Осідальні: {variantStats.lingeringCount}/41
                </span>
                <span className={`mc-ach-chip ${variantStats.extendedCount >= 39 ? 'done' : ''}`} title="Подовжені зілля (з редстоуном)">
                  ⏳ Редстоун: {variantStats.extendedCount}/39
                </span>
                <span className={`mc-ach-chip ${variantStats.level2Count >= 27 ? 'done' : ''}`} title="Посилені II/IV зілля (зі світлопилом)">
                  ⚡ Світлопил: {variantStats.level2Count}/27
                </span>
              </div>

              <div className="mc-ach-card-status">
                {isOverlordComplete ? (
                  <span className="unlocked-text gold-text">
                    ★ Гранд-досягнення здобуто! Всі {TOTAL_VARIANTS_COUNT} варіацій приготовано! 👑
                  </span>
                ) : (
                  <span className="locked-text">
                    🔒 Прогрес: <strong>{variantStats.brewedCount}</strong> / {TOTAL_VARIANTS_COUNT} варіацій ({variantStats.percentage}%)
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
              Усі варіації зілля ({variantStats.brewedCount} / {TOTAL_VARIANTS_COUNT})
            </button>
            <button
              type="button"
              className={`mc-ach-nav-tab ${checklistTab === 'base' ? 'active' : ''}`}
              onClick={() => {
                playButtonClickSound();
                setChecklistTab('base');
              }}
            >
              Основні види ({baseBrewedCount} / {POTIONS_DATA.length})
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
                    Всі ({TOTAL_VARIANTS_COUNT})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${variantStatusFilter === 'brewed' ? 'active' : ''}`}
                    onClick={() => setVariantStatusFilter('brewed')}
                  >
                    Зварені ({variantStats.brewedCount})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${variantStatusFilter === 'remaining' ? 'active' : ''}`}
                    onClick={() => setVariantStatusFilter('remaining')}
                  >
                    Залишилось ({TOTAL_VARIANTS_COUNT - variantStats.brewedCount})
                  </button>
                </div>

                {/* Subcategory filter pills */}
                <div className="mc-ach-type-filters">
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('all')}
                  >
                    Всі типи
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'regular' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('regular')}
                  >
                    🧪 Звичайні
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'splash' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('splash')}
                  >
                    💥 Вибухові
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'lingering' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('lingering')}
                  >
                    💨 Осідальні
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'extended' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('extended')}
                  >
                    ⏳ Подовжені
                  </button>
                  <button
                    type="button"
                    className={`mc-type-pill ${variantTypeFilter === 'level2' ? 'active' : ''}`}
                    onClick={() => setVariantTypeFilter('level2')}
                  >
                    ⚡ Посилені II
                  </button>
                </div>
              </div>

              {/* Grid of 123 Potion Variations */}
              <div className="mc-ach-variants-grid">
                {displayedVariants.map((v) => (
                  <div
                    key={v.key}
                    className={`mc-ach-variant-item ${v.isBrewed ? 'brewed' : 'unbrewed'}`}
                    title={v.name}
                  >
                    <div className="mc-ach-variant-icon-box">
                      <img
                        src={v.sprite}
                        alt={v.name}
                        className="mc-ach-variant-icon"
                        draggable="false"
                        onError={(e) => { e.currentTarget.src = '/items/water_bottle.png'; }}
                      />
                      {v.isBrewed && <span className="mc-ach-variant-check">✓</span>}
                    </div>
                    <div className="mc-ach-variant-details">
                      <div className="mc-ach-variant-name">{v.name}</div>
                      <div className="mc-ach-variant-tags">
                        <span className={`tag-del tag-${v.delivery}`}>{v.deliveryLabel}</span>
                        {v.tier !== 'base' && (
                          <span className={`tag-tier tag-${v.tier}`}>{v.tier === 'extended' ? '+Редстоун' : '+Світлопил'}</span>
                        )}
                        {v.isBrewed ? (
                          <span className="tag-status brewed">✓ Зварено</span>
                        ) : (
                          <span className="tag-status unbrewed">🔒 Очікує</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                    Усі ({POTIONS_DATA.length})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${baseFilter === 'brewed' ? 'active' : ''}`}
                    onClick={() => setBaseFilter('brewed')}
                  >
                    Зварені ({baseBrewedCount})
                  </button>
                  <button
                    type="button"
                    className={`mc-ach-filter-btn ${baseFilter === 'remaining' ? 'active' : ''}`}
                    onClick={() => setBaseFilter('remaining')}
                  >
                    Залишилось ({POTIONS_DATA.length - baseBrewedCount})
                  </button>
                </div>
              </div>

              <div className="mc-ach-potions-grid">
                {displayedBasePotions.map((potion) => (
                  <div
                    key={potion.id}
                    className={`mc-ach-potion-item ${potion.isBrewed ? 'brewed' : 'unbrewed'}`}
                    title={potion.name}
                  >
                    <div className="mc-ach-potion-icon-box">
                      <img
                        src={potion.icon}
                        alt={potion.name}
                        className="mc-ach-potion-icon"
                        draggable="false"
                      />
                      {potion.isBrewed && <span className="mc-ach-potion-check" title="Зілля зварено">✓</span>}
                      {potion.isManual && <span className="mc-ach-potion-manual" title="Зварено власноруч (без кнопки вставки)">★</span>}
                    </div>
                    <div className="mc-ach-potion-details">
                      <div className="mc-ach-potion-name">{potion.name}</div>
                      <div className="mc-ach-potion-tag">
                        {potion.isBrewed ? (
                          <span className="tag-brewed">{potion.isManual ? 'Власноруч ✓' : 'Зварено ✓'}</span>
                        ) : (
                          <span className="tag-unbrewed">Не зварено 🔒</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
