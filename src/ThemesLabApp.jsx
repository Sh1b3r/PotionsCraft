import React, { useState, useEffect, useMemo } from 'react';
import PotionCard from './components/PotionCard';
import PotionModal from './components/PotionModal';
import { TooltipProvider } from './components/MinecraftTooltip';
import PotionSearch from './components/PotionSearch';
import BaseModifiersTable from './components/BaseModifiersTable';
import { POTIONS_DATA } from './data/potionsData';
import { playButtonClickSound } from './utils/soundEffects';
import './App.css';

// Active themes for this laboratory
export const LAB_THEMES = [
  {
    id: 'obsidian',
    name: 'Obsidian Minimal',
    icon: '🌌',
    badge: 'Базова тема',
    description: 'Чорне матове скло, витончена грань і плавні заокруглення. Без неонового підсвічування.',
  },
  {
    id: 'sculk',
    name: 'Sculk Echo',
    icon: '👾',
    badge: 'Нова концепція',
    description: 'Глибока бірюзово-акустична пітьма біому Deep Dark та енергія Вардена.',
  },
  {
    id: 'end',
    name: 'End Void',
    icon: '🔮',
    badge: 'Нова концепція',
    description: 'Космічний вимір Краю: темний пурпурово-фіолетовий відтінок та магія аметисту й хорусу.',
  },
  {
    id: 'deepslate',
    name: 'Deepslate Modern',
    icon: '💎',
    badge: 'Нова концепція',
    description: 'Сланцево-синій інженерний відтінок глибинного каменю з сапфіровими акцентами.',
  },
];

