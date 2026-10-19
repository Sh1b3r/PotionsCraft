import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import BrewingArrow from './BrewingArrow';
import BrewingBubbles from './BrewingBubbles';
import { BrewingFuelGauge } from './BrewingFuelCircuit';
import { createPortal } from 'react-dom';
import BedrockStationView from './BedrockStationView';
import usePocketInventory from './usePocketInventory';
import MobileStationShell, { useMobileStation, usePocketSettings } from './MobileStationShell';
import { WIKI_REAGENTS, WIKI_POTIONS } from '../data/wikiTooltipsData';
import { BREWING_STAND_DATA } from '../data/brewingStandData';
import { POTIONS_DATA } from '../data/potionsData';
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
  const [pocketOpen, setPocketOpen] = useState(false);
  const [pocketSettings, setPocketSettings] = usePocketSettings();
  const [pocketMessage, setPocketMessage] = useState('');
  const activePocketRecipe = useRef(null);
  const pocketStationTab = useRef('brewing');
  const dragRef = useRef(null);
  const clickRef = useRef(null);
  const activeIngredientRef = useRef(null);
  const hoveredSlotRef = useRef(null);
  const recipeLoadedFromCardRef = useRef(false);
  const [containerReturns, setContainerReturns] = useState(0);
  // 1. Player Inventory: 72 slots (54 storage + 18 hotbar) with LocalStorage persistence
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('potionscraft_station_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure saved inventory is 72 slots and contains vital brewing fuel (blaze_powder)
        const hasBlazePowder = Array.isArray(parsed) && parsed.some(it => it && it.itemId === 'blaze_powder');
        if (Array.isArray(parsed) && parsed.length === 72 && hasBlazePowder) return parsed;
      }
    } catch {}
    return buildInitialInventory();
  });

  // Save inventory changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('potionscraft_station_inventory', JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

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
  const [brewingBubbleFrame, setBrewingBubbleFrame] = useState(null);

  // Hand / Cursor held item for pick-and-place
  const [heldItem, setHeldItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Tooltip integration using MinecraftTooltip system
  const { showTooltip, hideTooltip } = useTooltip();

  // Toast notification for newly brewed potion & achievements (supports queued toasts)
  const [brewedToast, setBrewedToast] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);

  const addToast = useCallback((toast) => {
    setToastQueue(prev => [...prev, toast]);
  }, []);

  useEffect(() => {
    if (!brewedToast && toastQueue.length > 0) {
      setBrewedToast(toastQueue[0]);
      setToastQueue(prev => prev.slice(1));
    }
  }, [brewedToast, toastQueue]);

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

  // Active Crafting Output (memoized so it does not flicker on re-renders)
  const craftingOutput = useMemo(() => checkCraftingRecipe(craftingGrid), [craftingGrid]);
  const craftingOutputRef = useRef(craftingOutput);
  craftingOutputRef.current = craftingOutput;

  // Helper to get slot item synchronously
  const getSlotValue = useCallback(
    (slotType, index) => {
      if (slotType === 'inventory') return inventoryRef.current[index];
      if (slotType === 'crafting') return craftingGridRef.current[index];
      if (slotType === 'ingredient') return brewingIngredientRef.current;
      if (slotType === 'bottle') return brewingBottlesRef.current[index];
      if (slotType === 'fuel') return fuelSlotRef.current;
      if (slotType === 'output') return craftingOutputRef.current;
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
        recipeLoadedFromCardRef.current = false;
        const next = typeof value === 'function' ? value(brewingIngredientRef.current) : value;
        brewingIngredientRef.current = next;
        setBrewingIngredient(next);
        if (!next || !canBrew(next, brewingBottlesRef.current, 1) || next.itemId !== activeIngredientRef.current) {
          setIsBrewing(false);
          setBrewingStep(0);
          setBrewingProgress(0);
          setBrewingBubbleFrame(null);
        }
      } else if (slotType === 'bottle') {
        recipeLoadedFromCardRef.current = false;
        const next = [...brewingBottlesRef.current];
        next[index] = typeof value === 'function' ? value(next[index]) : value;
        brewingBottlesRef.current = next;
        setBrewingBottles(next);
        if (!canBrew(brewingIngredientRef.current, next, 1)) {
          setIsBrewing(false);
          setBrewingStep(0);
          setBrewingProgress(0);
          setBrewingBubbleFrame(null);
        }
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
      : type === 'ingredient' ? VALID_BREWING_REAGENTS.has(item.itemId)
        : type === 'inventory' || type === 'crafting';
  const limit = (type, item) => type === 'bottle' ? 1 : item.maxStack || 64;
  const deposit = (type, index, requested) => {
    const held = heldItemRef.current;
    if (!held || !accepts(type, held)) return 0;
    const target = getSlotValue(type, index);
    if (target && !sameStack(target, held)) return 0;
    const count = Math.min(requested, held.count, limit(type, held) - (target?.count || 0));
    if (count <= 0) return 0;
    setSlotValue(type, index, { ...held, count: (target?.count || 0) + count });
    hold(held.count > count ? { ...held, count: held.count - count } : null);
    return count;
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
  const quickMovePocket = (type, index) => {
    const item = getSlotValue(type, index);
    if (!item) return;
    if (type === 'inventory' && pocketStationTab.current === 'crafting') {
      let target = craftingGridRef.current.findIndex(slot => sameStack(slot, item) && slot.count < (item.maxStack || 64));
      if (target < 0) target = craftingGridRef.current.findIndex(slot => !slot);
      if (target < 0) return;
      const current = craftingGridRef.current[target];
      const amount = Math.min(item.count, (item.maxStack || 64) - (current?.count || 0));
      setSlotValue('crafting', target, { ...item, count: (current?.count || 0) + amount });
      setSlotValue(type, index, item.count > amount ? { ...item, count: item.count - amount } : null);
    } else handleShiftClick(type, index);
  };
  const pocket = usePocketInventory({ enabled: pocketOpen, getSlot: getSlotValue, setSlot: setSlotValue,
    accepts, limit, sameStack, quickMove: quickMovePocket, settings: pocketSettings,
    onGridChange: () => { activePocketRecipe.current = null; setPocketMessage(''); } });
  // Work on copies until the complete recipe and all leftovers fit.
  const addToArray = (next, item) => {
    let remaining = item.count;
    for (const empty of [false, true]) for (let i = 0; i < next.length && remaining; i++) {
      const target = next[i];
      if (empty ? !!target : !sameStack(target, item)) continue;
      const amount = Math.min(remaining, (item.maxStack || 64) - (target?.count || 0));
      if (amount > 0) { next[i] = { ...item, count: (target?.count || 0) + amount }; remaining -= amount; }
    }
    return remaining ? { ...item, count: remaining } : null;
  };
  const fillPocketRecipe = recipe => {
    const nextInventory = inventoryRef.current.map(item => item && { ...item });
    const oldGrid = craftingGridRef.current.map(item => item && { ...item });
    const nextGrid = [];
    for (const id of recipe.grid) {
      if (!id) { nextGrid.push(null); continue; }
      const source = [oldGrid, nextInventory].find(items => items.some(item => item?.itemId === id));
      if (!source) { setPocketMessage('Бракує матеріалів для цього рецепта.'); return false; }
      const index = source.findIndex(item => item?.itemId === id);
      nextGrid.push({ ...source[index], count: 1 });
      source[index] = source[index].count > 1 ? { ...source[index], count: source[index].count - 1 } : null;
    }
    for (const item of oldGrid) if (item && addToArray(nextInventory, item)) {
      setPocketMessage('Звільніть місце в інвентарі для предметів із сітки.'); return false;
    }
    inventoryRef.current = nextInventory; setInventory(nextInventory);
    craftingGridRef.current = nextGrid; setCraftingGrid(nextGrid);
    activePocketRecipe.current = recipe;
    pocket.clear(); setPocketMessage('Рецепт заповнено. Торкніться результату.');
    return true;
  };
  const craftPocket = () => {
    const output = checkCraftingRecipe(craftingGridRef.current);
    if (!output) return false;
    if (insertInventory(output, undefined, false)) { setPocketMessage('Інвентар заповнений.'); return false; }
    insertInventory(output);
    const next = craftingGridRef.current.map(item => item && item.count > 1 ? { ...item, count: item.count - 1 } : null);
    craftingGridRef.current = next; setCraftingGrid(next);
    const recipe = activePocketRecipe.current;
    if (recipe && !next.some(Boolean)) fillPocketRecipe(recipe);
    pocket.clear(); playCraftSuccessSound();
    setPocketMessage(output.name + ' — додано в інвентар.');
    return true;
  };
  const clearPocketGrid = () => {
    const nextInventory = [...inventoryRef.current];
    const nextGrid = craftingGridRef.current.map(item => item && addToArray(nextInventory, item));
    inventoryRef.current = nextInventory; setInventory(nextInventory);
    craftingGridRef.current = nextGrid; setCraftingGrid(nextGrid);
    activePocketRecipe.current = null; pocket.clear();
    setPocketMessage(nextGrid.some(Boolean) ? 'Інвентар заповнений. Решта предметів залишилась у сітці.' : 'Предмети повернуто в інвентар.');
  };
  const handleCraftOutputClick = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (event.button !== 0 && event.button !== 2) return; // Support both LMB and RMB for crafting

    const output = checkCraftingRecipe(craftingGridRef.current);
    if (!output) return;

    if (event.shiftKey) {
      // Shift-click: craft as many as possible directly into inventory
      let craftedAny = false;
      let currentOutput = output;
      while (currentOutput) {
        // Can inventory accept currentOutput?
        const remainder = insertInventory(currentOutput, undefined, false);
        if (remainder && remainder.count === currentOutput.count) {
          // No room in inventory
          break;
        }
        insertInventory(currentOutput, undefined, true);
        craftedAny = true;

        const nextGrid = craftingGridRef.current.map(slot =>
          slot && slot.count > 1 ? { ...slot, count: slot.count - 1 } : null
        );
        craftingGridRef.current = nextGrid;
        setCraftingGrid(nextGrid);
        currentOutput = checkCraftingRecipe(nextGrid);
      }
      if (craftedAny) {
        playCraftSuccessSound();
        hideTooltip();
      }
    } else {
      // Normal LMB click: take crafted item into cursor (held)
      const held = heldItemRef.current;
      if (held) {
        if (!sameStack(held, output)) return;
        if (held.count + output.count > (held.maxStack || 64)) return;
        hold({ ...held, count: held.count + output.count });
      } else {
        hold({ ...output });
      }

      const nextGrid = craftingGridRef.current.map(slot =>
        slot && slot.count > 1 ? { ...slot, count: slot.count - 1 } : null
      );
      craftingGridRef.current = nextGrid;
      setCraftingGrid(nextGrid);
      playCraftSuccessSound();

      const nextOutput = checkCraftingRecipe(nextGrid);
      if (nextOutput) {
        handleSlotHover('output', 0, nextOutput);
      } else {
        hideTooltip();
      }
    }
  };

  const collect = () => {
    const held = heldItemRef.current;
    if (!held || (held.maxStack || 64) <= 1) return;
    const max = held.maxStack || 64;
    let currentHeld = { ...held };
    // Authentic Minecraft rule: double-click only collects from inventory storage and hotbar, never crafting table!
    for (let index = 0; index < 72; index++) {
      if (currentHeld.count >= max) break;
      const item = getSlotValue('inventory', index);
      if (!sameStack(item, currentHeld)) continue;
      const amount = Math.min(item.count, max - currentHeld.count);
      if (amount <= 0) continue;
      setSlotValue('inventory', index, item.count > amount ? { ...item, count: item.count - amount } : null);
      currentHeld = { ...currentHeld, count: currentHeld.count + amount };
    }
    hold(currentHeld);
  };

  const shiftCollectAll = targetItem => {
    if (!targetItem) return;
    for (let i = 0; i < 72; i++) {
      const it = inventoryRef.current[i];
      if (sameStack(it, targetItem)) {
        handleShiftClick('inventory', i);
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
      playItemClickSound();
    } else if (!item || sameStack(item, held)) {
      if (deposit(type, index, right ? 1 : held.count) > 0) {
        playItemClickSound();
      }
    } else if (!right && accepts(type, held) && held.count <= limit(type, held)) {
      setSlotValue(type, index, held);
      hold(item);
      playItemClickSound();
    }
  };

  const cancelGesture = () => {
    dragRef.current = null;
  };

  const visitSlot = (type, index) => {
    const drag = dragRef.current;
    if (!drag || type === 'output') return;
    const key = `${type}-${index}`;
    if (drag.visitedKeys?.has(key)) return;

    const held = heldItemRef.current;
    if (!held) return;

    if (drag.one) {
      // RMB Drag: place 1 in each visited slot (unchanged, works ideally)
      if (drag.picked) return;
      if (!accepts(type, held)) return;
      const item = getSlotValue(type, index);
      if (item && !sameStack(item, held)) return;
      if ((item?.count || 0) >= limit(type, held)) return;

      drag.visitedKeys.add(key);
      const placed = deposit(type, index, 1);
      if (placed > 0) {
        playItemClickSound();
      }
    } else {
      // LMB Drag: Gathering technique ("техніка збору")
      // Sweeps across slots with matching items and collects them into the held stack up to maxStack (64)
      if (held.count >= (held.maxStack || 64)) return;
      const item = getSlotValue(type, index);
      if (!item || !sameStack(item, held)) return;
      const space = (held.maxStack || 64) - held.count;
      const amount = Math.min(item.count, space);
      if (amount <= 0) return;

      drag.visitedKeys.add(key);
      setSlotValue(type, index, item.count > amount ? { ...item, count: item.count - amount } : null);
      hold({ ...held, count: held.count + amount });
      playItemClickSound();
    }
  };

  const finishGesture = () => {
    dragRef.current = null;
  };

  const hotbarSwap = key => {
    const slot = hoveredSlotRef.current;
    if (!slot || heldItemRef.current) return;
    const hotbarIndex = 54 + Number(key) - 1;

    if (slot.type === 'output') {
      const output = checkCraftingRecipe(craftingGridRef.current);
      if (!output) return;
      const hotbar = getSlotValue('inventory', hotbarIndex);
      if (!hotbar) {
        setSlotValue('inventory', hotbarIndex, { ...output });
        const nextGrid = craftingGridRef.current.map(s => s && s.count > 1 ? { ...s, count: s.count - 1 } : null);
        craftingGridRef.current = nextGrid;
        setCraftingGrid(nextGrid);
        playCraftSuccessSound();
      } else if (sameStack(hotbar, output) && hotbar.count + output.count <= (output.maxStack || 64)) {
        setSlotValue('inventory', hotbarIndex, { ...hotbar, count: hotbar.count + output.count });
        const nextGrid = craftingGridRef.current.map(s => s && s.count > 1 ? { ...s, count: s.count - 1 } : null);
        craftingGridRef.current = nextGrid;
        setCraftingGrid(nextGrid);
        playCraftSuccessSound();
      }
      return;
    }

    if (slot.type === 'inventory' && slot.index === hotbarIndex) return;
    const source = getSlotValue(slot.type, slot.index);
    const hotbar = getSlotValue('inventory', hotbarIndex);
    if (!source && !hotbar) return;
    if (hotbar && (!accepts(slot.type, hotbar) || hotbar.count > limit(slot.type, hotbar))) return;
    setSlotValue(slot.type, slot.index, hotbar);
    setSlotValue('inventory', hotbarIndex, source);
    playItemClickSound();
    hideTooltip();
  };

  const dropItem = (dropAll = false) => {
    if (heldItemRef.current) {
      const held = heldItemRef.current;
      const countToDrop = dropAll ? held.count : 1;
      const remainder = insertInventory({ ...held, count: countToDrop });
      const actuallyReturned = countToDrop - (remainder ? remainder.count : 0);
      if (actuallyReturned > 0) {
        const nextHeldCount = held.count - actuallyReturned;
        hold(nextHeldCount > 0 ? { ...held, count: nextHeldCount } : null);
        playItemClickSound();
      }
      return;
    }
    const slot = hoveredSlotRef.current;
    if (!slot || slot.type === 'output') return;
    const item = getSlotValue(slot.type, slot.index);
    if (!item) return;
    const countToMove = dropAll ? item.count : 1;
    if (slot.type !== 'inventory') {
      const remainder = insertInventory({ ...item, count: countToMove });
      const actuallyMoved = countToMove - (remainder ? remainder.count : 0);
      if (actuallyMoved > 0) {
        setSlotValue(slot.type, slot.index, item.count > actuallyMoved ? { ...item, count: item.count - actuallyMoved } : null);
        playItemClickSound();
      }
    } else {
      const remainder = insertInventory({ ...item, count: countToMove }, Array.from({ length: 18 }, (_, i) => 54 + i));
      if (!remainder || remainder.count < countToMove) {
        const moved = countToMove - (remainder ? remainder.count : 0);
        setSlotValue(slot.type, slot.index, item.count > moved ? { ...item, count: item.count - moved } : null);
        playItemClickSound();
      }
    }
  };

  const gesturesRef = useRef({ finishGesture, visitSlot, returnHeld, hotbarSwap, dropItem, cancelGesture });
  gesturesRef.current = { finishGesture, visitSlot, returnHeld, hotbarSwap, dropItem, cancelGesture };

  useEffect(() => {
    const move = event => {
      if (heldItemRef.current) {
        setMousePos({ x: event.clientX, y: event.clientY });
      }
      if (dragRef.current && event.pointerId !== dragRef.current.pointerId) return;
      if (dragRef.current && !(event.buttons & dragRef.current.buttonMask)) {
        gesturesRef.current.cancelGesture();
        return;
      }
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot-index]');
      if (target) {
        gesturesRef.current.visitSlot(target.dataset.slotType, +target.dataset.slotIndex);
      }
    };
    const end = event => gesturesRef.current.finishGesture(event);
    const handleKeyDown = event => {
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape') {
        gesturesRef.current.cancelGesture();
        gesturesRef.current.returnHeld();
        hideTooltip();
      }
      if (/^[1-9]$/.test(event.key)) {
        gesturesRef.current.hotbarSwap(event.key);
      }
      if (event.key === 'q' || event.key === 'Q' || event.key === 'й' || event.key === 'Й') {
        gesturesRef.current.dropItem(event.ctrlKey);
      }
    };
    const blur = () => gesturesRef.current.cancelGesture();
    window.addEventListener('pointermove', move);
    const handleContextMenu = e => {
      if (e.target.closest('#mc-workbench, .mc-workbench-layout, .mc-floating-held-item, .mc-workstation-info')) {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', blur);
    return () => {
      gesturesRef.current.cancelGesture();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', blur);
    };
  }, []);

  const slotEvents = (type, index, item) => pocketOpen ? { ...pocket.events(type, index), role: 'button', tabIndex: 0, 'aria-label': item?.name || 'Порожній слот' } : ({
    onContextMenu: event => {
      event.preventDefault();
      event.stopPropagation();
    },
    onPointerDown: event => {
      // Middle Click (Button 1): Clone full stack in sandbox / creative
      if (event.button === 1) {
        event.preventDefault();
        event.stopPropagation();
        hideTooltip();
        const currentItem = getSlotValue(type, index);
        if (currentItem) {
          const max = currentItem.maxStack || 64;
          hold({ ...currentItem, count: max });
          playItemClickSound();
        }
        return;
      }

      if (event.button !== 0 && event.button !== 2) return;
      event.preventDefault();
      event.stopPropagation();
      hideTooltip();
      setMousePos({ x: event.clientX, y: event.clientY });

      // Always clear any stale drag so subsequent clicks never get stuck
      dragRef.current = null;
      const slotItem = getSlotValue(type, index);

      // Shift + Click handling
      if (event.shiftKey && !heldItemRef.current) {
        handleShiftClick(type, index);
        playItemClickSound();
        return;
      }

      const now = Date.now();
      const previous = clickRef.current;
      const key = `${type}-${index}`;

      // Double-click handling: ONLY with LMB, within 300ms
      const targetItem = heldItemRef.current || slotItem || previous?.item;
      if (!mobile && event.button === 0 && targetItem && previous?.button === 0 && now - previous.time < 300) {
        if (!heldItemRef.current) {
          if (slotItem) {
            hold({ ...slotItem });
            setSlotValue(type, index, null);
          } else if (previous?.item) {
            hold({ ...previous.item });
          }
        }
        if (event.shiftKey) {
          shiftCollectAll(heldItemRef.current || targetItem);
        } else {
          collect();
        }
        clickRef.current = null;
        playItemClickSound();
        return;
      }
      clickRef.current = { key, time: now, button: event.button, item: heldItemRef.current || slotItem };

      const held = heldItemRef.current;
      const isRight = event.button === 2;

      if (!held) {
        // Empty hand: pick up stack (LMB) or half stack (RMB)
        slotClick(type, index, isRight);
        dragRef.current = {
          type,
          index,
          picked: isRight, // For RMB, prevent painting on origin; for LMB, allow dragging to gather immediately
          one: isRight,
          stack: heldItemRef.current,
          visitedKeys: new Set([key]),
          pointerId: event.pointerId,
          buttonMask: isRight ? 2 : 1
        };
      } else {
        // Holding item in hand:
        if (isRight) {
          // In Minecraft, RMB with held item on a slot with a DIFFERENT item does nothing
          if (slotItem && !sameStack(slotItem, held)) {
            return;
          }
          if (!accepts(type, held) || (slotItem?.count || 0) >= limit(type, held)) {
            return;
          }

          // Deposit 1 item immediately on press
          const placed = deposit(type, index, 1);
          if (placed > 0) {
            playItemClickSound();
          }

          dragRef.current = {
            type,
            index,
            picked: false,
            one: true,
            stack: held,
            visitedKeys: new Set([key]),
            pointerId: event.pointerId,
            buttonMask: 2
          };
        } else {
          // LMB with held item:
          if (slotItem && !sameStack(slotItem, held)) {
            // Swap items
            slotClick(type, index, false);
            dragRef.current = {
              type,
              index,
              picked: false,
              one: false,
              stack: heldItemRef.current,
              visitedKeys: new Set([key]),
              pointerId: event.pointerId,
              buttonMask: 1
            };
          } else {
            // Place or start left-drag gathering
            deposit(type, index, held.count);
            playItemClickSound();
            dragRef.current = {
              type,
              index,
              picked: false,
              one: false,
              stack: heldItemRef.current,
              visitedKeys: new Set([key]),
              pointerId: event.pointerId,
              buttonMask: 1
            };
          }
        }
      }

      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    onPointerEnter: event => {
      hoveredSlotRef.current = { type, index };
      const drag = dragRef.current;
      if (drag && (event.buttons & drag.buttonMask)) {
        gesturesRef.current.visitSlot(type, index);
      } else {
        handleSlotHover(type, index, item);
      }
    },
    onPointerLeave: () => {
      hoveredSlotRef.current = null;
      hideTooltip();
    },
  });

  // Vanilla uses 400 ticks (20 seconds), consumes a fuel charge at the start,
  // and aborts if the ingredient changes or no bottle remains convertible.
  // The arrow has 28 pixel increments (each takes 20000ms / 28 = ~714.28ms, or ~0.714s).
  // The steam (bubbles) fills across 7 frames during each 0.714s cycle, completing right as each pixel appears.
  const TOTAL_BREW_TIME = 20000;
  const ARROW_STEPS = 28;
  const STEP_DURATION = TOTAL_BREW_TIME / ARROW_STEPS; // 714.2857 ms (~0.714 s)
  const BUBBLE_FRAME_DURATION = STEP_DURATION / 7; // ~102.04 ms per frame

  useEffect(() => {
    if (fuelCharges === 0 && fuelSlot?.itemId === 'blaze_powder') {
      fuelChargesRef.current = 20; setFuelCharges(20);
      setSlotValue('fuel', 0, fuelSlot.count > 1 ? { ...fuelSlot, count: fuelSlot.count - 1 } : null);
      playRefuelSound();
    }
  }, [fuelCharges, fuelSlot, setSlotValue]);
  useEffect(() => {
    const possible = canBrew(brewingIngredient, brewingBottles, fuelCharges);
    if (isBrewing) {
      if (!possible || activeIngredientRef.current !== brewingIngredient?.itemId) {
        setIsBrewing(false); setBrewingStep(0); setBrewingProgress(0); setBrewingBubbleFrame(null);
      }
    } else if (possible && fuelCharges > 0) {
      activeIngredientRef.current = brewingIngredient.itemId;
      setBrewingBubbleFrame(0);
      setIsBrewing(true);
    }
  }, [brewingIngredient, brewingBottles, fuelCharges, isBrewing]);
  useEffect(() => {
    if (!isBrewing) {
      setBrewingProgress(0);
      setBrewingStep(0);
      setBrewingBubbleFrame(null);
      return;
    }
    const start = Date.now();
    const ingredientId = activeIngredientRef.current;
    const timer = setInterval(() => {
      // In-flight abort check: if reagent was removed or bottles changed, abort instantly
      const currentIng = brewingIngredientRef.current;
      const currentBottles = brewingBottlesRef.current;
      if (!currentIng || currentIng.itemId !== ingredientId || !canBrew(currentIng, currentBottles, fuelChargesRef.current)) {
        clearInterval(timer);
        setIsBrewing(false);
        setBrewingStep(0);
        setBrewingProgress(0);
        setBrewingBubbleFrame(null);
        return;
      }

      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / TOTAL_BREW_TIME);
      const currentStep = Math.min(ARROW_STEPS, Math.floor(elapsed / STEP_DURATION));
      const cycleElapsed = elapsed % STEP_DURATION;
      const bubbleFrame = Math.min(6, Math.floor(cycleElapsed / BUBBLE_FRAME_DURATION));

      setBrewingProgress(progress * 100);
      setBrewingStep(currentStep * 2);
      setBrewingBubbleFrame(bubbleFrame);

      if (progress < 1) return;
      clearInterval(timer);
      const ingredient = brewingIngredientRef.current;
      if (ingredient?.itemId !== ingredientId || !canBrew(ingredient, brewingBottlesRef.current, fuelChargesRef.current)) {
        setIsBrewing(false); setBrewingStep(0); setBrewingProgress(0); setBrewingBubbleFrame(null); return;
      }
      let brewed = null;
      let brewedCount = 0;
      const brewedList = [];
      brewingBottlesRef.current.forEach((bottle, index) => {
        const result = getBrewingResult(bottle, ingredientId);
        if (result) {
          setSlotValue('bottle', index, result);
          brewed = result;
          brewedCount++;
          brewedList.push(result);
        }
      });
      // Exactly 1 fuel charge is spent per brewing operation (NOT per potion)
      if (brewedCount > 0) {
        setFuelCharges(prev => {
          const next = Math.max(0, prev - 1);
          fuelChargesRef.current = next;
          return next;
        });
      }
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
      setIsBrewing(false); setBrewingStep(0); setBrewingProgress(0); setBrewingBubbleFrame(null);
      playPotionBrewedSound();
      const fromCard = recipeLoadedFromCardRef.current;
      recipeLoadedFromCardRef.current = false;
      if (brewed) {
        const potionMatch = brewed.catalogId ? POTIONS_DATA.find(p => p.id === brewed.catalogId) : null;
        const sprite = brewed.sprite || brewed.image || potionMatch?.icon || '/items/brewing_stand.png';

        // Group brewed potions for display in toast
        const groupedPotions = [];
        brewedList.forEach(p => {
          const match = groupedPotions.find(g => g.name === p.name);
          if (match) {
            match.count += 1;
          } else {
            groupedPotions.push({
              name: p.name,
              sprite: p.sprite || p.image || potionMatch?.icon || '/items/brewing_stand.png',
              catalogId: p.catalogId,
              count: 1
            });
          }
        });

        // Track cumulative prepared potions history in localStorage
        let cumulativeBrewed = [];
        try {
          cumulativeBrewed = JSON.parse(localStorage.getItem('potionscraft_brewed_potions_history') || '[]');
        } catch {}
        brewedList.forEach(p => {
          if (p && p.name && !cumulativeBrewed.some(item => (typeof item === 'string' ? item === p.name : item.name === p.name))) {
            cumulativeBrewed.push({
              name: p.name,
              catalogId: p.catalogId,
              sprite: p.sprite || p.image || '/items/brewing_stand.png'
            });
          }
        });
        try {
          localStorage.setItem('potionscraft_brewed_potions_history', JSON.stringify(cumulativeBrewed));
        } catch {}

        // Helper to check Local Brewery achievement
        let hasLocalBrewery = false;
        try {
          hasLocalBrewery =
            localStorage.getItem('potionscraft_achievement_local_brewery') === 'true' ||
            localStorage.getItem('potionscraft_achievement_local_brew') === 'true' ||
            localStorage.getItem('potionscraft_achievement_mistseva_brovarnya') === 'true' ||
            JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').local_brewery === true;
        } catch {}

        // Helper to check Master Alchemist achievement ("Майстер зілля")
        let hasMasterAlchemist = false;
        try {
          hasMasterAlchemist =
            localStorage.getItem('potionscraft_achievement_master_alchemist') === 'true' ||
            localStorage.getItem('potionscraft_achievement_master_zillya') === 'true' ||
            localStorage.getItem('potionscraft_achievement_potion_master') === 'true' ||
            localStorage.getItem('potionscraft_achievement_master_potion') === 'true' ||
            JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').master_alchemist === true ||
            JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}').master_zillya === true;
        } catch {}

        // Track total cumulative potions brewed
        let totalBrewed = 0;
        try {
          totalBrewed = parseInt(localStorage.getItem('potionscraft_total_potions_brewed') || '0', 10);
          if (isNaN(totalBrewed)) totalBrewed = 0;
        } catch {}
        totalBrewed += brewedCount;
        try {
          localStorage.setItem('potionscraft_total_potions_brewed', String(totalBrewed));
        } catch {}

        let awardedAchievement = false;

        // Collect all individual brewed potions (one per bottle)
        const allPotionsList = brewedList.map(p => {
          const pMatch = p.catalogId ? POTIONS_DATA.find(pd => pd.id === p.catalogId) : null;
          return {
            name: p.name,
            sprite: p.sprite || p.image || pMatch?.icon || '/items/brewing_stand.png',
            catalogId: p.catalogId
          };
        });

        // 1. «Місцева броварня» — awarded on first potion brewed, saved persistently
        if (!hasLocalBrewery) {
          try {
            localStorage.setItem('potionscraft_achievement_local_brewery', 'true');
            localStorage.setItem('potionscraft_achievement_mistseva_brovarnya', 'true');
            const curAch = JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}');
            curAch.local_brewery = true;
            curAch.mistseva_brovarnya = true;
            localStorage.setItem('potionscraft_achievements', JSON.stringify(curAch));
          } catch {}
          awardedAchievement = true;
          addToast({
            name: 'Місцева броварня',
            catalogId: brewed.catalogId,
            fromCard,
            timestamp: Date.now(),
            sprite,
            customTitle: 'Досягнення отримано!',
            isAchievement: true,
            potions: groupedPotions,
            allPotions: allPotionsList
          });
        }

        // 2. «Майстер зілля» — awarded when 3 potions are brewed simultaneously or in total, saved persistently
        const isMasterBrew =
          !hasMasterAlchemist &&
          (brewedCount >= 3 ||
            totalBrewed >= 3 ||
            (brewingBottlesRef.current.filter(b => b && (b.isPotion || b.itemId?.startsWith('potion_') || b.itemId?.includes('potion'))).length === 3 && brewedCount > 0));

        if (isMasterBrew) {
          try {
            localStorage.setItem('potionscraft_achievement_master_alchemist', 'true');
            localStorage.setItem('potionscraft_achievement_master_zillya', 'true');
            localStorage.setItem('potionscraft_achievement_potion_master', 'true');
            localStorage.setItem('potionscraft_achievement_master_potion', 'true');
            const curAch = JSON.parse(localStorage.getItem('potionscraft_achievements') || '{}');
            curAch.master_alchemist = true;
            curAch.master_zillya = true;
            curAch.potion_master = true;
            localStorage.setItem('potionscraft_achievements', JSON.stringify(curAch));
          } catch {}
          awardedAchievement = true;
          addToast({
            name: 'Майстер зілля',
            catalogId: brewed.catalogId,
            fromCard,
            timestamp: Date.now() + 1,
            sprite,
            customTitle: 'Досягнення отримано!',
            isAchievement: true,
            potions: groupedPotions,
            allPotions: allPotionsList
          });
        }

        // 3. Regular brew title if no achievements were unlocked during this brew
        if (!awardedAchievement) {
          addToast({
            name: brewed.name,
            catalogId: brewed.catalogId,
            fromCard,
            timestamp: Date.now(),
            sprite,
            customTitle: 'Зілля зварено!',
            isAchievement: false,
            potions: groupedPotions,
            allPotions: allPotionsList
          });
        }
      }
    }, 20);
    return () => clearInterval(timer);
  }, [isBrewing]);
  useEffect(() => {
    if (!brewedToast) return;
    const duration = brewedToast.potions && brewedToast.potions.length > 1 ? 6000 : 4500;
    const timer = setTimeout(() => setBrewedToast(null), duration);
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



  // Load recipe from catalog directly into brewing stand
  useEffect(() => {
    const handleLoadRecipe = (e) => {
      const potionId = e.detail?.potionId;
      if (!potionId) return;

      const wikiData = BREWING_STAND_DATA[potionId];
      const potionDef = POTIONS_DATA.find((p) => p.id === potionId);
      if (!potionDef && !wikiData) return;

      // Ingredient resolution
      const spritePath = wikiData?.reagent?.localSrc || potionDef?.ingredientSprite || '';
      let reagentKey = spritePath.replace(/^\/items\//, '').replace(/\.png$/, '');
      if (reagentKey === 'glistering_melon_slice') reagentKey = 'glistering_melon';
      if (!MINECRAFT_ITEMS[reagentKey]) {
        if (reagentKey.includes('nether_wart')) reagentKey = 'nether_wart';
        else if (reagentKey.includes('carrot')) reagentKey = 'golden_carrot';
        else if (reagentKey.includes('magma')) reagentKey = 'magma_cream';
        else if (reagentKey.includes('sugar')) reagentKey = 'sugar';
        else if (reagentKey.includes('redstone')) reagentKey = 'redstone';
        else if (reagentKey.includes('glowstone')) reagentKey = 'glowstone_dust';
      }

      const reagentItem = MINECRAFT_ITEMS[reagentKey] || MINECRAFT_ITEMS.nether_wart;

      // Base bottle resolution
      let baseKey = 'awkward_potion';
      if (potionDef?.id === 'invisibility') {
        baseKey = 'potion_night_vision';
      } else if (potionDef?.id === 'harming') {
        baseKey = 'potion_healing';
      } else if (potionDef?.id === 'slowness') {
        baseKey = 'potion_swiftness';
      } else if (['awkward', 'mundane', 'thick', 'weakness'].includes(potionDef?.id)) {
        baseKey = 'water_bottle';
      } else {
        const baseName = (wikiData?.output2?.title || wikiData?.output1?.title || potionDef?.base || '').toLowerCase();
        baseKey =
          baseName.includes('водян') || baseName.includes('звичайне') || baseName.includes('water')
            ? 'water_bottle'
            : 'awkward_potion';
      }
      const baseItem = MINECRAFT_ITEMS[baseKey] || MINECRAFT_ITEMS.awkward_potion;

      // Place in brewing stand
      setBrewingIngredient({ ...reagentItem, itemId: reagentKey, count: 1 });
      setBrewingBottles([
        { ...baseItem, itemId: baseKey, count: 1 },
        { ...baseItem, itemId: baseKey, count: 1 },
        { ...baseItem, itemId: baseKey, count: 1 }
      ]);

      // Ensure fuel is ready
      if (fuelChargesRef.current <= 0) {
        setFuelCharges(20);
        fuelChargesRef.current = 20;
      }

      playItemClickSound();

      // Smooth scroll to workbench
      const el = document.getElementById('mc-workbench') || document.querySelector('.mc-brewing-workbench');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      recipeLoadedFromCardRef.current = true;
    };

    window.addEventListener('load_potion_recipe', handleLoadRecipe);
    return () => window.removeEventListener('load_potion_recipe', handleLoadRecipe);
  }, []);

  // Authentic Minecraft Card-Parity Tooltip System
  const getSlotTooltipData = useCallback(
    (slotType, index, item) => {
      if (slotType === 'fuel-gauge') {
        return {
          title: 'Паливо варильної стійки',
          lore: `§eЗалишилося зарядів: ${fuelChargesRef.current} / 20\n§71 вогняний порошок = 20 варінь\n§8(1 заряд витрачається після приготування зілля)`
        };
      }

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
    []
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

  // Dynamic Tooltip Auto-Refresh: when the item in the currently hovered slot updates
  // (e.g. potion finishes brewing in brewing stand), immediately update the tooltip in real time.
  useEffect(() => {
    if (!hoveredSlotRef.current || mobile || heldItemRef.current || dragRef.current) return;
    const { type, index } = hoveredSlotRef.current;
    const currentItem = getSlotValue(type, index);
    if (currentItem) {
      handleSlotHover(type, index, currentItem);
    } else {
      hideTooltip();
    }
  }, [brewingBottles, brewingIngredient, craftingOutput, heldItem, mobile, getSlotValue, handleSlotHover, hideTooltip]);

  const handleBackgroundClick = event => {
    if (!event.target.closest('.mc-slot, button')) {
      if (heldItemRef.current) {
        if (event.button === 2) {
          // Right-click outside: drop 1 item
          const held = heldItemRef.current;
          const remainder = insertInventory({ ...held, count: 1 });
          const dropped = 1 - (remainder ? remainder.count : 0);
          if (dropped > 0) {
            const nextCount = held.count - dropped;
            hold(nextCount > 0 ? { ...held, count: nextCount } : null);
            playItemClickSound();
          }
        } else {
          // Left-click outside: drop/return full held stack
          returnHeld();
          playItemClickSound();
        }
      }
    }
  };

  const brewingStage = (<div className="mc-brewing-stand-stage">
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
                  >
                    <BrewingFuelGauge />
                  </div>
                </div>

                {/* 1. Top-Left Fuel Slot */}
                {/* 1. Top-Left Fuel Slot */}
                <div
                  className={`mc-slot mc-slot-fuel ${fuelSlot ? 'has-item' : ''}`}
                  data-slot-type="fuel"
                  data-slot-index={0}
                  {...slotEvents('fuel', 0, getSlotValue('fuel', 0))}
                >
                  {fuelSlot ? (
                    <>
                      <img
                        src={fuelSlot.sprite}
                        alt={fuelSlot.name}
                        className="mc-item-icon"
                        draggable="false"
                      />
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
                  <BrewingBubbles isBrewing={isBrewing} frameIndex={isBrewing ? brewingBubbleFrame : null} />
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
                        draggable="false"
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
                  aria-valuenow={isBrewing ? Math.floor(brewingProgress) : 0}
                  onMouseEnter={() => handleSlotHover('arrow', 0, null)}
                  onMouseLeave={hideTooltip}
                >
                  <BrewingArrow filledHeight={isBrewing ? brewingStep : 0} />
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
                            draggable="false"
                          />
                          {bottle.count > 1 && (
                            <span className="mc-item-count">{bottle.count}</span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>);

  return (
    <MobileStationShell mobile={mobile} settings={pocketSettings} onSettingsChange={setPocketSettings}
      onClose={() => { hideTooltip(); pocket.clear(); setPocketOpen(false); }}
      onOpen={() => { hideTooltip(); cancelGesture(); returnHeld(); pocketStationTab.current = 'brewing'; setPocketOpen(true); }}>
      {pocketOpen || mobile ? <BedrockStationView inventory={inventory} grid={craftingGrid} output={craftingOutput}
        brewingStage={brewingStage} controls={pocket} settings={pocketSettings} fillRecipe={fillPocketRecipe} onTabChange={tab => { pocketStationTab.current = tab; }}
        craft={craftPocket} clearGrid={clearPocketGrid} fuelCharges={fuelCharges} progress={brewingProgress}
        brewing={isBrewing} message={pocketMessage} containers={containerReturns} collectContainers={() => {
          const remaining = insertInventory({ ...MINECRAFT_ITEMS.glass_bottle, itemId: 'glass_bottle', count: containerReturns });
          setContainerReturns(remaining?.count || 0);
        }} /> : <>
      <div className="mc-workbench-viewport-scaler">
        <div className="mc-workbench-layout">
          <aside className="mc-workstation-info mc-station-sidebar mc-station-brewing-info" aria-label="Стан варильної стійки">
            <h3>Варіння</h3>
            <div className="mc-workstation-info-title">{isBrewing ? `Варіння · ${Math.ceil(20 * (1 - brewingProgress / 100))} с` : 'Очікування'}</div>
            <dl><div><dt>Паливо</dt><dd>{fuelCharges} / 20</dd></div><div><dt>Пляшечки</dt><dd>{brewingBottles.filter(Boolean).length} / 3</dd></div></dl>
            <p>{brewingIngredient ? `Інгредієнт: ${brewingIngredient.name}` : 'Інгредієнт ще не додано.'}</p>
            <h4>Як варити</h4>
            <ol><li>Паливо — вогняний порошок.</li><li>До трьох пляшечок у нижні слоти.</li><li>Інгредієнт — зверху. Час варіння: 20 секунд.</li></ol>
          </aside>
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
              <div className="mc-brewing-header-row">
                <div className="mc-brewing-header-label">Варильна стійка</div>
              </div>

              {brewingStage}
            </div>

            {/* 2. RIGHT: Crafting Table 3x3 ("Майстрування" matching reference mockup) */}
            <div className="mc-crafting-area">
              <div className="mc-crafting-header-label">Крафт</div>

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
                            draggable="false"
                          />
                          {slotItem.count > 1 && (
                            <span className="mc-item-count">
                              {slotItem.count}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Minecraft crafting: grid, right-pointing arrow, output. */}
                <div className="mc-crafting-arrow-box">
                  <img
                    src="/mc_crafting_arrow.png"
                    alt="Стрілка створення"
                    className="mc-pixel-crafting-arrow"
                  />
                </div>

                {/* Large Output Slot (52x52px, beside the grid) */}
                <div className="mc-output-slot-wrapper">
                  <div
                    className={`mc-slot mc-slot-output ${craftingOutput ? 'has-result' : ''}`}
                    data-slot-type="output"
                    onPointerDown={handleCraftOutputClick}
                    onContextMenu={e => e.preventDefault()}
                    onPointerEnter={() => {
                      hoveredSlotRef.current = { type: 'output', index: 0 };
                      handleSlotHover('output', 0, craftingOutput);
                    }}
                    onPointerLeave={() => { hoveredSlotRef.current = null; hideTooltip(); }}
                  >
                    {craftingOutput && (
                      <>
                        <img
                          key={`out-${craftingOutput.itemId}`}
                          src={craftingOutput.sprite}
                          alt={craftingOutput.name}
                          className="mc-item-icon"
                          draggable="false"
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

            {/* 3x18 Main Storage Grid (Slots 0..53) */}
            <div className="mc-inventory-grid">
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
                        draggable="false"
                      />
                      {slotItem.count > 1 && (
                        <span className="mc-item-count">
                          {slotItem.count}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Authentic Minecraft Horizontal Separator Gap */}
            <div className="mc-hotbar-separator-gap" />

            {/* 1x18 Quick Hotbar Grid (Slots 54..71) */}
            <div className="mc-hotbar-grid">
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
                          draggable="false"
                        />
                        {slotItem.count > 1 && (
                          <span className="mc-item-count">
                            {slotItem.count}
                          </span>
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
                <span className="mc-held-count">
                  {heldItem.count}
                </span>
              )}
            </div>, document.body
          )}


          {/* ==================== MINECRAFT ACHIEVEMENT POPUP ==================== */}
          {brewedToast && createPortal(
            <div
              className={`mc-station-toast ${!brewedToast.fromCard && brewedToast.catalogId ? 'is-clickable' : ''}`}
              onClick={() => {
                if (!brewedToast.fromCard && brewedToast.catalogId) {
                  handleViewInCatalog(brewedToast.catalogId);
                }
              }}
              role="status"
              title={
                brewedToast.potions && brewedToast.potions.length > 0
                  ? `${brewedToast.customTitle || 'Зілля зварено!'}: ${brewedToast.potions.map(p => `${p.name}${p.count > 1 ? ` × ${p.count}` : ''}`).join(', ')}`
                  : brewedToast.name === 'Майстер зілля'
                  ? 'Зваріть 3 будь-які зілля одночасно на одній варильній стійці'
                  : brewedToast.name === 'Місцева броварня'
                  ? 'Зваріть своє перше зілля'
                  : !brewedToast.fromCard && brewedToast.catalogId
                  ? 'Клацніть, щоб переглянути в каталозі'
                  : ''
              }
            >
              <div className="mc-station-toast-icons-wrapper">
                {(brewedToast.allPotions && brewedToast.allPotions.length > 0
                  ? brewedToast.allPotions
                  : [{ sprite: brewedToast.sprite, name: brewedToast.name }]
                ).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.sprite || '/items/brewing_stand.png'}
                    alt={item.name || ''}
                    className="mc-station-toast-icon"
                    draggable="false"
                  />
                ))}
              </div>
              <div className="mc-station-toast-body">
                <div className="mc-station-toast-title">
                  {brewedToast.customTitle || 'Зілля зварено!'}
                </div>
                {brewedToast.isAchievement && (
                  <div className="mc-station-toast-desc">{brewedToast.name}</div>
                )}
                {brewedToast.potions && brewedToast.potions.length > 0 && (
                  <div className="mc-station-toast-potions-items">
                    {brewedToast.potions.map((p, idx) => (
                      <span key={idx} className="mc-station-toast-potion-tag" title={p.name}>
                        <img src={p.sprite} alt="" className="mc-station-toast-potion-mini-icon" draggable="false" />
                        <span className="mc-station-toast-potion-tag-name">
                          {p.name}{p.count > 1 ? ` × ${p.count}` : ''}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="mc-station-toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setBrewedToast(null);
                }}
                title="Закрити"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>,
            document.body
          )}
        </div>
          <aside className="mc-workstation-info mc-station-sidebar mc-station-crafting-info" aria-label="Стан крафту">
            <h3>Крафт</h3>
            <div className="mc-workstation-info-title">{craftingOutput ? `${craftingOutput.name} × ${craftingOutput.count}` : 'Сітка 3 × 3'}</div>
            <dl className="mc-station-shortcuts">
              <div><dt>ЛКМ</dt><dd>Клік — взяти / покласти. Утримання й протяжка — зібрати однакові.</dd></div>
              <div><dt>ПКМ</dt><dd>Взяти половину / покласти 1. Протяжка — по 1 у слот.</dd></div>
              <div><dt>Подвійний ЛКМ</dt><dd>Зібрати однакові предмети до повної стопки.</dd></div>
              <div><dt>Shift + клік</dt><dd>Швидке перенесення; на результаті — крафт усіх.</dd></div>
              <div><dt>Клавіші 1–9</dt><dd>Швидкий обмін зі слотом хотбара.</dd></div>
              <div><dt>Q / Ctrl+Q</dt><dd>Скинути 1 предмет / усю стопку в інвентар.</dd></div>
            </dl>
            <div className="mc-station-sidebar-btns">
              <button
                type="button"
                className="mc-brewing-ref-btn"
                disabled={!craftingGrid.some(Boolean)}
                onClick={() => { returnHeld(); clearPocketGrid(); }}
              >
                Очистити сітку
              </button>
              <button
                type="button"
                className="mc-brewing-ref-btn mc-reset-inv-btn"
                onClick={() => {
                  returnHeld();
                  clearPocketGrid();
                  try {
                    localStorage.removeItem('potionscraft_station_inventory');
                  } catch {}
                  setInventory(buildInitialInventory());
                  // Also completely reset the brewing stand
                  setBrewingIngredient(null);
                  brewingIngredientRef.current = null;
                  setBrewingBottles([null, null, null]);
                  brewingBottlesRef.current = [null, null, null];
                  setFuelSlot(null);
                  fuelSlotRef.current = null;
                  setFuelCharges(0);
                  fuelChargesRef.current = 0;
                  setIsBrewing(false);
                  setBrewingStep(0);
                  setBrewingProgress(0);
                  setBrewingBubbleFrame(null);
                  activeIngredientRef.current = null;
                  recipeLoadedFromCardRef.current = false;
                  setContainerReturns(0);
                  hideTooltip();
                  playCraftSuccessSound();
                  addToast({
                    name: 'Початковий набір предметів та варильну стійку відновлено',
                    customTitle: 'Інвентар і стійку скинуто!'
                  });
                }}
                title="Скинути стан інвентарю та варильної стійки до початкового"
              >
                Скинути інвентар
              </button>
            </div>
          </aside>
        </div>
      </div>
      </>}
    </MobileStationShell>
  );
}
