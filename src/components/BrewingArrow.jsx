import React, { useId } from 'react';

// Lossless rectangles from the existing PNGs. SVG paints their pixel grid at
// the final size, so reduced browser zoom does not resample a raster texture.
const CARD = [
  { fill: 'var(--brewing-pipe-body, #8b8b8b)', d: 'M14 7h2v42h-2z M16 51h2v2h-2z M14 53h2v2h-2z M12 55h2v2h-2z' },
  { fill: 'var(--brewing-pipe-light, #fff)', d: 'M8 5h6v44h-6z M4 49h14v2h-14z M6 51h10v2h-10z M8 53h6v2h-6z M10 55h2v2h-2z' },
];
const STATION = [
  { fill: 'var(--brewing-arrow-shadow, var(--brewing-pipe-shadow, #373737))', d: 'M4 0h4v2h-4z M4 2h2v46h-2z M0 48h6v2h-6z M10 48h2v2h-2z M2 50h2v2h-2z M4 52h2v2h-2z' },
  { fill: 'var(--brewing-arrow-body, var(--brewing-pipe-body, #8b8b8b))', d: 'M6 2h2v46h-2z M6 48h4v2h-4z M4 50h6v2h-6z M6 52h2v2h-2z' },
  { fill: 'var(--brewing-arrow-light, var(--brewing-pipe-light, #fff))', d: 'M8 0h2v48h-2z M12 48h2v2h-2z M10 50h2v2h-2z M8 52h2v2h-2z M6 54h2v2h-2z' },
];
const FULL = 'M4 0h6v48h-6z M0 48h14v2h-14z M2 50h10v2h-10z M4 52h6v2h-6z M6 54h2v2h-2z';

export default function BrewingArrow({ variant = 'station', filledHeight = 0 }) {
  const clipId = useId();
  const card = variant === 'card';
  const width = card ? 18 : 16;
  const height = card ? 57 : 56;
  return <svg className="mc-brewing-arrow-svg" width={width} height={height} viewBox={'0 0 ' + width + ' ' + height} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    {(card ? CARD : STATION).map((path, index) => <path key={index} {...path} />)}
    {!card && filledHeight > 0 && <>
      <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><rect width="16" height={Math.min(56, Math.max(0, filledHeight))} /></clipPath></defs>
      <path fill="var(--brewing-arrow-fill, #fff)" d={FULL} clipPath={'url(#' + clipId + ')'} />
    </>}
  </svg>;
}
