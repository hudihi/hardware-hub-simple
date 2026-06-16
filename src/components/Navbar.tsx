import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Top Navbar — Desktop */}
      <nav className={`navbar navbar-pahala navbar-expand-md sticky-top d-none d-md-flex ${scrolled ? 'navbar-scrolled' : ''}`}>
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
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}>
              <i className="bi bi-house me-1" /> {t('nav_home')}
            </Link>
            <Link to="/products" className={`nav-link ${location.pathname.startsWith('/products') ? 'nav-link-active' : ''}`}>
              <i className="bi bi-grid me-1" /> {t('nav_products')}
            </Link>
            <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'nav-link-active' : ''}`}>
              <i className="bi bi-box me-1" /> {t('nav_orders')}
            </Link>
            <Link to="/cart" className="nav-link position-relative">
              <i className="bi bi-cart3 fs-5" />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
            <button
              className="btn btn-sm btn-outline-light rounded-pill px-3"
              onClick={toggleLanguage}
              title={t('lang_switch_label')}
            >
              <i className="bi bi-globe me-1" />
              {language === 'en' ? t('lang_current_en') : t('lang_current_sw')}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className={`navbar-pahala py-3 d-md-none ${scrolled ? 'navbar-scrolled' : ''}`}>
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
              className="btn btn-sm btn-outline-light rounded-pill px-2 py-1 d-flex align-items-center gap-1"
              onClick={toggleLanguage}
              title={t('lang_switch_label')}
              style={{ fontSize: '0.75rem' }}
            >
              <i className="bi bi-globe" />
              {language === 'en' ? t('lang_current_en') : t('lang_current_sw')}
            </button>
            <Link to="/cart" className="text-white position-relative">
              <i className="bi bi-cart3 fs-4" />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation — Mobile */}
      <nav className="bottom-nav d-md-none">
        <div className="container">
          <div className="d-flex justify-content-around">
            {[
              { to: '/', icon: 'bi-house', label: t('nav_home'), exact: true },
              { to: '/products', icon: 'bi-grid', label: t('nav_products'), exact: false },
              { to: '/cart', icon: 'bi-cart3', label: t('nav_cart'), exact: true },
              { to: '/orders', icon: 'bi-box', label: t('nav_orders'), exact: true },
            ].map(({ to, icon, label, exact }) => {
              const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
              return (
                <Link key={to} to={to} className={`nav-link bottom-nav-link ${isActive ? 'active' : ''}`}>
                  <span className="bottom-nav-indicator" />
                  <i className={`bi ${icon}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
