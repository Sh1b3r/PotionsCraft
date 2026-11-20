import React from 'react';
import { playButtonClickSound } from '../utils/soundEffects';
import { useI18n } from '../i18n';

export default function Header({
  isDark,
  theme,
  onToggleTheme,
  onOpenEasterEgg,
  onOpenAchievements,
}) {
  const { t } = useI18n();
  const isDarkActive = theme ? theme === 'dark' || theme === 'sculk' : Boolean(isDark);
  const logoDaySrc = '/logo_light.svg';
  const logoDarkSrc = '/logo_dark.svg';
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
        <a
          href="https://www.privat24.ua/send/k853c"
          className="header-donate-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('donate')}
        </a>
        <button
          type="button"
          className="mc-header-achievements-btn"
          onClick={() => {
            playButtonClickSound();
            if (onOpenAchievements) onOpenAchievements();
          }}
          title={t('achievements')}
          aria-label={t('achievements')}
        >
          <img src="/items/advancements_book.svg" alt={t('achievements')} className="mc-header-adv-icon" />
        </button>

        {/* Authentic Minecraft Lever Toggle Switch (From Uiverse.io by zl306) */}
        <label className="switch" title={isDarkActive ? t('toggle_to_light') : t('toggle_to_dark')}>
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
