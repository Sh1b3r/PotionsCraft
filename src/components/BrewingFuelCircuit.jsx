import React from 'react';

// Exact pixel rectangles from the original PNGs; only their paint changes.
export function BrewingSpring() {
  return <g transform="translate(50 27)">
    <path fill="var(--brewing-fuel-shadow, #373737)" d="M0 2h16v2h-16z M16 4h4v2h-4z M4 8h12v2h-12z M20 8h2v2h-2z M2 10h2v2h-2z M0 12h2v2h-2z M14 12h2v2h-2z M4 14h10v2h-10z M20 14h2v2h-2z M2 16h2v2h-2z M18 16h2v2h-2z M0 18h2v2h-2z M14 18h2v2h-2z M4 20h10v2h-10z M20 20h2v2h-2z M2 22h2v2h-2z M18 22h2v2h-2z M0 24h2v2h-2z M14 24h2v2h-2z M4 26h10v2h-10z M20 26h2v2h-2z M2 28h2v2h-2z M18 28h2v2h-2z M14 30h4v2h-4z M0 30h2v2h-2z M4 32h10v2h-10z M20 32h2v2h-2z M2 34h2v2h-2z M18 34h2v2h-2z M20 36h6v2h-6z M14 36h4v2h-4z M0 36h2v2h-2z M4 38h10v2h-10z" />
    <path fill="var(--brewing-fuel-detail, #000)" d="M18 10h2v2h-2z" />
    <path fill="var(--brewing-fuel-body, #8b8b8b)" d="M22 4h2v4h-2z M16 12h2v2h-2z M22 10h2v4h-2z M14 14h2v2h-2z M16 18h2v2h-2z M22 16h2v4h-2z M14 20h2v2h-2z M16 24h2v2h-2z M22 22h2v4h-2z M14 26h2v2h-2z M22 28h2v4h-2z" />
    <path fill="var(--brewing-fuel-light, #fff)" d="M0 0h16v2h-16z M16 2h4v2h-4z M20 4h2v4h-2z M4 6h12v2h-12z M16 8h4v2h-4z M2 8h2v2h-2z M0 10h2v2h-2z M14 10h4v2h-4z M20 10h2v4h-2z M2 12h12v2h-12z M16 14h4v2h-4z M2 14h2v2h-2z M0 16h2v2h-2z M14 16h4v2h-4z M20 16h2v4h-2z M2 18h12v2h-12z M16 20h4v2h-4z M2 20h2v2h-2z M0 22h2v2h-2z M14 22h4v2h-4z M20 22h2v4h-2z M2 24h12v2h-12z M16 26h4v2h-4z M2 26h2v2h-2z M0 28h2v2h-2z M14 28h4v2h-4z M2 30h12v2h-12z M20 28h2v4h-2z M16 32h4v2h-4z M2 32h2v2h-2z M20 34h6v2h-6z M0 34h2v2h-2z M14 34h4v2h-4z M2 36h12v2h-12z" />
  </g>;
}

export function BrewingFuelTrough() {
  return <g transform="translate(88 57)">
    <path fill="var(--brewing-fuel-shadow, #373737)" d="M2 0h32v2h-32z M34 2h2v2h-2z M0 2h2v2h-2z" />
    <path fill="var(--brewing-fuel-body, #8b8b8b)" d="M2 2h32v2h-32z M0 4h36v4h-36z M2 8h32v2h-32z" />
    <path fill="var(--brewing-fuel-light, #fff)" d="M36 4h2v4h-2z M0 8h2v2h-2z M34 8h2v2h-2z M2 10h32v2h-32z" />
  </g>;
}

export function BrewingFuelGauge() {
  return <svg className="mc-fuel-gauge-sculk" width="36" height="8" viewBox="0 0 36 8"
    shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <path fill="var(--brewing-fuel-shadow)" d="M0 2h2v2h-2z M32 6h2v2h-2z M0 4h2v2h-2z M6 6h12v2h-12z M30 6h2v2h-2z M18 6h12v2h-12z M2 6h4v2h-4z M34 4h2v2h-2z" />
    <path fill="var(--brewing-fuel-body)" d="M4 0h2v2h-2z M12 0h6v2h-6z M24 0h2v2h-2z M6 0h2v2h-2z M30 0h2v2h-2z M2 0h2v2h-2z M34 2h2v2h-2z M32 0h2v2h-2z M8 0h4v2h-4z M26 0h4v2h-4z M18 0h6v2h-6z" />
    <path fill="var(--sculk-glow)" d="M4 4h4v2h-4z M18 4h4v2h-4z M24 4h2v2h-2z M30 4h4v2h-4z M10 4h4v2h-4z M8 4h2v2h-2z M2 4h2v2h-2z M14 4h4v2h-4z M26 4h4v2h-4z M22 4h2v2h-2z" />
    <path fill="var(--brewing-fuel-light)" d="M26 2h6v2h-6z M18 2h2v2h-2z M20 2h6v2h-6z M8 2h4v2h-4z M4 2h2v2h-2z M16 2h2v2h-2z M32 2h2v2h-2z M2 2h2v2h-2z M6 2h2v2h-2z M12 2h4v2h-4z" />
  </svg>;
}
