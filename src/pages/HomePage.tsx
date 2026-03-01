import React from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { categories, products } from '../data/products';
import SearchBar from '@/components/SearchBar';


const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const featuredProducts = products.slice(0, 6);
  const { t } = useLanguage();

  // Sample suggestions and recent searches (in a real app, these would come from API/localStorage)
  const suggestions = [
    'Power Tools',
    'Hand Tools',
    'Drilling Machine',
    'Electric Saw',
    'Measuring Tools',
    'Safety Equipment',
    'Garden Tools',
    'Painting Supplies'
  ];

  const recentSearches = [
    'Hammer',
    'Screwdriver Set',
    'Power Drill'
  ];

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      
      // Save to recent searches (in a real app, this would be saved to localStorage)
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="h4 fw-bold mb-2">{t('home_welcome')}</h1>
          <p className="mb-3 opacity-75">{t('home_subtitle')}</p>

          <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          placeholder={t('home_search_placeholder')}
          suggestions={suggestions}
          recentSearches={recentSearches}
          isLoading={isLoading}
          />
          
          {/* <HeroSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder={t('home_search_placeholder')}
            suggestions={suggestions}
            recentSearches={recentSearches}
            isLoading={isLoading}
          /> */}
        </div>
      </div>

      <div className="container">
        {/* Categories */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">{t('home_categories')}</h2>
            <Link to="/products" className="text-brown text-decoration-none small">
              {t('home_view_all')} <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
          
          <div className="row g-2">
            {categories.map((category) => (
              <div key={category.id} className="col-4 col-md-2">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">{t('home_featured')}</h2>
            <Link to="/products" className="text-brown text-decoration-none small">
              {t('home_view_all')} <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
          
          <div className="row g-3">
            {featuredProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="card-pahala card mb-4">
          <div className="card-body text-center py-4">
            <i className="bi bi-headset fs-1 text-brown mb-2 d-block"></i>
            <h5 className="fw-bold mb-2">{t('home_need_help')}</h5>
            <p className="text-muted mb-3 small">
              {t('home_help_text')}
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg-mobile"
              >
                <i className="bi bi-whatsapp me-2"></i>
                WhatsApp
              </a>
              <a
                href="tel:+6281234567890"
                className="btn btn-outline-primary btn-lg-mobile"
              >
                <i className="bi bi-telephone me-2"></i>
                {t('home_call')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
