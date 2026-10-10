import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MINECRAFT_ITEMS } from '../data/minecraftItemIcons';
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

// 72-Slot Inventory Distribution matching reference mockup (18 columns x 4 rows)
// Hotbar: slots 54..71 (18 slots)
// Main Storage: slots 0..53 (54 slots)
const INITIAL_INVENTORY_ITEMS = [
  // Hotbar items (slots 54..71)
  { slot: 54, itemId: 'water_bottle', count: 1 },
  { slot: 55, itemId: 'water_bottle', count: 1 },
  { slot: 56, itemId: 'water_bottle', count: 1 },
  { slot: 57, itemId: 'nether_wart', count: 32 },
  { slot: 58, itemId: 'blaze_powder', count: 16 },
  { slot: 59, itemId: 'sugar', count: 16 },
  { slot: 60, itemId: 'redstone', count: 32 },
  { slot: 61, itemId: 'glowstone', count: 32 },
  { slot: 62, itemId: 'gunpowder', count: 16 },
  { slot: 63, itemId: 'golden_carrot', count: 8 },
  { slot: 64, itemId: 'glistering_melon', count: 8 },
  { slot: 65, itemId: 'fermented_spider_eye', count: 8 },
  { slot: 66, itemId: 'magma_cream', count: 8 },
  { slot: 67, itemId: 'ghast_tear', count: 8 },
  { slot: 68, itemId: 'spider_eye', count: 8 },
  { slot: 69, itemId: 'pufferfish', count: 4 },
  { slot: 70, itemId: 'rabbit_foot', count: 4 },
  { slot: 71, itemId: 'phantom_membrane', count: 4 },

  // Main storage items (slots 0..53)
  { slot: 0, itemId: 'glass', count: 32 },
  { slot: 1, itemId: 'stick', count: 16 },
  { slot: 2, itemId: 'blaze_rod', count: 8 },
  { slot: 3, itemId: 'brown_mushroom', count: 16 },
  { slot: 4, itemId: 'gold_nugget', count: 64 },
  { slot: 5, itemId: 'carrot', count: 16 },
  { slot: 6, itemId: 'melon_slice', count: 16 },
  { slot: 7, itemId: 'turtle_shell', count: 2 },
  { slot: 8, itemId: 'glass_bottle', count: 16 },
  { slot: 9, itemId: 'awkward_potion', count: 1 },
  { slot: 10, itemId: 'awkward_potion', count: 1 },
  { slot: 11, itemId: 'awkward_potion', count: 1 },
  { slot: 12, itemId: 'slime_block', count: 4 },
  { slot: 13, itemId: 'cobweb', count: 8 },
  { slot: 14, itemId: 'stone', count: 16 },
  { slot: 15, itemId: 'breeze_rod', count: 8 },
  { slot: 16, itemId: 'dragons_breath', count: 8 },
  { slot: 17, itemId: 'splash_water_bottle', count: 1 },
  { slot: 18, itemId: 'lingering_water_bottle', count: 1 }
];

function buildInitialInventory() {
  const inv = new Array(72).fill(null);
  INITIAL_INVENTORY_ITEMS.forEach((it) => {
    if (it.slot < 72) {
      const def = MINECRAFT_ITEMS[it.itemId];
      if (def) {
        inv[it.slot] = {
          ...def,
          itemId: it.itemId,
          count: it.count
        };
      }
    }
  });
  return inv;
}

