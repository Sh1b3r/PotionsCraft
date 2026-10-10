import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MINECRAFT_ITEMS } from '../data/minecraftItemIcons';
import { buildInitialInventory } from '../data/initialStationInventory';
import {
  checkCraftingRecipe,
  getBrewingResult,
  canBrew
} from '../utils/brewingCraftingEngine';
import {
  playItemClickSound,
  playCraftSuccessSound,
  playPotionBrewedSound,
  playRefuelSound
} from '../utils/minecraftStationSounds';
import { useTooltip } from './MinecraftTooltip';
import BrewingStandFrame from './BrewingStandFrame';
import { createPortal } from 'react-dom';
import MobileStationShell, { useMobileStation } from './MobileStationShell';
import { WIKI_REAGENTS, WIKI_POTIONS } from '../data/wikiTooltipsData';
import './MinecraftStationWidget.css';

// All valid Minecraft brewing reagents that can be placed in the reagent slot
export const VALID_BREWING_REAGENTS = new Set([
  'nether_wart',
  'sugar',
  'magma_cream',
  'golden_carrot',
  'ghast_tear',
  'blaze_powder',
  'glistering_melon',
  'spider_eye',
  'fermented_spider_eye',
  'pufferfish',
  'rabbit_foot',
  'phantom_membrane',
  'turtle_shell',
  'slime_block',
  'cobweb',
  'stone',
  'breeze_rod',
  'redstone',
  'glowstone',
  'gunpowder',
  'dragon_breath',
  'dragons_breath'
]);

const sameStack = (a, b) => !!a && !!b && a.itemId === b.itemId &&
  ['isExtended', 'isLevel2', 'isSplash', 'isLingering'].every(key => !!a[key] === !!b[key]);

