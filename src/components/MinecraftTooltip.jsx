import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';

const TooltipContext = createContext(null);

// Authentic Minecraft color codes
const MC_COLORS = {
  '0': '#000000',
  '1': '#0000aa',
  '2': '#00aa00',
  '3': '#00aaaa',
  '4': '#aa0000',
  '5': '#aa00aa',
  '6': '#ffaa00', // gold
  '7': '#aaaaaa', // gray
  '8': '#555555', // dark gray
  '9': '#5555ff', // blue (positive effects)
  'a': '#55ff55', // green
  'b': '#55ffff', // aqua
  'c': '#ff5555', // red (negative effects)
  'd': '#ff55ff', // light purple
  'e': '#ffff55', // yellow
  'f': '#ffffff', // white
};

// 1/4 brightness shadow colors
const MC_SHADOWS = {
  '#000000': '#000000',
  '#0000aa': '#00002a',
  '#00aa00': '#002a00',
  '#00aaaa': '#002a2a',
  '#aa0000': '#2a0000',
  '#aa00aa': '#2a002a',
  '#ffaa00': '#2a2a00',
  '#aaaaaa': '#2a2a2a',
  '#555555': '#151515',
  '#5555ff': '#15153f',
  '#55ff55': '#153f15',
  '#55ffff': '#153f3f',
  '#ff5555': '#3f1515',
  '#ff55ff': '#3f153f',
  '#ffff55': '#3f3f15',
  '#ffffff': '#3f3f3f',
};

/**
 * Parses Minecraft formatting codes (&9, §c, &l, &o, etc.) and multiline breaks (/ or \n)
 * matching Minecraft Wiki minetip.js parsing
 */
