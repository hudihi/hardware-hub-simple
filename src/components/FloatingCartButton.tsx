import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../utils/format';

const HIDE_PATHS = ['/cart', '/checkout', '/otp-verification', '/payment-processing', '/payment-status', '/order-confirmation', '/payment-instructions', '/upload-proof'];

const FloatingCartButton: React.FC = () => {
  const { itemCount, total } = useCart();
  const location = useLocation();
  const { language } = useLanguage();

  const shouldHide =
    itemCount === 0 ||
    location.pathname.startsWith('/admin') ||
    HIDE_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <div className={`floating-cart-wrap ${shouldHide ? 'floating-cart-hidden' : 'floating-cart-visible'}`}>
      <Link to="/cart" className="floating-cart-btn" aria-label="View cart">
        <span className="floating-cart-icon-wrap">
          <i className="bi bi-cart3" />
          <span className="floating-cart-count">{itemCount > 9 ? '9+' : itemCount}</span>
        </span>
        <span className="floating-cart-label">
          {itemCount} {language === 'sw' ? (itemCount === 1 ? 'bidhaa' : 'bidhaa') : (itemCount === 1 ? 'item' : 'items')}
        </span>
        <span className="floating-cart-divider" aria-hidden="true" />
        <span className="floating-cart-total">{formatPrice(total)}</span>
        <i className="bi bi-chevron-right floating-cart-arrow" />
      </Link>
    </div>
  );
};

export default FloatingCartButton;
