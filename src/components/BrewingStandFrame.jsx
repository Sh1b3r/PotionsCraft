import React from 'react';
import { BrewingSpring, BrewingFuelTrough } from './BrewingFuelCircuit';

function SlotFrame({ x, y, emptyBottle = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="36" height="36" fill="var(--slot-surface, #8b8b8b)" />
      <path d="M0 0H36L34 2H2V34L0 36Z" fill="var(--slot-shadow, #373737)" />
      <path d="M36 0V36H0L2 34H34V2Z" fill="var(--slot-bevel-light, #fff)" />
      {emptyBottle && (
        /* Same silhouette as the PNG, with its visible 18x24 bounds centered
           at (18, 18). Render on the frame's grid instead of a CSS background. */
        <path className="mcui-empty-bottle" fill="var(--slot-silhouette, #686868)"
          d="M13 6h10v2H13z M13 8h2v2h-2z M21 8h2v2h-2z M15 10h2v4h-2z M19 10h2v4h-2z M13 14h2v2h-2z M21 14h2v2h-2z M11 16h2v2h-2z M15 16h2v2h-2z M23 16h2v2h-2z M9 18h2v8H9z M13 18h2v4h-2z M25 18h2v8h-2z M21 22h2v4h-2z M11 26h2v2h-2z M19 26h2v2h-2z M23 26h2v2h-2z M13 28h10v2H13z" />
      )}
    </g>
  );
}

export default function BrewingStandFrame({ withFuel = false, pipeExtension = 0, emptyBottles = [true, true, true] }) {
  const width = withFuel ? 206 : 128;
  const height = 111 + pipeExtension;
  return (
    <svg className="mcui-frame" width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {withFuel && (
        <g>
          {/* Original fuel circuit, relative to the station frame at (46, 5). */}
          <path d="M36 27h14v2H36z M66 61h22v2H66z" fill="var(--brewing-pipe-light, #fff)" />
          <path d="M36 29h14v2H36z M66 63h22v2H66z" fill="var(--brewing-pipe-shadow)" />
          <BrewingSpring />
          <BrewingFuelTrough />
          <SlotFrame x={0} y={3} />
        </g>
      )}
      <g transform={`translate(${withFuel ? 78 : 0} 0)`}>
        {/* Original pipe rectangles share the slots' pixel grid. The station
            extends the straight stems to fit its original fuel circuit. */}
        <g transform="translate(34 35)">
          <path fill="var(--brewing-pipe-body, #8b8b8b)" d={`M16 0h6v2h-6z M26 0h6v2h-6z M36 0h6v2h-6z M18 2h4v${28 + pipeExtension}h-4z M28 2h4v${38 + pipeExtension}h-4z M38 2h4v${28 + pipeExtension}h-4z M0 ${28 + pipeExtension}h2v2H0z M0 ${30 + pipeExtension}h22v4H0z M38 ${30 + pipeExtension}h22v4H38z M36 ${34 + pipeExtension}h2v2h-2z M58 ${34 + pipeExtension}h2v2h-2z`} />
          <path fill="var(--brewing-pipe-shadow)" d={`M16 2h2v${26 + pipeExtension}h-2z M26 2h2v${38 + pipeExtension}h-2z M36 2h2v${32 + pipeExtension}h-2z M2 ${28 + pipeExtension}h16v2H2z M42 ${28 + pipeExtension}h18v2H42z`} />
          <path fill="var(--brewing-pipe-light, #fff)" d={`M22 2h2v${32 + pipeExtension}h-2z M32 2h2v${38 + pipeExtension}h-2z M42 2h2v${24 + pipeExtension}h-2z M0 ${34 + pipeExtension}h24v2H0z M38 ${34 + pipeExtension}h20v2H38z`} />
        </g>
        {/* Pipe stems overlap the input's last four rows. Paint the slot over
            them, just like the output slots, so they cannot show inside it. */}
        <SlotFrame x={46} y={3} />
        <SlotFrame x={0} y={61 + pipeExtension} emptyBottle={emptyBottles[0]} />
        <SlotFrame x={46} y={75 + pipeExtension} emptyBottle={emptyBottles[1]} />
        <SlotFrame x={92} y={61 + pipeExtension} emptyBottle={emptyBottles[2]} />
      </g>
    </svg>
  );
}
