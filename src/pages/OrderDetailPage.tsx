import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { useOrderFlow } from '../hooks/useOrderFlow';
import authService from '../services/auth.service';
import { formatPrice } from '../utils/format';
import UploadPaymentProof from './UploadPaymentProof';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customerOrders, fetchCustomerOrders } = useOrderFlow();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadProof, setShowUploadProof] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Check if this is a magic link access
  const accessToken = searchParams.get('token');
  const isMagicLinkAccess = !!accessToken;

  // Find the order from customerOrders
  const order = customerOrders.find(o => o.order_id === id);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');

        if (isMagicLinkAccess && accessToken) {
          // Magic link access - fetch orders without requiring OTP session
          // For now, we'll use the existing fetchCustomerOrders
          // In a real implementation, you'd validate the token first
          await fetchCustomerOrders();
        } else {
          // Traditional access - check if user has valid OTP session
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
  }, [id, accessToken, isMagicLinkAccess, navigate, fetchCustomerOrders]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'pending_payment':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'awaiting_confirmation':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'Paid';
      case 'pending':
      case 'pending_payment':
        return 'Pending Payment';
      case 'failed':
        return 'Failed';
      case 'awaiting_confirmation':
        return 'Awaiting Confirmation';
      default:
        return status || 'Unknown';
    }
  };

  const getTimelineStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'placed':
      case 'awaiting_payment':
        return {
          current: 0,
          steps: [
            { id: 0, label: 'Order Placed', completed: true, active: true },
            { id: 1, label: 'Awaiting Payment', completed: false, active: false },
            { id: 2, label: 'Verifying Payment', completed: false, active: false },
            { id: 3, label: 'Order Confirmed', completed: false, active: false },
          ]
        };
      case 'verifying':
      case 'awaiting_confirmation':
        return {
          current: 1,
          steps: [
            { id: 0, label: 'Order Placed', completed: true, active: false },
            { id: 1, label: 'Awaiting Payment', completed: true, active: false },
            { id: 2, label: 'Verifying Payment', completed: false, active: true },
            { id: 3, label: 'Order Confirmed', completed: false, active: false },
          ]
        };
      case 'paid':
      case 'confirmed':
      case 'completed':
        return {
          current: 3,
          steps: [
            { id: 0, label: 'Order Placed', completed: true, active: false },
            { id: 1, label: 'Awaiting Payment', completed: true, active: false },
            { id: 2, label: 'Verifying Payment', completed: true, active: false },
            { id: 3, label: 'Order Confirmed', completed: true, active: true },
          ]
        };
      default:
        return {
          current: 0,
          steps: [
            { id: 0, label: 'Order Placed', completed: true, active: true },
            { id: 1, label: 'Awaiting Payment', completed: false, active: false },
            { id: 2, label: 'Verifying Payment', completed: false, active: false },
            { id: 3, label: 'Order Confirmed', completed: false, active: false },
          ]
        };
    }
  };

  const handlePaymentProofUploaded = async () => {
    setUploadingProof(true);
    try {
      // Update order status to 'verifying'
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

  const handleUploadProof = () => {
    setShowUploadProof(true);
  };

  const handleBackToOrders = () => {
    if (isMagicLinkAccess) {
      // For magic link users, go back to track order page
      navigate('/track-order');
    } else {
      // For traditional users, go back to orders list
      navigate('/orders');
    }
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
          <button className="btn btn-primary" onClick={handleBackToOrders}>
            Back to Orders
          </button>
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
              Back to Order Details
            </button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Upload Payment Proof</CardTitle>
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
                      Processing...
                    </>
                  ) : (
                    'Confirm Upload'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button 
            className="btn btn-link text-brown p-0 mb-3" 
            onClick={handleBackToOrders}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Orders
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
                  
                  {/* Timeline Steps */}
                  <div className="space-y-8">
                    {getTimelineStatus(order.payment_status).steps.map((step, index) => (
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
                            {step.label}
                          </h4>
                          {step.active && (
                            <p className="text-sm text-gray-600 mt-1">
                              {step.id === 1 && 'Please complete payment to proceed'}
                              {step.id === 2 && 'We are verifying your payment proof'}
                              {step.id === 3 && 'Your order has been confirmed and is being processed'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{order.order_id}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status)}`}>
                    {getStatusText(order.payment_status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Location</p>
                    <p className="font-semibold">{order.customer_location}</p>
                  </div>
                  {order.order_notes && (
                    <div>
                      <p className="text-sm text-gray-600">Order Notes</p>
                      <p className="font-semibold">{order.order_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
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
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-brown">
                      {formatPrice(order.amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conditional Sections Based on Status */}
            {order.payment_status === 'PENDING_PAYMENT' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Complete your payment to confirm this order
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Instructions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)</li>
                      <li>• Use Order ID as reference</li>
                      <li>• Amount: {formatPrice(order.amount)}</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleUploadProof}
                    className="w-full"
                  >
                    📤 Upload Payment Proof
                  </Button>
                </CardContent>
              </Card>
            )}

            {order.payment_status === 'AWAITING_CONFIRMATION' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-800">Waiting for Confirmation</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Your payment proof has been received and is being verified
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {order.payment_status === 'PAID' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">Payment Completed</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your payment has been confirmed and order is being processed
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    📥 Download Receipt
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Need Help?</h3>
                  <p className="text-sm text-gray-600">
                    Contact our customer support for any questions about your order
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
      </div>
    </div>
  );
};

export default OrderDetailPage;