export default function ThemesLabApp() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('potionscraft_lab_theme');
      return saved || 'obsidian';
    } catch {
      return 'obsidian';
    }
  });

  const [activeModalPotion, setActiveModalPotion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem('potionscraft_lab_theme', currentTheme);
    } catch (e) {}

    // Apply dark theme and specific theme variant to body
    document.body.className = `dark-theme lab-theme-${currentTheme}`;
    document.documentElement.setAttribute('data-lab-theme', currentTheme);
  }, [currentTheme]);

  // Filter potions exactly like on the main site
  const filteredPotions = useMemo(() => {
    return POTIONS_DATA.filter((potion) => {
      if (selectedCategory !== 'all' && potion.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const qAlt = q.startsWith('сцілен')
        ? q.replace('сцілен', 'зцілен')
        : q.startsWith('зцілен')
        ? q.replace('зцілен', 'сцілен')
        : q;

      const nameMatch =
        potion.name.toLowerCase().includes(q) || potion.name.toLowerCase().includes(qAlt);
      const engMatch = potion.englishName.toLowerCase().includes(q);
      const ingredientMatch = potion.ingredient.toLowerCase().includes(q);
      const effectMatch = potion.effectName?.toLowerCase().includes(q);
      const baseMatch = potion.base.toLowerCase().includes(q);

      return nameMatch || engMatch || ingredientMatch || effectMatch || baseMatch;
    });
  }, [searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    return {
      all: POTIONS_DATA.length,
      positive: POTIONS_DATA.filter((p) => p.category === 'positive').length,
      negative: POTIONS_DATA.filter((p) => p.category === 'negative').length,
      mixed: POTIONS_DATA.filter((p) => p.category === 'mixed').length,
    };
  }, []);

  const positiveFiltered = useMemo(
    () => filteredPotions.filter((p) => p.category === 'positive'),
    [filteredPotions]
  );
  const negativeFiltered = useMemo(
    () => filteredPotions.filter((p) => p.category === 'negative'),
    [filteredPotions]
  );
  const mixedFiltered = useMemo(
    () => filteredPotions.filter((p) => p.category === 'mixed'),
    [filteredPotions]
  );

  return (
    <TooltipProvider>
      <div className={`potions-craft-app dark-theme lab-theme-${currentTheme}`} id="body1">
        {/* Gallery Stars */}
        <div className="gallery">
          <div className="stars"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="tiny-stars"></div>
          <div className="tiny-stars"></div>
          <div className="tiny-stars"></div>
          <div className="tiny-stars"></div>
          <div className="tiny-stars"></div>
        </div>

        {/* Top Laboratory Bar with live interactive switcher */}
        <div className="lab-control-bar">
          <div className="lab-control-inner">
            <div className="lab-title-group">
              <a href="/index.html" className="lab-home-btn" title="Повернутися на основний сайт">
                ⬅ Головна
              </a>
              <div className="lab-brand-title">
                <span className="lab-badge">Лабораторія тем</span>
                <span className="lab-subtitle">Тестуйте нові варіанти на живому сайті</span>
              </div>
            </div>

            {/* Interactive Theme Switcher Buttons */}
            <div className="lab-theme-pills">
              {LAB_THEMES.map((theme) => {
                const isActive = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`lab-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      playButtonClickSound();
                      setCurrentTheme(theme.id);
                    }}
                    title={`${theme.name}: ${theme.description}`}
                  >
                    <span className="lab-pill-icon">{theme.icon}</span>
                    <span className="lab-pill-name">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Header */}
        <header id="header2" className="dark-theme">
          <div className="headertext dark-theme" id="headertext1">
            <div className="logocontainer" id="logo">
              <a href="/index.html">
                <img
                  src="/Potion_of_Luck_JE3.png"
                  id="logoday"
                  alt="PotionsCraft Logo"
                  className="logo"
                />
              </a>
            </div>
            <div className="title">
              <h1>PotionsCraft 3D</h1>
            </div>
          </div>

          <div className="header-right-controls">
            <div className="current-theme-status">
              Активна тема: <b>{LAB_THEMES.find((t) => t.id === currentTheme)?.name}</b>
            </div>
          </div>
        </header>

        {/* Main Body Container */}
        <div className="container">
          <div className="body2 dark-theme" id="body21">
            {/* Base ingredients & modifiers table */}
            <BaseModifiersTable />

            {/* Comprehensive Search & Filter System */}
            <PotionSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              counts={categoryCounts}
              totalResults={filteredPotions.length}
              onReset={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            />

            <h2>Зілля та їх види (Інтерактивний перегляд у {LAB_THEMES.find((t) => t.id === currentTheme)?.name})</h2>

            {/* Categorized Potions */}
            {filteredPotions.length > 0 ? (
              <div className="potions-sections-wrapper">
                {positiveFiltered.length > 0 && (
                  <div className="potions-category-group">
                    <h3 className="category-section-title positive-title">
                      Зілля з позитивними ефектами
                    </h3>
                    <div className="potions">
                      {positiveFiltered.map((potion) => (
                        <PotionCard
                          key={potion.id}
                          potion={potion}
                          isDark={true}
                          onSelect3D={setActiveModalPotion}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {negativeFiltered.length > 0 && (
                  <div className="potions-category-group">
                    <h3 className="category-section-title negative-title">
                      Зілля з негативними ефектами
                    </h3>
                    <div className="potions">
                      {negativeFiltered.map((potion) => (
                        <PotionCard
                          key={potion.id}
                          potion={potion}
                          isDark={true}
                          onSelect3D={setActiveModalPotion}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {mixedFiltered.length > 0 && (
                  <div className="potions-category-group">
                    <h3 className="category-section-title mixed-title">
                      Зілля зі змішаними ефектами
                    </h3>
                    <div className="potions">
                      {mixedFiltered.map((potion) => (
                        <PotionCard
                          key={potion.id}
                          potion={potion}
                          isDark={true}
                          onSelect3D={setActiveModalPotion}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="search-empty-state">
                <div className="empty-state-icon">🧪</div>
                <h3>Нічого не знайдено</h3>
                <p>За запитом «<b>{searchQuery}</b>» не знайдено жодного зілля.</p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive 3D Modal */}
        <PotionModal
          potion={activeModalPotion}
          onClose={() => setActiveModalPotion(null)}
          isDark={true}
        />
      </div>
    </TooltipProvider>
  );
}
