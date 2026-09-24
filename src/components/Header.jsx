import React from 'react';
import { playButtonClickSound } from '../utils/soundEffects';

export default function Header({
  isDark,
  onToggleTheme,
  onOpenEasterEgg,
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
        {/* Link to Lab Design Themes showcase page */}
        <a
          href="/themes.html"
          className="themes-showcase-link"
          title="Лабораторія тем: переглянути нові концепції темної теми"
        >
          <span className="themes-icon">🎨</span>
          <span className="themes-link-text">Концепти тем</span>
        </a>

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