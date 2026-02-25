import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Share2, Minus, Plus, ShoppingCart, CheckCircle } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { language, t } = useLanguage();

  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="page-container">
        <div className="container py-5 text-center">
          <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
          <h5>{t('product_not_found')}</h5>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/products')}>
            {t('product_view_products')}
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    navigate('/cart');
  };

  const handleShare = () => {
    const productUrl = window.location.href;
    const message = `${product.name} - PAHALA.COM!\n\n${formatPrice(product.price)}/${product.unit}\n\n${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="page-container">
      <div className="container py-3" style={{ paddingBottom: '100px' }}>
        {/* Back button */}
        <button
          className="btn btn-link p-0 mb-3 d-inline-flex align-items-center gap-1 text-decoration-none"
          style={{ color: 'var(--pahala-brown)' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span>{t('product_back')}</span>
        </button>

        {/* Product Image */}
        <div
          className="rounded-3 overflow-hidden mb-4"
          style={{ aspectRatio: '1', backgroundColor: 'var(--pahala-beige)' }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-100 h-100 object-fit-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Product Info Section */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h1 className="h4 fw-bold mb-0" style={{ lineHeight: 1.3 }}>{product.name}</h1>
            <button
              className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              onClick={handleShare}
              style={{ width: 38, height: 38 }}
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Price */}
          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="fs-4 fw-bold" style={{ color: 'var(--pahala-brown)' }}>
              {formatPrice(product.price)}
            </span>
            <span className="text-muted">/ {product.unit}</span>
          </div>

          {/* Stock Status */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#D1E7DD', color: '#0F5132' }}>
              <CheckCircle size={12} />
              {t('product_available')}
            </span>
            <span className="text-muted small">({product.stock} {t('product_in_stock')})</span>
          </div>

          {/* Description */}
          <p className="text-muted mb-0" style={{ lineHeight: 1.6 }}>{product.description}</p>
        </div>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--pahala-beige)', opacity: 1 }} />

        {/* Quantity & Total Section */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-semibold">{t('product_quantity')}</span>
            <div className="qty-control">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">{t('product_total')}</span>
            <span className="fs-5 fw-bold" style={{ color: 'var(--pahala-brown)' }}>
              {formatPrice(product.price * quantity)}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Add to Cart */}
      <div
        className="position-fixed start-0 end-0"
        style={{
          bottom: 60,
          zIndex: 999,
          background: 'linear-gradient(to top, var(--pahala-white) 85%, transparent)',
          padding: '1rem',
          paddingTop: '1.5rem',
        }}
      >
        <div className="container">
          <button
            className="btn btn-primary btn-lg-mobile w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} />
            {t('product_add_to_cart')} — {formatPrice(product.price * quantity)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
