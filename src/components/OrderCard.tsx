import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { formatPrice, formatDate, getStatusText, getStatusClass } from '../utils/format';
import { shareOrder } from '../utils/whatsapp';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const handleShareOrder = () => {
    shareOrder(order);
  };

  return (
    <div className="card-pahala card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="mb-1 fw-bold">{order.id}</h6>
            <small className="text-muted">{formatDate(order.createdAt)}</small>
          </div>
          <span className={`status-badge ${getStatusClass(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        <div className="mb-3">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="d-flex justify-content-between small mb-1">
              <span className="text-muted">
                {item.quantity}x {item.product.name}
              </span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <small className="text-muted">
              +{order.items.length - 2} more items
            </small>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
          <div>
            <small className="text-muted">Total</small>
            <div className="fw-bold text-brown">{formatPrice(order.total)}</div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleShareOrder}
              className="btn btn-whatsapp btn-sm"
            >
              <i className="bi bi-whatsapp me-1"></i>
              Share
            </button>
            <Link
              to={`/orders/${order.id}`}
              className="btn btn-outline-primary btn-sm"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
