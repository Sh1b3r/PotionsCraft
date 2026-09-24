import React from 'react';

export default function InfoGuide({ isDark }) {
  return (
    <section className={`info-guide-card ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <h2 className="guide-title">📖 Алхімічний Довідник (Примітка)</h2>
      <div className="guide-grid">
        <div className="guide-item">
          <span className="guide-emoji">⚗️</span>
          <div>
            <b>Варильна стійка:</b> Всі механіки зілля у грі відбуваються виключно у варильній стійці з використанням вогняного порошку як палива.
          </div>
        </div>

        <div className="guide-item">
          <span className="guide-emoji">🧪</span>
          <div>
            <b>Базове зілля:</b> Для майже всіх рецептів основою є <b>«Моторошне зілля»</b> (з пекельного наросту), <i>окрім зілля слабкості</i>, для якого підходить звичайна <b>пляшка з водою</b>.
          </div>
        </div>

        <div className="guide-item">
          <span className="guide-emoji">✨</span>
          <div>
            <b>Світляний пил (Світлопил):</b> Збільшує рівень та силу ефекту зілля до <b>Рівня II</b>, але зменшує час його дії.
          </div>
        </div>

        <div className="guide-item">
          <span className="guide-emoji">🔴</span>
          <div>
            <b>Редстоун (Червоний пил):</b> Збільшує <b>тривалість</b> ефекту (наприклад, з 3:00 до 8:00 хв), проте скидає підвищений рівень сили.
          </div>
        </div>

        <div className="guide-item">
          <span className="guide-emoji">💥</span>
          <div>
            <b>Вибухове зілля:</b> Додавання <b>пороху</b> перетворює пляшку на снаряд, який розбивається при ударі та діє по площі.
          </div>
        </div>

        <div className="guide-item">
          <span className="guide-emoji">🐲</span>
          <div>
            <b>Осідаюче (Туманне) зілля:</b> Додавання <b>драконячого дихання</b> до вибухового зілля створює хмару ефекту, що тримається на землі.
          </div>
        </div>
      </div>
    </section>
  );
}