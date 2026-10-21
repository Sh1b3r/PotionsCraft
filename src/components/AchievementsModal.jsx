import React, { useEffect, useState } from 'react';
import { POTIONS_DATA } from '../data/potionsData';
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

    const totalBrewed = parseInt(localStorage.getItem('potionscraft_total_potions_brewed') || '0', 10) || 0;
    const history = JSON.parse(localStorage.getItem('potionscraft_brewed_potions_history') || '[]');
    const manualBrewed = JSON.parse(localStorage.getItem('potionscraft_manual_brewed_potions') || '[]');

    return {
      hasLocalBrewery,
      hasMasterAlchemist,
      hasTrueAlchemist,
      totalBrewed,
      history: Array.isArray(history) ? history : [],
      manualBrewed: Array.isArray(manualBrewed) ? manualBrewed : []
    };
  } catch {
    return {
      hasLocalBrewery: false,
      hasMasterAlchemist: false,
      hasTrueAlchemist: false,
      totalBrewed: 0,
      history: [],
      manualBrewed: []
    };
  }
}

export default function AchievementsModal({ isOpen, onClose, isDark }) {
  const [data, setData] = useState(getAchievementsState);
  const [filter, setFilter] = useState('all'); // 'all' | 'brewed' | 'remaining'

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

  if (!isOpen) return null;

  // Match which potions from POTIONS_DATA were brewed
  const potionsStatusList = POTIONS_DATA.map((p) => {
    const isBrewed = data.history.some((h) => {
      if (typeof h === 'string') return h.toLowerCase().includes(p.name.toLowerCase());
      return h.catalogId === p.id || h.name === p.name;
    });
    const isManual = data.manualBrewed.includes(p.id);
    return { ...p, isBrewed, isManual };
  });

  const brewedCount = potionsStatusList.filter((p) => p.isBrewed).length;
  const manualCount = potionsStatusList.filter((p) => p.isManual).length;
  const isTrueAlchemistComplete = manualCount >= POTIONS_DATA.length || data.hasTrueAlchemist;

  const displayedPotions = potionsStatusList.filter((p) => {
    if (filter === 'brewed') return p.isBrewed;
    if (filter === 'remaining') return !p.isBrewed;
    return true;
  });

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
            <h2>Досягнення</h2>
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
            <span className="mc-ach-stat-label">Відкрито видів:</span>
            <span className="mc-ach-stat-val highlight">{brewedCount} / {POTIONS_DATA.length}</span>
          </div>
          <div className="mc-ach-stat">
            <span className="mc-ach-stat-label">Власноруч:</span>
            <span className="mc-ach-stat-val gold">{manualCount} / {POTIONS_DATA.length}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="mc-achievements-body">
          {/* Main Core Achievements */}
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
          </div>

          {/* Prepared Potions Checklist */}
          <div className="mc-achievements-potions-header">
            <div className="mc-achievements-section-title">
              Приготовані зілля ({brewedCount} / {POTIONS_DATA.length})
            </div>
            <div className="mc-ach-filters">
              <button
                type="button"
                className={`mc-ach-filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Усі ({POTIONS_DATA.length})
              </button>
              <button
                type="button"
                className={`mc-ach-filter-btn ${filter === 'brewed' ? 'active' : ''}`}
                onClick={() => setFilter('brewed')}
              >
                Зварені ({brewedCount})
              </button>
              <button
                type="button"
                className={`mc-ach-filter-btn ${filter === 'remaining' ? 'active' : ''}`}
                onClick={() => setFilter('remaining')}
              >
                Залишилось ({POTIONS_DATA.length - brewedCount})
              </button>
            </div>
          </div>

          <div className="mc-ach-potions-grid">
            {displayedPotions.map((potion) => (
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

          {/* Bottom Ultimate Achievement: "Істинний зіллєвар" */}
          <div className="mc-achievements-section-title ultimate-title">Легендарне досягнення</div>
          <div className={`mc-ach-card ultimate-card ${isTrueAlchemistComplete ? 'is-unlocked' : 'is-locked'}`}>
            <div className="mc-ach-card-icon-box ultimate-icon-box">
              <img src="/Potion_of_the_Turtle_Master_JE3.png" alt="Істинний зіллєвар" />
              {isTrueAlchemistComplete && <span className="ultimate-crown">👑</span>}
            </div>
            <div className="mc-ach-card-content">
              <div className="mc-ach-card-name ultimate-name">Істинний зіллєвар</div>
              <div className="mc-ach-card-desc">
                Приготуйте всі {POTIONS_DATA.length} видів зілля
              </div>

              {/* Progress bar */}
              <div className="mc-ach-progress-bar-wrap">
                <div
                  className="mc-ach-progress-bar-fill"
                  style={{ width: `${Math.min(100, (manualCount / POTIONS_DATA.length) * 100)}%` }}
                />
              </div>

              <div className="mc-ach-card-status">
                {isTrueAlchemistComplete ? (
                  <span className="unlocked-text gold-text">
                    ★ Легендарне досягнення здобуто! ({POTIONS_DATA.length}/{POTIONS_DATA.length})
                  </span>
                ) : (
                  <span className="locked-text">
                    🔒 Прогрес: <strong>{manualCount}</strong> / {POTIONS_DATA.length} видів зварено власноруч
                  </span>
                )}
              </div>
            </div>
          </div>
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
