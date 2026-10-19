import React from 'react';
import MinecraftHearts from './MinecraftHearts';

/**
 * Formats a description text with authentic Minecraft Wiki heart icons,
 * exactly matching the style and formatting in be.html, but without redundant
 * title prefixes since the card header already displays the potion/effect name.
 */
export default function PotionDescriptionContent({ potionId, description, compact = false }) {
  switch (potionId) {
    case 'healing':
      return (
        <span className="wiki-effect-desc">
          Відновлює 4 <MinecraftHearts count={2} label="2 серця" prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Відновлює 8{'\u00A0'}<MinecraftHearts count={4} label="4 серця" prefix="(" suffix=")." />
            </>
          )}
        </span>
      );

    case 'regeneration':
      return (
        <span className="wiki-effect-desc">
          Відновлює 1 <MinecraftHearts half={1} label="0.5 серця" prefix="(" suffix=")" /> кожні 2.5 с.
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Відновлює 1 <MinecraftHearts half={1} label="0.5 серця" prefix="(" suffix=")" /> кожні 1.25 с.
            </>
          )}
        </span>
      );

    case 'strength':
      return (
        <span className="wiki-effect-desc">
          Збільшує шкоду в ближньому бою на 3 <MinecraftHearts count={1} half={1} label="1.5 серця" prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Збільшує шкоду на 6 <MinecraftHearts count={3} label="3 серця" prefix="(" suffix=")." />
            </>
          )}
        </span>
      );

    case 'poison':
      return (
        <span className="wiki-effect-desc">
          Зменшує здоров’я на 1 <MinecraftHearts type="poison" half={1} label="0.5 серця" prefix="(" suffix=")" /> кожні 1.25 с.
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Зменшує здоров’я на 1 <MinecraftHearts type="poison" half={1} label="0.5 серця" prefix="(" suffix=")" /> кожні 0.6 с.
            </>
          )}
        </span>
      );

    case 'weakness':
      return (
        <span className="wiki-effect-desc">
          Зменшує шкоду в ближньому бою на 4 <MinecraftHearts count={2} label="2 серця" prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              З золотим яблуком лікує зомбоселян.
            </>
          )}
        </span>
      );

    case 'harming':
      return (
        <span className="wiki-effect-desc">
          Завдає 6 шкоди <MinecraftHearts count={3} label="3 серця" prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Завдає 12 шкоди{'\u00A0'}<MinecraftHearts count={6} label="6 сердець" prefix="(" suffix=")." />
            </>
          )}
        </span>
      );

    case 'fire_resistance':
      return (
        <span className="wiki-effect-desc">
          Дає імунітет до вогню, лави, магматичних блоків, багаття та куль пломенів.
        </span>
      );

    case 'swiftness':
      return (
        <span className="wiki-effect-desc">
          Збільшує швидкість бігу та стрибків на 20%.
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Швидкість збільшується на 40%.
            </>
          )}
        </span>
      );

    case 'night_vision':
      return (
        <span className="wiki-effect-desc">
          Максимальний рівень освітлення для всього, включно з водою.
        </span>
      );

    case 'invisibility':
      return (
        <span className="wiki-effect-desc">
          Робить гравця невидимим (екіпіровані речі лишаються видимими).
        </span>
      );

    case 'water_breathing':
      return (
        <span className="wiki-effect-desc">
          Запобігає виснаженню кисню під водою.
        </span>
      );

    case 'leaping':
      return (
        <span className="wiki-effect-desc">
          Збільшує висоту стрибка на 50%.
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Збільшує висоту стрибка удвічі.
            </>
          )}
        </span>
      );

    case 'slow_falling':
      return (
        <span className="wiki-effect-desc">
          Швидкість падіння сповільнена; шкода від падіння повністю знімається.
        </span>
      );

    case 'slowness':
      return (
        <span className="wiki-effect-desc">
          Зменшує швидкість руху на 15%.
          {!compact && (
            <>
              <br />
              <b>Посилене IV:</b> Зменшує швидкість руху на 60%.
            </>
          )}
        </span>
      );

    case 'oozing':
      return (
        <span className="wiki-effect-desc">
          У разі смерті спавнить двох слимаків 2-го розміру поруч.
        </span>
      );

    case 'weaving':
      return (
        <span className="wiki-effect-desc">
          Спавнить 2-3 павутиння при смерті; подвоює швидкість у павутинні.
        </span>
      );

    case 'infestation':
      return (
        <span className="wiki-effect-desc">
          Дає 10% шанс спавну 1-3 лусочниць при отриманні шкоди.
        </span>
      );

    case 'wind_charging':
      return (
        <span className="wiki-effect-desc">
          При смерті створює потужний вибух вітру.
        </span>
      );

    case 'turtle_master':
      return (
        <span className="wiki-effect-desc">
          Зменшує швидкість на 60% і вхідну шкоду на 60%.
          {!compact && (
            <>
              <br />
              <b>Посилене II:</b> Швидкість -90%, вхідна шкода -80%.
            </>
          )}
        </span>
      );

    default: {
      const cleanDesc = description ? description.replace(/^[^:]+:\s*/, '') : '';
      return <span>{cleanDesc || description}</span>;
    }
  }
}
