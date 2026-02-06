import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="text-decoration-none"
    >
      <div className="category-card">
        <i className={`bi ${category.icon} category-icon`}></i>
        <div className="category-name">{category.name}</div>
      </div>
    </Link>
  );
};

export default CategoryCard;
