import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { analytics } from '../lib/analytics';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { createProductUrl } from '../utils/slug';

/** Stable 1-10% discount derived from product ID — same value on every render. */
function getProductDiscount(productId: string): number {
  let h = 0;
  for (let i = 0; i < productId.length; i++) {
    h = Math.imul(31, h) + productId.charCodeAt(i);
  }
  return (Math.abs(h) % 10) + 1;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const translatedName = useTranslatedContent(product.name);
  const discount = getProductDiscount(product.id);
  const originalPrice = Math.round(product.price / (1 - discount / 100));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    analytics.addedToCart({ product_id: product.id, category: product.category, price: product.price });
  };

  return (
    <Link to={createProductUrl(product.id, product.name)} className="text-decoration-none">
      <div className="product-card h-100">
        <div className="product-image-container position-relative">
          {/* Shimmer skeleton — visible until image finishes loading */}
          {!imageLoaded && !imageError && (
            <div className="product-image-placeholder" aria-hidden="true" />
          )}
          <img
            src={imageError ? '/placeholder.svg' : product.image}
            alt={product.name}
            className="product-image w-100"
            width={300}
            height={300}
            style={{
              borderRadius: '0.375rem 0.375rem 0 0',
              objectFit: 'cover',
              opacity: imageLoaded || imageError ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
          />
          <span
            className="position-absolute top-0 end-0 m-2 badge"
            style={{
              backgroundColor: '#C0392B',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '0.25rem',
              padding: '3px 6px',
              letterSpacing: '0.02em',
            }}
          >
            {discount}% OFF
          </span>
        </div>
        <div className="p-2 p-md-3">
          <h6 className="mb-1 text-dark fw-semibold product-name">{translatedName || product.name}</h6>
          <div className="d-flex align-items-baseline gap-1 mb-2">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span
              className="text-muted text-decoration-line-through"
              style={{ fontSize: '0.78rem' }}
            >
              {formatPrice(originalPrice)}
            </span>
            <span className="product-unit">/ {product.unit}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-sm w-100"
          >
            <i className="bi bi-cart-plus me-1"></i>
            {t('products_add')}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
