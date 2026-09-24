import React from 'react';
import { playButtonClickSound } from '../utils/soundEffects';

export const DARK_PRESETS = [
  { id: 'obsidian', label: 'Obsidian Minimal', icon: '🌌', desc: 'Строгий преміум: м’який димчастий бордер без отруйного неону' },
  { id: 'nether', label: 'Nether Forge', icon: '🔥', desc: 'Атмосфера Незеру: глибокий темно-вугільний з теплим рубіновим акцентом' },
  { id: 'deepslate', label: 'Deepslate Modern', icon: '💎', desc: 'Сучасний темний UI: колір глибинного сланцю та бірюзовий аметист' },
  { id: 'original', label: 'Classic Glow', icon: '🧪', desc: 'Оригінальне зелене неонове світіння 2025 року' },
];

export default function Header({
  isDark,
  onToggleTheme,
  onOpenEasterEgg,
  darkPreset = 'obsidian',
  onSelectDarkPreset,
}) {
  const logoDaySrc = '/Glass_Bottle_JE2_BE2.webp';
  const logoNightSrc = '/Potion_of_Luck_JE3.png';

  return (
    <header id="header2" className={isDark ? 'dark-theme' : 'light-theme'}>
      <div className={`headertext ${isDark ? 'dark-theme' : 'light-theme'}`} id="headertext1">
        <div
          className="logocontainer"
          id="logo"
        >
          <a href="/no.html">
            <img
              src={isDark ? logoNightSrc : logoDaySrc}
              id="logoday"
              alt="PotionsCraft Logo"
              className="logo"
            />
          </a>
        </div>
        <div className="title">
          <h1>PotionsCraft</h1>
        </div>
      </div>

      <div className="header-right-controls">
        {/* Dark Theme Presets Selector (visible only when dark theme is active) */}
        {isDark && onSelectDarkPreset && (
          <div className="dark-presets-nav" title="Виберіть варіант оформлення темної теми">
            <span className="dark-presets-label">Стиль теми:</span>
            <div className="dark-presets-buttons">
              {DARK_PRESETS.map((preset) => {
                const isActive = darkPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-choice-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      playButtonClickSound();
                      onSelectDarkPreset(preset.id);
                    }}
                    title={`${preset.label}: ${preset.desc}`}
                  >
                    <span className="preset-icon">{preset.icon}</span>
                    <span className="preset-text">{preset.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* From Uiverse.io by zl306 */}
        <label className="switch" title="Перемкнути День / Ніч">
          <input
            className="toggle"
            type="checkbox"
            id="themeswitcher"
            checked={isDark}
            onChange={(e) => {
              playButtonClickSound();
              onToggleTheme(e.target.checked);
            }}
          />
          <span className="slider"></span>
          <span className="card-side"></span>
        </label>
      </div>
    </header>
  );
}