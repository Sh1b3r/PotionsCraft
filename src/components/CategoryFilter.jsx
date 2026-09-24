import React from 'react';
import { playButtonClickSound } from '../utils/soundEffects';

export default function CategoryFilter({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  counts,
}) {
  const categories = [
    { id: 'all', label: 'Всі зілля', count: counts.all, color: '#333' },
    { id: 'positive', label: 'Позитивні', count: counts.positive, color: '#2e7d32' },
    { id: 'negative', label: 'Негативні', count: counts.negative, color: '#c62828' },
    { id: 'mixed', label: 'Змішані', count: counts.mixed, color: '#6a1b9a' },
  ];

  return (
    <div className="catalog-filters-bar">
      <div className="category-buttons">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`pixel-btn filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              playButtonClickSound();
              onSelectCategory(cat.id);
            }}
          >
            {cat.label} <span className="cat-count">({cat.count})</span>
          </button>
        ))}
      </div>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Пошук зілля за назвою чи ефектом..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}