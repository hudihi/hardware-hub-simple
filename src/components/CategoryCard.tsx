import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const translatedName = useTranslatedContent(category.name);

  return (
    <Link
      to={`/products?category=${category.id}`}
      className="text-decoration-none"
    >
      <div className="category-card">
        <i className={`bi ${category.icon} category-icon`}></i>
        <div className="category-name">{translatedName || category.name}</div>
      </div>
    </Link>
  );
};

export default CategoryCard;
