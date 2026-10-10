import React, { useId } from 'react';

export default function BrewingBubbles({ isBrewing = false, height = 58 }) {
  const filterId = useId();
  return <svg className="mcui-bubbling" width="24" height={height} viewBox={`0 0 24 ${height}`}
    style={{ backgroundImage: 'none', '--sculk-bubbles-filter': `url(#${filterId})` }}
    aria-hidden="true" focusable="false">
    <defs>
      <filter id={filterId} colorInterpolationFilters="sRGB">
        {/* Map the sprite's three gray tones to Sculk shadow, body and echo.
            Preserve alpha and the original GIF frames and timing. */}
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues={`${2 / 255} ${56 / 255} ${153 / 255}`} />
          <feFuncG type="discrete" tableValues={`${12 / 255} ${123 / 255} ${244 / 255}`} />
          <feFuncB type="discrete" tableValues={`${17 / 255} ${131 / 255} ${229 / 255}`} />
        </feComponentTransfer>
      </filter>
    </defs>
    <image className="mc-bubbles-texture" href={isBrewing ? '/Grid_layout_Brewing_Bubbles.gif' : '/mc_bubbles_empty.png'}
      width="24" height="58" />
  </svg>;
}
