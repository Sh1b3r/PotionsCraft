import React from 'react';

function SlotFrame({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="36" height="36" fill="#8b8b8b" />
      <path d="M0 0H36L34 2H2V34L0 36Z" fill="#373737" />
      <path d="M36 0V36H0L2 34H34V2Z" fill="var(--slot-bevel-light)" />
    </g>
  );
}

export default function BrewingStandFrame() {
  return (
    <svg className="mcui-frame" width="128" height="111" viewBox="0 0 128 111"
      shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <SlotFrame x={46} y={3} />
      {/* Exact rectangles from the 60 x 40 pipe PNG, on the slots' pixel grid.
          Rasterizing one SVG avoids independent bitmap/CSS edge rounding. */}
      <g transform="translate(34 35)">
        <path fill="#8b8b8b" d="M16 0h6v2h-6z M26 0h6v2h-6z M36 0h6v2h-6z M18 2h4v28h-4z M28 2h4v38h-4z M38 2h4v28h-4z M0 28h2v2H0z M0 30h22v4H0z M38 30h22v4H38z M36 34h2v2h-2z M58 34h2v2h-2z" />
        <path fill="var(--brewing-pipe-shadow)" d="M16 2h2v26h-2z M26 2h2v38h-2z M36 2h2v32h-2z M2 28h16v2H2z M42 28h18v2H42z" />
        <path fill="#fff" d="M22 2h2v32h-2z M32 2h2v38h-2z M42 2h2v24h-2z M0 34h24v2H0z M38 34h20v2H38z" />
      </g>
      <SlotFrame x={0} y={61} />
      <SlotFrame x={46} y={75} />
      <SlotFrame x={92} y={61} />
    </svg>
  );
}
