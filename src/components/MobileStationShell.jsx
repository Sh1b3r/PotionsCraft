import React, { useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import BrewingStandFrame from './BrewingStandFrame';

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
export const POCKET_DEFAULTS = { size: 1, doubleTap: true, splitControl: true, holdDelay: 600, recipeBook: true };
export function usePocketSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('potionscraft-pocket-settings-v1')) || {};
      return { ...POCKET_DEFAULTS, size: [0.9, 1, 1.15].includes(saved.size) ? saved.size : 1,
        holdDelay: [400, 600, 900].includes(saved.holdDelay) ? saved.holdDelay : 600,
        ...Object.fromEntries(['doubleTap', 'splitControl', 'recipeBook'].map(key => [key, typeof saved[key] === 'boolean' ? saved[key] : POCKET_DEFAULTS[key]])) };
    } catch { return POCKET_DEFAULTS; }
  });
  const update = next => { setSettings(next); try { localStorage.setItem('potionscraft-pocket-settings-v1', JSON.stringify(next)); } catch { /* Storage may be unavailable. */ } };
  return [settings, update];
}
export default function MobileStationShell({ mobile, children, onClose, onOpen, settings, onSettingsChange }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const panel = useRef(null);
  const launchButton = useRef(null);
  const openedRef = useRef(false);
  const close = () => {
    openedRef.current = false;
    screen.orientation?.unlock?.();
    onClose(); setOpen(false); setConfig(false);
    if (document.fullscreenElement === panel.current) document.exitFullscreen?.().catch(() => {});
    launchButton.current?.focus();
  };
  useEffect(() => {
    const resize = () => setViewport({ width: window.visualViewport?.width || window.innerWidth, height: window.visualViewport?.height || window.innerHeight });
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('resize', resize); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const app = document.getElementById('root');
    const previousInert = app?.inert;
    document.body.style.overflow = 'hidden';
    if (app) app.inert = true;
    (panel.current.querySelector(config ? '.mc-pocket-settings select' : '.mc-mobile-heading button'))?.focus();
    const escape = event => {
      if (event.key === 'Escape') { if (config) setConfig(false); else close(); }
      if (event.key === 'Tab') {
        const root = panel.current.querySelector('.mc-pocket-settings, .mc-pocket-split') || panel.current;
        const controls = [...root.querySelectorAll('button:not(:disabled), input, select')].filter(el => el.getClientRects().length);
        const index = controls.indexOf(document.activeElement);
        event.preventDefault();
        controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
      }
    };
    window.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previousOverflow; if (app) app.inert = previousInert; window.removeEventListener('keydown', escape); };
  }, [open, config]);
  const launch = async () => {
    onOpen();
    openedRef.current = true;
    flushSync(() => setOpen(true));
    try { await panel.current.requestFullscreen?.({ navigationUI: 'hide' }); } catch { /* Use the viewport when fullscreen is unavailable. */ }
    if (!openedRef.current) return;
    try { await screen.orientation?.lock?.('landscape'); } catch { /* Rotate the interface when the browser cannot lock orientation. */ }
    if (!openedRef.current) screen.orientation?.unlock?.();
  };
  const rotated = viewport.height > viewport.width;
  if (!mobile && !open) return children;
  return <>
    <button ref={launchButton} type="button" className="mc-mobile-launch" onClick={launch}
      aria-label="Відкрити варильну стійку та верстак" aria-haspopup="dialog">
      <span className="mc-mobile-launch-icon" aria-hidden="true"><BrewingStandFrame /></span>
      <span className="mc-mobile-launch-copy"><span className="mc-mobile-launch-title">Варіння та крафт</span><span className="mc-mobile-launch-hint">Відкрити інтерактивний блок</span></span>
      <span className="mc-mobile-launch-chevron" aria-hidden="true">›</span>
    </button>
    {open && createPortal(<div ref={panel} role="dialog" aria-modal="true" aria-label="Варильна стійка та верстак" className="mc-station-shell is-mobile is-open">
      <div className={`mc-station-viewport ${rotated ? 'is-rotated' : ''}`} style={{ width: rotated ? viewport.height : viewport.width, height: rotated ? viewport.width : viewport.height }}>
        <header className="mc-mobile-heading"><button type="button" className="mc-pocket-back" onClick={close} aria-label="Закрити верстак">‹ <span>Назад</span></button><span>Варіння та крафт</span><div>
          <button type="button" onClick={() => setConfig(true)} aria-label="Налаштування керування">⚙</button>
        </div></header>
        <div className="mc-station-content" inert={config ? true : undefined}>{children}</div>
        {config && <div className="mc-pocket-overlay"><section className="mc-pocket-settings" role="dialog" aria-modal="true" aria-label="Налаштування керування">
          <h3>Сенсорне керування</h3>
          <label>Розмір слотів<select value={settings.size} onChange={e => onSettingsChange({ ...settings, size: Number(e.target.value) })}><option value="0.9">Компактні</option><option value="1">Звичайні</option><option value="1.15">Великі</option></select></label>
          <label>Час утримання<select value={settings.holdDelay} onChange={e => onSettingsChange({ ...settings, holdDelay: Number(e.target.value) })}><option value="400">400 мс</option><option value="600">600 мс</option><option value="900">900 мс</option></select></label>
          <label><span>Розділяти стопку утриманням</span><input type="checkbox" checked={settings.splitControl} onChange={e => onSettingsChange({ ...settings, splitControl: e.target.checked })} /></label>
          <label><span>Швидкий перенос подвійним дотиком</span><input type="checkbox" checked={settings.doubleTap} onChange={e => onSettingsChange({ ...settings, doubleTap: e.target.checked })} /></label>
          <label><span>Книга рецептів</span><input type="checkbox" checked={settings.recipeBook} onChange={e => onSettingsChange({ ...settings, recipeBook: e.target.checked })} /></label>
          <div className="mc-pocket-settings-actions"><button type="button" onClick={() => onSettingsChange(POCKET_DEFAULTS)}>Скинути</button><button type="button" onClick={() => setConfig(false)}>Готово</button></div>
        </section></div>}
      </div>
    </div>, document.body)}
  </>;
}
