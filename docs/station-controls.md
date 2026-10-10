# Brewing and crafting controls

## Desktop

- Left click: take, place, merge or swap a stack.
- Right click: take the larger half of a stack; place one held item.
- Taking and placing with a click update immediately on button press. Releasing
  the button does not repeat the placement. Right-button drag visits each slot
  once; left-button distribution updates visibly as new compatible slots join.
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

The mobile window is a separate full-viewport layout with inventory/recipe tabs
on the left and brewing and crafting visible side by side on the right. Touching
either workstation selects it as the destination for quick transfers; the heading
buttons also select that destination. Crafting has larger grid slots and its result
below the grid. The crafting area scrolls when vertical space is limited. It does not shrink the desktop
window. All 72 inventory slots are on one scrollable page; scrolling reveals the
remaining rows, and slot size can be changed in settings.

- Tap a source, then a destination to move the stack. Items remain at the source
  until a valid destination is chosen. Crafting-grid destinations receive one item.
- Hold a stack to choose a quantity with a slider, one/half/all shortcuts, then tap
  a destination. Cancelling a touch or dialog never removes items.
- Double tap to quick-transfer to the current workstation; tap workstation slots
  twice to return items to inventory. This can be disabled in settings.
- Drag a selected source across crafting cells to distribute one per visited cell.
- Tap a recipe to fill its grid from inventory plus the existing grid. Filling is
  transactional: missing ingredients or insufficient return space leave items intact.
- Tap the crafting result to create one batch directly into inventory. Hold it for
  700 ms to start repeated crafting, one batch every 250 ms, matching Bedrock's
  documented hold-to-craft timing. Selected recipes refill until materials run out.
  Full inventory stops crafting before consuming ingredients. Pointer cancellation,
  selecting the other workstation, closing the window, or losing focus stops repetition.
- Settings persist locally: slot size, hold delay, stack splitting, quick transfer,
  and recipe book visibility. The settings and split dialogs trap keyboard focus.

Timing reference: https://feedback.minecraft.net/hc/en-us/articles/19545277817357-Minecraft-1-20-30-Bedrock

The application retains its combined crafting/brewing station and 72-slot supply
inventory. These are application layouts, rather than separate vanilla screens.

On page load, each supply gets a random total within its configured range.
Stacks are split into random amounts and placed in random slots. Gold ingots
and blaze rods always occupy at least two separate stacks; other supplies may
also be split. At least 12 slots remain free. Item quantities do not reroll while
using the station or opening/closing the mobile panel. A random roll may repeat
a previous quantity.

## Vanilla behavior and asset provenance

The brewing arrow uses lossless SVG rectangles from the matching 16×56 empty/full
sprites and clips the full shape from top to bottom in 28 steps. Card arrows use
the same conversion of their 18×57 sprite. Both render with crisp edges at the
final size rather than resampling PNG textures. Cards keep their position on
hover; their shadow still transitions. The enlarged modal stand uses layout zoom
instead of a transformed compositor layer. The 20-second brewing cycle uses 50ms updates.
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
- Mobile at 390×844 and 640×360: full-viewport layout, recipe autofill, golden-carrot
  result tap and hold, stack splitting (8 into 4+4), and persisted slot-size setting.
- Landscape layout at 640×360: station and controls fit within the viewport.
- SVG arrows and stand edges: desktop at DPR 1.25, hover without positional
  transform, enlarged potion modal, and mobile landscape at DPR 1. Brewing
  progress at 62% clips the SVG fill at 34 of 56 pixels. The in-app browser
  cannot directly change browser zoom; reduced desktop zoom needs a manual check.
- Browser checks exercise the responsive touch control path with pointer clicks.
  Physical touch input and OS orientation locking still require a real phone.
