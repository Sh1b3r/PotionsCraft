import React, { useEffect, useRef, useState } from 'react';
import { MINECRAFT_ITEMS } from '../data/minecraftItemIcons';
import { STATION_CRAFTING_RECIPES, canFillStationRecipe } from '../data/stationCraftingRecipes';

function Item({ item }) {
  return item && <><img className="mc-item-icon" src={item.sprite} alt="" draggable="false" />{item.count > 1 && <span className="mc-item-count mc-pocket-count">{item.count}</span>}</>;
}
export default function BedrockStationView({ inventory, grid, output, brewingStage, controls, settings, fillRecipe, craft, clearGrid, fuelCharges, progress, brewing, message, containers, collectContainers, onTabChange }) {
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
    // This dedicated viewport has no variable-height status content.
    // Only viewport or slot-size changes can resize the brewing stand.
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
    data-slot-type={type} data-slot-index={index} aria-label={`${item?.name || 'Порожній слот'}${item ? `, ${item.count}` : ''}`}
    {...controls.events(type, index)}><Item item={item} /></button>;
  const selected = controls.item;
  const statusText = tab === 'brewing' && brewing
    ? `Варіння: ${Math.ceil(20 * (1 - progress / 100))} с · Паливо: ${fuelCharges} / 20`
    : message || (tab === 'crafting' ? 'Дотик по результату — створити. Утримання — кілька.' : 'Дотик — вибрати й перенести. Утримання — розділити стопку.');
  return <div className="mc-pocket-workspace" style={{ '--pocket-size': settings.size }} onContextMenu={e => e.preventDefault()}>
    <div className="mc-pocket-panels">
      <section className="mc-pocket-inventory">
        <nav className="mc-pocket-tabs" aria-label="Інвентар та рецепти">
          <button type="button" aria-pressed={left === 'inventory'} onClick={() => setLeft('inventory')}>Інвентар</button>
          {settings.recipeBook && <button type="button" aria-pressed={left === 'recipes'} onClick={() => { controls.clear(); setLeft('recipes'); }}>Рецепти</button>}
        </nav>
        {left === 'inventory' ?
          <div className="mc-pocket-scroll"><div className="mc-pocket-inventory-grid">{inventory.map((item, index) => slot('inventory', index, item))}</div></div>
          : <>
            <input className="mc-pocket-search" type="search" aria-label="Пошук рецепта" placeholder="Пошук рецепта…" value={search} onChange={e => setSearch(e.target.value)} />
            <div className="mc-pocket-scroll mc-pocket-recipes">{STATION_CRAFTING_RECIPES.filter(recipe => MINECRAFT_ITEMS[recipe.id].name.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(recipe => {
              const available = canFillStationRecipe(recipe, [...inventory, ...grid]);
              return <button type="button" key={recipe.id} className={`mc-pocket-recipe ${available ? 'is-available' : ''}`} aria-label={`Рецепт: ${MINECRAFT_ITEMS[recipe.id].name}`} onClick={() => { changeTab('crafting'); setPreview(fillRecipe(recipe) ? null : recipe); }}>
                <img src={MINECRAFT_ITEMS[recipe.id].sprite} alt="" /><span>{MINECRAFT_ITEMS[recipe.id].name}<small>{available ? 'Можна створити' : 'Бракує матеріалів'}</small></span>
              </button>;
            })}</div>
          </>}
      </section>
      <div className="mc-pocket-stations">
        <nav className="mc-pocket-tabs" aria-label="Варіння та крафт">
          <button type="button" aria-pressed={tab === 'brewing'} onClick={() => changeTab('brewing')}>Варіння</button>
          <button type="button" aria-pressed={tab === 'crafting'} onClick={() => changeTab('crafting')}>Крафт</button>
        </nav>
        <section className="mc-pocket-station mc-pocket-brewing-panel" aria-label="Варіння" hidden={tab !== 'brewing'}>
          <div ref={stageBox} className="mc-pocket-stage-box"><div className="mc-pocket-stage" style={{ width: 206 * stageScale, height: 132 * stageScale }}><div style={{ transform: `scale(${stageScale})` }}>{brewingStage}</div></div></div>
        </section>
        <section className="mc-pocket-station mc-pocket-crafting-panel" aria-label="Крафт" hidden={tab !== 'crafting'}>
          <div className="mc-pocket-crafting">
            {preview && <div className="mc-pocket-missing" role="status">Для {MINECRAFT_ITEMS[preview.id].name}: {Object.entries(preview.grid.reduce((counts, id) => { if (id) counts[id] = (counts[id] || 0) + 1; return counts; }, {})).map(([id, count]) => `${MINECRAFT_ITEMS[id].name} × ${count}`).join(', ')}<button type="button" onClick={() => setPreview(null)} aria-label="Закрити підказку рецепта">✕</button></div>}
            <div className="mc-pocket-crafting-row"><div className="mc-pocket-crafting-grid">{grid.map((item, index) => slot('crafting', index, item))}</div>
              <div className="mc-pocket-craft-arrow-box"><img className="mc-pixel-crafting-arrow mc-pocket-craft-arrow" src="/mc_crafting_arrow.png" alt="" /></div>
              <div className="mc-pocket-output-column"><button type="button" className="mc-pocket-slot mc-pocket-output" aria-label={output ? `Створити: ${output.name}` : 'Результат крафту'}
                onPointerDown={startCraft} onPointerUp={finishCraft} onPointerCancel={finishCraft} onLostPointerCapture={finishCraft}
                onClick={e => { if (!e.detail && output) craftRef.current(); }}><Item item={output} /></button>
              </div>
            </div>
            <button type="button" className="mc-pocket-clear" onClick={clearGrid} disabled={!grid.some(Boolean)}>Очистити сітку</button>
          </div>
        </section>
      </div>
    </div>
    <footer className="mc-pocket-selection" role="status">{selected ? <><img src={selected.sprite} alt="" /><span>{selected.name} × {controls.splitCount}<small>Торкніться місця переносу. У сітку — по одному.</small></span><button type="button" onClick={controls.clear} aria-label="Скасувати вибір">✕</button></> : <span>{statusText}</span>}{containers > 0 && <button type="button" onClick={collectContainers}>Забрати пляшечки: {containers}</button>}</footer>
    {controls.split && selected && <div className="mc-pocket-overlay"><section role="dialog" aria-modal="true" aria-label="Розділити стопку" className="mc-pocket-split">
      <h3>{selected.name}</h3><div className="mc-pocket-split-value"><img src={selected.sprite} alt="" />{controls.splitCount} / {selected.count}</div>
      <input type="range" min="1" max={selected.count} value={controls.splitCount} onChange={e => controls.setCount(Number(e.target.value))} aria-label="Кількість для переносу" />
      <div className="mc-pocket-settings-actions"><button type="button" onClick={() => controls.setCount(1)}>Один</button><button type="button" onClick={() => controls.setCount(Math.ceil(selected.count / 2))}>Половина</button><button type="button" onClick={() => controls.setCount(selected.count)}>Усе</button></div>
      <button type="button" onClick={controls.closeSplit}>Вибрати {controls.splitCount}</button><button type="button" onClick={controls.clear}>Скасувати</button>
    </section></div>}
  </div>;
}
