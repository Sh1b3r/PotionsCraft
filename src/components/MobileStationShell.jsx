import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export function useMobileStation() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 720px), (pointer: coarse)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px), (pointer: coarse)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}

export default function MobileStationShell({ mobile, children, onClose, onOpen }) {
  const [open, setOpen] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const panel = useRef(null);
  const openedRef = useRef(false);
  const launchButton = useRef(null);
  const close = () => {
    openedRef.current = false;
    onClose();
    setOpen(false);
    if (document.fullscreenElement === panel.current) document.exitFullscreen?.().catch(() => {});
    window.screen.orientation?.unlock?.();
    launchButton.current?.focus();
  };
  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current.querySelector('.mc-mobile-heading button')?.focus();
    const escape = event => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const buttons = [...panel.current.querySelectorAll('button:not(:disabled)')];
        const index = buttons.indexOf(document.activeElement);
        event.preventDefault();
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    };
    const fullscreen = () => { if (!document.fullscreenElement) window.screen.orientation?.unlock?.(); };
    window.addEventListener('keydown', escape);
    document.addEventListener('fullscreenchange', fullscreen);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', escape);
      document.removeEventListener('fullscreenchange', fullscreen);
    };
  }, [open]);
  useEffect(() => { if (!mobile && open) close(); }, [mobile]);

  const launch = async () => {
    onOpen();
    openedRef.current = true;
    flushSync(() => setOpen(true));
    try { await panel.current.requestFullscreen?.(); } catch { /* The landscape layout also works without fullscreen. */ }
    if (!openedRef.current) return;
    try { await window.screen.orientation?.lock?.('landscape'); } catch { /* iOS and some browsers need the CSS landscape layout. */ }
  };
  const rotated = mobile && viewport.height > viewport.width;
  const width = rotated ? viewport.height : viewport.width;
  const height = rotated ? viewport.width : viewport.height;
  const scale = Math.min(1.25, (width - 24) / 684, (height - 62) / 470);

  return <>
    {mobile && <button ref={launchButton} type="button" className="mc-mobile-launch" onClick={launch}>Відкрити варильну стійку та верстак</button>}
    <div ref={panel} role={mobile ? 'dialog' : undefined} aria-modal={mobile && open ? true : undefined}
      aria-label={mobile ? 'Варильна стійка та верстак' : undefined}
      className={`mc-station-shell ${mobile ? 'is-mobile' : ''} ${open ? 'is-open' : ''}`}>
      <div className={`mc-station-landscape ${rotated ? 'is-rotated' : ''}`} style={mobile ? { width, height } : undefined}>
        {mobile && <div className="mc-mobile-heading"><span>Варіння та крафт</span><button type="button" onClick={close} aria-label="Закрити верстак">✕</button></div>}
        <div className="mc-station-content" style={mobile ? { width: 684, transform: `scale(${Math.max(0.25, scale)})` } : undefined}>
          {children}
        </div>
      </div>
    </div>
  </>;
}
