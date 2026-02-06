import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { formatPrice, formatDate, getStatusText, getStatusClass } from '../utils/format';
import { shareOrder } from '../utils/whatsapp';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getOrderById } = useOrders();

  const order = id ? getOrderById(id) : undefined;
  const isNewOrder = location.state?.newOrder;

  if (!order) {
    return (
      <div className="page-container">
        <div className="container py-5 text-center">
          <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
          <h5>Order not found</h5>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/orders')}>
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const handleShareOrder = () => {
    shareOrder(order);
  };

  return (
    <div className="page-container">
      <div className="container py-3">
        <button
          className="btn btn-link text-brown p-0 mb-3"
          onClick={() => navigate('/orders')}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back to Orders
        </button>

        {/* Success Message for New Orders */}
        {isNewOrder && (
          <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2 fs-4"></i>
            <div>
              <strong>Order placed successfully!</strong>
              <p className="mb-0 small">We'll process your order soon. Thank you!</p>
            </div>
          </div>
        )}

        {/* Order Header */}
        <div className="card-pahala card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="fw-bold mb-1">{order.id}</h5>
                <small className="text-muted">{formatDate(order.createdAt)}</small>
              </div>
              <span className={`status-badge ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <button
              onClick={handleShareOrder}
              className="btn btn-whatsapp btn-lg-mobile w-100"
            >
              <i className="bi bi-whatsapp me-2"></i>
              Share Order via WhatsApp
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="card-pahala card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-box me-2"></i>
              Order Items
            </h6>

            {order.items.map((item, index) => (
              <div key={index} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="rounded"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1 small fw-semibold">{item.product.name}</h6>
                  <div className="text-muted small">
                    {item.quantity} {item.product.unit} × {formatPrice(item.product.price)}
                  </div>
                </div>
                <div className="fw-semibold text-brown">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between pt-2">
              <span className="fw-bold">Total</span>
              <span className="fw-bold text-brown fs-5">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="card-pahala card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-geo-alt me-2"></i>
              Delivery Address
            </h6>
            <p className="mb-1 fw-semibold">{order.customer.name}</p>
            <p className="mb-1 text-muted small">{order.customer.address.street}</p>
            <p className="mb-1 text-muted small">
              {order.customer.address.city}, {order.customer.address.province}{' '}
              {order.customer.address.postalCode}
            </p>
            <p className="mb-0 text-muted small">
              <i className="bi bi-telephone me-1"></i>
              {order.customer.phone}
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card-pahala card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-credit-card me-2"></i>
              Payment Method
            </h6>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-cash-coin text-brown"></i>
              <span>Pay on Delivery</span>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="card-pahala card mb-3">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-sticky me-2"></i>
                Order Notes
              </h6>
              <p className="mb-0 text-muted">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="card-pahala card">
          <div className="card-body text-center">
            <p className="mb-3 text-muted small">
              Questions about your order?
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
              >
                <i className="bi bi-whatsapp me-1"></i>
                WhatsApp
              </a>
              <a
                href="tel:+6281234567890"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-telephone me-1"></i>
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
