import React from 'react';
import MinecraftHearts from './MinecraftHearts';

/**
 * Formats a description text with authentic Minecraft Wiki heart icons,
 * exactly matching the style and formatting in be.html.
 */
export default function PotionDescriptionContent({ potionId, description, compact = false }) {
  switch (potionId) {
    case 'healing':
      return (
        <span className="wiki-effect-desc">
          <b>Миттєве зцілення:</b> Відновлює 4 <MinecraftHearts count={2} label="2 серця" />.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Миттєве зцілення II: Відновлює 8 <MinecraftHearts count={4} label="4 серця" />.
            </>
          )}
        </span>
      );

    case 'regeneration':
      return (
        <span className="wiki-effect-desc">
          <b>Регенерація:</b> Відновлює <MinecraftHearts half={1} label="0.5 серця" /> кожні 2.5 секунд.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Регенерація II: Відновлює <MinecraftHearts half={1} label="0.5 серця" /> кожні 1.25 секунд.
            </>
          )}
        </span>
      );

    case 'strength':
      return (
        <span className="wiki-effect-desc">
          <b>Сила:</b> Збільшує шкоду від атаки гравця в ближньому бою на 3 <MinecraftHearts count={1} half={1} label="1.5 серця" />.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Сила II: Збільшує шкоду від атаки на 6 <MinecraftHearts count={3} label="3 серця" />.
            </>
          )}
        </span>
      );

    case 'poison':
      return (
        <span className="wiki-effect-desc">
          <b>Отруєння:</b> Зменшує здоров’я на 1 <MinecraftHearts type="poison" half={1} label="0.5 серця" /> кожні 1.25 секунди.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Отруєння II: Зменшує здоров’я на 1 <MinecraftHearts type="poison" half={1} label="0.5 серця" /> кожні 0.6 секунди.
            </>
          )}
        </span>
      );

    case 'weakness':
      return (
        <span className="wiki-effect-desc">
          <b>Слабкість:</b> Зменшує шкоду від атаки гравця в ближньому бою на 4 <MinecraftHearts count={2} label="2 серця" />.
          {!compact && (
            <>
              <br />
              Можна використовувати в поєднанні з золотим яблуком для лікування зомбоселян.
            </>
          )}
        </span>
      );

    case 'harming':
      return (
        <span className="wiki-effect-desc">
          <b>Миттєва шкода:</b> Наносить 6 <MinecraftHearts count={3} label="3 серця" /> шкоди.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Миттєва шкода II: Наносить 12 <MinecraftHearts count={6} label="6 сердець" /> шкоди.
            </>
          )}
        </span>
      );

    case 'fire_resistance':
      return (
        <span className="wiki-effect-desc">
          <b>Вогнестійкість:</b> Дає імунітет до шкоди від вогню, лави, магматичних блоків, багаття і вогняних куль пломенів.
        </span>
      );

    case 'swiftness':
      return (
        <span className="wiki-effect-desc">
          <b>Швидкість:</b> Збільшує швидкість пересування, швидкість бігу та довжину стрибків на 20 %.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Швидкість II: Збільшує швидкість пересування, швидкість бігу та довжину стрибків на 40 %.
            </>
          )}
        </span>
      );

    case 'night_vision':
      return (
        <span className="wiki-effect-desc">
          <b>Нічне бачення:</b> Робить так, щоб все виглядало з максимальним рівнем освітлення, включно з підводними ділянками.
        </span>
      );

    case 'invisibility':
      return (
        <span className="wiki-effect-desc">
          <b>Невидимість:</b> Робить гравця невидимим. Екіпіровані предмети залишаються видимими.
        </span>
      );

    case 'water_breathing':
      return (
        <span className="wiki-effect-desc">
          <b>Водяне дихання:</b> Запобігає виснаженню кисню під водою.
        </span>
      );

    case 'leaping':
      return (
        <span className="wiki-effect-desc">
          <b>Стрибучість:</b> Збільшує висоту стрибка на 50 %.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Стрибучість II: Збільшує висоту стрибка удвічі.
            </>
          )}
        </span>
      );

    case 'slow_falling':
      return (
        <span className="wiki-effect-desc">
          <b>Повільне падіння:</b> Швидкість і прискорення падіння значно зменшуються, а шкода при падінні повністю скидається.
        </span>
      );

    case 'slowness':
      return (
        <span className="wiki-effect-desc">
          <b>Повільність:</b> Зменшує швидкість руху на 15 %.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Повільність IV: Зменшує швидкість руху на 60 %.
            </>
          )}
        </span>
      );

    case 'oozing':
      return (
        <span className="wiki-effect-desc">
          <b>Слизькість:</b> У разі смерти спавнить двох слимаків 2-го розміру поруч.
        </span>
      );

    case 'weaving':
      return (
        <span className="wiki-effect-desc">
          <b>Плетіння:</b> Спавнить 2-3 павутиння поруч при смерті; подвоює швидкість руху по павутинні (з 25 % на 50 %).
        </span>
      );

    case 'infestation':
      return (
        <span className="wiki-effect-desc">
          <b>Зараження:</b> Дає 10% шанс спавну 1-3 лусочниць при отриманні шкоди.
        </span>
      );

    case 'wind_charging':
      return (
        <span className="wiki-effect-desc">
          <b>Заряд вітру:</b> При смерті створює вибух вітру, подібний до заряду вітру.
        </span>
      );

    case 'turtle_master':
      return (
        <span className="wiki-effect-desc">
          <b>Повільність IV, Стійкість III:</b> Зменшує швидкість руху на 60 % і зменшує вхідну шкоду на 60 %.
          {!compact && (
            <>
              <br />
              <b>Посилене:</b> Повільність VI, Стійкість IV: Зменшує швидкість руху на 90 % і зменшує вхідну шкоду на 80 %.
            </>
          )}
        </span>
      );

    default:
      return <span>{description}</span>;
  }
}
