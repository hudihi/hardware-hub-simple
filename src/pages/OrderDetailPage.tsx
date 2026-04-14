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

function displayStatusKey(order: OrderFlowState): string {
  const ps = (order.payment_status || '').toUpperCase();
  const os = (order.order_status || '').toUpperCase();
  if (ps === 'PAID' || os === 'CONFIRMED') return 'order_status_paid';
  if (ps === 'AWAITING_CONFIRMATION' || os === 'AWAITING_VERIFICATION') return 'order_status_verifying';
  if (os === 'REJECTED' || ps === 'PROOF_REJECTED') return 'order_status_proof_rejected';
  if (os === 'AWAITING_PAYMENT' || os === 'PENDING_PAYMENT' || ps === 'PENDING') return 'order_status_awaiting_payment';
  return 'order_status_in_progress';
}

const POLL_INTERVAL_MS = 8000; // check every 8 seconds

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customerOrders, fetchCustomerOrders } = useOrderFlow();
  const { t } = useLanguage();

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [isPolling, setIsPolling]       = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

  const order = customerOrders.find((o) => o.order_id === id);

  // Initial load
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

  // Poll for status changes while the order is awaiting admin verification
  useEffect(() => {
    if (!order) return;

    const ps = (order.payment_status || '').toUpperCase();
    const os = (order.order_status  || '').toUpperCase();

    const waitingForVerification =
      ps === 'AWAITING_CONFIRMATION' || os === 'AWAITING_VERIFICATION';

    if (!waitingForVerification) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const intervalId = setInterval(async () => {
      try {
        await fetchCustomerOrders(true); // bypass cache — always fresh
      } catch {
        // silent — don't surface polling errors to the user
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [order?.payment_status, order?.order_status, fetchCustomerOrders]);

  // Detect the moment status flips to confirmed/paid and show a banner
  useEffect(() => {
    if (!order) return;
    const ps = (order.payment_status || '').toUpperCase();
    const os = (order.order_status  || '').toUpperCase();
    if (ps === 'PAID' || os === 'CONFIRMED') {
      setJustConfirmed(true);
    }
  }, [order?.payment_status, order?.order_status]);

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
            { id: 0, labelKey: 'timeline_order_placed', completed: true, active: true },
            { id: 1, labelKey: 'timeline_pay_upload', completed: false, active: false },
            { id: 2, labelKey: 'timeline_we_verify', completed: false, active: false },
            { id: 3, labelKey: 'timeline_order_confirmed', completed: false, active: false },
          ],
        };
      case 'awaiting_confirmation':
        return {
          current: 1,
          steps: [
            { id: 0, labelKey: 'timeline_order_placed', completed: true, active: false },
            { id: 1, labelKey: 'timeline_pay_upload', completed: true, active: false },
            { id: 2, labelKey: 'timeline_we_verify', completed: false, active: true },
            { id: 3, labelKey: 'timeline_order_confirmed', completed: false, active: false },
          ],
        };
      case 'paid':
        return {
          current: 3,
          steps: [
            { id: 0, labelKey: 'timeline_order_placed', completed: true, active: false },
            { id: 1, labelKey: 'timeline_pay_upload', completed: true, active: false },
            { id: 2, labelKey: 'timeline_we_verify', completed: true, active: false },
            { id: 3, labelKey: 'timeline_order_confirmed', completed: true, active: true },
          ],
        };
      default:
        return {
          current: 0,
          steps: [
            { id: 0, labelKey: 'timeline_order_placed', completed: true, active: true },
            { id: 1, labelKey: 'timeline_pay_upload', completed: false, active: false },
            { id: 2, labelKey: 'timeline_we_verify', completed: false, active: false },
            { id: 3, labelKey: 'timeline_order_confirmed', completed: false, active: false },
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
          <p>{t('order_loading_detail')}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <h5 className="text-xl font-semibold mb-3">{t('order_not_found_msg')}</h5>
          <p className="text-muted small mb-3">
            {t('order_verify_phone_hint')}
          </p>
          <button className="btn btn-primary me-2" onClick={() => navigate('/track-order')}>
            {t('order_track_btn')}
          </button>
          <button className="btn btn-outline-secondary" onClick={handleBackToOrders}>
            {t('order_back_orders_btn')}
          </button>
        </div>
      </div>
    );
  }

  const timeline = getTimelineStatus(orderTimelineKey(order));
  const statusLabel = t(displayStatusKey(order) as any);
  const items = order.items || [];

  return (
    <div className="page-container py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button className="btn btn-link text-brown p-0 mb-3" onClick={handleBackToOrders}>
            <i className="bi bi-arrow-left me-1"></i>
            {t('order_back_orders_btn')}
          </button>
        </div>

        {error && (
          <div className="alert alert-warning mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Live polling indicator — shown while waiting for admin to verify */}
        {isPolling && (
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
            {t('order_payment_checking')}
          </div>
        )}

        {/* Banner shown the moment admin confirms */}
        {justConfirmed && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl px-4 py-3 mb-4">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800">{t('order_payment_confirmed_title')}</p>
              <p className="text-sm text-green-700">{t('order_payment_confirmed_desc')}</p>
            </div>
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
                    <p className="text-sm text-gray-600">{t('order_customer_name_label')}</p>
                    <p className="font-semibold">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('order_phone_label')}</p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('order_delivery_location_label')}</p>
                    <p className="font-semibold">{order.customer_location}</p>
                  </div>
                  {order.order_notes && (
                    <div>
                      <p className="text-sm text-gray-600">{t('order_notes_label')}</p>
                      <p className="font-semibold">{order.order_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('order_items_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name || t('product')}</p>
                        <p className="text-sm text-gray-600">
                          {t('quantity')}: {item.quantity} × {formatPrice(item.unit_price || item.price || 0)}
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
                    <span className="text-lg font-semibold">{t('order_total_label')}</span>
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
                  <CardTitle className="text-lg">{t('order_payment_card_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(order.order_status || '').toUpperCase() === 'REJECTED' ||
                  (order.payment_status || '').toUpperCase() === 'PROOF_REJECTED' ? (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-800">{t('order_proof_rejected_msg')}</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">{t('order_payment_instructions_msg')}</p>
                    </div>
                  )}
                  <Button onClick={goUploadProof} className="w-full">
                    {t('order_upload_proof_btn')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {(order.payment_status || '').toUpperCase() === 'AWAITING_CONFIRMATION' ||
            (order.order_status || '').toUpperCase() === 'AWAITING_VERIFICATION' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('order_verification_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">{t('order_verification_desc')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {(order.payment_status || '').toUpperCase() === 'PAID' ||
            (order.order_status || '').toUpperCase() === 'CONFIRMED' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('order_confirmed_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">{t('order_confirmed_desc')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">{t('order_need_help_title')}</h3>
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
