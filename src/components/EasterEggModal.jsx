import React, { useEffect } from 'react';
import { playButtonClickSound, playEerieSound } from '../utils/soundEffects';
import { useI18n } from '../i18n';

export default function EasterEggModal({ type, onClose }) {
  const { t } = useI18n();
  useEffect(() => {
    if (!type) return;

    if (type === 'herobrine') {
      playEerieSound();
    } else if (type === 'matias') {
      window.open('https://matias.ma/nsfw/', '_blank');
      onClose();
    }
  }, [type, onClose]);

  if (!type || type === 'matias') return null;

  return (
    <div
      className={`original-easter-egg-fullscreen ${type === 'no' ? 'no-easter-egg' : 'heroine-easter-egg'}`}
      onClick={onClose}
    >
      <button
        className="easter-egg-back-btn"
        onClick={(e) => {
          e.stopPropagation();
          playButtonClickSound();
          onClose();
        }}
        title={t('easter_egg_back')}
      >
        {t('easter_egg_close')}
      </button>

      {type === 'no' && (
        <div className="no-content" onClick={(e) => e.stopPropagation()}>
          <h1>{t('easter_egg_no_title')}</h1>
          <img src="/photo_5429111156800356839_x.jpg" alt="No." />
          <h2>{t('easter_egg_no_sub')}</h2>
        </div>
      )}

      {type === 'herobrine' && (
        <div className="heroine-content" onClick={(e) => e.stopPropagation()}>
          <div className="stars"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <img src="/photo_5429299422396807543_x.jpg" alt="Herobrine" />
          <h1>{t('easter_egg_heroine_sub')}</h1>
        </div>
      )}
    </div>
  );
}