import React from 'react';
import BrewingStandWidget from './BrewingStandWidget';
import { TooltipTrigger } from './MinecraftTooltip';
import MinecraftHearts from './MinecraftHearts';
import PotionDescriptionContent from './PotionDescriptionContent';
import { WIKI_POTIONS } from '../data/wikiTooltipsData';
import { playButtonClickSound, playBubbleSound } from '../utils/soundEffects';
import { useI18n } from '../i18n';

export default function PotionCard({
  potion,
  isDark,
  onOpenEasterEgg,
  isSelected,
}) {
  const { t, lang } = useI18n();
  const wikiPotion = WIKI_POTIONS[potion.id];

  // Render description with authentic Minecraft Wiki hearts
  const renderDescription = () => {
    return (
      <p>
        <PotionDescriptionContent
          potionId={potion.id}
          description={potion.description}
          compact={false}
        />
      </p>
    );
  };

  const nominativeTitle = potion.nominativeTitle || potion.effectName || potion.name;

  // Format multi-word titles neatly
  const formattedNominativeTitle = (() => {
    const raw = nominativeTitle;
    if (raw.includes(' ')) {
      const parts = raw.split(' ');
      return (
        <>
          {parts[0]}<br />{parts.slice(1).join(' ')}
        </>
      );
    }
    return raw;
  })();

  const primaryEffectLore = (() => {
    if (potion.id === 'turtle_master') {
      if (lang === 'ru') return '&9Стойкость III (0:20)';
      if (lang === 'en') return '&9Resistance III (0:20)';
      return '&9Стійкість III (0:20)';
    }
    const effName = potion.effectName || nominativeTitle;
    const dur = potion.duration?.split('/')[0]?.trim() || potion.duration;
    return dur === 'Миттєво' || dur === 'Instant' || dur === 'Мгновенно'
      ? `&9${effName}`
      : `&9${effName} (${dur})`;
  })();

  const secondaryEffectLore = (() => {
    if (potion.id === 'turtle_master') {
      if (lang === 'ru') return '&cЗамедление IV (0:20)';
      if (lang === 'en') return '&cSlowness IV (0:20)';
      return '&cПовільність IV (0:20)';
    }
    return null;
  })();

  return (
    <div
      id={`potion-card-${potion.id}`}
      data-potion-id={potion.id}
      className={`card ${isDark ? 'dark-theme' : 'light-theme'} ${isSelected ? 'selected-card' : ''
        }`}
    >
      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="card-desktop-layout">
        {/* Left column: Brewing stand + Button underneath */}
        <div className="card-stand-column">
          <BrewingStandWidget potion={potion} />
          <button
            type="button"
            className="card-load-stand-btn"
            onClick={(e) => {
              e.stopPropagation();
              playButtonClickSound();
              window.dispatchEvent(new CustomEvent('load_potion_recipe', { detail: { potionId: potion.id } }));
            }}
            title={t('card_load_title')}
          >
            <span>{t('card_brew_btn')}</span>
          </button>
        </div>

        {/* Card Content with original structure */}
        <div className="card-content">
          {/* Header row: Potion icon in .invslot, Title, Effect Icon, Category tag */}
          <div className="card-top-row">
            <div className="card-title-group">
              <TooltipTrigger
                title={potion.name}
              >
                <span className="invslot">
                  <span
                    className="invslot-item invslot-item-image"
                    data-minetip-title={potion.name}
                  >
                    <span typeof="mw:File">
                      <img
                        src={potion.icon}
                        alt={potion.name}
                        className="card-potion-img mw-file-element"
                        width="36"
                        height="36"
                        loading="lazy"
                        decoding="async"
                        onClick={() => {
                          if (potion.easterEgg && potion.id === 'healing') {
                            playButtonClickSound();
                            onOpenEasterEgg(potion.easterEgg);
                          } else if (onSelect3D) {
                            playBubbleSound();
                            onSelect3D(potion);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  </span>
                </span>
              </TooltipTrigger>
              <h3
                className={`cardh3 ${isDark ? 'dark-theme' : 'light-theme'}`}
                onClick={() => {
                  if (onSelect3D) {
                    playBubbleSound();
                    onSelect3D(potion);
                  }
                }}
                style={{ cursor: 'pointer' }}
                title={potion.name}
              >
                {formattedNominativeTitle}
              </h3>
            </div>

            <div className="card-effect-badges">
              <TooltipTrigger
                lore={primaryEffectLore}
                extra={
                  potion.id === 'invisibility'
                }
              >
                <span className="sprite-file">
                  {potion.id === 'healing' ? (
                    <a
                      href="https://matias.ma/nsfw/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="effect-link"
                    >
                      <img
                        src={potion.effectIcon}
                        alt="Ефект"
                        className="card-effect-img"
                        width="28"
                        height="28"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  ) : potion.id === 'invisibility' ? (
                    <a href="/heroine.html" className="effect-link">
                      <img
                        src={potion.effectIcon}
                        alt="Ефект"
                        className="card-effect-img"
                        width="28"
                        height="28"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  ) : (
                    <img
                      src={potion.effectIcon}
                      alt="Ефект"
                      className="card-effect-img"
                      width="28"
                      height="28"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </span>
              </TooltipTrigger>
              {potion.secondaryEffectIcon && (
                <TooltipTrigger
                  lore={secondaryEffectLore}
                >
                  <span className="sprite-file">
                    <img
                      src={potion.secondaryEffectIcon}
                      alt="Додатковий ефект"
                      className="card-effect-img"
                      width="28"
                      height="28"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </TooltipTrigger>
              )}
            </div>
          </div>

          {/* Middle row: Effect description with hearts */}
          <div className="card-desc-row">
            {renderDescription()}
          </div>

          {/* Bottom stats row: Duration + Upgrades */}
          <div className="card-bottom-row">
            <TooltipTrigger
              title={`${t('duration_prefix')}${potion.duration}`}
              subtitle={`§7${t('effect_time_desc')}`}
              lore={
                wikiPotion?.extendedMinetip
                  ? `${t('extended_redstone')}\n${wikiPotion.extendedMinetip}`
                  : potion.upgrades?.redstone
                    ? `${t('card_redstone')}:\n${potion.upgrades.redstone}`
                    : '—'
              }
              extra={
                wikiPotion?.upgradedMinetip
                  ? `${t('upgraded_glowstone')}\n${wikiPotion.upgradedMinetip}`
                  : potion.upgrades?.glowstone
                    ? `${t('card_glowstone')}:\n${potion.upgrades.glowstone}`
                    : ''
              }
            >
              <div className="card-stat-pill">
                <span className="stat-label">{t('card_time_label')}</span>
                <span className="stat-value time-val">{potion.duration}</span>
              </div>
            </TooltipTrigger>

            {potion.upgrades?.redstone && (
              <TooltipTrigger
                title={t('card_redstone_tooltip_title')}
                subtitle={`${t('duration_prefix')}${potion.upgrades.redstone}`}
                lore={wikiPotion?.extendedMinetip || ''}
              >
                <span className="card-upgrade-tag redstone-tag">{t('card_redstone')}</span>
              </TooltipTrigger>
            )}

            {potion.upgrades?.glowstone && (
              <TooltipTrigger
                title={t('card_glowstone_tooltip_title')}
                subtitle={`${t('card_glowstone')}: ${potion.upgrades.glowstone}`}
                lore={wikiPotion?.upgradedMinetip || ''}
              >
                <span className="card-upgrade-tag glowstone-tag">{t('card_glowstone')}</span>
              </TooltipTrigger>
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE LAYOUT ================= */}
      <div className="card-mobile-layout">
        {/* Top area: Brewing stand pinned left + Info column beside it */}
        <div className="mobile-card-top-area">
          <div className="mobile-brewing-stand-container">
            <BrewingStandWidget potion={potion} />
          </div>

          <div className="mobile-card-info-col">
            {/* Single row: 1. Potion icon, 2. Small potion name, 3. Effect icon */}
            <div className="mobile-single-header-row">
              {/* 1. Иконка зелья */}
              <div className="mobile-header-potion-icon">
                <TooltipTrigger
                  title={potion.name}
                >
                  <span className="invslot">
                    <span
                      className="invslot-item invslot-item-image"
                      data-minetip-title={potion.name}
                    >
                      <span typeof="mw:File">
                        <img
                          src={potion.icon}
                          alt={potion.name}
                          className="card-potion-img mw-file-element"
                          width="36"
                          height="36"
                          loading="lazy"
                          decoding="async"
                          onClick={() => {
                            if (potion.easterEgg && potion.id === 'healing') {
                              playButtonClickSound();
                              onOpenEasterEgg(potion.easterEgg);
                            } else if (onSelect3D) {
                              playBubbleSound();
                              onSelect3D(potion);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </span>
                    </span>
                  </span>
                </TooltipTrigger>
              </div>

              {/* 2. Назва ефекту (у називному відмінку без слова "зілля") */}
              <h3
                className={`mobile-header-potion-title ${isDark ? 'dark-theme' : 'light-theme'}`}
                onClick={() => {
                  if (onSelect3D) {
                    playBubbleSound();
                    onSelect3D(potion);
                  }
                }}
                title={nominativeTitle}
              >
                {formattedNominativeTitle}
              </h3>

              {/* 3. Картинка ефекту */}
              <div className="mobile-header-effect-icons">
                <TooltipTrigger
                  lore={primaryEffectLore}
                >
                  <span className="sprite-file">
                    <img
                      src={potion.effectIcon}
                      alt="Ефект"
                      className="mobile-effect-icon-img"
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </TooltipTrigger>
                {potion.secondaryEffectIcon && (
                  <TooltipTrigger
                    lore={secondaryEffectLore}
                  >
                    <span className="sprite-file">
                      <img
                        src={potion.secondaryEffectIcon}
                        alt="Додатковий ефект"
                        className="mobile-effect-icon-img"
                        width="32"
                        height="32"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  </TooltipTrigger>
                )}
              </div>
            </div>

            {/* Rectangles with duration, redstone and glowstone level */}
            <div className="mobile-pills-row">
              <TooltipTrigger
                title={`${t('duration_prefix')}${potion.duration}`}
                subtitle={`§7${t('effect_time_desc')}`}
                lore={
                  wikiPotion?.extendedMinetip
                    ? `${t('extended_redstone')}\n${wikiPotion.extendedMinetip}`
                    : potion.upgrades?.redstone
                      ? `${t('card_redstone')}:\n${potion.upgrades.redstone}`
                      : '—'
                }
                extra={
                  wikiPotion?.upgradedMinetip
                    ? `${t('upgraded_glowstone')}\n${wikiPotion.upgradedMinetip}`
                    : potion.upgrades?.glowstone
                      ? `${t('card_glowstone')}:\n${potion.upgrades.glowstone}`
                      : ''
                }
              >
                <div className="card-stat-pill">
                  <span className="stat-label">{t('card_time_label')}</span>
                  <span className="stat-value time-val">{potion.duration}</span>
                </div>
              </TooltipTrigger>

              {potion.upgrades?.redstone && (
                <TooltipTrigger
                  title={t('card_redstone_tooltip_title')}
                  subtitle={`${t('duration_prefix')}${potion.upgrades.redstone}`}
                  lore={wikiPotion?.extendedMinetip || ''}
                >
                  <span className="card-upgrade-tag redstone-tag">{t('card_redstone')} +</span>
                </TooltipTrigger>
              )}

              {potion.upgrades?.glowstone && (
                <TooltipTrigger
                  title={t('card_glowstone_tooltip_title')}
                  subtitle={`${t('card_glowstone')}: ${potion.upgrades.glowstone}`}
                  lore={wikiPotion?.upgradedMinetip || ''}
                >
                  <span className="card-upgrade-tag glowstone-tag">{t('card_glowstone')} +</span>
                </TooltipTrigger>
              )}
            </div>
          </div>
        </div>

        {/* Description below */}
        <div className="mobile-card-desc-box">
          {renderDescription()}
        </div>
      </div>
    </div>
  );
}