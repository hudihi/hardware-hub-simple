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
  const transformToCustomerOrder = (order: any): CustomerOrder => {
    // Map uppercase backend status to lowercase frontend status
    const getStatusMapping = (status: string): string => {
      const statusLower = (status || '').toLowerCase();
      switch (statusLower) {
        case 'confirmed':
        case 'paid':
          return 'confirmed';
        case 'delivered':
        case 'completed':
          return 'completed';
        case 'cancelled':
          return 'cancelled';
        case 'awaiting_payment':
        case 'pending_payment':
        case 'awaiting_verification':
        case 'pending_otp':
        case 'rejected':
          return 'pending';
        default:
          return 'pending';
      }
    };

    return {
      id: order.order_id,
      cart_id: order.order_id, // Use order_id as cart_id for compatibility
      customer_phone: order.phone,
      customer_address: order.customer_location,
      customer_name: order.customer_name,
      customer_city: order.customer_location, // Use location as city for compatibility
      order_notes: order.order_notes,
      payment_method: 'mobile_money', // Default payment method
      status: getStatusMapping(order.order_status), // Properly map the order status
      total_amount: Number(order.amount ?? order.total_amount ?? order.total ?? 0),
      items: order.items,
      created_at: order.created_at,
      updated_at: order.updated_at
    };
  };

  return (
    <div className="page-container">
      <div className="container py-3">
        <h1 className="section-header">{t('orders_title')}</h1>
        <div className="card-pahala card mb-4">
          <div className="card-body text-center">
            <h6 className="fw-bold mb-2">{t('orders_track_title')}</h6>
            <p className="text-muted small mb-3">
              {t('orders_track_desc')}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg-mobile"
              onClick={() => navigate('/track-order')}
            >
              <i className="bi bi-shield-check me-2"></i>
              {t('orders_track_btn')}
            </button>
          </div>
        </div>

        {customerOrders.length === 0 ? (
          <EmptyState
            icon="bi-box"
            title={t('orders_empty_loaded')}
            description={t('orders_empty_loaded_desc')}
          />
        ) : (
          <div>
            {customerOrders.map((order) => (
              <OrderCard key={order.order_id} order={transformToCustomerOrder(order)} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default OrdersPage;
