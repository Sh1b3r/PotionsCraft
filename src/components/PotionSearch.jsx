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

  // Mobile adaptive 3 potion filters stored in localStorage
  const [quickPotionFilters, setQuickPotionFilters] = useState(() => {
    try {
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

  // Adapt 3 filters whenever user enters a search query
  const updateAdaptiveFilters = (query) => {
    const raw = query.trim().toLowerCase();
    if (raw.length < 3) return;

    const shortName = raw.replace(/^зілля\s+(?:зі\s+|з\s+)?/i, '').trim();
    if (!shortName) return;

    setQuickPotionFilters((prev) => {
      if (prev[0] && prev[0].toLowerCase() === shortName.toLowerCase()) {
        return prev;
      }
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== shortName.toLowerCase()
      );
      const updated = [shortName, ...filtered].slice(0, 3);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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
      updateAdaptiveFilters(reagentName);
    }
  };

  const handlePotionFilterClick = (filterName) => {
    playButtonClickSound();
    if (searchQuery.toLowerCase() === filterName.toLowerCase()) {
      onSearchChange('');
    } else {
      onSearchChange(filterName);
      updateAdaptiveFilters(filterName);
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
              updateAdaptiveFilters(e.target.value);
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