export default function MinecraftStationWidget() {
  const mobile = useMobileStation();
  const [touchMode, setTouchMode] = useState('one');
  const dragRef = useRef(null);
  const clickRef = useRef(null);
  const activeIngredientRef = useRef(null);
  const hoveredSlotRef = useRef(null);
  const [containerReturns, setContainerReturns] = useState(0);
  // 1. Player Inventory: 72 slots (54 storage + 18 hotbar)
  const [inventory, setInventory] = useState(buildInitialInventory);

  // 2. Crafting Table 3x3 (9 slots)
  const [craftingGrid, setCraftingGrid] = useState(() => new Array(9).fill(null));

  // 3. Brewing Stand slots (starts empty with authentic silhouettes/watermarks)
  const [fuelSlot, setFuelSlot] = useState(null);
  // Fuel charges: starts at 0 (empty until blaze powder is added). 1 powder = 20 brews.
  const [fuelCharges, setFuelCharges] = useState(0);


  // Top reagent slot (Empty by default)
  const [brewingIngredient, setBrewingIngredient] = useState(null);

  // 3 Bottom bottle slots (Empty by default)
  const [brewingBottles, setBrewingBottles] = useState(() => [null, null, null]);

  // Brewing animation state
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewingProgress, setBrewingProgress] = useState(0);
  const [brewingStep, setBrewingStep] = useState(0); // 28 divisions, 2px each

  // Hand / Cursor held item for pick-and-place
  const [heldItem, setHeldItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Tooltip integration using MinecraftTooltip system
  const { showTooltip, hideTooltip } = useTooltip();

  // Toast notification for newly brewed potion
  const [brewedToast, setBrewedToast] = useState(null);

  // Refs to always access freshest state inside timer, drag & click handlers
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;

  const craftingGridRef = useRef(craftingGrid);
  craftingGridRef.current = craftingGrid;

  const fuelSlotRef = useRef(fuelSlot);
  fuelSlotRef.current = fuelSlot;

  const fuelChargesRef = useRef(fuelCharges);
  fuelChargesRef.current = fuelCharges;

  const brewingIngredientRef = useRef(brewingIngredient);
  brewingIngredientRef.current = brewingIngredient;

  const brewingBottlesRef = useRef(brewingBottles);
  brewingBottlesRef.current = brewingBottles;

  const heldItemRef = useRef(heldItem);
  heldItemRef.current = heldItem;

  // Active Crafting Output
  const craftingOutput = checkCraftingRecipe(craftingGrid);

  // Helper to get slot item synchronously
  const getSlotValue = useCallback(
    (slotType, index) => {
      if (slotType === 'inventory') return inventoryRef.current[index];
      if (slotType === 'crafting') return craftingGridRef.current[index];
      if (slotType === 'ingredient') return brewingIngredientRef.current;
      if (slotType === 'bottle') return brewingBottlesRef.current[index];
      if (slotType === 'fuel') return fuelSlotRef.current;
      return null;
    },
    []
  );

  // Helper to set slot item synchronously - updates ref IMMEDIATELY to prevent any race condition
  const setSlotValue = useCallback(
    (slotType, index, value) => {
      if (slotType === 'inventory') {
        const next = [...inventoryRef.current];
        next[index] = typeof value === 'function' ? value(next[index]) : value;
        inventoryRef.current = next;
        setInventory(next);
      } else if (slotType === 'crafting') {
        const next = [...craftingGridRef.current];
        next[index] = typeof value === 'function' ? value(next[index]) : value;
        craftingGridRef.current = next;
        setCraftingGrid(next);
      } else if (slotType === 'ingredient') {
        const next = typeof value === 'function' ? value(brewingIngredientRef.current) : value;
        brewingIngredientRef.current = next;
        setBrewingIngredient(next);
      } else if (slotType === 'bottle') {
        const next = [...brewingBottlesRef.current];
        next[index] = typeof value === 'function' ? value(next[index]) : value;
        brewingBottlesRef.current = next;
        setBrewingBottles(next);
      } else if (slotType === 'fuel') {
        const next = typeof value === 'function' ? value(fuelSlotRef.current) : value;
        fuelSlotRef.current = next;
        setFuelSlot(next);
      }
    },
    []
  );

  const hold = item => { heldItemRef.current = item; setHeldItem(item); };
  const accepts = (type, item) => type === 'bottle'
    ? !!(item.isPotion || item.itemId === 'glass_bottle')
    : type === 'fuel' ? item.itemId === 'blaze_powder'
    : type === 'ingredient' ? VALID_BREWING_REAGENTS.has(item.itemId) : true;
  const limit = (type, item) => type === 'bottle' ? 1 : item.maxStack || 64;
  const deposit = (type, index, requested) => {
    const held = heldItemRef.current;
    if (!held || !accepts(type, held)) return;
    const target = getSlotValue(type, index);
    if (target && !sameStack(target, held)) return;
    const count = Math.min(requested, held.count, limit(type, held) - (target?.count || 0));
    if (count <= 0) return;
    setSlotValue(type, index, { ...held, count: (target?.count || 0) + count });
    hold(held.count > count ? { ...held, count: held.count - count } : null);
  };
  // Return the exact remainder; callers keep it at its source when storage is full.
  const insertInventory = (item, indices = inventoryRef.current.map((_, index) => index), commit = true) => {
    const next = [...inventoryRef.current];
    let remaining = item.count;
    for (const empty of [false, true]) {
      for (const index of indices) {
        const target = next[index];
        if (empty ? !!target : !sameStack(target, item)) continue;
        const amount = Math.min(remaining, (item.maxStack || 64) - (target?.count || 0));
        if (amount <= 0) continue;
        next[index] = { ...item, count: (target?.count || 0) + amount };
        remaining -= amount;
        if (!remaining) break;
      }
      if (!remaining) break;
    }
    if (commit) { inventoryRef.current = next; setInventory(next); }
    return remaining ? { ...item, count: remaining } : null;
  };
  const returnHeld = () => { if (heldItemRef.current) hold(insertInventory(heldItemRef.current)); };
  const handleShiftClick = (type, index, item = getSlotValue(type, index)) => {
    if (!item || heldItemRef.current) return;
    if (type !== 'inventory') {
      setSlotValue(type, index, insertInventory(item));
      return;
    }
    const targets = [];
    if (item.itemId === 'blaze_powder') targets.push(['fuel', 0]);
    if (item.isPotion || item.itemId === 'glass_bottle') {
      const empty = brewingBottlesRef.current.findIndex(bottle => !bottle);
      if (empty >= 0) targets.push(['bottle', empty]);
    }
    if (VALID_BREWING_REAGENTS.has(item.itemId)) targets.push(['ingredient', 0]);
    for (const [targetType, targetIndex] of targets) {
      const target = getSlotValue(targetType, targetIndex);
      if (target && !sameStack(target, item)) continue;
      const amount = Math.min(item.count, limit(targetType, item) - (target?.count || 0));
      if (amount <= 0) continue;
      setSlotValue(targetType, targetIndex, { ...item, count: (target?.count || 0) + amount });
      setSlotValue(type, index, item.count > amount ? { ...item, count: item.count - amount } : null);
      return;
    }
    const indices = inventoryRef.current.map((_, i) => i).filter(i => index >= 54 ? i < 54 : i >= 54);
    setSlotValue(type, index, insertInventory(item, indices));
  };
  const handleCraftOutputClick = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    let output = checkCraftingRecipe(craftingGridRef.current);
    let crafted = false;
    while (output) {
      if (event?.shiftKey) {
        if (insertInventory(output, undefined, false)) break;
        insertInventory(output);
      } else {
        const held = heldItemRef.current;
        if (held && (!sameStack(held, output) || held.count + output.count > (held.maxStack || 64))) break;
        hold({ ...output, count: (held?.count || 0) + output.count });
      }
      const next = craftingGridRef.current.map(item => item && item.count > 1 ? { ...item, count: item.count - 1 } : null);
      craftingGridRef.current = next;
      setCraftingGrid(next);
      crafted = true;
      if (!event?.shiftKey) break;
      output = checkCraftingRecipe(next);
    }
    if (crafted) playCraftSuccessSound();
  };
  const collect = () => {
    const held = heldItemRef.current;
    if (!held || (held.maxStack || 64) <= 1) return;
    for (const [type, length] of [['inventory', 72], ['crafting', 9], ['fuel', 1], ['ingredient', 1]]) {
      for (let index = 0; index < length; index++) {
        const item = getSlotValue(type, index);
        if (!sameStack(item, held)) continue;
        const amount = Math.min(item.count, (held.maxStack || 64) - heldItemRef.current.count);
        if (!amount) return;
        setSlotValue(type, index, item.count > amount ? { ...item, count: item.count - amount } : null);
        hold({ ...heldItemRef.current, count: heldItemRef.current.count + amount });
      }
    }
  };
  const slotClick = (type, index, right = false) => {
    const item = getSlotValue(type, index);
    const held = heldItemRef.current;
    if (!held) {
      if (!item) return;
      const count = right ? Math.ceil(item.count / 2) : item.count;
      hold({ ...item, count });
      setSlotValue(type, index, item.count > count ? { ...item, count: item.count - count } : null);
    } else if (!item || sameStack(item, held)) {
      deposit(type, index, right ? 1 : held.count);
    } else if (accepts(type, held) && held.count <= limit(type, held)) {
      setSlotValue(type, index, held);
      hold(item);
    }
    playItemClickSound();
  };
  const visitSlot = (type, index) => {
    const drag = dragRef.current;
    const held = heldItemRef.current;
    if (!drag || !held || drag.picked || !accepts(type, held)) return;
    const item = getSlotValue(type, index);
    if (item && !sameStack(item, held)) return;
    if ((item?.count || 0) >= limit(type, held)) return;
    const key = type + '-' + index;
    if (!drag.slots.has(key)) drag.slots.set(key, { type, index });
  };
  const finishGesture = event => {
    const drag = dragRef.current;
    if (drag && event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (!drag) return;
    if (event?.type === 'pointercancel') return;
    const held = heldItemRef.current;
    if (drag.picked) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot-index]');
      if (held && target && (target.dataset.slotType !== drag.type || +target.dataset.slotIndex !== drag.index)) {
        slotClick(target.dataset.slotType, +target.dataset.slotIndex, drag.one);
      }
    } else if (held) {
      const slots = [...drag.slots.values()];
      if (slots.length <= 1) slotClick(drag.type, drag.index, drag.one);
      else {
        const each = drag.one ? 1 : Math.floor(held.count / slots.length);
        for (const slot of slots) deposit(slot.type, slot.index, each);
      }
    }
  };
  const hotbarSwap = key => {
    const slot = hoveredSlotRef.current;
    if (!slot || heldItemRef.current || slot.type === 'output') return;
    const hotbarIndex = 54 + Number(key) - 1;
    if (slot.type === 'inventory' && slot.index === hotbarIndex) return;
    const source = getSlotValue(slot.type, slot.index);
    const hotbar = getSlotValue('inventory', hotbarIndex);
    if (hotbar && (!accepts(slot.type, hotbar) || hotbar.count > limit(slot.type, hotbar))) return;
    setSlotValue(slot.type, slot.index, hotbar);
    setSlotValue('inventory', hotbarIndex, source);
  };
  const gesturesRef = useRef({ finishGesture, visitSlot, returnHeld, hotbarSwap });
  gesturesRef.current = { finishGesture, visitSlot, returnHeld, hotbarSwap };
  useEffect(() => {
    const move = event => {
      setMousePos({ x: event.clientX, y: event.clientY });
      if (dragRef.current && event.pointerId !== dragRef.current.pointerId) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot-index]');
      if (target) gesturesRef.current.visitSlot(target.dataset.slotType, +target.dataset.slotIndex);
    };
    const end = event => gesturesRef.current.finishGesture(event);
    const escape = event => {
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape') gesturesRef.current.returnHeld();
      if (/^[1-9]$/.test(event.key)) gesturesRef.current.hotbarSwap(event.key);
    };
    const blur = () => { dragRef.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('keydown', escape);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('keydown', escape);
      window.removeEventListener('blur', blur);
    };
  }, []);
  const slotEvents = (type, index, item) => ({
    onPointerDown: event => {
      if (event.button !== 0 && event.button !== 2) return;
      if (dragRef.current && event.pointerId !== dragRef.current.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      hideTooltip();
      setMousePos({ x: event.clientX, y: event.clientY });
      if (mobile && touchMode === 'transfer' && !heldItemRef.current) { handleShiftClick(type, index); return; }
      if (event.shiftKey && !heldItemRef.current) { handleShiftClick(type, index); return; }
      const now = Date.now();
      const previous = clickRef.current;
      const key = type + '-' + index;
      if (!mobile && event.button === 0 && heldItemRef.current && previous?.key === key && now - previous.time < 250) {
        collect(); clickRef.current = null; return;
      }
      clickRef.current = { key, time: now };
      const picked = !heldItemRef.current;
      const one = event.button === 2 || (mobile && touchMode === 'one' && !picked);
      const drag = { type, index, picked, one, slots: new Map(), pointerId: event.pointerId };
      dragRef.current = drag;
      if (picked) slotClick(type, index, event.button === 2 || (mobile && touchMode === 'half'));
      else visitSlot(type, index);
      // Touch browsers capture pointers implicitly; release so neighboring slots receive hover.
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerEnter: () => { hoveredSlotRef.current = { type, index }; if (dragRef.current) visitSlot(type, index); else handleSlotHover(type, index, item); },
    onPointerLeave: () => { hoveredSlotRef.current = null; hideTooltip(); },
  });

  // Vanilla uses 400 ticks (20 seconds), consumes a fuel charge at the start,
  // and aborts if the ingredient changes or no bottle remains convertible.
  const TOTAL_BREW_TIME = 20000;
  useEffect(() => {
    if (fuelCharges === 0 && fuelSlot?.itemId === 'blaze_powder') {
      fuelChargesRef.current = 20; setFuelCharges(20);
      setSlotValue('fuel', 0, fuelSlot.count > 1 ? { ...fuelSlot, count: fuelSlot.count - 1 } : null);
      playRefuelSound();
    }
  }, [fuelCharges, fuelSlot, setSlotValue]);
  useEffect(() => {
    const possible = canBrew(brewingIngredient, brewingBottles, 1);
    if (isBrewing) {
      if (!possible || activeIngredientRef.current !== brewingIngredient?.itemId) {
        setIsBrewing(false); setBrewingStep(0); setBrewingProgress(0);
      }
    } else if (possible && fuelCharges > 0) {
      activeIngredientRef.current = brewingIngredient.itemId;
      fuelChargesRef.current = fuelCharges - 1; setFuelCharges(fuelCharges - 1);
      setIsBrewing(true);
    }
  }, [brewingIngredient, brewingBottles, fuelCharges, isBrewing]);
  useEffect(() => {
    if (!isBrewing) return;
    const start = Date.now();
    const ingredientId = activeIngredientRef.current;
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / TOTAL_BREW_TIME);
      setBrewingProgress(progress * 100);
      setBrewingStep(Math.floor(progress * 28) * 2);
      if (progress < 1) return;
      clearInterval(timer);
      const ingredient = brewingIngredientRef.current;
      if (ingredient?.itemId !== ingredientId || !canBrew(ingredient, brewingBottlesRef.current, 1)) {
        setIsBrewing(false); setBrewingStep(0); setBrewingProgress(0); return;
      }
      let brewed = null;
      brewingBottlesRef.current.forEach((bottle, index) => {
        const result = getBrewingResult(bottle, ingredientId);
        if (result) { setSlotValue('bottle', index, result); brewed = result; }
      });
      const isBreath = ingredientId === 'dragons_breath' || ingredientId === 'dragon_breath';
      const emptyBottle = { ...MINECRAFT_ITEMS.glass_bottle, itemId: 'glass_bottle', count: 1 };
      setSlotValue('ingredient', 0, ingredient.count > 1 ? { ...ingredient, count: ingredient.count - 1 } : isBreath ? emptyBottle : null);
      // Keep a container remainder if the inventory cannot accept it.
      if (isBreath && ingredient.count > 1) {
        const remainder = insertInventory(emptyBottle);
        if (remainder) {
          setContainerReturns(count => count + remainder.count);
        }
      }
      setIsBrewing(false); setBrewingStep(0); setBrewingProgress(0);
      playPotionBrewedSound();
      if (brewed) setBrewedToast({ name: brewed.name, catalogId: brewed.catalogId, timestamp: Date.now() });
    }, 50);
    return () => clearInterval(timer);
  }, [isBrewing]);
  useEffect(() => {
    if (!brewedToast) return;
    const timer = setTimeout(() => setBrewedToast(null), 8000);
    return () => clearTimeout(timer);
  }, [brewedToast]);

  // Scroll smoothly to catalog card and apply golden pulsing border
  const handleViewInCatalog = (catalogId) => {
    if (!catalogId) return;

    const cardEl =
      document.getElementById(`potion-card-${catalogId}`) ||
      document.querySelector(`[data-potion-id="${catalogId}"]`) ||
      document.querySelector(`.card[id*="${catalogId}"]`);

    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('brewing-highlight-card');

      setTimeout(() => {
        cardEl.classList.remove('brewing-highlight-card');
      }, 4000);
    } else {
      const heading = document.querySelector('h2');
      if (heading) heading.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Authentic Minecraft Card-Parity Tooltip System
  const getSlotTooltipData = useCallback(
    (slotType, index, item) => {

      if (!item) return null;

      // Potion item tooltip
      if (item.isPotion || item.itemId === 'water_bottle') {
        let title = item.name;
        let lore = null;

        const catalogKey =
          item.catalogId ||
          (item.itemId.startsWith('potion_') ? item.itemId.replace('potion_', '') : item.itemId);
        const wikiDef = WIKI_POTIONS[catalogKey] || WIKI_POTIONS[item.itemId];

        if (wikiDef) {
          if (item.isExtended && wikiDef.extendedMinetip) {
            lore = wikiDef.extendedMinetip;
          } else if (item.isLevel2 && wikiDef.upgradedMinetip) {
            lore = wikiDef.upgradedMinetip;
          } else {
            lore = wikiDef.minetip;
          }
        }

        if (!lore) {
          if (item.description) {
            lore = `§9${item.description}`;
          } else {
            lore = '§7Немає ефектів';
          }
        }

        return {
          title,
          lore
        };
      }

      // Regular crafting/brewing item
      if (item.itemId === 'sugar') {
        return {
          title: item.name,
          lore: null
        };
      }
      const reagentDef = WIKI_REAGENTS[item.name];
      return {
        title: item.name,
        lore:
          reagentDef?.lore ||
          (item.description ? `§7${item.description}` : item.englishName ? `§8${item.englishName}` : null)
      };
    },
    [isBrewing, brewingProgress, TOTAL_BREW_TIME]
  );

  const handleSlotHover = useCallback(
    (slotType, index, item) => {
      if (mobile || heldItemRef.current || dragRef.current) {
        hideTooltip();
        return;
      }
      const tipData = getSlotTooltipData(slotType, index, item);
      if (tipData) {
        showTooltip(tipData);
      } else {
        hideTooltip();
      }
    },
    [mobile, getSlotTooltipData, showTooltip, hideTooltip]
  );

  const handleBackgroundClick = event => {
    if (!event.target.closest('.mc-slot, button')) returnHeld();
  };

  return (
    <MobileStationShell mobile={mobile} onClose={() => { hideTooltip(); returnHeld(); }} onOpen={hideTooltip}>
    {mobile && <div className="mc-touch-controls">
      <div className="mc-touch-hand">{heldItem ? <><img src={heldItem.sprite} alt="" />{heldItem.name} × {heldItem.count}</> : 'Торкніться предмета, щоб взяти його'}</div>
      <div className="mc-touch-actions">
        <button type="button" aria-pressed={touchMode === 'one'} onClick={() => setTouchMode('one')}>По одному</button>
        <button type="button" aria-pressed={touchMode === 'stack'} onClick={() => setTouchMode('stack')}>Стопка</button>
        <button type="button" aria-pressed={touchMode === 'half'} onClick={() => setTouchMode('half')}>Половина</button>
        <button type="button" aria-pressed={touchMode === 'transfer'} disabled={!!heldItem} onClick={() => setTouchMode('transfer')}>Перенести</button>
        <button type="button" disabled={!craftingOutput || !!heldItem} onClick={() => handleCraftOutputClick({ shiftKey: true })}>Створити все</button>
        <button type="button" disabled={!heldItem} onClick={returnHeld}>Повернути</button>
      </div>
    </div>}
    <div className="mc-workbench-viewport-scaler">
      <div
        className="mc-brewing-workbench"
        id="mc-workbench"
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={handleBackgroundClick}
      >
        {containerReturns > 0 && <button type="button" className="mc-container-return" onClick={() => {
          const remaining = insertInventory({ ...MINECRAFT_ITEMS.glass_bottle, itemId: 'glass_bottle', count: containerReturns });
          setContainerReturns(remaining?.count || 0);
        }}>Забрати порожні пляшечки: {containerReturns}</button>}
        {/* ==================== UPPER SECTION: BREWING (LEFT) & CRAFTING (RIGHT) ==================== */}
        <div className="mc-top-workstation-row">
          {/* 1. LEFT: Brewing Stand (Pixel-Perfect Authentic Minecraft GUI matching user reference) */}
          <div className="mc-brewing-stand-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div className="mc-brewing-header-label">Варильна стійка</div>
            </div>

            <div className="mc-brewing-stand-stage">
              <BrewingStandFrame withFuel pipeExtension={10} emptyBottles={brewingBottles.map(bottle => !bottle)} />
              {/* Fuel gauge at the spring outlet (20 charges, drains from right to left) */}
              <div
                className="mc-fuel-gauge-container"
                onMouseEnter={() => handleSlotHover('fuel-gauge', 0, null)}
                onMouseLeave={hideTooltip}
              >
                <div
                  className="mc-fuel-gauge-fill"
                  style={{
                    width: `${Math.round((fuelCharges / 20) * 36)}px`
                  }}
                />
              </div>

              {/* 1. Top-Left Fuel Slot */}
              <div
                className={`mc-slot mc-slot-fuel ${fuelSlot ? 'has-item' : ''}`}
                data-slot-type="fuel"
                data-slot-index={0}
                {...slotEvents('fuel', 0, getSlotValue('fuel', 0))}
              >
                {fuelSlot ? (
                  <>
                    <img src={fuelSlot.sprite} alt={fuelSlot.name} className="mc-item-icon" />
                    {fuelSlot.count > 1 && (
                      <span className="mc-item-count">{fuelSlot.count}</span>
                    )}
                  </>
                ) : (
                  <img
                    src="/mc_blaze_watermark.png"
                    alt="Вогняний порошок"
                    className="mc-fuel-blaze-watermark"
                  />
                )}
              </div>

              {/* 2. Brewing Steam / Bubbles Column */}
              <div className="mc-brewing-bubbles-column">
                <span className={`mcui-bubbling ${isBrewing ? 'is-brewing' : 'is-idle'}`}>
                  <br />
                </span>
              </div>

              {/* 3. Top Reagent Slot */}
              <div
                className={`mc-slot mc-slot-reagent ${brewingIngredient ? 'has-item' : ''}`}
                data-slot-type="ingredient"
                data-slot-index={0}
                {...slotEvents('ingredient', 0, getSlotValue('ingredient', 0))}
              >
                {brewingIngredient && (
                  <>
                    <img
                      src={brewingIngredient.sprite}
                      alt={brewingIngredient.name}
                      className="mc-item-icon"
                    />
                    {brewingIngredient.count > 1 && (
                      <span className="mc-item-count">{brewingIngredient.count}</span>
                    )}
                  </>
                )}
              </div>

              {/* Downward Brewing Progress Arrow (copied completely from cards) */}
              <div
                className={`mc-brewing-arrow-wrapper ${isBrewing ? 'is-brewing' : ''}`}
                role="progressbar"
                aria-label="Прогрес варіння"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.floor(brewingProgress)}
                onMouseEnter={() => handleSlotHover('arrow', 0, null)}
                onMouseLeave={hideTooltip}
              >
                <img src="/mc_arrow_empty.png" alt="Стрілка варіння" className="mc-brewing-arrow-empty" />
                <img src="/mc_brewing_arrow_full.png" alt="" className="mc-brewing-arrow-fill"
                  style={{ clipPath: `inset(0 0 ${56 - brewingStep}px 0)` }} />
              </div>

              {/* 4, 5, 6. Bottom 3 Output Bottle Slots (uses authentic uniform CSS silhouette from be.html) */}
              {[0, 1, 2].map((idx) => {
                const bottle = brewingBottles[idx];
                const slotClassNames = ['slot-bottle-left', 'slot-bottle-center', 'slot-bottle-right'];
                return (
                  <div
                    key={`bottle-${idx}`}
                    className={`mc-slot mc-slot-bottle ${slotClassNames[idx]} ${bottle ? 'has-item' : ''}`}
                    data-slot-type="bottle"
                    data-slot-index={idx}
                    {...slotEvents('bottle', idx, getSlotValue('bottle', idx))}
                  >
                    {bottle && (
                      <>
                        <img
                          src={bottle.sprite}
                          alt={bottle.name}
                          className="mc-item-icon"
                        />
                        {bottle.count > 1 && (
                          <span className="mc-item-count">{bottle.count}</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. RIGHT: Crafting Table 3x3 ("Майстрування" matching reference mockup) */}
          <div className="mc-crafting-area">
            <div className="mc-crafting-header-label">Майстрування</div>

            <div className="mc-crafting-flex-panel">
              {/* 3x3 Grid (Contiguous touching slots) */}
              <div className="mc-grid-3x3">
                {craftingGrid.map((slotItem, idx) => (
                  <div
                    key={`craft-${idx}`}
                    className={`mc-slot ${slotItem ? 'has-item' : ''}`}
                    data-slot-type="crafting"
                    data-slot-index={idx}
                    {...slotEvents('crafting', idx, getSlotValue('crafting', idx))}
                  >
                    {slotItem && (
                      <>
                        <img
                          src={slotItem.sprite}
                          alt={slotItem.name}
                          className="mc-item-icon"
                        />
                        {slotItem.count > 1 && (
                          <span className="mc-item-count">{slotItem.count}</span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Pixel Crafting Arrow (aligned with center row) */}
              <div className="mc-crafting-arrow-box">
                <img
                  src="/mc_crafting_arrow.png"
                  alt="Стрілка створення"
                  className="mc-pixel-crafting-arrow"
                />
              </div>

              {/* Large Output Slot (52x52px, aligned with center row and arrow) */}
              <div className="mc-output-slot-wrapper">
                <div
                  className={`mc-slot mc-slot-output ${craftingOutput ? 'has-result' : ''}`}
                  data-slot-type="output"
                  onPointerDown={handleCraftOutputClick}
                    onContextMenu={e => e.preventDefault()}
                  onMouseEnter={() => handleSlotHover('output', 0, craftingOutput)}
                  onMouseLeave={hideTooltip}
                >
                  {craftingOutput && (
                    <>
                      <img
                        src={craftingOutput.sprite}
                        alt={craftingOutput.name}
                        className="mc-item-icon"
                      />
                      {craftingOutput.count > 1 && (
                        <span className="mc-item-count">{craftingOutput.count}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== LOWER SECTION: PLAYER INVENTORY ==================== */}
        <div className="mc-inventory-area">
          <div className="mc-inventory-header-label">Інвентар</div>

          {/* 3x18 Main Storage Grid (Slots 0..53, contiguous touching slots) */}
          <div className="mc-inventory-grid-3x18">
            {inventory.slice(0, 54).map((slotItem, idx) => (
              <div
                key={`inv-${idx}`}
                className={`mc-slot ${slotItem ? 'has-item' : ''}`}
                data-slot-type="inventory"
                data-slot-index={idx}
                {...slotEvents('inventory', idx, getSlotValue('inventory', idx))}
              >
                {slotItem && (
                  <>
                    <img
                      src={slotItem.sprite}
                      alt={slotItem.name}
                      className="mc-item-icon"
                    />
                    {slotItem.count > 1 && (
                      <span className="mc-item-count">{slotItem.count}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Authentic Minecraft Horizontal Separator Gap */}
          <div className="mc-hotbar-separator-gap" />

          {/* 1x18 Quick Hotbar Grid (Slots 54..71, contiguous touching slots) */}
          <div className="mc-hotbar-grid-1x18">
            {inventory.slice(54, 72).map((slotItem, idx) => {
              const actualIdx = 54 + idx;
              return (
                <div
                  key={`hotbar-${actualIdx}`}
                  className={`mc-slot ${slotItem ? 'has-item' : ''}`}
                  data-slot-type="inventory"
                  data-slot-index={actualIdx}
                  {...slotEvents('inventory', actualIdx, getSlotValue('inventory', actualIdx))}
                >
                  {slotItem && (
                    <>
                      <img
                        src={slotItem.sprite}
                        alt={slotItem.name}
                        className="mc-item-icon"
                      />
                      {slotItem.count > 1 && (
                        <span className="mc-item-count">{slotItem.count}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== FLOATING HELD ITEM UNDER CURSOR ==================== */}
        {heldItem && !mobile && createPortal(
          <div
            className="mc-floating-held-item"
            style={{ left: mousePos.x, top: mousePos.y }}
          >
            <img src={heldItem.sprite} alt={heldItem.name} />
            {heldItem.count > 1 && (
              <span className="mc-held-count">{heldItem.count}</span>
            )}
          </div>, document.body
        )}


        {/* ==================== BREWED NOTIFICATION TOAST ==================== */}
        {brewedToast && (
          <div className="mc-brewed-toast">
            <div className="mc-brewed-toast-text">
              ✨ Зварено: <b>{brewedToast.name}</b>!
            </div>
            {brewedToast.catalogId && (
              <button
                type="button"
                className="mc-brewed-catalog-btn"
                onClick={() => handleViewInCatalog(brewedToast.catalogId)}
              >
                Переглянути в каталозі 🔍
              </button>
            )}
            <button
              type="button"
              className="mc-brewed-toast-close"
              onClick={() => setBrewedToast(null)}
              title="Закрити"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
    </MobileStationShell>
  );
}
