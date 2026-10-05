import React from 'react';
import { playButtonClickSound } from '../utils/soundEffects';

export default function Header({
  isDark,
  theme,
  onToggleTheme,
  onOpenEasterEgg,
}) {
  const isDarkActive = theme ? theme === 'dark' || theme === 'sculk' : Boolean(isDark);
  const logoDaySrc = '/Glass_Bottle_JE2_BE2.webp';
  // Authentic dark theme logo: high-resolution Potion of Swiftness (Speed) matching cyan/teal aesthetic
  const logoDarkSrc = '/Potion_of_Swiftness_JE3.png';
  const currentLogo = isDarkActive ? logoDarkSrc : logoDaySrc;

  return (
    <header id="header2" className={isDarkActive ? 'dark-theme' : 'light-theme'}>
      <div className={`headertext ${isDarkActive ? 'dark-theme' : 'light-theme'}`} id="headertext1">
        <div
          className="logocontainer"
          id="logo"
        >
          <a href="/no.html" onClick={(e) => {
            if (onOpenEasterEgg) {
              e.preventDefault();
              onOpenEasterEgg('no');
            }
          }}>
            <img
              src={currentLogo}
              id="logoday"
              alt="PotionsCraft Logo"
              className="logo"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + logoDaySrc) {
                  e.currentTarget.src = logoDaySrc;
                }
              }}
            />
          </a>
        </div>
        <div className="title">
          <h1>PotionsCraft</h1>
        </div>
      </div>

      <div className="header-right-controls">
        {/* Authentic Minecraft Lever Toggle Switch (From Uiverse.io by zl306) */}
        <label className="switch" title={isDarkActive ? 'Перемкнути на День (Світла тема)' : 'Перемкнути на Ніч (Темна тема)'}>
          <input
            className="toggle"
            type="checkbox"
            id="themeswitcher"
            checked={isDarkActive}
            onChange={(e) => {
              playButtonClickSound();
              if (onToggleTheme) {
                onToggleTheme(e.target.checked);
              }
            }}
          />
          <span className="slider"></span>
          <span className="card-side"></span>
        </label>
      </div>
    </header>
  );
}