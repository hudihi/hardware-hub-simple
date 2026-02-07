import React from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { categories, products } from '../data/products';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const featuredProducts = products.slice(0, 6);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="h4 fw-bold mb-2">Karibu PAHALA.COM</h1>
          <p className="mb-3 opacity-75">Duka lako la vifaa vya ujenzi la kuaminika</p>
          
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Tafuta bidhaa..."
              />
            </div>
            <button
              className="btn btn-light"
              onClick={handleSearch}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Categories */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">Makundi</h2>
            <Link to="/products" className="text-brown text-decoration-none small">
              Ona Zote <i className="bi bi-chevron-right"></i>
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
            <h2 className="section-header mb-0">Bidhaa Maarufu</h2>
            <Link to="/products" className="text-brown text-decoration-none small">
              Ona Zote <i className="bi bi-chevron-right"></i>
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
            <h5 className="fw-bold mb-2">Unahitaji Msaada?</h5>
            <p className="text-muted mb-3 small">
              Timu yetu ya masoko iko tayari kukusaidia
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
                Piga Simu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
