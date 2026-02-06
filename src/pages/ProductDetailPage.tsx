import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="page-container">
        <div className="container py-5 text-center">
          <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
          <h5>Product not found</h5>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/products')}>
            Browse Products
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
    const message = `Check out ${product.name} at PAHALA.COM!\n\nPrice: ${formatPrice(product.price)}/${product.unit}\n\n${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="page-container">
      <div className="container py-3">
        {/* Back Button */}
        <button
          className="btn btn-link text-brown p-0 mb-3"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back
        </button>

        {/* Product Image */}
        <div className="bg-beige rounded-3 mb-4" style={{ aspectRatio: '1' }}>
          <img
            src={product.image}
            alt={product.name}
            className="w-100 h-100 object-fit-cover rounded-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h1 className="h4 fw-bold mb-0">{product.name}</h1>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleShare}
            >
              <i className="bi bi-share"></i>
            </button>
          </div>
          
          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="fs-4 fw-bold text-brown">{formatPrice(product.price)}</span>
            <span className="text-muted">/ {product.unit}</span>
          </div>

          <p className="text-muted">{product.description}</p>

          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge bg-success">
              <i className="bi bi-check-circle me-1"></i>
              In Stock
            </span>
            <span className="text-muted small">({product.stock} available)</span>
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="card-pahala card position-sticky" style={{ bottom: '80px' }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-semibold">Quantity</span>
              <div className="qty-control">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">Total</span>
              <span className="fs-5 fw-bold text-brown">
                {formatPrice(product.price * quantity)}
              </span>
            </div>

            <button
              className="btn btn-primary btn-lg-mobile w-100"
              onClick={handleAddToCart}
            >
              <i className="bi bi-cart-plus me-2"></i>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
