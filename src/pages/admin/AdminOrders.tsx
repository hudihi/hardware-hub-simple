import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { formatPrice, formatDate, getStatusText } from '../../utils/format';
import { OrderStatus } from '../../types';

const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredOrders = selectedStatus
    ? orders.filter((o) => o.status === selectedStatus)
    : orders;

  const statusOptions: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'ready',
    'completed',
    'cancelled',
  ];

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Maagizo</h4>

      {/* Filter */}
      <div className="card-pahala card mb-4">
        <div className="card-body">
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${
                selectedStatus === '' ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setSelectedStatus('')}
            >
              Yote ({orders.length})
            </button>
            {statusOptions.map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <button
                  key={status}
                  className={`btn btn-sm ${
                    selectedStatus === status
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {getStatusText(status)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-pahala card">
        <div className="card-body p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">
              Hakuna maagizo yaliyopatikana
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
                    <th>Tarehe</th>
                    <th>Hali</th>
                    <th>Vitendo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">{order.id}</td>
                      <td>
                        <div>{order.customer.name}</div>
                        <small className="text-muted">{order.customer.phone}</small>
                      </td>
                      <td>{order.items.length} bidhaa</td>
                      <td className="text-brown fw-semibold">
                        {formatPrice(order.total)}
                      </td>
                      <td>
                        <small>{formatDate(order.createdAt)}</small>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          style={{ width: 'auto' }}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {getStatusText(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-muted small">
        Inaonyesha {filteredOrders.length} kati ya {orders.length} maagizo
      </div>
    </div>
  );
};

export default AdminOrders;
