import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CustomerOrder } from '../services/checkout.service';
import { Order } from '../types';
import { formatDate, formatOrderDisplayCode, formatPrice, getStatusClass, getStatusText } from '../utils/format';
import { shareOrder } from '../utils/whatsapp';

interface OrderCardProps {
  order: Order | CustomerOrder;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { language, t } = useLanguage();

  // Handle both Order and CustomerOrder types with proper type guards
  const isCustomerOrder = (order: any): order is CustomerOrder => {
    return 'customer_phone' in order;
  };

  const orderId = order.id;
  const orderDisplayCode = formatOrderDisplayCode(String(orderId));
  const orderTotal = isCustomerOrder(order) ? order.total_amount : order.total;
  const orderCreatedAt = isCustomerOrder(order) ? order.created_at : order.createdAt;
  const orderItems = order.items;
  const orderStatus = order.status;

  const handleShareOrder = () => {
    // Convert to Order type for sharing if needed
    const shareOrderData = isCustomerOrder(order) ? {
      id: orderId,
      items: orderItems,
      customer: {
        id: '',
        name: order.customer_name,
        email: '',
        phone: order.customer_phone,
        address: {
          street: order.customer_address,
          city: order.customer_city,
          province: '',
          postalCode: ''
        }
      },
      status: orderStatus as any, // Cast to any to handle string status from API
      total: orderTotal,
      notes: order.order_notes || '',
      createdAt: orderCreatedAt
    } : order;
    shareOrder(orderId, shareOrderData, language);
  };

  return (
    <div className="card-pahala card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="mb-1 fw-bold font-monospace" title={orderId}>{orderDisplayCode}</h6>
            <small className="text-muted">{formatDate(orderCreatedAt, language)}</small>
          </div>
          <span className={`status-badge ${getStatusClass(orderStatus)}`}>
            {getStatusText(orderStatus, language)}
          </span>
        </div>

        <div className="mb-3">
          {orderItems.slice(0, 2).map((item, index) => (
            <div key={index} className="d-flex justify-content-between small mb-1">
              <span className="text-muted">
                {item.quantity}x {'product_name' in item ? item.product_name : item.product?.name || item.name}
              </span>
              <span>{formatPrice(('unit_price' in item ? item.unit_price : item.product?.price || 0) * item.quantity)}</span>
            </div>
          ))}
          {orderItems.length > 2 && (
            <small className="text-muted">
              +{orderItems.length - 2} {t('orders_more')}
            </small>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
          <div>
            <small className="text-muted">{t('cart_total')}</small>
            <div className="fw-bold text-brown">{formatPrice(orderTotal)}</div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleShareOrder}
              className="btn btn-whatsapp btn-sm"
            >
              <i className="bi bi-whatsapp me-1"></i>
              {t('orders_share')}
            </button>
            <Link
              to={`/orders/${orderId}`}
              className="btn btn-outline-primary btn-sm"
            >
              {t('orders_details')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
