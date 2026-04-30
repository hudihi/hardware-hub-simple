import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import LiveMap from '../../components/admin/LiveMap';
import { useLanguage } from '../../context/LanguageContext';
import { useLiveLocations } from '../../hooks/useLiveLocations';
import { adminService, DashboardSummary, PopularProduct, RecentOrder, RevenueOverview, VisitorStats } from '../../services/admin.service';
import { formatOrderDisplayCode, formatPrice, getStatusClass, getStatusText } from '../../utils/format';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [actualProductCount, setActualProductCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenue, setRevenue] = useState<RevenueOverview | null>(null);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);

  // Live locations hook
  const { users: liveUsers, isConnected, error: locationError, reconnect } = useLiveLocations();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all dashboard data in parallel
      const [summaryData, recentOrdersData, revenueData, popularProductsData, productsData, visitorData] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getRecentOrders(),
        adminService.getRevenueOverview(),
        adminService.getPopularProducts(),
        adminService.getAllProducts(1, 100),
        adminService.getVisitorStats(30).catch(() => null),
      ]);

      setSummary(summaryData);
      setActualProductCount(productsData.total);
      setRecentOrders(recentOrdersData);
      setRevenue(revenueData);
      setPopularProducts(popularProductsData);
      setVisitorStats(visitorData);
      
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

  const completedOrders = (summary?.confirmed_orders || 0) + (summary?.delivered_orders || 0);
  
  const stats = [
    { label: t('admin_total_products'), value: actualProductCount, icon: 'bi-box-seam', color: 'primary' },
    { label: t('admin_total_orders'), value: summary?.total_orders || 0, icon: 'bi-receipt', color: 'success' },
    { label: t('admin_pending_orders'), value: summary?.pending_orders || 0, icon: 'bi-clock', color: 'warning' },
    { label: t('admin_completed_orders'), value: completedOrders, icon: 'bi-check-circle', color: 'info' },
    { label: t('admin_total_revenue'), value: formatPrice(summary?.total_revenue || 0), icon: 'bi-currency-dollar', color: 'secondary' },
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
          <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-2">
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

      {/* Daily Visitor Trend */}
      {visitorStats && (
        <div className="card-pahala card mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">
              Daily Visitors
              <span className="badge bg-primary ms-2">{visitorStats.total} in 30 days</span>
            </h6>
            <small className="text-muted">Unique visitors per day</small>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={visitorStats.data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  tick={{ fontSize: 11 }}
                  interval={4}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [value, 'Visitors']}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                />
                <Bar dataKey="count" fill="#0d6efd" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Live Visitor Intelligence */}
      <div className="card-pahala card mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">
            Live Visitors
            {liveUsers.length > 0 && (
              <span className="badge bg-success ms-2">{liveUsers.length} online</span>
            )}
          </h6>
          <div className="d-flex align-items-center gap-2">
            <div className={`rounded-circle ${isConnected ? 'bg-success' : 'bg-danger'}`}
              style={{ width: 8, height: 8 }} />
            <small className="text-muted">{isConnected ? 'Connected' : 'Disconnected'}</small>
            {locationError && (
              <button className="btn btn-sm btn-outline-secondary" onClick={reconnect}>
                <i className="bi bi-arrow-clockwise" />
              </button>
            )}
          </div>
        </div>

        {/* Stats row above map */}
        {liveUsers.length > 0 && (() => {
          const funnelStages = [
            { label: 'Home',     icon: 'bi-house',        match: (p: string) => p === '/' },
            { label: 'Products', icon: 'bi-grid',         match: (p: string) => p.startsWith('/products') },
            { label: 'Cart',     icon: 'bi-cart',         match: (p: string) => p === '/cart' },
            { label: 'Checkout', icon: 'bi-credit-card',  match: (p: string) => p.startsWith('/checkout') || p.startsWith('/payment') },
          ];
          const devices = {
            mobile:  liveUsers.filter(u => u.device_type === 'mobile').length,
            tablet:  liveUsers.filter(u => u.device_type === 'tablet').length,
            desktop: liveUsers.filter(u => !u.device_type || u.device_type === 'desktop').length,
          };
          return (
            <div className="card-body border-bottom py-2 px-3">
              <div className="row g-2">
                {/* Funnel */}
                <div className="col-12 col-md-8">
                  <small className="text-muted fw-semibold d-block mb-1">Conversion Funnel</small>
                  <div className="d-flex gap-2 flex-wrap">
                    {funnelStages.map(stage => {
                      const count = liveUsers.filter(u => stage.match(u.page ?? '/')).length;
                      return (
                        <div key={stage.label}
                          className="d-flex align-items-center gap-1 bg-light rounded px-2 py-1">
                          <i className={`bi ${stage.icon} text-muted`} style={{ fontSize: 11 }} />
                          <span className="small">{stage.label}</span>
                          <span className={`badge ${count > 0 ? 'bg-primary' : 'bg-secondary'}`}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Devices */}
                <div className="col-12 col-md-4">
                  <small className="text-muted fw-semibold d-block mb-1">Devices</small>
                  <div className="d-flex gap-2">
                    {devices.mobile > 0 && (
                      <span className="d-flex align-items-center gap-1 bg-light rounded px-2 py-1 small">
                        📱 {devices.mobile}
                      </span>
                    )}
                    {devices.tablet > 0 && (
                      <span className="d-flex align-items-center gap-1 bg-light rounded px-2 py-1 small">
                        📋 {devices.tablet}
                      </span>
                    )}
                    {devices.desktop > 0 && (
                      <span className="d-flex align-items-center gap-1 bg-light rounded px-2 py-1 small">
                        💻 {devices.desktop}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="card-body p-0">
          <LiveMap users={liveUsers} height="400px" />
        </div>
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
                      <td className="fw-semibold" title={order.id}>{formatOrderDisplayCode(order.id)}</td>
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
