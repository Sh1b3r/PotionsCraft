import { useEffect, useRef, useState } from 'react';

const keyOf = slot => slot && `${slot.type}:${slot.index}`;

// Pocket selection stays in its source slot. Items move only after a destination
// is chosen, so scrolling, cancelled touches and the split dialog cannot lose them.
export default function usePocketInventory({ enabled, getSlot, setSlot, accepts, limit, sameStack, quickMove, onGridChange, settings }) {
  const [selection, setSelection] = useState(null);
  const selectedRef = useRef(null);
  const [split, setSplit] = useState(null);
  const pressRef = useRef(null);
  const lastTap = useRef(null);
  const actionsRef = useRef(null);
  const choose = next => { selectedRef.current = next; setSelection(next); };
  const clear = () => { choose(null); setSplit(null); lastTap.current = null; };
  const cancelPress = () => {
    clearTimeout(pressRef.current?.timer);
    pressRef.current = null;
  };
  const move = (target, requested) => {
    const source = selectedRef.current;
    if (!source || keyOf(source) === keyOf(target)) return false;
    const item = getSlot(source.type, source.index);
    const destination = getSlot(target.type, target.index);
    if (!item) { choose(null); return false; }
    if (!accepts(target.type, item)) return false;
    const amount = Math.min(item.count, source.count, requested ?? (target.type === 'crafting' ? 1 : source.count));
    if (destination && !sameStack(item, destination)) {
      if (amount !== item.count || amount > limit(target.type, item) || !accepts(source.type, destination) || destination.count > limit(source.type, destination)) return false;
      setSlot(source.type, source.index, destination);
      setSlot(target.type, target.index, item);
      choose(null);
    } else {
      const count = Math.min(amount, limit(target.type, item) - (destination?.count || 0));
      if (count <= 0) return false;
      setSlot(source.type, source.index, item.count > count ? { ...item, count: item.count - count } : null);
      setSlot(target.type, target.index, { ...item, count: (destination?.count || 0) + count });
      choose(source.count > count && item.count > count ? { ...source, count: Math.min(source.count - count, item.count - count) } : null);
    }
    if (source.type === 'crafting' || target.type === 'crafting') onGridChange();
    return true;
  };
  const tap = slot => {
    const item = getSlot(slot.type, slot.index);
    const source = selectedRef.current;
    const now = Date.now();
    if (source && keyOf(source) === keyOf(slot)) {
      if (settings.doubleTap && lastTap.current?.key === keyOf(slot) && now - lastTap.current.time < 350) {
        choose(null); quickMove(slot.type, slot.index); onGridChange();
      } else choose(null);
    } else if (!source) {
      choose(item ? { ...slot, count: item.count } : null);
    } else move(slot);
    lastTap.current = { key: keyOf(slot), time: now };
  };
  const events = (type, index) => {
    const slot = { type, index };
    return {
      'data-selected': keyOf(selection) === keyOf(slot),
      onContextMenu: event => event.preventDefault(),
      onPointerDown: event => {
        if (event.button !== 0 || !enabled || pressRef.current) return;
        event.stopPropagation();
        const press = { pointerId: event.pointerId, slot, x: event.clientX, y: event.clientY,
          visited: new Set(), dragged: false, held: false, moved: false,
          selectionBefore: selectedRef.current };
        pressRef.current = press;
        const item = getSlot(type, index);
        if (item && settings.splitControl && item.count > 1) {
          press.timer = setTimeout(() => {
            if (pressRef.current !== press || press.dragged) return;
            const current = getSlot(type, index);
            if (!current) return;
            press.held = true;
            choose({ ...slot, count: current.count });
            setSplit(slot);
          }, settings.holdDelay);
        }
      },
      onClick: event => { if (event.detail === 0) tap(slot); },
    };
  };
  actionsRef.current = { tap, move, choose, getSlot };
  useEffect(() => {
    if (!enabled) { cancelPress(); clear(); return; }
    const pointerMove = event => {
      const press = pressRef.current;
      if (!press || press.pointerId !== event.pointerId || press.held) return;
      if (!press.dragged && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 10) return;
      clearTimeout(press.timer);
      if (!press.dragged) {
        press.dragged = true;
        if (!selectedRef.current) {
          const item = actionsRef.current.getSlot(press.slot.type, press.slot.index);
          if (item) actionsRef.current.choose({ ...press.slot, count: item.count });
        }
      }
      const element = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot-index]');
      if (element?.dataset.slotType === 'crafting') {
        const target = { type: 'crafting', index: Number(element.dataset.slotIndex) };
        if (!press.visited.has(keyOf(target))) {
          press.visited.add(keyOf(target));
          if (actionsRef.current.move(target, 1)) press.moved = true;
        }
      }
    };
    const pointerEnd = event => {
      const press = pressRef.current;
      if (!press || press.pointerId !== event.pointerId) return;
      cancelPress();
      if (event.type === 'pointercancel') {
        if (press.dragged && !press.moved) actionsRef.current.choose(press.selectionBefore);
        return;
      }
      if (press.held) return;
      if (!press.dragged) actionsRef.current.tap(press.slot);
      else {
        const element = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot-index]');
        if (element) {
          const target = { type: element.dataset.slotType, index: Number(element.dataset.slotIndex) };
          if (target.type !== 'crafting' || !press.visited.has(keyOf(target))) {
            if (actionsRef.current.move(target, target.type === 'crafting' ? 1 : undefined)) press.moved = true;
          }
        }
        if (!press.moved) actionsRef.current.choose(press.selectionBefore);
      }
    };
    const blur = () => cancelPress();
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerEnd);
    window.addEventListener('pointercancel', pointerEnd);
    window.addEventListener('blur', blur);
    return () => {
      cancelPress(); window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerEnd); window.removeEventListener('pointercancel', pointerEnd); window.removeEventListener('blur', blur);
    };
  }, [enabled]);
  const collect = () => {
    const source = selectedRef.current;
    const item = source && getSlot(source.type, source.index);
    if (!item) return;
    const max = limit(source.type, item);
    let count = item.count;
    let gridChanged = false;
    // Keep the combined stack in its selected source slot. All transfers are
    // bounded by that slot's capacity and compare complete item variants.
    for (const [type, length] of [['inventory', 72], ['crafting', 9], ['fuel', 1], ['ingredient', 1]]) {
      for (let index = 0; index < length && count < max; index++) {
        if (type === source.type && index === source.index) continue;
        const target = getSlot(type, index);
        if (!sameStack(target, item)) continue;
        const amount = Math.min(target.count, max - count);
        setSlot(type, index, target.count > amount ? { ...target, count: target.count - amount } : null);
        count += amount;
        if (type === 'crafting') gridChanged = true;
      }
    }
    if (count === item.count) return;
    setSlot(source.type, source.index, { ...item, count });
    choose({ ...source, count });
    lastTap.current = null;
    if (gridChanged || source.type === 'crafting') onGridChange();
  };
  const item = selection && getSlot(selection.type, selection.index);
  const canCollect = !!item && limit(selection.type, item) > item.count &&
    [['inventory', 72], ['crafting', 9], ['fuel', 1], ['ingredient', 1]].some(([type, length]) =>
      Array.from({ length }, (_, index) => index).some(index =>
        (type !== selection.type || index !== selection.index) && sameStack(getSlot(type, index), item)));
  return { selection, item, events, clear, collect, canCollect, split, closeSplit: () => setSplit(null),
    splitCount: Math.min(selection?.count || 1, item?.count || 1),
    setCount: count => { if (selectedRef.current && item) choose({ ...selectedRef.current, count: Math.min(item.count, Math.max(1, count)) }); } };
}
