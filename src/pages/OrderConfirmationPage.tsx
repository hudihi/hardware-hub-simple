import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { formatPrice } from '../utils/format';

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState, resetOrderFlow } = useOrderFlow();

  // Redirect if no active order
  useEffect(() => {
    if (!orderState) {
      navigate('/checkout');
      return;
    }

    // Check if payment was completed
    if (orderState.payment_status !== 'CONFIRMED') {
      navigate('/payment-status');
      return;
    }
  }, [orderState, navigate]);

  const handleTrackOrder = () => {
    // Navigate to order tracking (mock)
    navigate(`/orders/${orderState?.order_id}`);
  };

  const handleContinueShopping = () => {
    // Reset order flow and go to products
    resetOrderFlow();
    navigate('/products');
  };

  const handleShareOrder = () => {
    // Mock share functionality
    if (orderState) {
      const shareText = `Order ${orderState.order_id} - Amount: ${formatPrice(orderState.amount)} - Status: ${orderState.payment_status}`;
      console.log('Sharing order:', shareText);
    }
  };

  if (!orderState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Order Confirmed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Order Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-semibold">{orderState.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-green-600">Completed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">{new Date(orderState.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Time</p>
                    <p className="font-semibold">{new Date(orderState.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold">{orderState.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold">{orderState.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Location</p>
                    <p className="font-semibold">{orderState.customer_location}</p>
                  </div>
                  {orderState.order_notes && (
                    <div>
                      <p className="text-sm text-gray-600">Order Notes</p>
                      <p className="font-semibold">{orderState.order_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Delivery Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">Estimated Delivery</span>
                  </div>
                  <p className="text-blue-700">2-3 business days</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-semibold">{orderState.customer_location}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Contact Number</p>
                  <p className="font-semibold">{orderState.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🛒</span>
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {orderState.items.map((item, index) => (
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

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(orderState.amount)}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">💳</span>
                    <span className="text-sm font-medium">Payment Method:</span>
                    <span className="text-sm">Mobile Money</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleTrackOrder}
              >
                📦 Track Order
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleShareOrder}
              >
                📤 Share Order
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={handleContinueShopping}
              >
                🛍️ Continue Shopping
              </Button>
            </div>

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

export default OrderConfirmationPage;
