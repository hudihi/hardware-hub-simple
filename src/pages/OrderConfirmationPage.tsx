import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { formatOrderDisplayCode, formatPrice } from '../utils/format';

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState } = useOrderFlow();
  const [copiedNumber, setCopiedNumber] = useState<string>('');

  // Redirect if no active order
  useEffect(() => {
    if (!orderState) {
      navigate('/checkout');
      return;
    }
  }, [orderState, navigate]);

  const copyToClipboard = async (paymentNumber: string) => {
    try {
      // Copy only the payment number.
      await navigator.clipboard.writeText(paymentNumber);
      setCopiedNumber(paymentNumber);
      setTimeout(() => setCopiedNumber(''), 1400);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!orderState) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const orderDisplayCode = formatOrderDisplayCode(orderState.order_id);

  const paymentRows = [
    { method: 'CRDB', number: '0152537327800', accountName: 'Staphod Dauson' },
    { method: 'NMB', number: '20910030968', accountName: 'Staphod Dauson' },
    { method: 'Lipa Namba Voda', number: '57853616', accountName: 'Staphod Dauson' },
    { method: 'Lipa Halopesa', number: '24022678', accountName: 'Pahala builds&makers' },
  ];

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-600">Order Placed Successfully</h1>
          <p className="text-sm text-gray-600 mt-1">Complete payment and upload proof to continue</p>
        </div>

        {/* 1) Order Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600 mb-0">Order Code</p>
              <p className="font-mono font-semibold text-right mb-0" title={orderState.order_id}>
                {orderDisplayCode}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600 mb-0">Total Amount</p>
              <p className="text-xl font-bold text-green-600 text-right mb-0">{formatPrice(orderState.amount)}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600 mb-0">Payment Status</p>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs sm:text-sm font-semibold text-amber-700">
                Awaiting Payment
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2) Payment Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-[170px_1fr] gap-3 text-sm font-semibold text-gray-700 border-b pb-2">
              <p>Payment Method</p>
              <p>Mobile Money / Bank Details</p>
            </div>

            {paymentRows.map((row) => (
              <div key={`${row.method}-${row.number}`} className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-3 p-3 bg-cream rounded-lg border border-brown-light">
                <p className="text-sm font-semibold text-brown">{row.method}</p>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-bold text-brown-dark">{row.number}</p>
                    <p className="text-sm text-gray-700">{row.accountName}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="whitespace-nowrap !bg-[var(--pahala-brown)] !text-white !border-[var(--pahala-brown)] hover:!bg-[var(--pahala-brown-dark)]"
                    onClick={() => copyToClipboard(row.number)}
                  >
                    {copiedNumber === row.number ? 'Copied' : 'Copy Number'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3) Next Steps Card */}
        <Card>
          <CardHeader>
            <CardTitle>📌 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
              <li>Pay using the payment details above</li>
              <li>Click &quot;Track My Order&quot; below</li>
              <li>Upload your payment proof</li>
            </ol>
          </CardContent>
        </Card>

        {/* 4) Track My Order button */}
        <Button
          className="w-full !bg-[var(--pahala-brown)] !text-white hover:!bg-[var(--pahala-brown-dark)]"
          onClick={() => navigate('/track-order')}
        >
          Track My Order
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
