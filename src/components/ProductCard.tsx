import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productUrl = `${window.location.origin}/products/${product.id}`;
    const message = `Angalia ${product.name} katika PAHALA.COM!\n\nBei: ${formatPrice(product.price)}/${product.unit}\n\n${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Link to={`/products/${product.id}`} className="text-decoration-none">
      <div className="product-card h-100">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
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
              Ongeza
            </button>
            <button
              onClick={handleShare}
              className="btn btn-outline-secondary btn-sm"
              title="Shiriki"
            >
              <i className="bi bi-share"></i>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
