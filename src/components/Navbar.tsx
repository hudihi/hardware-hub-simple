import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  // Don't show navbar on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Top Navbar - Desktop */}
      <nav className="navbar navbar-pahala navbar-expand-md sticky-top d-none d-md-flex">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img 
              src="/PAHELA_27_FEBRUARY_2025.svg" 
              alt="PAHALA" 
              style={{ height: '40px', marginRight: '10px' }}
            />
            Pahala Store
          </Link>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="nav-link">
              <i className="bi bi-house me-1"></i> {t('nav_home')}
            </Link>
            <Link to="/products" className="nav-link">
              <i className="bi bi-grid me-1"></i> {t('nav_products')}
            </Link>
            <Link to="/orders" className="nav-link">
              <i className="bi bi-box me-1"></i> {t('nav_orders')}
            </Link>
            <Link to="/cart" className="nav-link position-relative">
              <i className="bi bi-cart3 fs-5"></i>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
            <button
              className="btn btn-sm btn-outline-light rounded-pill px-3"
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Swahili' : 'Badilisha kwa Kiingereza'}
            >
              <i className="bi bi-translate me-1"></i>
              {t('lang_toggle')}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="navbar-pahala py-3 d-md-none">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="text-white text-decoration-none fw-bold fs-5 d-flex align-items-center">
            <img 
              src="/PAHELA_27_FEBRUARY_2025.svg" 
              alt="PAHALA" 
              style={{ height: '36px', marginRight: '10px' }}
            />
            Pahala Store
          </Link>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-light rounded-pill px-2 py-1"
              onClick={toggleLanguage}
              style={{ fontSize: '0.75rem' }}
            >
              {t('lang_toggle')}
            </button>
            <Link to="/cart" className="text-white position-relative">
              <i className="bi bi-cart3 fs-4"></i>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="bottom-nav d-md-none">
        <div className="container">
          <div className="d-flex justify-content-around">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="bi bi-house"></i>
              <span>{t('nav_home')}</span>
            </Link>
            <Link
              to="/products"
              className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}
            >
              <i className="bi bi-grid"></i>
              <span>{t('nav_products')}</span>
            </Link>
            <Link
              to="/cart"
              className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
            >
              <i className="bi bi-cart3"></i>
              <span>{t('nav_cart')}</span>
            </Link>
            <Link
              to="/orders"
              className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
            >
              <i className="bi bi-box"></i>
              <span>{t('nav_orders')}</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
