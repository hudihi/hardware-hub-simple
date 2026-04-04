import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { OrderFlowState, useOrderFlow } from '../hooks/useOrderFlow';
import authService from '../services/auth.service';
import { formatOrderDisplayCode, formatPrice } from '../utils/format';

function orderTimelineKey(order: OrderFlowState): string {
  const ps = (order.payment_status || '').toUpperCase();
  const os = (order.order_status || '').toUpperCase();
  if (ps === 'PAID' || os === 'CONFIRMED') return 'paid';
  if (ps === 'AWAITING_CONFIRMATION' || os === 'AWAITING_VERIFICATION') return 'awaiting_confirmation';
  return 'awaiting_payment';
}

function canUploadPaymentProof(order: OrderFlowState): boolean {
  const ps = (order.payment_status || '').toUpperCase();
  const os = (order.order_status || '').toUpperCase();
  if (ps === 'PAID' || os === 'CONFIRMED') return false;
  if (ps === 'AWAITING_CONFIRMATION' || os === 'AWAITING_VERIFICATION') return false;
  return true;
}

function displayStatusLabel(order: OrderFlowState): string {
  const ps = (order.payment_status || '').toUpperCase();
  const os = (order.order_status || '').toUpperCase();
  if (ps === 'PAID' || os === 'CONFIRMED') return 'Paid';
  if (ps === 'AWAITING_CONFIRMATION' || os === 'AWAITING_VERIFICATION') return 'Verifying payment';
  if (os === 'REJECTED' || ps === 'PROOF_REJECTED') return 'Proof rejected — upload again';
  if (os === 'AWAITING_PAYMENT' || os === 'PENDING_PAYMENT' || ps === 'PENDING') return 'Awaiting payment';
  return os || ps || 'In progress';
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customerOrders, fetchCustomerOrders } = useOrderFlow();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const order = customerOrders.find((o) => o.order_id === id);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');

        const customerToken = authService.getCustomerToken();
        if (!customerToken) {
          navigate(`/track-order?next=${encodeURIComponent(`/orders/${id || ''}`)}`);
          return;
        }

        await fetchCustomerOrders();
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate, fetchCustomerOrders]);

  const getStatusColor = (label: string) => {
    const s = label.toLowerCase();
    if (s.includes('paid')) return 'text-green-600 bg-green-50';
    if (s.includes('verifying')) return 'text-blue-600 bg-blue-50';
    if (s.includes('rejected')) return 'text-red-600 bg-red-50';
    if (s.includes('awaiting payment')) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getTimelineStatus = (key: string) => {
    switch (key) {
      case 'awaiting_payment':
        return {
          current: 0,
          steps: [
            { id: 0, label: 'Order placed', completed: true, active: true },
            { id: 1, label: 'Pay & upload proof', completed: false, active: false },
            { id: 2, label: 'We verify your payment', completed: false, active: false },
            { id: 3, label: 'Order confirmed', completed: false, active: false },
          ],
        };
      case 'awaiting_confirmation':
        return {
          current: 1,
          steps: [
            { id: 0, label: 'Order placed', completed: true, active: false },
            { id: 1, label: 'Pay & upload proof', completed: true, active: false },
            { id: 2, label: 'We verify your payment', completed: false, active: true },
            { id: 3, label: 'Order confirmed', completed: false, active: false },
          ],
        };
      case 'paid':
        return {
          current: 3,
          steps: [
            { id: 0, label: 'Order placed', completed: true, active: false },
            { id: 1, label: 'Pay & upload proof', completed: true, active: false },
            { id: 2, label: 'We verify your payment', completed: true, active: false },
            { id: 3, label: 'Order confirmed', completed: true, active: true },
          ],
        };
      default:
        return {
          current: 0,
          steps: [
            { id: 0, label: 'Order placed', completed: true, active: true },
            { id: 1, label: 'Pay & upload proof', completed: false, active: false },
            { id: 2, label: 'We verify your payment', completed: false, active: false },
            { id: 3, label: 'Order confirmed', completed: false, active: false },
          ],
        };
    }
  };

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  const goUploadProof = () => {
    if (order?.order_id) navigate(`/upload-proof/${order.order_id}`);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <h5 className="text-xl font-semibold mb-3">Order not found</h5>
          <p className="text-muted small mb-3">
            Verify your phone on Track Order if you just placed this order.
          </p>
          <button className="btn btn-primary me-2" onClick={() => navigate('/track-order')}>
            Track order
          </button>
          <button className="btn btn-outline-secondary" onClick={handleBackToOrders}>
            Back to orders
          </button>
        </div>
      </div>
    );
  }

  const timeline = getTimelineStatus(orderTimelineKey(order));
  const statusLabel = displayStatusLabel(order);
  const items = order.items || [];

  return (
    <div className="page-container py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button className="btn btn-link text-brown p-0 mb-3" onClick={handleBackToOrders}>
            <i className="bi bi-arrow-left me-1"></i>
            Back to Orders
          </button>
        </div>

        {error && (
          <div className="alert alert-warning mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-mono" title={order.order_id}>
                      {formatOrderDisplayCode(order.order_id)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusLabel)}`}>
                    {statusLabel}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer name</p>
                    <p className="font-semibold">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery location</p>
                    <p className="font-semibold">{order.customer_location}</p>
                  </div>
                  {order.order_notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-semibold">{order.order_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name || 'Product'}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatPrice(item.unit_price || item.price || 0)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice((item.unit_price || item.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-xl font-bold text-brown">{formatPrice(order.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {canUploadPaymentProof(order) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(order.order_status || '').toUpperCase() === 'REJECTED' ||
                  (order.payment_status || '').toUpperCase() === 'PROOF_REJECTED' ? (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-800">
                        Your previous proof was not accepted. Please upload a new screenshot or receipt.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Pay using the numbers on your order confirmation, then upload your proof here.
                      </p>
                    </div>
                  )}
                  <Button onClick={goUploadProof} className="w-full">
                    Upload payment proof
                  </Button>
                </CardContent>
              </Card>
            )}

            {(order.payment_status || '').toUpperCase() === 'AWAITING_CONFIRMATION' ||
            (order.order_status || '').toUpperCase() === 'AWAITING_VERIFICATION' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your payment proof was received. Our team will confirm it shortly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {(order.payment_status || '').toUpperCase() === 'PAID' ||
            (order.order_status || '').toUpperCase() === 'CONFIRMED' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">Payment confirmed — your order is being processed.</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Need help?</h3>
                  <p className="text-sm text-gray-600">{t('orders_help')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
