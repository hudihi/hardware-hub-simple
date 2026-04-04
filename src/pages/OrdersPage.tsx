import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import OrderCard from '../components/OrderCard';
import { useLanguage } from '../context/LanguageContext';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { CustomerOrder } from '../services/checkout.service';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { customerOrders } = useOrderFlow();

  // Transform OrderFlowState to CustomerOrder format for OrderCard
  const transformToCustomerOrder = (order: any): CustomerOrder => ({
    id: order.order_id,
    cart_id: order.order_id, // Use order_id as cart_id for compatibility
    customer_phone: order.phone,
    customer_address: order.customer_location,
    customer_name: order.customer_name,
    customer_city: order.customer_location, // Use location as city for compatibility
    order_notes: order.order_notes,
    payment_method: 'mobile_money', // Default payment method
    status: String(order.payment_status || '')
      .toLowerCase() === 'completed'
      ? 'completed'
      : String(order.payment_status || '').toLowerCase() === 'failed'
      ? 'failed'
      : 'pending',
    total_amount: Number(order.amount ?? order.total_amount ?? order.total ?? 0),
    items: order.items,
    created_at: order.created_at,
    updated_at: order.updated_at
  });

  return (
    <div className="page-container">
      <div className="container py-3">
        <h1 className="section-header">{t('orders_title')}</h1>
        <div className="card-pahala card mb-4">
          <div className="card-body text-center">
            <h6 className="fw-bold mb-2">Track your orders</h6>
            <p className="text-muted small mb-3">
              Verify your phone with OTP to access your order history and status updates.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg-mobile"
              onClick={() => navigate('/track-order')}
            >
              <i className="bi bi-shield-check me-2"></i>
              Track Orders
            </button>
          </div>
        </div>

        {customerOrders.length === 0 ? (
          <EmptyState
            icon="bi-box"
            title="No orders loaded yet"
            description="Use Track Orders above and complete phone verification to view your orders."
          />
        ) : (
          <div>
            {customerOrders.map((order) => (
              <OrderCard key={order.order_id} order={transformToCustomerOrder(order)} />
            ))}
          </div>
        )}

        <div className="card-pahala card mt-4">
          <div className="card-body text-center">
            <p className="mb-3 text-muted small">{t('orders_help')}</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <a href="https://wa.me/621979787" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                <i className="bi bi-whatsapp me-1"></i> WhatsApp
              </a>
              <a href="tel:+255621979787" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-telephone me-1"></i> {t('home_call')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
