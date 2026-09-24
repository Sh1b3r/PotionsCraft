import React from 'react';
import ThreePotionBottle from './ThreePotionBottle';
import { playBubbleSound, playButtonClickSound } from '../utils/soundEffects';

export default function HeroSection({
  selectedPotion,
  onSelectPotion,
  potions,
  onOpenModal,
  isDark,
}) {
  return (
    <section className={`hero-banner ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">⚗️ Світ Алхімії Minecraft 3D</div>
          <h1 className="hero-title">Майстерня Зілля</h1>
          <p className="hero-description">
            Досліджуйте всі 19 офіційних зілль Minecraft у форматі 3D.
            Інтерактивні тривимірні пляшки, повні рецепти варіння, демонстраційні відео та симулятор варильної стійки!
          </p>

          <div className="hero-actions">
            <button
              className="pixel-btn hero-primary-btn"
              onClick={() => {
                playBubbleSound();
                onOpenModal(selectedPotion);
              }}
            >
              🔍 Детальний 3D Огляд
            </button>
          </div>

          <div className="hero-quick-swatches">
            <span className="swatches-label">Виберіть зілля для 3D:</span>
            <div className="swatches-row">
              {potions.slice(0, 6).map((pot) => (
                <button
                  key={pot.id}
                  className={`swatch-btn ${selectedPotion.id === pot.id ? 'active' : ''}`}
                  style={{
                    backgroundColor: pot.color,
                    boxShadow: selectedPotion.id === pot.id ? `0 0 14px ${pot.color}` : 'none',
                  }}
                  onClick={() => {
                    playButtonClickSound();
                    onSelectPotion(pot);
                  }}
                  title={pot.name}
                >
                  <img src={pot.icon} alt={pot.name} className="swatch-icon" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-3d-showcase">
          <div
            className="hero-3d-stage"
            style={{
              boxShadow: isDark
                ? `0 0 50px 10px ${selectedPotion.color}40`
                : '0 12px 35px rgba(0,0,0,0.18)',
            }}
          >
            <ThreePotionBottle
              color={selectedPotion.color}
              emissive={selectedPotion.emissive}
              height="380px"
              interactive={true}
              autoRotate={true}
            />
            <div className="showcase-info-bar">
              <img
                src={selectedPotion.icon}
                alt="Icon"
                className="showcase-potion-icon"
              />
              <div className="showcase-meta">
                <div
                  className="showcase-name"
                  style={{ color: selectedPotion.color }}
                >
                  {selectedPotion.name}
                </div>
                <div className="showcase-base">База: {selectedPotion.base}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}