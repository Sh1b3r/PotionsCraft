import React from 'react';

export default function BrewingBubbles({ isBrewing = false, frameIndex = null, height = 58 }) {
  // When no potion is brewing, steam/bubbles do not exist at all in authentic Minecraft GUI
  if (!isBrewing) {
    return (
      <span
        className="mcui-bubbling mcui-bubbling-idle"
        style={{ width: '24px', height: `${height}px`, display: 'inline-block' }}
        aria-hidden="true"
      >
        <img
          src="/mc_bubbles_empty.png"
          alt=""
          width="24"
          height={height}
          className="mc-bubbles-texture mc-bubbles-light"
          draggable="false"
        />
        <img
          src="/mc_bubbles_empty_dark.png"
          alt=""
          width="24"
          height={height}
          className="mc-bubbles-texture mc-bubbles-dark"
          draggable="false"
        />
      </span>
    );
  }

  // Active brewing with discrete 7-step frame progression matching the 20-second arrow
  if (typeof frameIndex === 'number' && frameIndex >= 0 && frameIndex < 7) {
    return (
      <span className="mcui-bubbling is-brewing" style={{ width: '24px', height: `${height}px`, display: 'inline-block' }}>
        <img
          src={`/mc_bubble_light_${frameIndex}.png`}
          alt=""
          width="24"
          height={height}
          className="mc-bubbles-texture mc-bubbles-light"
          draggable="false"
        />
        <img
          src={`/mc_bubble_dark_${frameIndex}.png`}
          alt=""
          width="24"
          height={height}
          className="mc-bubbles-texture mc-bubbles-dark"
          draggable="false"
        />
      </span>
    );
  }

  // Active brewing fallback animation
  return (
    <span className="mcui-bubbling is-brewing" style={{ width: '24px', height: `${height}px`, display: 'inline-block' }}>
      <img
        src="/Grid_layout_Brewing_Bubbles.gif"
        alt=""
        width="24"
        height={height}
        className="mc-bubbles-texture mc-bubbles-light"
        draggable="false"
      />
      <img
        src="/Grid_layout_Brewing_Bubbles_dark.gif"
        alt=""
        width="24"
        height={height}
        className="mc-bubbles-texture mc-bubbles-dark"
        draggable="false"
      />
    </span>
  );
}
