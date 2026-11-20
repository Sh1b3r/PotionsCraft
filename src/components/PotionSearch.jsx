import React, { useState, useEffect, useMemo } from 'react';
import { playButtonClickSound } from '../utils/soundEffects';
import { useI18n } from '../i18n';

const STORAGE_KEY = 'pc_recent_potion_filters';

export default function PotionSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  counts,
  totalResults,
  onReset
}) {
  const { t, localizedPotions } = useI18n();

  const categories = [
    { id: 'all', label: t('cat_all'), icon: '✨', count: counts.all },
    { id: 'positive', label: t('cat_positive'), icon: '💚', count: counts.positive },
    { id: 'negative', label: t('cat_negative'), icon: '🔻', count: counts.negative },
    { id: 'mixed', label: t('cat_mixed'), icon: '🐢', count: counts.mixed }
  ];

  const popularEffects = useMemo(() => {
    return localizedPotions.slice(0, 12).map((p) => p.nominativeTitle || p.name);
  }, [localizedPotions]);

  const defaultFilters = useMemo(() => {
    return localizedPotions.slice(0, 3).map((p) => p.nominativeTitle || p.name);
  }, [localizedPotions]);

  // Adaptive quick filters with frequency + recency calculation
  const [quickPotionFilters, setQuickPotionFilters] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('pc_potion_queries_history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const sorted = Object.entries(history)
          .sort((a, b) => {
            const scoreA = a[1].count * 2 + Math.min(10, Math.floor((Date.now() - a[1].lastUsed) / -3600000));
            const scoreB = b[1].count * 2 + Math.min(10, Math.floor((Date.now() - b[1].lastUsed) / -3600000));
            return scoreB - scoreA;
          })
          .map(([term]) => term);

        if (sorted.length > 0) {
          return sorted.slice(0, 3);
        }
      }
    } catch (e) { }
    return [];
  });

  const activeMobileFilters = quickPotionFilters.length > 0 ? quickPotionFilters : defaultFilters;

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
        try { history = JSON.parse(saved); } catch (e) { }
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
    } catch (e) { }
  };

  const handleCategoryClick = (catId) => {
    playButtonClickSound();
    onSelectCategory(catId);
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
            placeholder={t('search_placeholder')}
            aria-label={t('search_placeholder')}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                playButtonClickSound();
                onSearchChange('');
              }}
              title={t('search_clear')}
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
            {t('search_reset')}
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
          {t('search_results_found')}<b>{totalResults}</b>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="quick-reagents-row">
        <span className="quick-reagents-title">{t('quick_filter_title')}</span>

        {/* Mobile-only 3 adaptive potion filters */}
        <div className="mobile-quick-filters">
          {activeMobileFilters.map((filter) => {
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

        {/* Desktop filters: All Potion Effects */}
        <div className="desktop-quick-filters">
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
      </div>
    </div>
  );
}
