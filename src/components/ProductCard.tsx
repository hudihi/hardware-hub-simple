import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import ImageWithFallback from './ImageWithFallback';
import ShareButton from './ShareButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { language, t } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const getShareContent = () => {
    const title = product.name;
    const text = language === 'sw' 
      ? `Angalia bidhaa hii kutoka Pahala Store!\n\n${product.name}\n${formatPrice(product.price)}/${product.unit}`
      : `Check out this product from Pahala Store!\n\n${product.name}\n${formatPrice(product.price)}/${product.unit}`;
    const url = `${window.location.origin}/products/${product.id}`;
    return { title, text, url };
  };

  return (
    <Link to={`/products/${product.id}`} className="text-decoration-none">
      <div className="product-card h-100">
        <div className="product-image-container position-relative">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="product-image w-100"
            width={300}
            height={300}
            style={{ borderRadius: '0.375rem 0.375rem 0 0' }}
          />
        </div>
        <div className="p-3">
          <h6 className="mb-1 text-dark fw-semibold text-truncate">{product.name}</h6>
          <div className="d-flex align-items-baseline gap-1 mb-2">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="product-unit">/ {product.unit}</span>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-sm flex-grow-1"
            >
              <i className="bi bi-cart-plus me-1"></i>
              {t('products_add')}
            </button>
            <ShareButton
              title={getShareContent().title}
              text={getShareContent().text}
              url={getShareContent().url}
              className="btn btn-outline-secondary btn-sm"
              aria-label={t('products_share')}
            >
              <i className="bi bi-share"></i>
            </ShareButton>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
