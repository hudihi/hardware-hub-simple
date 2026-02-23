import React from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { generateCartMessage, openWhatsApp } from '../utils/whatsapp';
import { useLanguage } from '../context/LanguageContext';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { language, t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="container py-3">
          <h1 className="section-header">{t('cart_title')}</h1>
          <EmptyState
            icon="bi-cart"
            title={t('cart_empty')}
            description={t('cart_empty_desc')}
            action={{
              label: t('product_view_products'),
              onClick: () => navigate('/products'),
            }}
          />
        </div>
      </div>
    );
  }

  const handleWhatsAppShare = () => {
    const message = generateCartMessage(items, total, language);
    openWhatsApp(message);
  };

  return (
    <div className="page-container">
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="section-header mb-0">{t('cart_title')}</h1>
          <button
            className="btn btn-link text-danger p-0 small"
            onClick={clearCart}
          >
            {t('cart_clear')}
          </button>
        </div>

        <div className="mb-4">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        <div className="card-pahala card">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">{t('cart_subtotal')}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">{t('cart_shipping')}</span>
              <span className="text-success">{t('cart_cod')}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold">{t('cart_total')}</span>
              <span className="fs-5 fw-bold text-brown">{formatPrice(total)}</span>
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg-mobile"
                onClick={() => navigate('/checkout')}
              >
                <i className="bi bi-lock me-2"></i>
                {t('cart_checkout')}
              </button>
              <button
                className="btn btn-whatsapp btn-lg-mobile"
                onClick={handleWhatsAppShare}
              >
                <i className="bi bi-whatsapp me-2"></i>
                {t('cart_share_wa')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
