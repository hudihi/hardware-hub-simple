import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import OrderCard from '../components/OrderCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { CustomerOrder } from '../services/checkout.service';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { customerOrders, fetchCustomerOrders } = useOrderFlow();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    status: order.payment_status === 'COMPLETED' ? 'completed' : 
            order.payment_status === 'FAILED' ? 'failed' : 
            order.payment_status === 'PENDING' ? 'pending' : 'pending',
    total_amount: order.amount,
    items: order.items,
    created_at: order.created_at,
    updated_at: order.updated_at
  });

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch customer orders using the new API
        await fetchCustomerOrders();
        console.log('Orders loaded successfully');
        
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        
        // Handle specific error cases
        if (error.message?.includes('not authenticated')) {
          setError('Please verify your phone number to view orders.');
        } else {
          setError(error.message || 'Failed to load orders');
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [fetchCustomerOrders]);

  return (
    <div className="page-container">
      <div className="container py-3">
        <h1 className="section-header">{t('orders_title')}</h1>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : customerOrders.length === 0 ? (
          <EmptyState
            icon="bi-box"
            title={t('orders_empty')}
            description={t('orders_empty_desc')}
            action={{
              label: t('product_view_products'),
              onClick: () => navigate('/products'),
            }}
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
