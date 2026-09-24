import React from 'react';
import { TooltipTrigger } from './MinecraftTooltip';
import { BREWING_STAND_DATA } from '../data/brewingStandData';
import { WIKI_REAGENTS } from '../data/wikiTooltipsData';

export default function BrewingStandWidget({ potion, inModal = false }) {
  if (!potion) return null;

  // Retrieve exact recipe data from Ukrainian Minecraft Wiki dataset
  const wikiData = BREWING_STAND_DATA[potion.id];

  const reagentTitle = wikiData?.reagent?.title || potion.ingredient || 'Незерський наріст';
  const reagentLocalSrc = wikiData?.reagent?.localSrc || potion.ingredientSprite || '/items/nether_wart.png';
  const reagentWikiSrc = wikiData?.reagent?.wikiSrc;

  // Reagent wiki metadata from be.html (only title, plus lore only for turtle shell)
  const reagentMeta = WIKI_REAGENTS[reagentTitle] || {
    title: reagentTitle
  };

  // Outputs from wiki data or fallback
  const output1 = wikiData?.output1;
  const output2 = wikiData?.output2 || (!wikiData?.output1 && !wikiData?.output3 ? {
    title: potion.base || 'Незграбне зілля',
    localSrc: potion.baseSprite || '/items/water_bottle.png',
    text: '&7Немає ефектів'
  } : null);
  const output3 = wikiData?.output3;

  const renderSlot = (slotData, slotClass, defaultLabel) => {
    if (slotData) {
      return (
        <TooltipTrigger
          title={slotData.title}
          lore={slotData.text || '&7Немає ефектів'}
        >
          <span className={`invslot ${slotClass}`}>
            <span
              className="invslot-item invslot-item-image"
              data-minetip-title={slotData.title}
              data-minetip-text={slotData.text || '&7Немає ефектів'}
            >
              <span typeof="mw:File">
                <img
                  alt={slotData.title}
                  src={slotData.localSrc || slotData.wikiSrc}
                  onError={(e) => {
                    if (slotData.localSrc && e.currentTarget.src !== slotData.localSrc) {
                      e.currentTarget.src = slotData.localSrc;
                    }
                  }}
                  width="32"
                  height="32"
                  className="mw-file-element"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </span>
          </span>
        </TooltipTrigger>
      );
    }

    // Empty slot with Minecraft Wiki bottle watermark
    return (
      <span className={`invslot ${slotClass}`} />
    );
  };

  return (
    <div className={`card-brewing-stand-box ${inModal ? 'in-modal-stand' : ''}`}>
      <div>
        <span className="mcui mcui-Brewing_Stand pixel-image">
          {/* Top Input Row: Bubbling + Reagent Slot + Downward Arrow */}
          <span className="mcui-input">
            <span className="mcui-bubbling"><br /></span>

            <TooltipTrigger
              title={reagentMeta.title}
              lore={reagentMeta.lore}
            >
              <span className="invslot">
                <span
                  className="invslot-item invslot-item-image"
                  data-minetip-title={reagentMeta.title}
                >
                  <span typeof="mw:File">
                    <img
                      alt={reagentMeta.title}
                      src={reagentLocalSrc}
                      onError={(e) => {
                        if (reagentWikiSrc && e.currentTarget.src !== reagentWikiSrc) {
                          e.currentTarget.src = reagentWikiSrc;
                        }
                      }}
                      width="32"
                      height="32"
                      className="mw-file-element"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </span>
              </span>
            </TooltipTrigger>

            <span className="mcui-arrow"><br /></span>
          </span>

          {/* Connecting Branching Pipes */}
          <span className="mcui-paths"><br /></span>

          {/* Bottom Output Row: 3 Bottle Slots from Wiki Table */}
          <span className="mcui-output">
            {renderSlot(output1, 'mcui-output1', 'Порожній слот')}
            {renderSlot(output2, 'mcui-output2', output2?.title || 'Порожній слот')}
            {renderSlot(output3, 'mcui-output3', 'Порожній слот')}
          </span>
        </span>
      </div>
    </div>
  );
}
