import React from 'react';
import BrewingStandWidget from './BrewingStandWidget';
import { TooltipTrigger } from './MinecraftTooltip';
import MinecraftHearts from './MinecraftHearts';
import PotionDescriptionContent from './PotionDescriptionContent';
import { WIKI_POTIONS } from '../data/wikiTooltipsData';
import { playButtonClickSound, playBubbleSound } from '../utils/soundEffects';

export default function PotionCard({
  potion,
  isDark,
  onSelect3D,
  onOpenEasterEgg,
  isSelected,
}) {
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

  const shortEffectName = potion.name.replace(/^Зілля\s+(?:зі\s+|з\s+)?/i, '') || potion.name;

  return (
    <div
      className={`card ${isDark ? 'dark-theme' : 'light-theme'} ${
        isSelected ? 'selected-card' : ''
      }`}
    >
      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="card-desktop-layout">
        {/* Minecraft Wiki Brewing Stand Fragment */}
        <BrewingStandWidget potion={potion} />

        {/* Card Content with original structure */}
        <div className="card-content">
          {/* Header row: Potion icon in .invslot, Title, Effect Icon, Category tag */}
          <div className="card-top-row">
            <div className="card-title-group">
              <TooltipTrigger
                title={potion.name}
                extra="💡 Клацніть, щоб оглянути в 3D"
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
              >
                {potion.name}
              </h3>
            </div>

            <div className="card-effect-badges">
              <TooltipTrigger
                title={wikiPotion?.effectTitle || potion.effectName || 'Ефект'}
                lore={wikiPotion?.minetip}
                extra={
                  potion.id === 'healing'
                    ? '🦆 Секретна пасхалка!'
                    : potion.id === 'invisibility'
                    ? '⚡ Секретна пасхалка (Херпобрив)!'
                    : ''
                }
              >
                <span className="sprite-file">
                  <span className="pixel-image">
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
                          width="26"
                          height="26"
                        />
                      </a>
                    ) : potion.id === 'invisibility' ? (
                      <a href="/heroine.html" className="effect-link">
                        <img
                          src={potion.effectIcon}
                          alt="Ефект"
                          className="card-effect-img"
                          width="26"
                          height="26"
                        />
                      </a>
                    ) : (
                      <img
                        src={potion.effectIcon}
                        alt="Ефект"
                        className="card-effect-img"
                        width="26"
                        height="26"
                      />
                    )}
                  </span>
                </span>
              </TooltipTrigger>
              {potion.secondaryEffectIcon && (
                <TooltipTrigger
                  title="Додатковий ефект"
                  subtitle="§cПовільність IV / §9Стійкість III"
                  lore={wikiPotion?.effectDesc || potion.description}
                >
                  <span className="sprite-file">
                    <span className="pixel-image">
                      <img
                        src={potion.secondaryEffectIcon}
                        alt="Додатковий ефект"
                        className="card-effect-img"
                        width="26"
                        height="26"
                      />
                    </span>
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
            <div className="card-stat-pill">
              <span className="stat-label">Час:</span>
              <TooltipTrigger
                title={`Тривалість: ${potion.duration}`}
                subtitle="§7Час дії ефекту"
                lore={
                  wikiPotion?.extendedMinetip
                    ? `Подовжене (редстоун): ${wikiPotion.extendedMinetip}`
                    : potion.upgrades?.redstone
                    ? `Редстоун: ${potion.upgrades.redstone}`
                    : '—'
                }
                extra={
                  wikiPotion?.upgradedMinetip
                    ? `Посилене (світлопил): ${wikiPotion.upgradedMinetip}`
                    : potion.upgrades?.glowstone
                    ? `Світлопил: ${potion.upgrades.glowstone}`
                    : ''
                }
              >
                <span className="stat-value time-val">{potion.duration}</span>
              </TooltipTrigger>
            </div>

            {potion.upgrades?.redstone && (
              <TooltipTrigger
                title="Подовження дії (Редстоун)"
                subtitle={`Тривалість: ${potion.upgrades.redstone}`}
                lore={wikiPotion?.extendedMinetip || ''}
              >
                <span className="card-upgrade-tag redstone-tag">Редстоун +</span>
              </TooltipTrigger>
            )}

            {potion.upgrades?.glowstone && (
              <TooltipTrigger
                title="Посилення дії (Світлокам'яний пил)"
                subtitle={`Посилення: ${potion.upgrades.glowstone}`}
                lore={wikiPotion?.upgradedMinetip || ''}
              >
                <span className="card-upgrade-tag glowstone-tag">Рівень II +</span>
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
                  extra="💡 Клацніть, щоб оглянути в 3D"
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

              {/* 2. Название зелья */}
              <h3
                className={`mobile-header-potion-title ${isDark ? 'dark-theme' : 'light-theme'}`}
                onClick={() => {
                  if (onSelect3D) {
                    playBubbleSound();
                    onSelect3D(potion);
                  }
                }}
                title={potion.name}
              >
                {potion.name}
              </h3>

              {/* 3. Картинка эффекта */}
              <div className="mobile-header-effect-icons">
                <TooltipTrigger
                  title={wikiPotion?.effectTitle || potion.effectName || 'Ефект'}
                  lore={wikiPotion?.minetip}
                >
                  <span className="sprite-file">
                    <span className="pixel-image">
                      <img
                        src={potion.effectIcon}
                        alt="Ефект"
                        className="mobile-effect-icon-img"
                        width="32"
                        height="32"
                      />
                    </span>
                  </span>
                </TooltipTrigger>
                {potion.secondaryEffectIcon && (
                  <span className="sprite-file">
                    <span className="pixel-image">
                      <img
                        src={potion.secondaryEffectIcon}
                        alt="Додатковий ефект"
                        className="mobile-effect-icon-img"
                        width="32"
                        height="32"
                      />
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Rectangles with duration, redstone and glowstone level */}
            <div className="mobile-pills-row">
              <div className="card-stat-pill">
                <span className="stat-label">Час:</span>
                <span className="stat-value time-val">{potion.duration}</span>
              </div>

              {potion.upgrades?.redstone && (
                <span className="card-upgrade-tag redstone-tag">Редстоун +</span>
              )}

              {potion.upgrades?.glowstone && (
                <span className="card-upgrade-tag glowstone-tag">Рівень II +</span>
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