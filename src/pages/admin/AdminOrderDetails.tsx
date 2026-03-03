import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { AdminOrder, adminService } from '../../services/admin.service';
import { formatDate, formatPrice, getStatusClass, getStatusText } from '../../utils/format';

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      setError('');
      const orderData = await adminService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Failed to fetch order details:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string, currentStatus: string) => {
    if (!order) return;
    
    try {
      // Validate status transition before making API call
      if (!adminService.isValidStatusTransition(currentStatus, newStatus)) {
        const validTransitions = adminService.getValidStatusTransitions(currentStatus);
        setError(`Invalid status transition from "${currentStatus}" to "${newStatus}". Valid transitions: ${validTransitions.join(', ')}`);
        return;
      }
      
      await adminService.updateOrderStatus(order.id, newStatus);
      // Refresh order details
      await fetchOrderDetails(order.id);
      console.log(`Order ${order.id} status updated from ${currentStatus} to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      setError(error.message || 'Failed to update order status');
    }
  };

  const goBack = () => {
    navigate('/admin/orders');
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>{t('error')}</h5>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={goBack}>
            {t('back_to_orders')}
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h5>{t('order_not_found')}</h5>
          <button className="btn btn-primary" onClick={goBack}>
            {t('back_to_orders')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('order_details')}</h2>
        <button className="btn btn-secondary" onClick={goBack}>
          <i className="bi bi-arrow-left me-2"></i>
          {t('back_to_orders')}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}>
            <span>&times;</span>
          </button>
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('order_information')}</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('order_id')}</label>
                    <div className="form-control-plaintext">{order.id}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('status')}</label>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${getStatusClass(order.status)} me-2`}>
                        {getStatusText(order.status, language)}
                      </span>
                      {(() => {
                        const validTransitions = adminService.getValidStatusTransitions(order.status);
                        return validTransitions.map((validStatus) => (
                          <button
                            key={validStatus}
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleStatusUpdate(validStatus, order.status)}
                            title={`Update status to ${getStatusText(validStatus, language)}`}
                          >
                            {getStatusText(validStatus, language)}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('created_at')}</label>
                    <div className="form-control-plaintext">
                      {formatDate(order.created_at, language)}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('updated_at')}</label>
                    <div className="form-control-plaintext">
                      {formatDate(order.updated_at, language)}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('payment_method')}</label>
                    <div className="form-control-plaintext">{order.payment_method}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('total_amount')}</label>
                    <div className="form-control-plaintext fw-bold text-brown">
                      {formatPrice(order.total_amount)}
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">{t('order_notes')}</label>
                    <div className="form-control-plaintext">
                      {order.order_notes || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('customer_information')}</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">{t('customer_name')}</label>
                <div className="form-control-plaintext">{order.customer_name}</div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('customer_phone')}</label>
                <div className="form-control-plaintext">{order.customer_phone}</div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('customer_address')}</label>
                <div className="form-control-plaintext">{order.customer_address}</div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('customer_city')}</label>
                <div className="form-control-plaintext">{order.customer_city}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('order_items')}</h5>
              <span className="badge bg-secondary ms-2">{order.items.length} {t('items')}</span>
            </div>
            <div className="card-body">
              {order.items.length === 0 ? (
                <p className="text-muted">{t('no_items')}</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>{t('product')}</th>
                        <th>{t('quantity')}</th>
                        <th>{t('price')}</th>
                        <th>{t('total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name || item.name || 'N/A'}</td>
                          <td>{item.quantity || 1}</td>
                          <td>{formatPrice(item.unit_price || 0)}</td>
                          <td>{formatPrice(item.total_price || 0)}</td>
                        </tr>
                      ))}
                      <tr className="table-active fw-bold">
                        <td colSpan={3} className="text-end">= Total of all items:</td>
                        <td>{formatPrice(order.items.reduce((sum, item) => sum + (item.total_price || 0), 0))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
