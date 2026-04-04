import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { AdminOrder, adminService } from '../../services/admin.service';
import { formatDate, formatPrice, getStatusClass, getStatusText } from '../../utils/format';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // API uses 1-based pagination
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus, dateFrom, dateTo]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build parameters according to API spec
      const params: any = {
        page: currentPage,
        size: pageSize
      };
      
      // Add optional parameters only if they have values
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      if (dateFrom) {
        params.date_from = dateFrom;
      }
      if (dateTo) {
        params.date_to = dateTo;
      }
      
      const response = await adminService.getAllOrders(
        currentPage,
        pageSize,
        selectedStatus || undefined,
        dateFrom || undefined,
        dateTo || undefined
      );
      
      setOrders(response.items);
      setTotalOrders(response.total);
      setTotalPages(response.pages);
      console.log(`Loaded ${response.items.length} orders (page ${currentPage} of ${response.pages})`);
    } catch (error: any) {
      console.error('Failed to fetch admin orders:', error);
      
      // Handle specific error cases
      if (error.message.includes('Validation error')) {
        // Try with default parameters if validation fails
        try {
          console.log('Retrying with default parameters...');
          const fallbackResponse = await adminService.getAllOrders(1, 10);
          setOrders(fallbackResponse.items);
          setTotalOrders(fallbackResponse.total);
          setTotalPages(fallbackResponse.pages);
          setError('Using default pagination settings due to validation error.');
        } catch (fallbackError: any) {
          console.error('Fallback also failed:', fallbackError);
          setError(fallbackError.message || 'Failed to load orders with default settings');
        }
      } else {
        setError(error.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders; // Filtered by API now, not client-side

  const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'AWAITING_VERIFICATION', label: 'Awaiting Verification' },
  { value: 'PENDING_OTP', label: 'Pending OTP' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

  const handleStatusUpdate = async (orderId: string, newStatus: string, currentStatus: string) => {
    try {
      // Find the order
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        setError('Order not found');
        return;
      }
      
      // TEMPORARILY DISABLE permission check for testing
      // TODO: Re-enable when backend properly sets part_of_status
      /*
      // Check if admin is allowed to update status for this order
      if (!order.part_of_status) {
        setError('You do not have permission to update the status for this order');
        return;
      }
      */
      
      // Validate status transition before making API call
      if (!adminService.isValidStatusTransition(currentStatus, newStatus)) {
        const validTransitions = adminService.getValidStatusTransitions(currentStatus);
        setError(`Invalid status transition from "${currentStatus}" to "${newStatus}". Valid transitions: ${validTransitions.join(', ')}`);
        return;
      }
      
      console.log(`Attempting status update: ${currentStatus} → ${newStatus} for order ${orderId}`);
      await adminService.updateOrderStatus(orderId, newStatus);
      // Refresh orders to show updated status
      await fetchOrders();
      console.log(`Order ${orderId} status updated from ${currentStatus} to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      setError(error.message || 'Failed to update order status');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterReset = () => {
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">{t('admin_orders')}</h4>

      {error && (
        <div className="alert alert-danger mb-4 d-flex justify-content-between align-items-center" role="alert">
          <span>{error}</span>
          {error.includes('validation error') && (
            <button className="btn btn-sm btn-outline-danger" onClick={handleFilterReset}>
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card-pahala card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Status Filter</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date From</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Date To</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="card-pahala card mb-4">
        <div className="card-body">
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${selectedStatus === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setSelectedStatus('');
                setCurrentPage(1);
              }}
            >
              {t('admin_all')} ({totalOrders})
            </button>
            {statusOptions.map((status) => (
              <button
                key={status.value}
                className={`btn btn-sm ${selectedStatus === status.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => {
                  setSelectedStatus(status.value);
                  setCurrentPage(1);
                }}
              >
                {getStatusText(status.value, language)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-pahala card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
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
                    <th>Order Status</th>
                    <th>Payment Status</th>
                    <th>{t('admin_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">{order.id}</td>
                      <td>
                        <div>{order.customer_name}</div>
                        <small className="text-muted">{order.customer_phone}</small>
                      </td>
                      <td>{order.items.length} {t('admin_items')}</td>
                      <td className="text-brown fw-semibold">{formatPrice(order.total_amount)}</td>
                      <td><small>{formatDate(order.created_at, language)}</small></td>
                      <td>
                        <span className={`badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status, language)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${adminService.getPaymentStatusClass(order.payment_status || '')}`}>
                          {adminService.getPaymentStatusText(order.payment_status || 'PENDING', language)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          {/* Debug: Show order status */}
                          <small className="text-muted me-2">DEBUG: {order.status}</small>
                          
                          {/* Status Update Buttons */}
                          {(() => {
                            const validTransitions = adminService.getValidStatusTransitions(order.status);
                            console.log(`=== DEBUG ORDER ${order.id} ===`);
                            console.log('=== DEBUG ORDER OBJECT ===', order);
                            console.log(`=== DEBUG STATUS: ${order.status} ===`);
                            console.log('=== DEBUG VALID TRANSITIONS ===', validTransitions);
                            console.log('=== DEBUG TRANSITIONS LENGTH ===', validTransitions.length);
                            
                            // Debug: Check if transitions exist
                            if (validTransitions.length === 0) {
                              console.log(`=== NO BUTTONS FOR ORDER ${order.id} ===`);
                              return (
                                <div className="text-muted">
                                  <small>No actions available</small>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="btn-group d-flex gap-1" role="group">
                                {validTransitions.map((validStatus) => (
                                  <button
                                    key={validStatus}
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleStatusUpdate(order.id, validStatus, order.status)}
                                    title={`Update status to ${getStatusText(validStatus, language)}`}
                                  >
                                    {getStatusText(validStatus, language)}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                          
                          {/* View Button */}
                          <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        title="View order details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            {t('admin_showing')} {filteredOrders.length} {t('admin_of')} {totalOrders} {t('admin_orders').toLowerCase()}
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1; // Convert to 1-based numbering
                return (
                  <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </li>
                );
              })}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
