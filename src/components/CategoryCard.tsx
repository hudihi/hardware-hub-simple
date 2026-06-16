import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

const CATEGORY_COLOR_MAP: Array<{ keywords: string[]; color: string }> = [
  { keywords: ['electrical', 'electric', 'umeme', 'wiring', 'cable'], color: '#3B82F6' },
  { keywords: ['plumbing', 'pipe', 'mabomba', 'water'], color: '#06B6D4' },
  { keywords: ['paint', 'rangi', 'painting', 'color'], color: '#EC4899' },
  { keywords: ['garden', 'bustani', 'lawn', 'plant'], color: '#22C55E' },
  { keywords: ['building', 'ujenzi', 'cement', 'construction'], color: '#F97316' },
  { keywords: ['safety', 'usalama', 'protection'], color: '#EF4444' },
  { keywords: ['tools', 'vifaa', 'hand', 'power'], color: '#7C5A3C' },
  { keywords: ['measuring', 'kipimo'], color: '#8B5CF6' },
];

function getCategoryColor(name: string): string {
  const lower = name.toLowerCase();
  for (const { keywords, color } of CATEGORY_COLOR_MAP) {
    if (keywords.some(k => lower.includes(k))) return color;
  }
  return '#7C5A3C';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const translatedName = useTranslatedContent(category.name);
  const accentColor = getCategoryColor(category.name);

  return (
    <Link
      to={`/products?category=${category.id}`}
      className="text-decoration-none"
    >
      <div
        className="category-card"
        style={{ '--cat-accent': accentColor } as React.CSSProperties}
      >
        <i
          className={`bi ${category.icon} category-icon`}
          style={{ color: accentColor }}
        />
        <div className="category-name">{translatedName || category.name}</div>
      </div>
    </Link>
  );
};

export default CategoryCard;
