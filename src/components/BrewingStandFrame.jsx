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

export default function BrewingStandFrame({ withFuel = false, pipeExtension = 0 }) {
  const width = withFuel ? 206 : 128;
  const height = 111 + pipeExtension;
  return (
    <svg className="mcui-frame" width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {withFuel && (
        <g>
          {/* Original fuel circuit, relative to the station frame at (46, 5). */}
          <path d="M36 27h14v2H36z M66 61h22v2H66z" fill="#fff" />
          <path d="M36 29h14v2H36z M66 63h22v2H66z" fill="var(--brewing-pipe-shadow)" />
          <g className="mcui-fuel-light">
            <image href="/mc_brewing_spring_exact.png" x="50" y="27" width="26" height="40" />
            <image href="/mc_brewing_fuel_trough.png" x="88" y="57" width="38" height="12" />
          </g>
          <g className="mcui-fuel-dark">
            <image href="/mc_brewing_spring_exact_dark.png" x="50" y="27" width="26" height="40" />
            <image href="/mc_brewing_fuel_trough_dark.png" x="88" y="57" width="38" height="12" />
          </g>
          <SlotFrame x={0} y={3} />
        </g>
      )}
      <g transform={`translate(${withFuel ? 78 : 0} 0)`}>
        <SlotFrame x={46} y={3} />
        {/* Original pipe rectangles share the slots' pixel grid. The station
            extends the straight stems to fit its original fuel circuit. */}
        <g transform="translate(34 35)">
          <path fill="#8b8b8b" d={`M16 0h6v2h-6z M26 0h6v2h-6z M36 0h6v2h-6z M18 2h4v${28 + pipeExtension}h-4z M28 2h4v${38 + pipeExtension}h-4z M38 2h4v${28 + pipeExtension}h-4z M0 ${28 + pipeExtension}h2v2H0z M0 ${30 + pipeExtension}h22v4H0z M38 ${30 + pipeExtension}h22v4H38z M36 ${34 + pipeExtension}h2v2h-2z M58 ${34 + pipeExtension}h2v2h-2z`} />
          <path fill="var(--brewing-pipe-shadow)" d={`M16 2h2v${26 + pipeExtension}h-2z M26 2h2v${38 + pipeExtension}h-2z M36 2h2v${32 + pipeExtension}h-2z M2 ${28 + pipeExtension}h16v2H2z M42 ${28 + pipeExtension}h18v2H42z`} />
          <path fill="#fff" d={`M22 2h2v${32 + pipeExtension}h-2z M32 2h2v${38 + pipeExtension}h-2z M42 2h2v${24 + pipeExtension}h-2z M0 ${34 + pipeExtension}h24v2H0z M38 ${34 + pipeExtension}h20v2H38z`} />
        </g>
        <SlotFrame x={0} y={61 + pipeExtension} />
        <SlotFrame x={46} y={75 + pipeExtension} />
        <SlotFrame x={92} y={61 + pipeExtension} />
      </g>
    </svg>
  );
}
