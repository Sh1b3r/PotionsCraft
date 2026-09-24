import React, { useState } from 'react';
import ThreePotionBottle from './ThreePotionBottle';
import BrewingStandWidget from './BrewingStandWidget';
import PotionDescriptionContent from './PotionDescriptionContent';
import { playDrinkSound, playButtonClickSound } from '../utils/soundEffects';

export default function PotionModal({ potion, onClose, isDark }) {
  const [drunk, setDrunk] = useState(false);

  if (!potion) return null;

  const handleDrink = () => {
    playDrinkSound();
    setDrunk(true);
    setTimeout(() => {
      setDrunk(false);
    }, 4000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`potion-modal-content ${isDark ? 'dark-theme' : 'light-theme'}`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: potion.color }}
      >
        <button
          className="modal-close-btn"
          onClick={() => {
            playButtonClickSound();
            onClose();
          }}
        >
          ✕
        </button>

        <div className="modal-grid">
          <div className="modal-3d-side">
            <div className="modal-3d-canvas-wrap">
              <ThreePotionBottle
                color={potion.color}
                emissive={potion.emissive}
                height="360px"
                interactive={true}
                autoRotate={true}
              />
              <span className="canvas-hint">💡 Потягніть мишкою, щоб обертати</span>
            </div>

            <button
              className="pixel-btn drink-btn"
              onClick={handleDrink}
              disabled={drunk}
            >
              {drunk ? '✨ ЕФЕКТ АКТИВОВАНО!' : '🧪 ВИПИТИ ЗІЛЛЯ'}
            </button>
          </div>

          <div className="modal-info-side">
            <div className="modal-header-flex">
              <img src={potion.icon} alt="Icon" className="modal-potion-icon" />
              <div>
                <h2 className="modal-title" style={{ color: potion.color }}>
                  {potion.name}
                </h2>
                <div className="modal-english-name">{potion.englishName}</div>
              </div>
            </div>

            <div className="modal-desc">
              <PotionDescriptionContent
                potionId={potion.id}
                description={potion.description}
                compact={false}
              />
            </div>

            <div className="modal-stats-card">
              <div className="stat-row">
                <b>Категорія:</b>{' '}
                <span className="stat-tag">
                  {potion.category === 'positive'
                    ? 'Позитивний ефект'
                    : potion.category === 'negative'
                    ? 'Негативний ефект'
                    : 'Змішаний ефект'}
                </span>
              </div>
              <div className="stat-row">
                <b>Базове зілля:</b> <span>{potion.base}</span>
              </div>
              <div className="stat-row">
                <b>Головний інгредієнт:</b> <span>{potion.ingredient}</span>
              </div>
              <div className="stat-row">
                <b>Тривалість:</b> <span>{potion.duration}</span>
              </div>

              {potion.upgrades && (
                <div className="modal-upgrades">
                  <b>Покращення:</b>
                  <ul>
                    {potion.upgrades.redstone && (
                      <li>🔴 Редстоун: {potion.upgrades.redstone}</li>
                    )}
                    {potion.upgrades.glowstone && (
                      <li>✨ Світлопил: {potion.upgrades.glowstone}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-brewing-wrapper">
              <BrewingStandWidget potion={potion} inModal={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}