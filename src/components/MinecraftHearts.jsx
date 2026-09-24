import React from 'react';

/**
 * Renders authentic Minecraft hearts just like in be.html (Minecraft Wiki)
 * Uses /Heart_29.webp, /Half_Heart_29.webp, and /Poisoned_Heart_29.webp
 */
export default function MinecraftHearts({ type = 'full', count = 1, label = '', half = 0 }) {
  const hearts = [];

  const fullIcon = type === 'poison' ? '/Poisoned_Heart_29.webp' : '/Heart_29.webp';
  const halfIcon = '/Half_Heart_29.webp';

  // Render full hearts
  for (let i = 0; i < count; i++) {
    hearts.push(
      <img
        key={`full-${i}`}
        src={fullIcon}
        alt="❤️"
        title={label || `${count} ${count > 1 ? 'серця' : 'серце'}`}
        className="mc-heart-img"
        width="14"
        height="14"
        loading="lazy"
      />
    );
  }

  // Render half heart if needed (e.g. for strength or regeneration)
  if (half > 0) {
    for (let j = 0; j < half; j++) {
      hearts.push(
        <img
          key={`half-${j}`}
          src={halfIcon}
          alt="💔"
          title={label || '0.5 серця'}
          className="mc-heart-img"
          width="14"
          height="14"
          loading="lazy"
        />
      );
    }
  }

  return (
    <span
      className="nowrap mc-hearts"
      title={label || `${count + (half ? 0.5 : 0)} серця`}
    >
      <span className="iconbar pixel-image nowrap">
        {hearts}
      </span>
    </span>
  );
}
