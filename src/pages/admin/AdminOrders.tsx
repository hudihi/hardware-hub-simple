import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { formatPrice, formatDate, getStatusText } from '../../utils/format';
import { OrderStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState('');
  const { language, t } = useLanguage();

  const filteredOrders = selectedStatus
    ? orders.filter((o) => o.status === selectedStatus)
    : orders;

  const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'];

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">{t('admin_orders')}</h4>

      <div className="card-pahala card mb-4">
        <div className="card-body">
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${selectedStatus === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedStatus('')}
            >
              {t('admin_all')} ({orders.length})
            </button>
            {statusOptions.map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <button
                  key={status}
                  className={`btn btn-sm ${selectedStatus === status ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {getStatusText(status, language)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-pahala card">
        <div className="card-body p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">{t('admin_no_orders_found')}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>{t('admin_order_id')}</th>
                    <th>{t('admin_customer')}</th>
                    <th>{t('admin_products')}</th>
                    <th>{t('cart_total')}</th>
                    <th>{t('admin_date')}</th>
                    <th>{t('admin_status')}</th>
                    <th>{t('admin_actions')}</th>
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
                      <td>{order.items.length} {t('admin_items')}</td>
                      <td className="text-brown fw-semibold">{formatPrice(order.total)}</td>
                      <td><small>{formatDate(order.createdAt, language)}</small></td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          style={{ width: 'auto' }}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{getStatusText(status, language)}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-outline-primary btn-sm"><i className="bi bi-eye"></i></button>
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
        {t('admin_showing')} {filteredOrders.length} {t('admin_of')} {orders.length} {t('admin_orders').toLowerCase()}
      </div>
    </div>
  );
};

export default AdminOrders;