function renderFormattedLines(rawText, defaultColor = '#ffffff') {
  if (!rawText) return null;

  // Split into lines by \n or / (Minecraft Wiki minetip line break delimiter)
  const lines = rawText.includes('\n')
    ? rawText.split('\n')
    : rawText.includes('/')
    ? rawText.split('/').filter(Boolean)
    : [rawText];

  return lines.map((line, lIdx) => {
    const parts = [];
    const regex = /(?:&|§)([0-9a-fk-or])/gi;
    let lastIndex = 0;
    let currentColor = defaultColor;
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isStrike = false;
    let m;

    while ((m = regex.exec(line)) !== null) {
      if (m.index > lastIndex) {
        parts.push({
          text: line.slice(lastIndex, m.index),
          color: currentColor,
          isBold,
          isItalic,
          isUnderline,
          isStrike,
        });
      }
      const code = m[1].toLowerCase();
      if (code === 'l') {
        isBold = true;
      } else if (code === 'o') {
        isItalic = true;
      } else if (code === 'n') {
        isUnderline = true;
      } else if (code === 'm') {
        isStrike = true;
      } else if (code === 'r') {
        currentColor = defaultColor;
        isBold = false;
        isItalic = false;
        isUnderline = false;
        isStrike = false;
      } else if (MC_COLORS[code]) {
        currentColor = MC_COLORS[code];
        isBold = false;
        isItalic = false;
        isUnderline = false;
        isStrike = false;
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push({
        text: line.slice(lastIndex),
        color: currentColor,
        isBold,
        isItalic,
        isUnderline,
        isStrike,
      });
    }

    if (parts.length === 0) {
      parts.push({
        text: line,
        color: defaultColor,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrike: false,
      });
    }

    return (
      <span key={`line-${lIdx}`} className="minetip-line">
        {parts.map((p, pIdx) => {
          const shadow = MC_SHADOWS[p.color.toLowerCase()] || '#3f3f3f';
          const textDec = [
            p.isUnderline ? 'underline' : '',
            p.isStrike ? 'line-through' : '',
          ].filter(Boolean).join(' ') || 'none';

          return (
            <span
              key={`part-${pIdx}`}
              style={{
                color: p.color,
                textShadow: `1px 1px 0 ${shadow}`,
                fontWeight: p.isBold ? 'bold' : 'normal',
                fontStyle: p.isItalic ? 'italic' : 'normal',
                textDecoration: textDec,
              }}
            >
              {p.text}
            </span>
          );
        })}
      </span>
    );
  });
}

export function TooltipProvider({ children }) {
  const [tooltip, setTooltip] = useState(null);
  const tooltipRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  const updatePosition = (clientX, clientY) => {
    if (typeof clientX === 'number' && typeof clientY === 'number' && (clientX > 0 || clientY > 0)) {
      posRef.current = { x: clientX, y: clientY };
    }
    const el = tooltipRef.current;
    if (!el) return;

    let targetX = posRef.current.x;
    let targetY = posRef.current.y;

    // Prevent placing at (0, 0) if no coordinates recorded yet
    if (targetX <= 0 && targetY <= 0) {
      return;
    }

    const width = el.offsetWidth || 180;
    const height = el.offsetHeight || 30;

    let x = targetX + 12;
    let y = targetY - 12;

    if (x + width > window.innerWidth - 8) {
      x = targetX - width - 12;
    }
    if (x < 8) x = 8;
    if (x + width > window.innerWidth - 8) {
      x = Math.max(8, window.innerWidth - width - 8);
    }

    if (y < 8) {
      y = targetY + 20;
    } else if (y + height > window.innerHeight - 8) {
      y = Math.max(8, window.innerHeight - height - 8);
    }

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  };

  useEffect(() => {
    const handleMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (tooltipRef.current) {
        updatePosition(e.clientX, e.clientY);
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('pointermove', handleMove);
    };
  }, []);

  useLayoutEffect(() => {
    if (tooltip && tooltipRef.current) {
      updatePosition(posRef.current.x, posRef.current.y);
    }
  }, [tooltip]);

  // Event delegation to catch any element with data-minetip attributes as in be.html
  useEffect(() => {
    const handleMouseOver = (e) => {
      if (e.clientX && e.clientY) {
        posRef.current = { x: e.clientX, y: e.clientY };
      }
      const target = e.target.closest(
        '[data-minetip-title], [data-minetip-text], [data-minetip], .invslot-item'
      );
      if (target) {
        // Skip if managed by explicit TooltipTrigger component or workstation slots
        if (target.closest('.mc-tooltip-trigger, .mc-slot, .mc-workbench-layout')) return;

        let title = target.getAttribute('data-minetip-title');
        let text = target.getAttribute('data-minetip-text') || target.getAttribute('data-minetip');

        // Fallbacks as on Minecraft Wiki minetip
        if (!title) {
          const a = target.querySelector('a');
          const img = target.querySelector('img');
          title = target.getAttribute('title') || a?.getAttribute('title') || img?.getAttribute('alt');
        }

        if (title || text) {
          setTooltip({ title, lore: text });
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest(
        '[data-minetip-title], [data-minetip-text], [data-minetip], .invslot-item'
      );
      if (!target) return;
      // Do not hide tooltip if moving into a child element inside target
      if (e.relatedTarget && target.contains(e.relatedTarget)) return;

      if (!target.closest('.mc-tooltip-trigger, .mc-slot, .mc-workbench-layout')) {
        setTooltip(null);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  const showTooltip = useCallback((data, coordsOrEvent) => {
    if (coordsOrEvent) {
      let cx = coordsOrEvent.clientX;
      let cy = coordsOrEvent.clientY;
      if ((typeof cx !== 'number' || typeof cy !== 'number') && coordsOrEvent.currentTarget?.getBoundingClientRect) {
        const rect = coordsOrEvent.currentTarget.getBoundingClientRect();
        cx = rect.right + 8;
        cy = rect.top;
      }
      if (typeof cx === 'number' && typeof cy === 'number' && (cx > 0 || cy > 0)) {
        posRef.current = { x: cx, y: cy };
      }
    }
    setTooltip(data);
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  const contextValue = useMemo(() => ({ showTooltip, hideTooltip }), [showTooltip, hideTooltip]);

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
      {tooltip && (
        <div
          id="minetip-tooltip"
          ref={tooltipRef}
          className="minetip-tooltip"
          style={{
            display: 'block',
          }}
        >
          {tooltip.title && (
            <span className="minetip-title">
              {renderFormattedLines(tooltip.title, '#ffffff')}
            </span>
          )}
          {tooltip.subtitle && (
            <span className="minetip-text">
              {renderFormattedLines(tooltip.subtitle, '#5555ff')}
            </span>
          )}
          {tooltip.lore && (
            <span className="minetip-text">
              {renderFormattedLines(tooltip.lore, '#aaaaaa')}
            </span>
          )}
          {tooltip.extra && (
            <span className="minetip-extra">
              {renderFormattedLines(tooltip.extra, '#ffaa00')}
            </span>
          )}
        </div>
      )}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    return {
      showTooltip: () => {},
      hideTooltip: () => {},
    };
  }
  return ctx;
}

export function TooltipTrigger({ as: Tag = 'div', title, subtitle, lore, color, extra, children, className = '', style = {}, onClick }) {
  const { showTooltip, hideTooltip } = useTooltip();

  return (
    <Tag
      className={`mc-tooltip-trigger ${className}`}
      style={style}
      onMouseEnter={(e) => {
        if (title || subtitle || lore) {
          showTooltip({ title, subtitle, lore, color, extra }, e);
        }
      }}
      onMouseMove={(e) => {
        if (title || subtitle || lore) {
          showTooltip({ title, subtitle, lore, color, extra }, e);
        }
      }}
      onMouseLeave={hideTooltip}
      onClick={(e) => {
        hideTooltip();
        if (onClick) onClick(e);
      }}
    >
      {children}
    </Tag>
  );
}
