# Brewing and crafting controls

## Desktop

- Left click: take, place, merge or swap a stack.
- Right click: take the larger half of a stack; place one held item.
- Drag a held stack across compatible slots with the left button to divide it evenly;
  with the right button to place one item in each visited slot. Revisiting a slot
  during the same gesture does not add more items.
- Double click to collect matching items up to the stack limit.
- Shift click to transfer an item or craft as many complete batches as fit in storage.
- Keys 1–9 swap the hovered slot with the first nine hotbar slots.
- Escape or a click on the workstation background returns held items to storage.
  If storage is full, the remainder stays in hand.

## Touch

The page shows an Open button for narrow screens and devices with a coarse pointer.
Opening requests fullscreen and landscape orientation. Browsers which reject
orientation locking use a rotated landscape layout within the page instead.
Closing and reopening preserves the station, inventory and any held remainder.

- **По одному**: take a stack, then tap slots to place one item per tap.
- **Стопка**: take/place a whole stack; drag across slots to divide it evenly.
- **Половина**: take half a stack, then place it.
- **Перенести**: tap an item to quick-transfer it without a keyboard.
- **Створити все**: craft complete batches into available inventory space.
- **Повернути**: return the held item to available inventory space.

The application retains its combined crafting/brewing station and 72-slot supply
inventory. These are application layouts, rather than separate vanilla screens.

## Vanilla behavior and asset provenance

The brewing arrow uses matching 16×56 empty/full sprites and clips the full layer
from top to bottom in 28 steps. The 20-second brewing cycle uses 50ms updates.
One blaze powder supplies 20 charges; a cycle uses one charge at its start, processes
all convertible bottles, and consumes one ingredient at completion. Removing the
ingredient, changing its type, or removing all convertible bottles aborts the cycle.
Dragon breath returns an empty bottle; a full inventory leaves container returns
available for collection rather than deleting them or replacing the held item.

Potion conversions were checked against the `PotionBrewing` and
`PotionBrewing.Builder` constant-pool references in the official Java 1.21.1 client,
using Mojang's matching client mappings. No downloaded game code was executed.
In particular, strong swiftness/leaping have no fermented-eye conversion; long
poison becomes ordinary harming; the four 1.21 effect potions cannot be extended.

Item textures and crafting recipe provenance are recorded in
`public/items/VANILLA_TEXTURES.md`.

## Verification

- Production build: `npm run build`.
- Desktop at DPR 1.25: golden-carrot recipe by right clicking individual ingredients;
  brewing night vision, ingredient consumption and fuel charge at the start;
  dragging 16 bamboo across three slots yields 5+5+5 with one item left in hand.
- Mobile layout at 390×844: landscape fallback, individual ingredient placement,
  two golden carrots using the bulk craft button, and quick-transfer brewing.
- Landscape layout at 640×360: station and controls fit within the viewport.
- Browser checks exercise the responsive touch control path with pointer clicks.
  Physical touch input and OS orientation locking still require a real phone.
