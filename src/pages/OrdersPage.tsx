import React from 'react';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, getOrdersByCustomer } = useOrders();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const userOrders = isAuthenticated && user
    ? getOrdersByCustomer(user.id)
    : orders;

  return (
    <div className="page-container">
      <div className="container py-3">
        <h1 className="section-header">{t('orders_title')}</h1>

        {userOrders.length === 0 ? (
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
            {userOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <div className="card-pahala card mt-4">
          <div className="card-body text-center">
            <p className="mb-3 text-muted small">{t('orders_help')}</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                <i className="bi bi-whatsapp me-1"></i> WhatsApp
              </a>
              <a href="tel:+6281234567890" className="btn btn-outline-primary btn-sm">
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
