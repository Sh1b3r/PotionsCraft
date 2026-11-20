import React from 'react';
import MinecraftHearts from './MinecraftHearts';
import { useI18n } from '../i18n';

/**
 * Formats description text with authentic Minecraft Wiki heart icons,
 * localized exactly as in the official Minecraft game.
 */
export default function PotionDescriptionContent({ potionId, description, compact = false }) {
  const { lang } = useI18n();

  const isRu = lang === 'ru';
  const isEn = lang === 'en';

  switch (potionId) {
    case 'healing': {
      const label2 = isRu ? '2 сердца' : isEn ? '2 hearts' : '2 серця';
      const label4 = isRu ? '4 сердца' : isEn ? '4 hearts' : '4 серця';
      const restores = isRu ? 'Восстанавливает' : isEn ? 'Restores' : 'Відновлює';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      return (
        <span className="wiki-effect-desc">
          {restores} 4 <MinecraftHearts count={2} label={label2} prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {restores} 8{'\u00A0'}<MinecraftHearts count={4} label={label4} prefix="(" suffix=")." />
            </>
          )}
        </span>
      );
    }

    case 'regeneration': {
      const labelHalf = isRu ? '0.5 сердца' : isEn ? '0.5 heart' : '0.5 серця';
      const restores = isRu ? 'Восстанавливает' : isEn ? 'Restores' : 'Відновлює';
      const every = isRu ? 'каждые' : isEn ? 'every' : 'кожні';
      const s = isEn ? 's.' : 'с.';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      return (
        <span className="wiki-effect-desc">
          {restores} 1 <MinecraftHearts half={1} label={labelHalf} prefix="(" suffix=")" /> {every} 2.5 {s}
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {restores} 1 <MinecraftHearts half={1} label={labelHalf} prefix="(" suffix=")" /> {every} 1.25 {s}
            </>
          )}
        </span>
      );
    }

    case 'strength': {
      const label15 = isRu ? '1.5 сердца' : isEn ? '1.5 hearts' : '1.5 серця';
      const label3 = isRu ? '3 сердца' : isEn ? '3 hearts' : '3 серця';
      const text1 = isRu
        ? 'Увеличивает урон в ближнем бою на 3 '
        : isEn
          ? 'Increases melee damage by 3 '
          : 'Збільшує шкоду в ближньому бою на 3 ';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      const text2 = isRu ? 'Увеличивает урон на 6 ' : isEn ? 'Increases damage by 6 ' : 'Збільшує шкоду на 6 ';
      return (
        <span className="wiki-effect-desc">
          {text1}<MinecraftHearts count={1} half={1} label={label15} prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {text2}<MinecraftHearts count={3} label={label3} prefix="(" suffix=")." />
            </>
          )}
        </span>
      );
    }

    case 'poison': {
      const labelHalf = isRu ? '0.5 сердца' : isEn ? '0.5 heart' : '0.5 серця';
      const text1 = isRu
        ? 'Уменьшает здоровье на 1 '
        : isEn
          ? 'Deals 1 damage '
          : 'Зменшує здоров’я на 1 ';
      const every = isRu ? 'каждые' : isEn ? 'every' : 'кожні';
      const s = isEn ? 's.' : 'с.';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      return (
        <span className="wiki-effect-desc">
          {text1}<MinecraftHearts type="poison" half={1} label={labelHalf} prefix="(" suffix=")" /> {every} 1.25 {s}
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {text1}<MinecraftHearts type="poison" half={1} label={labelHalf} prefix="(" suffix=")" /> {every} 0.6 {s}
            </>
          )}
        </span>
      );
    }

    case 'weakness': {
      const label2 = isRu ? '2 сердца' : isEn ? '2 hearts' : '2 серця';
      const text1 = isRu
        ? 'Уменьшает урон в ближнем бою на 4 '
        : isEn
          ? 'Reduces melee damage by 4 '
          : 'Зменшує шкоду в ближньому бою на 4 ';
      const sub = isRu
        ? 'С золотым яблоком лечит зомби-жителей.'
        : isEn
          ? 'Cures zombie villagers with a golden apple.'
          : 'З золотим яблоком лікує зомбоселян.';
      return (
        <span className="wiki-effect-desc">
          {text1}<MinecraftHearts count={2} label={label2} prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              {sub}
            </>
          )}
        </span>
      );
    }

    case 'harming': {
      const label3 = isRu ? '3 сердца' : isEn ? '3 hearts' : '3 серця';
      const label6 = isRu ? '6 сердец' : isEn ? '6 hearts' : '6 сердець';
      const text1 = isRu ? 'Наносит 6 урона ' : isEn ? 'Deals 6 damage ' : 'Завдає 6 шкоди ';
      const text2 = isRu ? 'Наносит 12 урона ' : isEn ? 'Deals 12 damage ' : 'Завдає 12 шкоди ';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      return (
        <span className="wiki-effect-desc">
          {text1}<MinecraftHearts count={3} label={label3} prefix="(" suffix=")." />
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {text2}{'\u00A0'}<MinecraftHearts count={6} label={label6} prefix="(" suffix=")." />
            </>
          )}
        </span>
      );
    }

    case 'fire_resistance': {
      const text = isRu
        ? 'Даёт иммунитет к огню, лаве, магматическим блокам, кострам и шарам всполохов.'
        : isEn
          ? 'Gives immunity to fire, lava, magma blocks, campfires, and blaze fireballs.'
          : lang === 'de'
            ? 'Verleiht Immunität gegen Feuer, Lava, Magmablöcke, Lagerfeuer und Lohengeschosse.'
            : lang === 'fr'
              ? 'Immunise contre le feu, la lave, les blocs de magma, les feux de camp et les boules de blaze.'
              : lang === 'es'
                ? 'Otorga inmunidad al fuego, lava, bloques de magma, hogueras y bolas de fuego de blaze.'
                : 'Дає імунітет до вогню, лави, магматичних блоків, багаття та куль пломенів.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'swiftness': {
      const text1 = isRu
        ? 'Увеличивает скорость движения и прыжков на 20%.'
        : isEn
          ? 'Increases movement and jump speed by 20%.'
          : 'Збільшує швидкість бігу та стрибків на 20%.';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      const text2 = isRu
        ? 'Скорость увеличивается на 40%.'
        : isEn
          ? 'Speed increases by 40%.'
          : 'Швидкість збільшується на 40%.';
      return (
        <span className="wiki-effect-desc">
          {text1}
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {text2}
            </>
          )}
        </span>
      );
    }

    case 'night_vision': {
      const text = isRu
        ? 'Максимальный уровень освещения для всего, включая подводный мир.'
        : isEn
          ? 'Maximum brightness level for everything, including underwater.'
          : 'Максимальний рівень освітлення для всього, включно з водою.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'invisibility': {
      const text = isRu
        ? 'Делает игрока невидимым (экипированные вещи остаются видимыми).'
        : isEn
          ? 'Makes player invisible (equipped armor and held items remain visible).'
          : 'Робить гравця невидимим (екіпіровані речі лишаються видимими).';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'water_breathing': {
      const text = isRu
        ? 'Предотвращает истощение кислорода под водой.'
        : isEn
          ? 'Prevents oxygen depletion while underwater.'
          : 'Запобігає виснаженню кисню під водою.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'leaping': {
      const text1 = isRu
        ? 'Увеличивает высоту прыжка на 50%.'
        : isEn
          ? 'Increases jump height by 50%.'
          : 'Збільшує висоту стрибка на 50%.';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      const text2 = isRu
        ? 'Увеличивает высоту прыжка вдвое.'
        : isEn
          ? 'Doubles jump height.'
          : 'Збільшує висоту стрибка удвічі.';
      return (
        <span className="wiki-effect-desc">
          {text1}
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {text2}
            </>
          )}
        </span>
      );
    }

    case 'slow_falling': {
      const text = isRu
        ? 'Скорость падения снижена; урон от падения полностью снимается.'
        : isEn
          ? 'Fall speed slowed down; eliminates all fall damage.'
          : 'Швидкість падіння сповільнена; шкода від падіння повністю знімається.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'slowness': {
      const text1 = isRu
        ? 'Уменьшает скорость движения на 15%.'
        : isEn
          ? 'Reduces movement speed by 15%.'
          : 'Зменшує швидкість руху на 15%.';
      const upgraded = isRu ? 'Усиленное IV:' : isEn ? 'Upgraded IV:' : 'Посилене IV:';
      const text2 = isRu
        ? 'Уменьшает скорость движения на 60%.'
        : isEn
          ? 'Reduces movement speed by 60%.'
          : 'Зменшує швидкість руху на 60%.';
      return (
        <span className="wiki-effect-desc">
          {text1}
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {text2}
            </>
          )}
        </span>
      );
    }

    case 'oozing': {
      const text = isRu
        ? 'При смерти спавнит двух слизней 2-го размера рядом.'
        : isEn
          ? 'Spawns two medium slimes upon death.'
          : 'У разі смерті спавнить двох слимаків 2-го розміру поруч.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'weaving': {
      const text = isRu
        ? 'Спавнит 2-3 паутины при смерти; удваивает скорость сквозь паутину.'
        : isEn
          ? 'Spawns 2-3 cobwebs upon death; doubles movement speed through cobwebs.'
          : 'Спавнить 2-3 павутиння при смерті; подвоює швидкість у павутинні.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'infestation': {
      const text = isRu
        ? 'Даёт 10% шанс спавна 1-3 чешуйниц при получении урона.'
        : isEn
          ? '10% chance to spawn 1-3 silverfish when taking damage.'
          : 'Дає 10% шанс спавну 1-3 лусочниць при отриманні шкоди.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'wind_charging': {
      const text = isRu
        ? 'При смерти создаёт мощный ветряной взрыв.'
        : isEn
          ? 'Emits a burst of wind upon death.'
          : 'При смерті створює потужний вибух вітру.';
      return <span className="wiki-effect-desc">{text}</span>;
    }

    case 'turtle_master': {
      const text1 = isRu
        ? 'Уменьшает скорость на 60% и входящий урон на 60%.'
        : isEn
          ? 'Reduces movement speed by 60% and incoming damage by 60%.'
          : 'Зменшує швидкість на 60% і вхідну шкоду на 60%.';
      const upgraded = isRu ? 'Усиленное II:' : isEn ? 'Upgraded II:' : 'Посилене II:';
      const text2 = isRu
        ? 'Скорость -90%, входящий урон -80%.'
        : isEn
          ? 'Speed -90%, incoming damage -80%.'
          : 'Швидкість -90%, вхідна шкода -80%.';
      return (
        <span className="wiki-effect-desc">
          {text1}
          {!compact && (
            <>
              <br />
              <b>{upgraded}</b> {text2}
            </>
          )}
        </span>
      );
    }

    default: {
      const cleanDesc = description ? description.replace(/^[^:]+:\s*/, '') : '';
      return <span>{cleanDesc || description}</span>;
    }
  }
}
