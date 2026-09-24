import React from 'react';
import { TooltipTrigger } from './MinecraftTooltip';

const BASES_AND_MODIFIERS = [
  {
    name: 'Незерський наріст',
    anchor: 'Незерський_наріст',
    icon: '/items/nether_wart.png',
    tipText: null,
    tipTitle: null,
    waterName: 'Незграбне зілля',
    waterTip: '&7Немає ефектів',
    afterModifier: '—',
  },
  {
    name: 'Редстоуновий пил',
    anchor: 'Редстоуновий_пил',
    icon: '/items/redstone.png',
    tipText: null,
    tipTitle: null,
    waterName: 'Звичайне зілля',
    waterTip: '&7Немає ефектів',
    afterModifier: 'Подовжує тривалість зілля.',
  },
  {
    name: 'Світлокам\'яний пил',
    anchor: 'Світлокам\'яний_пил',
    icon: '/items/glowstone.png',
    tipText: null,
    tipTitle: null,
    waterName: 'Густе зілля',
    waterTip: '&7Немає ефектів',
    afterModifier: 'Збільшує рівень зілля.',
  },
  {
    name: 'Оброблене павуче око',
    anchor: 'Оброблене_павуче_око',
    icon: '/items/fermented_spider_eye.png',
    tipText: null,
    tipTitle: null,
    waterName: 'Зілля слабкости',
    waterTip: '&cСлабкість (1:30)',
    afterModifier: 'Змінює ефект зілля.',
  },
  {
    name: 'Порох',
    anchor: 'Порох',
    icon: '/items/gunpowder.png',
    tipText: null,
    tipTitle: null,
    waterName: 'Вибухова пляшка води',
    waterTip: '&7Немає ефектів',
    afterModifier: 'Перетворює зілля на вибухове зілля.',
  },
  {
    name: 'Дихання дракона',
    anchor: 'Дихання_дракона',
    icon: '/Dragon\'s_Breath_JE2_BE2.png',
    tipText: null,
    tipTitle: '&e',
    waterName: (
      <>
        <span className="wiki-potion-link">Осідальна пляшка води</span>
        <br />
        <small className="table-subtext">(із вибухової пляшки води)</small>
      </>
    ),
    waterTip: '&7Немає ефектів',
    afterModifier: 'Перетворює вибухове зілля в осідальне зілля.',
  },
];

export default function BaseModifiersTable() {
  return (
    <section className="wiki-section-container">
      <div className="wiki-section-header">
        <h2 className="wiki-section-title">Базові інгредієнти та модифікатори</h2>
      </div>

      <div className="wiki-section-intro">
        <p>
          <b>Базові інгредієнти</b> — це інгредієнти, які можна додавати безпосередньо до{' '}
          <b>пляшки води</b> і є початковою точкою для всіх зіллів.{' '}
          <b>Незерський наріст</b> є найголовнішим з базових інгредієнтів, оскільки необхідний для приготування переважної більшости зіллів.
        </p>
        <p>
          <b>Модифікатори</b> — це інгредієнти, які використовуються для зміни властивостей зілля або зміни ефекту зілля на інший.{' '}
          <b>Оброблене павуче око</b> унікальне тим, що це єдиний модифікатор, який може перетворити{' '}
          <b>пляшку води</b> безпосередньо на ефективне зілля.
        </p>
      </div>

      <div className="wiki-table-wrapper">
        <table className="wikitable minecraft-styled-table" style={{ textAlign: 'center' }} data-description="Bases and modifiers">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Значок</th>
              <th>Після додавання до пляшки води</th>
              <th>Після додавання як модифікатор</th>
            </tr>
          </thead>
          <tbody>
            {BASES_AND_MODIFIERS.map((row) => (
              <tr key={row.name}>
                <th scope="row" className="table-item-name">
                  <span className="anchor" id={row.anchor}></span>
                  <a href={`#${row.anchor}`} className="wiki-name-link">{row.name}</a>
                </th>
                <td className="table-icon-cell">
                  <TooltipTrigger
                    title={row.tipTitle ? `${row.tipTitle}${row.name}` : row.name}
                    lore={row.tipText}
                  >
                    <span className="invslot">
                      <span
                        className="invslot-item invslot-item-image"
                        data-minetip-title={row.tipTitle || undefined}
                        data-minetip-text={row.tipText || undefined}
                      >
                        <span typeof="mw:File">
                          <img
                            src={row.icon}
                            alt={row.name}
                            className="mw-file-element pixelated-item-icon"
                            loading="lazy"
                            width="32"
                            height="32"
                          />
                        </span>
                      </span>
                    </span>
                  </TooltipTrigger>
                </td>
                <td className="table-water-cell">
                  {typeof row.waterName === 'string' ? (
                    <span className="wiki-potion-link">{row.waterName}</span>
                  ) : (
                    row.waterName
                  )}
                </td>
                <td className="table-modifier-cell">{row.afterModifier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

