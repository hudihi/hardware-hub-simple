import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { products } from '../../data/products';
import { formatPrice } from '../../utils/format';

const AdminDashboard: React.FC = () => {
  const { orders } = useOrders();

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;

  const stats = [
    {
      label: 'Jumla ya Bidhaa',
      value: products.length,
      icon: 'bi-box-seam',
      color: 'primary',
    },
    {
      label: 'Jumla ya Maagizo',
      value: orders.length,
      icon: 'bi-receipt',
      color: 'success',
    },
    {
      label: 'Maagizo Yanasubiri',
      value: pendingOrders,
      icon: 'bi-clock',
      color: 'warning',
    },
    {
      label: 'Jumla ya Mapato',
      value: formatPrice(totalRevenue),
      icon: 'bi-currency-dollar',
      color: 'info',
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <h4 className="fw-bold mb-4">Dashibodi</h4>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-6 col-lg-3">
            <div className="card-pahala card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className={`rounded-circle bg-${stat.color} bg-opacity-10 p-3`}
                  >
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

      {/* Recent Orders */}
      <div className="card-pahala card">
        <div className="card-header bg-white">
          <h6 className="mb-0 fw-bold">Maagizo ya Hivi Karibuni</h6>
        </div>
        <div className="card-body p-0">
          {recentOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">
              Hakuna maagizo bado
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nambari ya Agizo</th>
                    <th>Mteja</th>
                    <th>Bidhaa</th>
                    <th>Jumla</th>
                    <th>Hali</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">{order.id}</td>
                      <td>{order.customer.name}</td>
                      <td>{order.items.length} bidhaa</td>
                      <td className="text-brown fw-semibold">
                        {formatPrice(order.total)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === 'pending'
                              ? 'bg-warning'
                              : order.status === 'completed'
                              ? 'bg-success'
                              : 'bg-info'
                          }`}
                        >
                          {order.status === 'pending' ? 'Inasubiri' : 
                           order.status === 'completed' ? 'Imekamilika' : 
                           order.status}
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
