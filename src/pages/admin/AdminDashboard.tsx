import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { adminService, DashboardSummary, PopularProduct, RecentOrder, RevenueOverview } from '../../services/admin.service';
import { formatPrice, getStatusClass, getStatusText } from '../../utils/format';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [actualProductCount, setActualProductCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenue, setRevenue] = useState<RevenueOverview | null>(null);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all dashboard data in parallel
      const [summaryData, recentOrdersData, revenueData, popularProductsData, productsData] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getRecentOrders(),
        adminService.getRevenueOverview(),
        adminService.getPopularProducts(),
        adminService.getAllProducts(1, 100) // Get all products to count them
      ]);
      
      setSummary(summaryData);
      setActualProductCount(productsData.total); // Use actual count from products API
      setRecentOrders(recentOrdersData);
      setRevenue(revenueData);
      setPopularProducts(popularProductsData);
      
      console.log('Dashboard data loaded successfully');
      console.log('Product count discrepancy:', {
        dashboard: summaryData.total_products,
        actual: productsData.total,
        items: productsData.items.length
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: t('admin_total_products'), value: actualProductCount, icon: 'bi-box-seam', color: 'primary' },
    { label: t('admin_total_orders'), value: summary?.total_orders || 0, icon: 'bi-receipt', color: 'success' },
    { label: t('admin_pending_orders'), value: summary?.pending_orders || 0, icon: 'bi-clock', color: 'warning' },
    { label: t('admin_total_revenue'), value: formatPrice(summary?.total_revenue || 0), icon: 'bi-currency-dollar', color: 'info' },
  ];

  if (loading) {
    return (
      <div>
        <h4 className="fw-bold mb-4">{t('admin_dashboard')}</h4>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h4 className="fw-bold mb-4">{t('admin_dashboard')}</h4>
        <div className="alert alert-danger">
          <h5>{t('error')}</h5>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                      <td>
                        <div>{order.customer_name}</div>
                        <small className="text-muted">{order.customer_phone}</small>
                      </td>
                      <td>{order.items.length} {t('admin_items')}</td>
                      <td className="text-brown fw-semibold">{formatPrice(order.total_amount)}</td>
                      <td>
                        <span className={`badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status, 'en')}
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
