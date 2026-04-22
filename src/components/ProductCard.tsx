import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { analytics } from '../lib/analytics';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { createProductUrl } from '../utils/slug';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const translatedName = useTranslatedContent(product.name);

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
        </div>
        <div className="p-2 p-md-3">
          <h6 className="mb-1 text-dark fw-semibold product-name">{translatedName || product.name}</h6>
          <div className="d-flex align-items-baseline gap-1 mb-2">
            <span className="product-price">{formatPrice(product.price)}</span>
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