export default function MinecraftStationWidget() {
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
  const [brewingStep, setBrewingStep] = useState(0); // 0 to 28 discrete pixels

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

  // Minecraft Mouse Dragging & Dispensing System
  const isRightMouseDownRef = useRef(false);
  const isLeftMouseDownRef = useRef(false);
  const hasGatheredRef = useRef(false);

  // Continuous RMB dispensing refs
  const rmbActiveSlotRef = useRef(null); // { slotType, index }
  const rmbTimerRef = useRef(null);
  const rmbIntervalRef = useRef(null);

  // LMB Drag gathering ref
  const currentLeftDragSlotRef = useRef(null); // `${slotType}-${index}`

  // Track mousedown origin to support both click-to-pick and drag-to-drop without conflicts
  const mouseDownOriginRef = useRef(null);
  const handleSlotMouseDownRef = useRef(null);
  const touchStartOriginRef = useRef(null);

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

  // Stop continuous RMB dispensing timer
  const stopRmbDispensing = useCallback(() => {
    if (rmbTimerRef.current) {
      clearTimeout(rmbTimerRef.current);
      rmbTimerRef.current = null;
    }
    if (rmbIntervalRef.current) {
      clearInterval(rmbIntervalRef.current);
      rmbIntervalRef.current = null;
    }
    rmbActiveSlotRef.current = null;
  }, []);

  const stopRmbDispensingRef = useRef(stopRmbDispensing);
  stopRmbDispensingRef.current = stopRmbDispensing;

  // Deposit 1 single item from heldItem into target slot (Conserves items strictly)
  const depositOneItem = useCallback(
    (slotType, index) => {
      if (slotType === 'output') return false;
      const currentHeld = heldItemRef.current;
      if (!currentHeld || currentHeld.count <= 0) return false;

      // Slot type validations
      if (
        slotType === 'bottle' &&
        !currentHeld.isPotion &&
        currentHeld.itemId !== 'water_bottle' &&
        currentHeld.itemId !== 'glass_bottle'
      ) {
        return false;
      }
      if (slotType === 'fuel' && currentHeld.itemId !== 'blaze_powder') {
        return false;
      }
      if (slotType === 'ingredient' && !VALID_BREWING_REAGENTS.has(currentHeld.itemId)) {
        return false;
      }

      const currentVal = getSlotValue(slotType, index);

      // 1. If slot is empty: place 1 item
      if (!currentVal) {
        setSlotValue(slotType, index, { ...currentHeld, count: 1 });
        const nextCount = currentHeld.count - 1;
        const nextHeld = nextCount > 0 ? { ...currentHeld, count: nextCount } : null;
        heldItemRef.current = nextHeld;
        setHeldItem(nextHeld);
        playItemClickSound();
        return nextCount > 0;
      }

      // 2. If slot already has the exact same item and has space: add 1 item
      const max = currentVal.maxStack || 64;
      if (
        currentVal.itemId === currentHeld.itemId &&
        currentVal.count < max &&
        slotType !== 'bottle'
      ) {
        setSlotValue(slotType, index, { ...currentVal, count: currentVal.count + 1 });
        const nextCount = currentHeld.count - 1;
        const nextHeld = nextCount > 0 ? { ...currentHeld, count: nextCount } : null;
        heldItemRef.current = nextHeld;
        setHeldItem(nextHeld);
        playItemClickSound();
        return nextCount > 0 && (currentVal.count + 1) < max;
      }

      return false;
    },
    [getSlotValue, setSlotValue]
  );

  const depositOneItemRef = useRef(depositOneItem);
  depositOneItemRef.current = depositOneItem;

  // Handle continuous and multi-item RMB distribution on slot hover
  const handleRmbSlotHover = useCallback(
    (slotType, index) => {
      if (slotType === 'output') {
        stopRmbDispensing();
        return;
      }
      const currentHeld = heldItemRef.current;
      if (!currentHeld || currentHeld.count <= 0) {
        stopRmbDispensing();
        return;
      }

      const active = rmbActiveSlotRef.current;
      // If moving to a new slot or re-entering after leaving:
      if (!active || active.slotType !== slotType || active.index !== index) {
        stopRmbDispensing();
        rmbActiveSlotRef.current = { slotType, index };

        // Deposit first item immediately!
        const canContinue = depositOneItemRef.current(slotType, index);
        if (!canContinue) {
          return;
        }

        // Continuously dispense items while cursor is held over slot (or wiggled)
        rmbTimerRef.current = setTimeout(() => {
          rmbIntervalRef.current = setInterval(() => {
            if (!isRightMouseDownRef.current || !heldItemRef.current || heldItemRef.current.count <= 0) {
              stopRmbDispensingRef.current();
              return;
            }
            const activeCheck = rmbActiveSlotRef.current;
            if (!activeCheck || activeCheck.slotType !== slotType || activeCheck.index !== index) {
              stopRmbDispensingRef.current();
              return;
            }
            const more = depositOneItemRef.current(slotType, index);
            if (!more) {
              stopRmbDispensingRef.current();
            }
          }, 110);
        }, 190);
      }
    },
    [stopRmbDispensing]
  );

  const handleRmbSlotHoverRef = useRef(handleRmbSlotHover);
  handleRmbSlotHoverRef.current = handleRmbSlotHover;

  // Left-Drag gather identical items into held cursor stack up to maxStack (ЛКМ протяжка/збирання)
  // Strictly atomic and guarded against duplicate invocations per slot
  const handleLmbSlotHover = useCallback(
    (slotType, index) => {
      if (slotType === 'output') return;
      const currentHeld = heldItemRef.current;
      if (!currentHeld || (currentHeld.maxStack || 64) <= 1) return;
      const max = currentHeld.maxStack || 64;
      if (currentHeld.count >= max) return;

      const key = `${slotType}-${index}`;
      if (currentLeftDragSlotRef.current === key) {
        return; // Already processed this slot during this continuous hover pass!
      }
      currentLeftDragSlotRef.current = key;

      const currentVal = getSlotValue(slotType, index);
      if (!currentVal || currentVal.itemId !== currentHeld.itemId) return;

      const space = max - currentHeld.count;
      if (space <= 0) return;

      const canTake = Math.min(space, currentVal.count);
      if (canTake <= 0) return;

      // 1. Synchronously update the source slot in ref and state
      const nextSlotVal = currentVal.count > canTake ? { ...currentVal, count: currentVal.count - canTake } : null;
      setSlotValue(slotType, index, nextSlotVal);

      // 2. Synchronously update held item in ref and state
      const updatedHeld = { ...currentHeld, count: currentHeld.count + canTake };
      heldItemRef.current = updatedHeld;
      hasGatheredRef.current = true;
      setHeldItem(updatedHeld);
      playItemClickSound();
    },
    [getSlotValue, setSlotValue]
  );

  const handleLmbSlotHoverRef = useRef(handleLmbSlotHover);
  handleLmbSlotHoverRef.current = handleLmbSlotHover;

  // Slot mouse leave handler: cleans up active dispensing & drag tracking
  const handleSlotMouseLeave = useCallback(
    (slotType, index) => {
      hideTooltip();
      if (
        rmbActiveSlotRef.current &&
        rmbActiveSlotRef.current.slotType === slotType &&
        rmbActiveSlotRef.current.index === index
      ) {
        stopRmbDispensing();
      }
      if (currentLeftDragSlotRef.current === `${slotType}-${index}`) {
        currentLeftDragSlotRef.current = null;
      }
    },
    [hideTooltip, stopRmbDispensing]
  );

  // Track global mouse position and seamless gliding drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Synchronize button states directly from mouse event bitmask
      const hasRight = (e.buttons & 2) === 2;
      const hasLeft = (e.buttons & 1) === 1;

      if (!hasRight && isRightMouseDownRef.current) {
        isRightMouseDownRef.current = false;
        stopRmbDispensingRef.current();
      }
      if (!hasLeft && isLeftMouseDownRef.current) {
        isLeftMouseDownRef.current = false;
        currentLeftDragSlotRef.current = null;
      }

      // Hide tooltip when an item is held on cursor or during any mouse dragging
      if (heldItemRef.current || isRightMouseDownRef.current || isLeftMouseDownRef.current || hasRight || hasLeft) {
        hideTooltip();
      }

      // 1. Right Mouse Button Drag Distribution (continuous multi-item dispensing across slots)
      if ((isRightMouseDownRef.current || hasRight) && heldItemRef.current && heldItemRef.current.count > 0) {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.mc-slot');
        if (el && el.dataset.slotType) {
          const sType = el.dataset.slotType;
          const sIdx = parseInt(el.dataset.slotIndex, 10);
          if (!Number.isNaN(sIdx)) {
            handleRmbSlotHoverRef.current(sType, sIdx);
          }
        } else {
          stopRmbDispensingRef.current();
        }
      } else {
        stopRmbDispensingRef.current();
      }

      // 2. Left Mouse Button Drag Gathering (collects identical items into cursor stack up to maxStack)
      if ((isLeftMouseDownRef.current || hasLeft) && heldItemRef.current && (heldItemRef.current.maxStack || 64) > 1) {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.mc-slot');
        if (el && el.dataset.slotType) {
          const sType = el.dataset.slotType;
          const sIdx = parseInt(el.dataset.slotIndex, 10);
          if (!Number.isNaN(sIdx)) {
            handleLmbSlotHoverRef.current(sType, sIdx);
          }
        } else {
          currentLeftDragSlotRef.current = null;
        }
      } else {
        currentLeftDragSlotRef.current = null;
      }
    };

    const handleMouseUpGlobal = (e) => {
      if (e.button === 2 || (e.buttons & 2) === 0) {
        isRightMouseDownRef.current = false;
        stopRmbDispensingRef.current();
      }
      if (e.button === 0 || (e.buttons & 1) === 0) {
        isLeftMouseDownRef.current = false;
        currentLeftDragSlotRef.current = null;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        setMousePos({ x: touch.clientX, y: touch.clientY });
        if (heldItemRef.current && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (!heldItemRef.current) {
        touchStartOriginRef.current = null;
        return;
      }

      if (e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.mc-slot');
        if (el && el.dataset.slotType) {
          const sType = el.dataset.slotType;
          const sIdx = parseInt(el.dataset.slotIndex, 10);
          if (!Number.isNaN(sIdx) && handleSlotMouseDownRef.current) {
            if (
              !touchStartOriginRef.current ||
              touchStartOriginRef.current.slotType !== sType ||
              touchStartOriginRef.current.index !== sIdx
            ) {
              handleSlotMouseDownRef.current(e, sType, sIdx);
            }
          }
        }
      }
      touchStartOriginRef.current = null;
    };

    const handleWindowContextMenu = (e) => {
      if (isRightMouseDownRef.current || heldItemRef.current || e.target.closest('.mc-brewing-workbench')) {
        e.preventDefault();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('contextmenu', handleWindowContextMenu);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('contextmenu', handleWindowContextMenu);
      stopRmbDispensingRef.current();
    };
  }, [hideTooltip]);

  // Return held item on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && heldItemRef.current) {
        placeInInventory(heldItemRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper: Find available slot in inventory to place an item safely without losing any items
  const placeInInventory = useCallback((itemToAdd) => {
    if (!itemToAdd || !itemToAdd.itemId || itemToAdd.count <= 0) return false;

    const next = [...inventoryRef.current];
    let remaining = itemToAdd.count;
    const max = itemToAdd.maxStack || 64;

    // 1. Try to merge into existing stacks that have matching itemId and space
    if (max > 1) {
      for (let i = 0; i < next.length; i++) {
        if (next[i] && next[i].itemId === itemToAdd.itemId) {
          const space = (next[i].maxStack || max) - next[i].count;
          if (space > 0) {
            const toAdd = Math.min(space, remaining);
            next[i] = { ...next[i], count: next[i].count + toAdd };
            remaining -= toAdd;
            if (remaining <= 0) break;
          }
        }
      }
    }

    // 2. Place into empty slots respecting maxStack
    if (remaining > 0) {
      for (let i = 0; i < next.length; i++) {
        if (!next[i]) {
          const toAdd = Math.min(remaining, max);
          next[i] = { ...itemToAdd, count: toAdd };
          remaining -= toAdd;
          if (remaining <= 0) break;
        }
      }
    }

    inventoryRef.current = next;
    setInventory(next);

    // If inventory is completely full, keep remainder in heldItem
    if (remaining > 0) {
      const remHeld = { ...itemToAdd, count: remaining };
      heldItemRef.current = remHeld;
      setHeldItem(remHeld);
    } else {
      heldItemRef.current = null;
      setHeldItem(null);
    }

    return true;
  }, []);

  // Quick preset: Load the 100% exact reference setup from user's image
  const loadReferenceBrewingState = useCallback(() => {
    setFuelSlot({ ...MINECRAFT_ITEMS.blaze_powder, itemId: 'blaze_powder', count: 63 });
    setFuelCharges(20);
    fuelChargesRef.current = 20;
    setBrewingIngredient({ ...MINECRAFT_ITEMS.pufferfish, itemId: 'pufferfish', count: 4 });
    setBrewingBottles([
      { ...MINECRAFT_ITEMS.awkward_potion, itemId: 'awkward_potion', count: 1 },
      { ...MINECRAFT_ITEMS.awkward_potion, itemId: 'awkward_potion', count: 1 },
      { ...MINECRAFT_ITEMS.awkward_potion, itemId: 'awkward_potion', count: 1 }
    ]);
    setIsBrewing(false);
    setBrewingProgress(0);
    setBrewingStep(0);
    playCraftSuccessSound();
  }, []);

  // Auto-consume 1 blaze powder to fill fuelCharges to 20 whenever fuelCharges is 0 and powder is placed
  useEffect(() => {
    if (fuelCharges <= 0 && fuelSlot && fuelSlot.itemId === 'blaze_powder') {
      setFuelCharges(20);
      fuelChargesRef.current = 20;
      setFuelSlot((prev) => {
        if (!prev) return null;
        if (prev.count > 1) return { ...prev, count: prev.count - 1 };
        return null;
      });
      playRefuelSound();
    }
  }, [fuelCharges, fuelSlot]);

  // 1. Condition Monitor: starts or cancels brewing when items/fuel change
  useEffect(() => {
    // STRICT CHECK: Brewing requires active fuel charges (> 0)!
    const readyToBrew = fuelCharges > 0 && canBrew(brewingIngredient, brewingBottles, fuelCharges);

    if (readyToBrew && !isBrewing) {
      setIsBrewing(true);
    } else if (!readyToBrew && isBrewing) {
      // Abort immediately if items or fuel are removed during brewing
      setIsBrewing(false);
      setBrewingProgress(0);
      setBrewingStep(0);
    }
  }, [brewingIngredient, brewingBottles, fuelCharges, isBrewing]);

  // 2. Brewing Timer Engine: Synchronized 1:1 with 700ms steam fill cycles
  // Each steam cycle (7 frames @ 100ms in Grid_layout_Brewing_Bubbles.gif) takes exactly 700ms.
  // The arrow has 28 divisions (56px high, 2px per segment).
  // As steam fills during each 700ms cycle, the corresponding segment of the arrow whitens.
  const STEAM_CYCLE_MS = 700;
  const TOTAL_BREW_TIME = 28 * STEAM_CYCLE_MS; // 19600ms = exactly 28 steam fill cycles

  useEffect(() => {
    if (!isBrewing) {
      setBrewingProgress(0);
      setBrewingStep(0);
      return;
    }

    const startTime = Date.now();

    // Tick every 50ms (1 game tick = 50ms)
    const animTimer = setInterval(() => {
      const elapsedMs = Date.now() - startTime;

      // Over 19600ms, 57 pixels whiten. Exactly 2px (1 division) whiten per 700ms steam cycle.
      const currentPixels = Math.min(57, Math.floor((elapsedMs / TOTAL_BREW_TIME) * 57));
      setBrewingStep(currentPixels);
      setBrewingProgress(Math.min(100, (elapsedMs / TOTAL_BREW_TIME) * 100));

      if (elapsedMs >= TOTAL_BREW_TIME) {
        clearInterval(animTimer);
        setIsBrewing(false);
        setBrewingProgress(0);
        setBrewingStep(0);

        // Decrement fuel charge by 1
        const nextFuelCharges = Math.max(0, fuelChargesRef.current - 1);
        setFuelCharges(nextFuelCharges);
        fuelChargesRef.current = nextFuelCharges;

        // Auto-refuel from reserve blaze powder if charges reached 0 and powder is in slot
        if (nextFuelCharges === 0 && fuelSlotRef.current && fuelSlotRef.current.itemId === 'blaze_powder') {
          setFuelCharges(20);
          fuelChargesRef.current = 20;
          setFuelSlot((prev) => {
            if (!prev) return null;
            if (prev.count > 1) return { ...prev, count: prev.count - 1 };
            return null;
          });
          playRefuelSound();
        }

        // Decrement reagent count
        const currentReagent = brewingIngredientRef.current;
        const ingredientId = currentReagent?.itemId;
        setBrewingIngredient((prev) => {
          if (!prev) return null;
          if (prev.count > 1) return { ...prev, count: prev.count - 1 };
          return null;
        });

        // Transform bottles using freshest state
        let newlyBrewedName = '';
        let newlyBrewedCatalogId = null;

        setBrewingBottles((prevBottles) => {
          return prevBottles.map((bottle) => {
            if (!bottle) return null;
            const result = getBrewingResult(bottle, ingredientId);
            if (result) {
              newlyBrewedName = result.name;
              if (result.catalogId) newlyBrewedCatalogId = result.catalogId;
              return result;
            }
            return bottle;
          });
        });

        // Play sound
        playPotionBrewedSound();

        // Show Toast Notification
        if (newlyBrewedName) {
          setBrewedToast({
            name: newlyBrewedName,
            catalogId: newlyBrewedCatalogId,
            timestamp: Date.now()
          });
        }
      }
    }, 50);

    return () => clearInterval(animTimer);
  }, [isBrewing]);

  // Auto-hide notification after 8 seconds
  useEffect(() => {
    if (brewedToast) {
      const timer = setTimeout(() => {
        setBrewedToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [brewedToast]);

  // Shift + Left Click: Smart Transfer between Inventory & Workstation
  const handleShiftClick = (slotType, index, item) => {
    if (!item) return;
    playItemClickSound();

    if (slotType === 'inventory') {
      // 1. Blaze Powder -> Send to fuel slot first if not full
      if (item.itemId === 'blaze_powder') {
        if (!fuelSlot) {
          setFuelSlot(item);
          setSlotValue('inventory', index, null);
          return;
        }
        if (fuelSlot.count < (fuelSlot.maxStack || 64)) {
          const space = (fuelSlot.maxStack || 64) - fuelSlot.count;
          const toAdd = Math.min(space, item.count);
          setFuelSlot({ ...fuelSlot, count: fuelSlot.count + toAdd });
          if (item.count > toAdd) {
            setSlotValue('inventory', index, { ...item, count: item.count - toAdd });
          } else {
            setSlotValue('inventory', index, null);
          }
          return;
        }
      }

      // 2. Bottle / Potion -> Move 1 bottle into first empty brewing bottle slot
      if (item.isPotion || item.itemId === 'water_bottle' || item.itemId === 'glass_bottle') {
        const emptyBottleIdx = brewingBottlesRef.current.findIndex((b) => !b);
        if (emptyBottleIdx !== -1) {
          const nextBottles = [...brewingBottlesRef.current];
          nextBottles[emptyBottleIdx] = { ...item, count: 1 };
          brewingBottlesRef.current = nextBottles;
          setBrewingBottles(nextBottles);
          if (item.count > 1) {
            setSlotValue('inventory', index, { ...item, count: item.count - 1 });
          } else {
            setSlotValue('inventory', index, null);
          }
          return;
        }
      }

      // 3. Brewing Reagent -> Move to brewing ingredient slot (Only valid brewing reagents)
      if (VALID_BREWING_REAGENTS.has(item.itemId)) {
        if (!brewingIngredientRef.current) {
          brewingIngredientRef.current = item;
          setBrewingIngredient(item);
          setSlotValue('inventory', index, null);
          return;
        }
        if (
          brewingIngredientRef.current.itemId === item.itemId &&
          brewingIngredientRef.current.count < (brewingIngredientRef.current.maxStack || 64)
        ) {
          const space = (brewingIngredientRef.current.maxStack || 64) - brewingIngredientRef.current.count;
          const toAdd = Math.min(space, item.count);
          const updated = { ...brewingIngredientRef.current, count: brewingIngredientRef.current.count + toAdd };
          brewingIngredientRef.current = updated;
          setBrewingIngredient(updated);
          if (item.count > toAdd) {
            setSlotValue('inventory', index, { ...item, count: item.count - toAdd });
          } else {
            setSlotValue('inventory', index, null);
          }
          return;
        }
      }

      // 4. Hotbar <-> Main Storage quick swapping
      if (index >= 54) {
        // From Hotbar (54..71) -> Move to Main Storage (0..53)
        setInventory((prev) => {
          const next = [...prev];
          let remaining = item.count;
          if (item.maxStack > 1) {
            for (let i = 0; i < 54; i++) {
              if (next[i] && next[i].itemId === item.itemId) {
                const space = next[i].maxStack - next[i].count;
                if (space > 0) {
                  const toAdd = Math.min(space, remaining);
                  next[i] = { ...next[i], count: next[i].count + toAdd };
                  remaining -= toAdd;
                  if (remaining <= 0) break;
                }
              }
            }
          }
          if (remaining > 0) {
            for (let i = 0; i < 54; i++) {
              if (!next[i]) {
                const toAdd = Math.min(remaining, item.maxStack || 64);
                next[i] = { ...item, count: toAdd };
                remaining -= toAdd;
                if (remaining <= 0) break;
              }
            }
          }
          next[index] = remaining > 0 ? { ...item, count: remaining } : null;
          return next;
        });
      } else {
        // From Main Storage (0..53) -> Move to Hotbar (54..71)
        setInventory((prev) => {
          const next = [...prev];
          let remaining = item.count;
          if (item.maxStack > 1) {
            for (let i = 54; i < 72; i++) {
              if (next[i] && next[i].itemId === item.itemId) {
                const space = next[i].maxStack - next[i].count;
                if (space > 0) {
                  const toAdd = Math.min(space, remaining);
                  next[i] = { ...next[i], count: next[i].count + toAdd };
                  remaining -= toAdd;
                  if (remaining <= 0) break;
                }
              }
            }
          }
          if (remaining > 0) {
            for (let i = 54; i < 72; i++) {
              if (!next[i]) {
                const toAdd = Math.min(remaining, item.maxStack || 64);
                next[i] = { ...item, count: toAdd };
                remaining -= toAdd;
                if (remaining <= 0) break;
              }
            }
          }
          next[index] = remaining > 0 ? { ...item, count: remaining } : null;
          return next;
        });
      }
    } else {
      // Transfer from Crafting Table or Brewing Stand back to Inventory
      placeInInventory(item);
      setSlotValue(slotType, index, null);
    }
  };

  // Handle click on crafting output slot
  const handleCraftOutputClick = (e) => {
    if (!craftingOutput) return;

    if (e && e.shiftKey) {
      // Batch craft all into inventory
      const currentGrid = craftingGridRef.current;
      let maxBatches = Infinity;
      currentGrid.forEach((slot) => {
        if (slot) {
          maxBatches = Math.min(maxBatches, slot.count);
        }
      });
      if (maxBatches === Infinity || maxBatches <= 0) return;

      playCraftSuccessSound();
      const totalCrafted = craftingOutput.count * maxBatches;
      placeInInventory({ ...craftingOutput, count: totalCrafted });

      const nextGrid = currentGrid.map((slot) => {
        if (!slot) return null;
        if (slot.count > maxBatches) {
          return { ...slot, count: slot.count - maxBatches };
        }
        return null;
      });
      craftingGridRef.current = nextGrid;
      setCraftingGrid(nextGrid);
      return;
    }

    const currentHeld = heldItemRef.current;
    if (
      currentHeld &&
      (currentHeld.itemId !== craftingOutput.itemId ||
        currentHeld.count + craftingOutput.count > (currentHeld.maxStack || 64))
    ) {
      return;
    }

    playCraftSuccessSound();

    if (!currentHeld) {
      const nextHeld = { ...craftingOutput };
      heldItemRef.current = nextHeld;
      setHeldItem(nextHeld);
    } else {
      const nextHeld = { ...currentHeld, count: currentHeld.count + craftingOutput.count };
      heldItemRef.current = nextHeld;
      setHeldItem(nextHeld);
    }

    // Decrement 1 item from each participating crafting grid slot synchronously
    const nextGrid = craftingGridRef.current.map((slot) => {
      if (!slot) return null;
      if (slot.count > 1) {
        return { ...slot, count: slot.count - 1 };
      }
      return null;
    });
    craftingGridRef.current = nextGrid;
    setCraftingGrid(nextGrid);
  };

  // Double-click: Gather all matching items into held item up to maxStack (64)
  // Completely atomic with strict stack conservation across inventory and crafting grid
  const handleSlotDoubleClick = (slotType, index) => {
    const held = heldItemRef.current;
    if (!held || (held.maxStack || 64) <= 1) return;
    const max = held.maxStack || 64;
    const spaceNeeded = max - held.count;
    if (spaceNeeded <= 0) return;

    let gathered = 0;

    // 1. Gather from crafting grid (excluding output slot)
    const nextGrid = [...craftingGridRef.current];
    let gridChanged = false;
    for (let i = 0; i < nextGrid.length; i++) {
      if (nextGrid[i] && nextGrid[i].itemId === held.itemId) {
        const canTake = Math.min(nextGrid[i].count, spaceNeeded - gathered);
        if (canTake > 0) {
          gridChanged = true;
          gathered += canTake;
          if (nextGrid[i].count > canTake) {
            nextGrid[i] = { ...nextGrid[i], count: nextGrid[i].count - canTake };
          } else {
            nextGrid[i] = null;
          }
          if (gathered >= spaceNeeded) break;
        }
      }
    }

    // 2. Gather from main inventory and hotbar
    const nextInv = [...inventoryRef.current];
    let invChanged = false;
    if (gathered < spaceNeeded) {
      for (let i = 0; i < nextInv.length; i++) {
        if (nextInv[i] && nextInv[i].itemId === held.itemId) {
          const canTake = Math.min(nextInv[i].count, spaceNeeded - gathered);
          if (canTake > 0) {
            invChanged = true;
            gathered += canTake;
            if (nextInv[i].count > canTake) {
              nextInv[i] = { ...nextInv[i], count: nextInv[i].count - canTake };
            } else {
              nextInv[i] = null;
            }
            if (gathered >= spaceNeeded) break;
          }
        }
      }
    }

    // 3. Commit state changes atomically
    if (gridChanged) {
      craftingGridRef.current = nextGrid;
      setCraftingGrid(nextGrid);
    }
    if (invChanged) {
      inventoryRef.current = nextInv;
      setInventory(nextInv);
    }

    if (gathered > 0) {
      playItemClickSound();
      const updatedHeld = { ...held, count: held.count + gathered };
      heldItemRef.current = updatedHeld;
      setHeldItem(updatedHeld);
    }
  };

  // Generalized slot mousedown handler: handles click-to-pick, click-to-place, right-click, shift-click
  const handleSlotMouseDown = (e, slotType, index) => {
    hideTooltip();
    if (e && e.preventDefault && e.cancelable !== false) e.preventDefault();
    const isRightClick = e ? e.button === 2 : false;
    const isShiftClick = Boolean(e && e.shiftKey);
    const currentItem = getSlotValue(slotType, index);
    const held = heldItemRef.current;

    // Shift click
    if (isShiftClick && currentItem && !held) {
      handleShiftClick(slotType, index, currentItem);
      return;
    }

    // RIGHT CLICK
    if (isRightClick) {
      // If holding an item: initiate continuous right-drag multi-item dispensing
      if (held) {
        isRightMouseDownRef.current = true;
        handleRmbSlotHover(slotType, index);
        return;
      }

      // Empty hand right click on slot with item: split half stack into hand
      if (currentItem) {
        playItemClickSound();
        if (currentItem.count > 1) {
          const takeCount = Math.ceil(currentItem.count / 2);
          const remainCount = currentItem.count - takeCount;
          const nextHeld = { ...currentItem, count: takeCount };
          heldItemRef.current = nextHeld;
          setHeldItem(nextHeld);
          setSlotValue(slotType, index, { ...currentItem, count: remainCount });
        } else {
          heldItemRef.current = currentItem;
          setHeldItem(currentItem);
          setSlotValue(slotType, index, null);
        }
        return;
      }
      return;
    }

    // LEFT CLICK / TOUCH TAP
    isLeftMouseDownRef.current = true;
    hasGatheredRef.current = false;

    // Fast Double-Click detection on mousedown (e.detail >= 2) to eliminate click race conditions
    if (e && e.detail >= 2 && held) {
      handleSlotDoubleClick(slotType, index);
      mouseDownOriginRef.current = null;
      return;
    }

    // CASE 1: No item held on cursor -> Pick up item
    if (!held) {
      if (!currentItem) return;
      playItemClickSound();
      heldItemRef.current = currentItem;
      setHeldItem(currentItem);
      setSlotValue(slotType, index, null);
      mouseDownOriginRef.current = { slotType, index, pickedUpNow: true };
      return;
    }

    // CASE 2: Item is held on cursor -> Validate slot type restrictions
    if (
      slotType === 'bottle' &&
      !held.isPotion &&
      held.itemId !== 'water_bottle' &&
      held.itemId !== 'glass_bottle'
    ) {
      return;
    }
    if (slotType === 'fuel' && held.itemId !== 'blaze_powder') {
      return;
    }
    if (slotType === 'ingredient' && !VALID_BREWING_REAGENTS.has(held.itemId)) {
      return;
    }

    playItemClickSound();
    mouseDownOriginRef.current = null; // Clear so subsequent mouseUp doesn't re-fire

    // 2A. Target slot is empty
    if (!currentItem) {
      if (slotType === 'bottle') {
        setSlotValue(slotType, index, { ...held, count: 1 });
        const nextCount = held.count - 1;
        const nextHeld = nextCount > 0 ? { ...held, count: nextCount } : null;
        heldItemRef.current = nextHeld;
        setHeldItem(nextHeld);
        return;
      }

      // Place entire held stack
      setSlotValue(slotType, index, held);
      heldItemRef.current = null;
      setHeldItem(null);
      return;
    }

    // 2B. Target slot has matching item & is stackable (and not bottle slot)
    if (currentItem.itemId === held.itemId && (currentItem.maxStack || 64) > 1 && slotType !== 'bottle') {
      const space = (currentItem.maxStack || 64) - currentItem.count;
      if (space > 0) {
        const toAdd = Math.min(space, held.count);
        setSlotValue(slotType, index, { ...currentItem, count: currentItem.count + toAdd });
        const remaining = held.count - toAdd;
        const nextHeld = remaining > 0 ? { ...held, count: remaining } : null;
        heldItemRef.current = nextHeld;
        setHeldItem(nextHeld);
      } else {
        // Swap if already full
        setSlotValue(slotType, index, held);
        heldItemRef.current = currentItem;
        setHeldItem(currentItem);
      }
      return;
    }

    // 2C. Target slot has different item (Left click swaps)
    if (slotType === 'bottle') {
      if (held.count === 1) {
        setSlotValue(slotType, index, held);
        heldItemRef.current = currentItem;
        setHeldItem(currentItem);
      }
    } else {
      setSlotValue(slotType, index, held);
      heldItemRef.current = currentItem;
      setHeldItem(currentItem);
    }
  };

  handleSlotMouseDownRef.current = handleSlotMouseDown;

  // Touch start handler for mobile devices
  const handleSlotTouchStart = (e, slotType, index) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      setMousePos({ x: touch.clientX, y: touch.clientY });
      touchStartOriginRef.current = { slotType, index, x: touch.clientX, y: touch.clientY };

      const currentItem = getSlotValue(slotType, index);
      const held = heldItemRef.current;

      // If hand is empty and slot has an item: pick it up!
      if (!held && currentItem) {
        if (e.cancelable) e.preventDefault();
        playItemClickSound();
        heldItemRef.current = currentItem;
        setHeldItem(currentItem);
        setSlotValue(slotType, index, null);
        return;
      }

      // If hand has an item and slot was touched: execute deposit/swap
      if (held) {
        if (e.cancelable) e.preventDefault();
        handleSlotMouseDown(e, slotType, index);
      }
    }
  };

  // Mouse up handler: finish drag gestures or glide-deposit
  const handleSlotMouseUp = (e, slotType, index) => {
    if (e.button === 2) {
      isRightMouseDownRef.current = false;
      stopRmbDispensing();
    } else if (e.button === 0) {
      isLeftMouseDownRef.current = false;
      currentLeftDragSlotRef.current = null;
    }
    if (
      !hasGatheredRef.current &&
      mouseDownOriginRef.current &&
      mouseDownOriginRef.current.pickedUpNow &&
      (mouseDownOriginRef.current.slotType !== slotType || mouseDownOriginRef.current.index !== index) &&
      heldItemRef.current
    ) {
      handleSlotMouseDown(e, slotType, index);
    }
    mouseDownOriginRef.current = null;
    hasGatheredRef.current = false;
  };

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
      if (heldItemRef.current || isRightMouseDownRef.current || isLeftMouseDownRef.current) {
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
    [getSlotTooltipData, showTooltip, hideTooltip]
  );

  // Background click: safely return held item to inventory
  const handleBackgroundClick = (e) => {
    if (
      heldItem &&
      !e.target.closest('.mc-slot') &&
      !e.target.closest('.invslot') &&
      !e.target.closest('button')
    ) {
      playItemClickSound();
      placeInInventory(heldItem);
      setHeldItem(null);
    }
  };

  return (
    <div className="mc-workbench-viewport-scaler">
      <div
        className="mc-brewing-workbench"
        id="mc-workbench"
        onContextMenu={(e) => e.preventDefault()}
        onClick={handleBackgroundClick}
      >
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
                onMouseDown={(e) => handleSlotMouseDown(e, 'fuel', 0)}
                onMouseUp={(e) => handleSlotMouseUp(e, 'fuel', 0)}
                onTouchStart={(e) => handleSlotTouchStart(e, 'fuel', 0)}
                onDoubleClick={() => handleSlotDoubleClick('fuel', 0)}
                onMouseEnter={(e) => {
                  handleSlotHover('fuel', 0, fuelSlot);
                  if (heldItemRef.current) {
                    if (isRightMouseDownRef.current || (e.buttons & 2) === 2) {
                      handleRmbSlotHover('fuel', 0);
                    } else if (isLeftMouseDownRef.current || (e.buttons & 1) === 1) {
                      handleLmbSlotHover('fuel', 0);
                    }
                  }
                }}
                onMouseLeave={() => handleSlotMouseLeave('fuel', 0)}
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
                onMouseDown={(e) => handleSlotMouseDown(e, 'ingredient', 0)}
                onMouseUp={(e) => handleSlotMouseUp(e, 'ingredient', 0)}
                onTouchStart={(e) => handleSlotTouchStart(e, 'ingredient', 0)}
                onDoubleClick={() => handleSlotDoubleClick('ingredient', 0)}
                onMouseEnter={(e) => {
                  handleSlotHover('ingredient', 0, brewingIngredient);
                  if (heldItemRef.current) {
                    if (isRightMouseDownRef.current || (e.buttons & 2) === 2) {
                      handleRmbSlotHover('ingredient', 0);
                    } else if (isLeftMouseDownRef.current || (e.buttons & 1) === 1) {
                      handleLmbSlotHover('ingredient', 0);
                    }
                  }
                }}
                onMouseLeave={() => handleSlotMouseLeave('ingredient', 0)}
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
                onMouseEnter={() => handleSlotHover('arrow', 0, null)}
                onMouseLeave={hideTooltip}
              >
                <span className="mcui-arrow"><br /></span>
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
                    onMouseDown={(e) => handleSlotMouseDown(e, 'bottle', idx)}
                    onMouseUp={(e) => handleSlotMouseUp(e, 'bottle', idx)}
                    onTouchStart={(e) => handleSlotTouchStart(e, 'bottle', idx)}
                    onDoubleClick={() => handleSlotDoubleClick('bottle', idx)}
                    onMouseEnter={(e) => {
                      handleSlotHover('bottle', idx, bottle);
                      if (heldItemRef.current) {
                        if (isRightMouseDownRef.current || (e.buttons & 2) === 2) {
                          handleRmbSlotHover('bottle', idx);
                        } else if (isLeftMouseDownRef.current || (e.buttons & 1) === 1) {
                          handleLmbSlotHover('bottle', idx);
                        }
                      }
                    }}
                    onMouseLeave={() => handleSlotMouseLeave('bottle', idx)}
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
                    onMouseDown={(e) => handleSlotMouseDown(e, 'crafting', idx)}
                    onMouseUp={(e) => handleSlotMouseUp(e, 'crafting', idx)}
                    onTouchStart={(e) => handleSlotTouchStart(e, 'crafting', idx)}
                    onDoubleClick={() => handleSlotDoubleClick('crafting', idx)}
                    onMouseEnter={(e) => {
                      handleSlotHover('crafting', idx, slotItem);
                      if (heldItemRef.current) {
                        if (isRightMouseDownRef.current || (e.buttons & 2) === 2) {
                          handleRmbSlotHover('crafting', idx);
                        } else if (isLeftMouseDownRef.current || (e.buttons & 1) === 1) {
                          handleLmbSlotHover('crafting', idx);
                        }
                      }
                    }}
                    onMouseLeave={() => handleSlotMouseLeave('crafting', idx)}
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
                  onMouseDown={handleCraftOutputClick}
                  onClick={handleCraftOutputClick}
                  onTouchStart={handleCraftOutputClick}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleCraftOutputClick(e);
                  }}
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
                onMouseDown={(e) => handleSlotMouseDown(e, 'inventory', idx)}
                onMouseUp={(e) => handleSlotMouseUp(e, 'inventory', idx)}
                onTouchStart={(e) => handleSlotTouchStart(e, 'inventory', idx)}
                onDoubleClick={() => handleSlotDoubleClick('inventory', idx)}
                onMouseEnter={(e) => {
                  handleSlotHover('inventory', idx, slotItem);
                  if (heldItemRef.current) {
                    if (isRightMouseDownRef.current || (e.buttons & 2) === 2) {
                      handleRmbSlotHover('inventory', idx);
                    } else if (isLeftMouseDownRef.current || (e.buttons & 1) === 1) {
                      handleLmbSlotHover('inventory', idx);
                    }
                  }
                }}
                onMouseLeave={() => handleSlotMouseLeave('inventory', idx)}
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
                  onMouseDown={(e) => handleSlotMouseDown(e, 'inventory', actualIdx)}
                  onMouseUp={(e) => handleSlotMouseUp(e, 'inventory', actualIdx)}
                  onTouchStart={(e) => handleSlotTouchStart(e, 'inventory', actualIdx)}
                  onDoubleClick={() => handleSlotDoubleClick('inventory', actualIdx)}
                  onMouseEnter={(e) => {
                    handleSlotHover('inventory', actualIdx, slotItem);
                    if (heldItemRef.current) {
                      if (isRightMouseDownRef.current || (e.buttons & 2) === 2) {
                        handleRmbSlotHover('inventory', actualIdx);
                      } else if (isLeftMouseDownRef.current || (e.buttons & 1) === 1) {
                        handleLmbSlotHover('inventory', actualIdx);
                      }
                    }
                  }}
                  onMouseLeave={() => handleSlotMouseLeave('inventory', actualIdx)}
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
        {heldItem && (
          <div
            className="mc-floating-held-item"
            style={{ left: mousePos.x, top: mousePos.y }}
          >
            <img src={heldItem.sprite} alt={heldItem.name} />
            {heldItem.count > 1 && (
              <span className="mc-held-count">{heldItem.count}</span>
            )}
          </div>
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
  );
}
