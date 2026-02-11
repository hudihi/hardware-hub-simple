import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { products } from '../../data/products';
import { formatPrice } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboard: React.FC = () => {
  const { orders } = useOrders();
  const { t } = useLanguage();

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const stats = [
    { label: t('admin_total_products'), value: products.length, icon: 'bi-box-seam', color: 'primary' },
    { label: t('admin_total_orders'), value: orders.length, icon: 'bi-receipt', color: 'success' },
    { label: t('admin_pending_orders'), value: pendingOrders, icon: 'bi-clock', color: 'warning' },
    { label: t('admin_total_revenue'), value: formatPrice(totalRevenue), icon: 'bi-currency-dollar', color: 'info' },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <h4 className="fw-bold mb-4">{t('admin_dashboard')}</h4>

      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-6 col-lg-3">
            <div className="card-pahala card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <div className={`rounded-circle bg-${stat.color} bg-opacity-10 p-3`}>
                    <i className={`bi ${stat.icon} text-${stat.color} fs-4`}></i>
                  </div>
                  <div>
                    <div className="text-muted small">{stat.label}</div>
                    <div className="fw-bold fs-5">{stat.value}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-pahala card">
        <div className="card-header bg-white">
          <h6 className="mb-0 fw-bold">{t('admin_recent_orders')}</h6>
        </div>
        <div className="card-body p-0">
          {recentOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">{t('admin_no_orders')}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>{t('admin_order_id')}</th>
                    <th>{t('admin_customer')}</th>
                    <th>{t('admin_products')}</th>
                    <th>{t('cart_total')}</th>
                    <th>{t('admin_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">{order.id}</td>
                      <td>{order.customer.name}</td>
                      <td>{order.items.length} {t('admin_items')}</td>
                      <td className="text-brown fw-semibold">{formatPrice(order.total)}</td>
                      <td>
                        <span className={`badge ${order.status === 'pending' ? 'bg-warning' : order.status === 'completed' ? 'bg-success' : 'bg-info'}`}>
                          {order.status === 'pending' ? t('status_pending') : order.status === 'completed' ? t('status_completed') : order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
