import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { useOrderFlow } from '../hooks/useOrderFlow';
import authService from '../services/auth.service';
import { formatOrderDisplayCode, formatPrice } from '../utils/format';
import UploadPaymentProof from './UploadPaymentProof';

const OrderTrackingPage: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const { token: accessToken } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { customerOrders, fetchCustomerOrders } = useOrderFlow();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadProof, setShowUploadProof] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Find the order from customerOrders or fetch by magic link
  const order = customerOrders.find(o => o.order_id === orderId);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');

        // Check if we have a magic link token
        if (accessToken && orderId) {
          // Validate token and fetch order details
          // For now, we'll fetch all orders and find the matching one
          await fetchCustomerOrders();
        } else {
          // Check if user has valid OTP session
          const customerToken = authService.getCustomerToken();
          if (!customerToken) {
            navigate('/track-order');
            return;
          }
          
          await fetchCustomerOrders();
        }
      } catch (error: any) {
        console.error('Failed to fetch order:', error);
        setError(error.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, accessToken, navigate, fetchCustomerOrders]);

  const getTimelineStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'placed':
      case 'awaiting_payment':
        return {
          current: 0,
          steps: [
            { id: 0, labelKey: 'timeline_order_placed_full', completed: true, active: true },
            { id: 1, labelKey: 'timeline_awaiting_payment', completed: false, active: false },
            { id: 2, labelKey: 'timeline_verifying_payment', completed: false, active: false },
            { id: 3, labelKey: 'timeline_order_confirmed_full', completed: false, active: false },
          ]
        };
      case 'verifying':
      case 'awaiting_confirmation':
        return {
          current: 1,
          steps: [
            { id: 0, labelKey: 'timeline_order_placed_full', completed: true, active: false },
            { id: 1, labelKey: 'timeline_awaiting_payment', completed: true, active: false },
            { id: 2, labelKey: 'timeline_verifying_payment', completed: false, active: true },
            { id: 3, labelKey: 'timeline_order_confirmed_full', completed: false, active: false },
          ]
        };
      case 'paid':
      case 'confirmed':
      case 'completed':
        return {
          current: 3,
          steps: [
            { id: 0, labelKey: 'timeline_order_placed_full', completed: true, active: false },
            { id: 1, labelKey: 'timeline_awaiting_payment', completed: true, active: false },
            { id: 2, labelKey: 'timeline_verifying_payment', completed: true, active: false },
            { id: 3, labelKey: 'timeline_order_confirmed_full', completed: true, active: true },
          ]
        };
      default:
        return {
          current: 0,
          steps: [
            { id: 0, labelKey: 'timeline_order_placed_full', completed: true, active: true },
            { id: 1, labelKey: 'timeline_awaiting_payment', completed: false, active: false },
            { id: 2, labelKey: 'timeline_verifying_payment', completed: false, active: false },
            { id: 3, labelKey: 'timeline_order_confirmed_full', completed: false, active: false },
          ]
        };
    }
  };

  const handleUploadProof = () => {
    setShowUploadProof(true);
  };

  const handlePaymentProofUploaded = async () => {
    setUploadingProof(true);
    try {
      // Update order status to 'verifying'
      // This would typically call an API to update the status
      console.log('Payment proof uploaded, updating order status...');
      
      // For now, we'll just show a success message and redirect back
      setTimeout(() => {
        setShowUploadProof(false);
        setUploadingProof(false);
        // In a real implementation, you'd refetch the order data
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to upload payment proof:', error);
      setError('Failed to upload payment proof');
      setUploadingProof(false);
    }
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
          <p className="text-gray-600 mb-4">{t('order_not_found_detail')}</p>
          <Button onClick={() => navigate('/track-order')}>
            {t('order_track_another')}
          </Button>
        </div>
      </div>
    );
  }

  if (showUploadProof) {
    return (
      <div className="page-container py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-6">
            <button
              className="btn btn-link text-brown p-0 mb-3"
              onClick={() => setShowUploadProof(false)}
            >
              <i className="bi bi-arrow-left me-1"></i>
              {t('order_back_to_detail_btn')}
            </button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('order_upload_proof_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadPaymentProof />
              <div className="mt-4 text-center">
                <Button
                  onClick={handlePaymentProofUploaded}
                  disabled={uploadingProof}
                  className="w-full"
                >
                  {uploadingProof ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      {t('checkout_loading')}
                    </>
                  ) : (
                    t('order_confirm_upload')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timeline = getTimelineStatus(order.payment_status);

  return (
    <div className="page-container py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            className="btn btn-link text-brown p-0 mb-3"
            onClick={() => navigate('/orders')}
          >
            <i className="bi bi-arrow-left me-1"></i>
            {t('order_back_orders_btn')}
          </button>
        </div>

        {/* Order Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-mono" title={order.order_id}>
                  {formatOrderDisplayCode(order.order_id)}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-brown">
                  {formatPrice(order.amount)}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Visual Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('order_status_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
              
              {/* Timeline Steps */}
              <div className="space-y-8">
                {timeline.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    {/* Step Circle */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.active 
                        ? 'bg-brown text-white animate-pulse'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.completed ? (
                        <i className="bi bi-check-fill text-sm"></i>
                      ) : (
                        <span className="text-xs font-semibold">{step.id + 1}</span>
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        step.active ? 'text-brown' : step.completed ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {t(step.labelKey as any)}
                      </h4>
                      {step.active && (
                        <p className="text-sm text-gray-600 mt-1">
                          {step.id === 1 && t('timeline_step1_desc')}
                          {step.id === 2 && t('timeline_step2_desc')}
                          {step.id === 3 && t('timeline_step3_desc')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        {order.payment_status === 'awaiting_payment' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('order_payment_instructions_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h5 className="font-semibold text-blue-800 mb-2">{t('order_mobile_money_title')}</h5>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>{t('order_amount_label')}:</strong> {formatPrice(order.amount)}</p>
                  <p><strong>{t('order_reference_label')}:</strong> {t('order_reference_hint')} {formatOrderDisplayCode(order.order_id)}</p>
                  <p><strong>{t('order_available_methods')}:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>M-Pesa: *150*00#</li>
                    <li>Tigo Pesa: *150*01#</li>
                    <li>Airtel Money: *150*60#</li>
                  </ul>
                </div>
              </div>
              
              <Button onClick={handleUploadProof} className="w-full">
                <i className="bi bi-upload me-2"></i>
                {t('order_upload_proof_title')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('order_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{t('order_customer_name_full')}</p>
                <p className="font-semibold">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('order_phone_number_label')}</p>
                <p className="font-semibold">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('order_delivery_location_full')}</p>
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

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('order_items_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
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
                <span className="text-lg font-semibold">{t('order_total_amount_label')}</span>
                <span className="text-xl font-bold text-brown">
                  {formatPrice(order.amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">{t('order_need_help_title')}</h3>
              <p className="text-sm text-gray-600">
                {t('order_help_contact_msg')}
              </p>
              <div className="space-y-1">
                <p className="text-sm">
                  📞 <span className="font-medium">+255 123 456 789</span>
                </p>
                <p className="text-sm">
                  ✉️ <span className="font-medium">support@hardwarehub.com</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
