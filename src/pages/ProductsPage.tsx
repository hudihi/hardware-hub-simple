import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { products, categories, searchProducts, getProductsByCategory } from '../data/products';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory) {
      result = getProductsByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="page-container">
      <div className="container py-3">
        {/* Search Bar */}
        <div className="mb-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products..."
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4 overflow-auto hide-scrollbar">
          <div className="d-flex gap-2" style={{ minWidth: 'max-content' }}>
            <button
              className={`btn ${
                selectedCategory === '' ? 'btn-primary' : 'btn-outline-secondary'
              } btn-sm rounded-pill`}
              onClick={() => handleCategoryChange('')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`btn ${
                  selectedCategory === category.id
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                } btn-sm rounded-pill`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <i className={`bi ${category.icon} me-1`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-muted small mb-3">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="row g-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h5>No products found</h5>
            <p className="text-muted">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
