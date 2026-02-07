import React from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { generateCartMessage, openWhatsApp } from '../utils/whatsapp';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="container py-3">
          <h1 className="section-header">Kikapu cha Ununuzi</h1>
          <EmptyState
            icon="bi-cart"
            title="Kikapu chako kipo tupu"
            description="Ongeza bidhaa ili kuanza"
            action={{
              label: 'Tazama Bidhaa',
              onClick: () => navigate('/products'),
            }}
          />
        </div>
      </div>
    );
  }

  const handleWhatsAppShare = () => {
    const message = generateCartMessage(items, total);
    openWhatsApp(message);
  };

  return (
    <div className="page-container">
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="section-header mb-0">Kikapu cha Ununuzi</h1>
          <button
            className="btn btn-link text-danger p-0 small"
            onClick={clearCart}
          >
            Futa Zote
          </button>
        </div>

        {/* Cart Items */}
        <div className="mb-4">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="card-pahala card">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Jumla Ndogo</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Usafirishaji</span>
              <span className="text-success">Lipa Unapopokea</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold">Jumla</span>
              <span className="fs-5 fw-bold text-brown">{formatPrice(total)}</span>
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg-mobile"
                onClick={() => navigate('/checkout')}
              >
                <i className="bi bi-lock me-2"></i>
                Endelea Kulipa
              </button>
              <button
                className="btn btn-whatsapp btn-lg-mobile"
                onClick={handleWhatsAppShare}
              >
                <i className="bi bi-whatsapp me-2"></i>
                Shiriki kupitia WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
