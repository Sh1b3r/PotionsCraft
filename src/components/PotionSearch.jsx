import React, { useState, useEffect } from 'react';
import { playButtonClickSound } from '../utils/soundEffects';

const STORAGE_KEY = 'pc_recent_potion_filters';
const DEFAULT_POTION_FILTERS = ['сцілення', 'сила', 'швидкість'];

export default function PotionSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  counts,
  totalResults,
  onReset
}) {
  const categories = [
    { id: 'all', label: 'Всі зілля', icon: '✨', count: counts.all },
    { id: 'positive', label: 'Позитивні', icon: '💚', count: counts.positive },
    { id: 'negative', label: 'Негативні', icon: '🔻', count: counts.negative },
    { id: 'mixed', label: 'Змішані', icon: '🐢', count: counts.mixed }
  ];

  const popularEffects = [
    'сцілення',
    'сила',
    'швидкість',
    'вогнестійкість',
    'регенерація',
    'невидимість'
  ];

  const popularReagents = [
    'Цукор',
    'Сльоза ґаста',
    'Магмовий крем',
    'Золота морква',
    'Павуче око',
    'Панцир черепахи'
  ];

  // Adaptive quick filters with frequency + recency calculation
  const [quickPotionFilters, setQuickPotionFilters] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('pc_potion_queries_history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        // history is an object { [term]: { count: number, lastUsed: number } }
        const sorted = Object.entries(history)
          .sort((a, b) => {
            // prioritize frequency (count * 2) combined with recency
            const scoreA = a[1].count * 2 + Math.min(10, Math.floor((Date.now() - a[1].lastUsed) / -3600000));
            const scoreB = b[1].count * 2 + Math.min(10, Math.floor((Date.now() - b[1].lastUsed) / -3600000));
            return scoreB - scoreA;
          })
          .map(([term]) => term);
        
        if (sorted.length > 0) {
          const filled = [...sorted];
          for (const d of DEFAULT_POTION_FILTERS) {
            if (!filled.includes(d)) filled.push(d);
          }
          return filled.slice(0, 3);
        }
      }

      // fallback to legacy STORAGE_KEY
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_POTION_FILTERS;
  });

  // Record a search term in frequency/recency history and update the 3 pills
  const recordSearchTerm = (query) => {
    if (!query) return;
    const raw = query.trim().toLowerCase();
    if (raw.length < 3) return;

    // clean up prefixes like "зілля", "зелья", "зелье"
    const cleaned = raw
      .replace(/^(?:зілля|зелье|зелья)\s+(?:зі\s+|з\s+|от\s+|для\s+)?/i, '')
      .replace(/^от\s+/i, '')
      .trim();

    if (!cleaned || cleaned.length < 2) return;

    try {
      let history = {};
      const saved = localStorage.getItem('pc_potion_queries_history');
      if (saved) {
        try { history = JSON.parse(saved); } catch (e) {}
      }

      const existing = history[cleaned] || { count: 0, lastUsed: 0 };
      history[cleaned] = {
        count: existing.count + 1,
        lastUsed: Date.now()
      };

      localStorage.setItem('pc_potion_queries_history', JSON.stringify(history));

      // Calculate top 3 by score (count + recency weight)
      const topTerms = Object.entries(history)
        .sort((a, b) => {
          // recency bonus
          const ageHoursA = (Date.now() - a[1].lastUsed) / 3600000;
          const ageHoursB = (Date.now() - b[1].lastUsed) / 3600000;
          const scoreA = a[1].count * 3 + Math.max(0, 10 - ageHoursA);
          const scoreB = b[1].count * 3 + Math.max(0, 10 - ageHoursB);
          return scoreB - scoreA;
        })
        .map(([term]) => term);

      const combined = [...topTerms];
      for (const def of DEFAULT_POTION_FILTERS) {
        if (!combined.includes(def)) combined.push(def);
      }
      const updated3 = combined.slice(0, 3);
      setQuickPotionFilters(updated3);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated3));
    } catch (e) {}
  };

  const handleCategoryClick = (catId) => {
    playButtonClickSound();
    onSelectCategory(catId);
  };

  const handleReagentClick = (reagentName) => {
    playButtonClickSound();
    if (searchQuery.toLowerCase() === reagentName.toLowerCase()) {
      onSearchChange('');
    } else {
      onSearchChange(reagentName);
      recordSearchTerm(reagentName);
    }
  };

  const handlePotionFilterClick = (filterName) => {
    playButtonClickSound();
    if (searchQuery.toLowerCase() === filterName.toLowerCase()) {
      onSearchChange('');
    } else {
      onSearchChange(filterName);
      recordSearchTerm(filterName);
    }
  };

  const isFiltering = searchQuery.trim() !== '' || selectedCategory !== 'all';

  return (
    <div className="search-system-container">
      {/* Search Input Bar */}
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              recordSearchTerm(e.target.value);
            }}
            onBlur={(e) => {
              recordSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                recordSearchTerm(e.currentTarget.value);
              }
            }}
            placeholder="Пошук зілля за назвою, інгредієнтом або ефектом..."
            aria-label="Пошук зілля"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                playButtonClickSound();
                onSearchChange('');
              }}
              title="Очистити пошук"
            >
              ✕
            </button>
          )}
        </div>

        {isFiltering && (
          <button
            type="button"
            className="search-reset-all-btn"
            onClick={() => {
              playButtonClickSound();
              onReset();
            }}
          >
            Скинути
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="search-categories-row">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
              <span className="cat-badge">{cat.count}</span>
            </button>
          ))}
        </div>

        <div className="search-results-count">
          Знайдено: <b>{totalResults}</b>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="quick-reagents-row">
        <span className="quick-reagents-title">Фільтр:</span>

        {/* Mobile-only 3 adaptive potion filters */}
        <div className="mobile-quick-filters">
          {quickPotionFilters.map((filter) => {
            const isSelected = searchQuery.toLowerCase() === filter.toLowerCase();
            return (
              <button
                key={filter}
                type="button"
                className={`potion-filter-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handlePotionFilterClick(filter)}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Desktop filters: Potion Effects + Reagents */}
        <div className="desktop-quick-filters">
          <div className="desktop-effects-group">
            {popularEffects.map((effect) => {
              const isSelected = searchQuery.toLowerCase() === effect.toLowerCase();
              return (
                <button
                  key={effect}
                  type="button"
                  className={`potion-filter-pill-btn effect-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handlePotionFilterClick(effect)}
                >
                  {effect}
                </button>
              );
            })}
          </div>

          <span className="filter-group-divider">|</span>

          <div className="desktop-reagents-group">
            {popularReagents.map((reagent) => {
              const isSelected = searchQuery.toLowerCase() === reagent.toLowerCase();
              return (
                <button
                  key={reagent}
                  type="button"
                  className={`reagent-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleReagentClick(reagent)}
                >
                  {reagent}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
