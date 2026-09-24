import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PotionCard from './components/PotionCard';
import PotionModal from './components/PotionModal';
import EasterEggModal from './components/EasterEggModal';
import { TooltipProvider } from './components/MinecraftTooltip';
import PotionSearch from './components/PotionSearch';
import BaseModifiersTable from './components/BaseModifiersTable';
import { POTIONS_DATA } from './data/potionsData';
import './App.css';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : false; // default to light theme as in original
    } catch {
      return false;
    }
  });

  const [darkPreset, setDarkPreset] = useState(() => {
    try {
      const savedPreset = localStorage.getItem('potionscraft_dark_preset');
      return savedPreset || 'obsidian';
    } catch {
      return 'obsidian';
    }
  });

  // Modals
  const [activeModalPotion, setActiveModalPotion] = useState(null);
  const [activeEasterEgg, setActiveEasterEgg] = useState(null);

  const logoDaySrc = '/Glass_Bottle_JE2_BE2.webp';
  const logoNightSrc = '/Potion_of_Luck_JE3.png';

  useEffect(() => {
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      localStorage.setItem('potionscraft_dark_preset', darkPreset);
    } catch (e) {}

    // Update body theme and attributes
    document.body.className = `${isDark ? 'dark-theme' : 'light-theme'} theme-preset-${darkPreset}`;
    document.documentElement.setAttribute('data-theme-preset', darkPreset);

    // Update favicon matching the logo swap (as in Pop! project)
    const favicon = document.getElementById('favicon') || document.querySelector("link[rel*='icon']");
    if (favicon) {
      favicon.href = isDark ? logoNightSrc : logoDaySrc;
    }
  }, [isDark, darkPreset]);

  // Client-side URL Routing & Legacy URL Handling
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('heroine') || hash === '#heroine' || hash === '#herobrine') {
        setActiveEasterEgg('herobrine');
      } else if (path.includes('no.html') || hash === '#no') {
        setActiveEasterEgg('no');
      } else if (hash === '#matias') {
        setActiveEasterEgg('matias');
      }

      if (path.endsWith('.html') && path !== '/index.html') {
        window.history.replaceState(null, '', '/' + hash);
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    return () => window.removeEventListener('hashchange', handleUrlRouting);
  }, []);

  const handleOpenEasterEgg = (type) => {
    setActiveEasterEgg(type);
    window.location.hash = type;
  };

  const handleCloseEasterEgg = () => {
    setActiveEasterEgg(null);
    if (['#no', '#herobrine', '#heroine', '#matias'].includes(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter potions based on search query and category
  const filteredPotions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return POTIONS_DATA.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Query filter
      if (!q) return true;
      const qAlt = q.startsWith('сцілен') ? q.replace('сцілен', 'зцілен') : q.startsWith('зцілен') ? q.replace('зцілен', 'сцілен') : q;
      const matchName = p.name.toLowerCase().includes(q) || p.name.toLowerCase().includes(qAlt);
      const matchEnglish = p.englishName?.toLowerCase().includes(q);
      const matchIngredient = p.ingredient?.toLowerCase().includes(q);
      const matchEffect = p.effectName?.toLowerCase().includes(q) || p.effectName?.toLowerCase().includes(qAlt);
      const matchDesc = p.description?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(qAlt);
      const matchBase = p.base?.toLowerCase().includes(q);
      return matchName || matchEnglish || matchIngredient || matchEffect || matchDesc || matchBase;
    });
  }, [searchQuery, selectedCategory]);

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

  const categoryCounts = useMemo(() => {
    return {
      all: POTIONS_DATA.length,
      positive: POTIONS_DATA.filter((p) => p.category === 'positive').length,
      negative: POTIONS_DATA.filter((p) => p.category === 'negative').length,
      mixed: POTIONS_DATA.filter((p) => p.category === 'mixed').length,
    };
  }, []);

  const handleResetSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <TooltipProvider>
      <div className={`potions-craft-app ${isDark ? 'dark-theme' : 'light-theme'}`} id="body1">
        {/* Original Gallery Sky & Twinkling Stars (only active in dark theme) */}
        {isDark && (
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
        )}

        {/* Original Sticky Glassmorphism Header */}
        <Header
          isDark={isDark}
          onToggleTheme={setIsDark}
          onOpenEasterEgg={handleOpenEasterEgg}
          darkPreset={darkPreset}
          onSelectDarkPreset={setDarkPreset}
        />

        {/* Main Body Container */}
        <div className="container">
          <div
            className={`body2 ${isDark ? 'dark-theme' : 'light-theme'} theme-preset-${darkPreset}`}
            id="body21"
          >
            {/* Base ingredients & modifiers table replacing the old note */}
            <BaseModifiersTable />

            {/* Comprehensive Search & Filter System */}
            <PotionSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              counts={categoryCounts}
              totalResults={filteredPotions.length}
              onReset={handleResetSearch}
            />

            <h2>Зілля та їх види</h2>

            {/* Categorized Potions with Big Section Titles */}
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
                          isDark={isDark}
                          onSelect3D={setActiveModalPotion}
                          onOpenEasterEgg={handleOpenEasterEgg}
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
                          isDark={isDark}
                          onSelect3D={setActiveModalPotion}
                          onOpenEasterEgg={handleOpenEasterEgg}
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
                          isDark={isDark}
                          onSelect3D={setActiveModalPotion}
                          onOpenEasterEgg={handleOpenEasterEgg}
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
                <button
                  type="button"
                  className="empty-reset-btn"
                  onClick={handleResetSearch}
                >
                  Скинути пошук
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Interactive 3D Modal */}
        <PotionModal
          potion={activeModalPotion}
          onClose={() => setActiveModalPotion(null)}
          isDark={isDark}
        />

        {/* Easter Egg Modals */}
        <EasterEggModal
          type={activeEasterEgg}
          onClose={handleCloseEasterEgg}
        />
      </div>
    </TooltipProvider>
  );
}