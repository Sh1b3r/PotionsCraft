import React, { useEffect, useRef, useState } from 'react';
import { MINECRAFT_ITEMS } from '../data/minecraftItemIcons';
import { STATION_CRAFTING_RECIPES, canFillStationRecipe } from '../data/stationCraftingRecipes';
import { useI18n } from '../i18n';

function Item({ item }) {
  return item && <><img className="mc-item-icon" src={item.sprite} alt="" draggable="false" />{item.count > 1 && <span className="mc-item-count mc-pocket-count">{item.count}</span>}</>;
}
export default function BedrockStationView({ inventory, grid, output, brewingStage, controls, settings, fillRecipe, craft, clearGrid, fuelCharges, progress, brewing, message, containers, collectContainers, onTabChange }) {
  const { t, getItemName } = useI18n();
  const [tab, setTab] = useState('brewing');
  const [left, setLeft] = useState('inventory');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [stageScale, setStageScale] = useState(1.5);
  const stageBox = useRef(null);
  const repeat = useRef(null);
  const craftRef = useRef(craft);
  craftRef.current = craft;
  const stopCraft = () => { clearTimeout(repeat.current?.delay); clearInterval(repeat.current?.timer); repeat.current = null; };
  const changeTab = next => { if (next !== tab) stopCraft(); setTab(next); onTabChange(next); };
  useEffect(() => {
    window.addEventListener('blur', stopCraft);
    return () => { stopCraft(); window.removeEventListener('blur', stopCraft); };
  }, []);
  useEffect(() => { if (!settings.recipeBook) setLeft('inventory'); }, [settings.recipeBook]);
  useEffect(() => {
    const box = stageBox.current;
    if (!box) return;
    const resize = () => {
      if (!box.clientWidth || !box.clientHeight) return;
      setStageScale(Math.max(0.65, Math.min((box.clientWidth - 12) / 206, (box.clientHeight - 8) / 132, 2 * settings.size)));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(box); resize();
    return () => observer.disconnect();
  }, [settings.size]);
  const startCraft = event => {
    if (!output || repeat.current || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const press = { pointerId: event.pointerId, repeated: false };
    repeat.current = press;
    press.delay = setTimeout(() => {
      if (repeat.current !== press) return;
      press.repeated = true;
      if (!craftRef.current()) { stopCraft(); return; }
      press.timer = setInterval(() => { if (!craftRef.current()) stopCraft(); }, 250);
    }, 700);
  };
  const finishCraft = event => {
    const press = repeat.current;
    if (!press || event.pointerId !== press.pointerId) return;
    stopCraft();
    if (event.type === 'pointerup' && !press.repeated) craftRef.current();
  };
  const slot = (type, index, item) => <button key={`${type}-${index}`} type="button" className={`mc-pocket-slot${item ? ' has-item' : ''}`}
    data-slot-type={type} data-slot-index={index} aria-label={`${(item && (getItemName(item.itemId || item.id) || item.name)) || 'Slot'}${item ? `, ${item.count}` : ''}`}
    {...controls.events(type, index)}><Item item={item} /></button>;
  const selected = controls.item;
  const statusText = tab === 'brewing' && brewing
    ? `${t('pocket_brewing_tab')}: ${Math.ceil(20 * (1 - progress / 100))} s · ${t('station_fuel')} ${fuelCharges} / 20`
    : message || (tab === 'crafting' ? 'Tap result to craft. Hold for multiple.' : 'Tap to select & move. Hold to split stack.');
  return <div className="mc-pocket-workspace" style={{ '--pocket-size': settings.size }} onContextMenu={e => e.preventDefault()}>
    <div className="mc-pocket-panels">
      <section className="mc-pocket-inventory">
        <nav className="mc-pocket-tabs" aria-label={t('station_inventory')}>
          <button type="button" aria-pressed={left === 'inventory'} onClick={() => setLeft('inventory')}>{t('pocket_inventory_tab')}</button>
          {settings.recipeBook && <button type="button" aria-pressed={left === 'recipes'} onClick={() => { controls.clear(); setLeft('recipes'); }}>{t('pocket_recipes_tab')}</button>}
        </nav>
        {left === 'inventory' ?
          <div className="mc-pocket-scroll"><div className="mc-pocket-inventory-grid">{inventory.map((item, index) => slot('inventory', index, item))}</div></div>
          : <>
            <input className="mc-pocket-search" type="search" aria-label={t('pocket_recipes_tab')} placeholder={t('pocket_search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
            <div className="mc-pocket-scroll mc-pocket-recipes">{STATION_CRAFTING_RECIPES.filter(recipe => (getItemName(recipe.id) || MINECRAFT_ITEMS[recipe.id].name).toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(recipe => {
              const recipeItemName = getItemName(recipe.id) || MINECRAFT_ITEMS[recipe.id].name;
              const available = canFillStationRecipe(recipe, [...inventory, ...grid]);
              return <button type="button" key={recipe.id} className={`mc-pocket-recipe ${available ? 'is-available' : ''}`} aria-label={recipeItemName} onClick={() => { changeTab('crafting'); setPreview(fillRecipe(recipe) ? null : recipe); }}>
                <img src={MINECRAFT_ITEMS[recipe.id].sprite} alt="" /><span>{recipeItemName}<small>{available ? t('pocket_can_craft') : t('pocket_lacks_materials')}</small></span>
              </button>;
            })}</div>
          </>}
      </section>
      <div className="mc-pocket-stations">
        <nav className="mc-pocket-tabs" aria-label="Stations">
          <button type="button" aria-pressed={tab === 'brewing'} onClick={() => changeTab('brewing')}>{t('pocket_brewing_tab')}</button>
          <button type="button" aria-pressed={tab === 'crafting'} onClick={() => changeTab('crafting')}>{t('pocket_crafting_tab')}</button>
        </nav>
        <section className="mc-pocket-station mc-pocket-brewing-panel" aria-label={t('pocket_brewing_tab')} hidden={tab !== 'brewing'}>
          <div ref={stageBox} className="mc-pocket-stage-box"><div className="mc-pocket-stage" style={{ width: 206 * stageScale, height: 132 * stageScale }}><div style={{ transform: `scale(${stageScale})` }}>{brewingStage}</div></div></div>
        </section>
        <section className="mc-pocket-station mc-pocket-crafting-panel" aria-label={t('pocket_crafting_tab')} hidden={tab !== 'crafting'}>
          <div className="mc-pocket-crafting">
            {preview && <div className="mc-pocket-missing" role="status">Для {getItemName(preview.id) || MINECRAFT_ITEMS[preview.id].name}: {Object.entries(preview.grid.reduce((counts, id) => { if (id) counts[id] = (counts[id] || 0) + 1; return counts; }, {})).map(([id, count]) => `${getItemName(id) || MINECRAFT_ITEMS[id].name} × ${count}`).join(', ')}<button type="button" onClick={() => setPreview(null)} aria-label="✕">✕</button></div>}
            <div className="mc-pocket-crafting-row"><div className="mc-pocket-crafting-grid">{grid.map((item, index) => slot('crafting', index, item))}</div>
              <div className="mc-pocket-craft-arrow-box"><img className="mc-pixel-crafting-arrow mc-pocket-craft-arrow" src="/mc_crafting_arrow.png" alt="" /></div>
              <div className="mc-pocket-output-column"><button type="button" className="mc-pocket-slot mc-pocket-output" aria-label={output ? `${output.name}` : 'Output'}
                onPointerDown={startCraft} onPointerUp={finishCraft} onPointerCancel={finishCraft} onLostPointerCapture={finishCraft}
                onClick={e => { if (!e.detail && output) craftRef.current(); }}><Item item={output} /></button>
              </div>
            </div>
            <button type="button" className="mc-pocket-clear" onClick={clearGrid} disabled={!grid.some(Boolean)}>{t('pocket_clear_grid')}</button>
          </div>
        </section>
      </div>
    </div>
    <footer className="mc-pocket-selection" role="status">{selected ? <><img src={selected.sprite} alt="" /><span>{getItemName(selected.itemId || selected.id) || selected.name} × {controls.splitCount}</span>{(selected.maxStack || 64) > 1 && <button type="button" onClick={controls.collect} disabled={!controls.canCollect}>Collect</button>}</> : <span>{statusText}</span>}{containers > 0 && <button type="button" onClick={collectContainers}>{t('pocket_collect_bottles', { count: containers })}</button>}</footer>
    {controls.split && selected && <div className="mc-pocket-overlay"><section role="dialog" aria-modal="true" aria-label="Split" className="mc-pocket-split">
      <h3>{getItemName(selected.itemId || selected.id) || selected.name}</h3><div className="mc-pocket-split-value"><img src={selected.sprite} alt="" />{controls.splitCount} / {selected.count}</div>
      <input type="range" min="1" max={selected.count} value={controls.splitCount} onChange={e => controls.setCount(Number(e.target.value))} aria-label="Amount" />
      <div className="mc-pocket-settings-actions"><button type="button" onClick={() => controls.setCount(1)}>1</button><button type="button" onClick={() => controls.setCount(Math.ceil(selected.count / 2))}>1/2</button><button type="button" onClick={() => controls.setCount(selected.count)}>All</button></div>
      <button type="button" onClick={controls.closeSplit}>OK ({controls.splitCount})</button><button type="button" onClick={controls.clear}>Cancel</button>
    </section></div>}
  </div>;
}
