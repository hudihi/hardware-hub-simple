import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import OrderCard from '../components/OrderCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { checkoutService, CustomerOrder } from '../services/checkout.service';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      // Security check 1: Ensure user is authenticated
      if (!isAuthenticated || !user?.phone) {
        console.log('User not authenticated or no phone number, skipping order fetch');
        setLoading(false);
        return;
      }

      // Security check 2: Validate phone number format
      const phoneNumber = user.phone.trim();
      if (!phoneNumber || phoneNumber.length < 10) {
        console.error('Invalid phone number format:', phoneNumber);
        setError('Invalid phone number. Please update your profile.');
        setLoading(false);
        return;
      }

      // Security check 3: Ensure we're not fetching for empty/null phone
      if (phoneNumber === '+' || phoneNumber === '') {
        console.error('Empty phone number detected');
        setError('Phone number is required to view orders.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching orders for authenticated user:', {
          userId: user.id,
          phoneNumber: phoneNumber.substring(0, 3) + '****' + phoneNumber.substring(phoneNumber.length - 2), // Log masked phone for privacy
          isAuthenticated: isAuthenticated
        });
        
        const customerOrders = await checkoutService.getCustomerOrders(phoneNumber);
        
        // Security check 4: Validate that returned orders belong to the same user
        const validatedOrders = customerOrders.filter(order => {
          // Check if the phone number matches exactly (case-insensitive)
          const orderPhoneMatches = order.customer_phone === phoneNumber || 
                                  order.customer_phone === phoneNumber.replace(/\s+/g, '') ||
                                  order.customer_phone.replace(/\s+/g, '') === phoneNumber;
          
          if (!orderPhoneMatches) {
            console.warn('Order phone mismatch detected:', {
              orderId: order.id,
              orderPhone: order.customer_phone,
              userPhone: phoneNumber
            });
          }
          
          return orderPhoneMatches;
        });
        
        if (validatedOrders.length !== customerOrders.length) {
          console.warn(`Filtered ${customerOrders.length - validatedOrders.length} orders due to phone mismatch`);
        }
        
        setOrders(validatedOrders);
        console.log(`Successfully loaded ${validatedOrders.length} orders for user`);
        
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
          // Optionally redirect to login
          // navigate('/login');
        } else if (error.response?.status === 403) {
          setError('You are not authorized to view these orders.');
        } else if (error.response?.status === 404) {
          // No orders found is not an error - just empty state
          console.log('No orders found for user');
        } else {
          setError(error.message || 'Failed to load orders');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user?.phone, user?.id, navigate]);

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
        ) : orders.length === 0 ? (
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
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
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
