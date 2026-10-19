import React from 'react';
import { BUBBLE_EMPTY_FRAME, BUBBLE_FRAMES_LIGHT } from '../data/brewingBubbleFrames';

export default function BrewingBubbles({ isBrewing = false, frameIndex = null, height = 58 }) {
  if (!isBrewing) {
    return (
      <span className="mcui-bubbling" style={{ height: `${height}px` }}>
        <img
          src={BUBBLE_EMPTY_FRAME}
          alt=""
          width="24"
          height={height}
          className="mc-bubbles-texture"
          draggable="false"
        />
      </span>
    );
  }

  if (typeof frameIndex === 'number' && frameIndex >= 0 && frameIndex < BUBBLE_FRAMES_LIGHT.length) {
    return (
      <span className="mcui-bubbling" style={{ height: `${height}px` }}>
        <img
          src={BUBBLE_FRAMES_LIGHT[frameIndex]}
          alt=""
          width="24"
          height={height}
          className="mc-bubbles-texture"
          draggable="false"
        />
      </span>
    );
  }

  return (
    <span className="mcui-bubbling" style={{ height: `${height}px` }}>
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
