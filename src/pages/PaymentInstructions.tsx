import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import apiClient from '../services/api';

interface PaymentInstruction {
  type: 'mobile_money' | 'bank';
  provider: string;
  name: string;
  number: string;
  account_name?: string;
}

interface PaymentInstructionsResponse {
  mobile_money: PaymentInstruction[];
  bank_accounts: PaymentInstruction[];
}

const PaymentInstructions: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [instructions, setInstructions] = useState<PaymentInstructionsResponse | null>(null);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const response = await apiClient.get('/api/v1/payments/instructions');
        setInstructions(response.data);
      } catch (err: any) {
        console.error('Failed to fetch payment instructions:', err);
        setError('Failed to load payment instructions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add toast notification here
      console.log('Copied to clipboard:', text);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handlePaidClick = () => {
    if (orderId) {
      navigate(`/upload-proof/${orderId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown mx-auto mb-4"></div>
          <p>Loading payment instructions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <i className="bi bi-exclamation-triangle text-4xl"></i>
          </div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brown text-white rounded-lg hover:bg-brown-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!instructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p>No payment instructions available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-brown-dark">
              Payment Instructions
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Please make payment using any of the following methods, then click "I HAVE PAID"
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Mobile Money Section */}
            <div>
              <h3 className="text-lg font-semibold text-brown-dark mb-4 flex items-center">
                <i className="bi bi-phone mr-2"></i>
                Mobile Money
              </h3>
              <div className="space-y-3">
                {instructions.mobile_money.map((mobile, index) => (
                  <div key={index} className="bg-cream p-4 rounded-lg border border-brown-light">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-brown">{mobile.provider}</p>
                        <p className="text-sm text-gray-600">{mobile.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-brown-dark">{mobile.number}</p>
                        <button
                          onClick={() => copyToClipboard(mobile.number)}
                          className="text-xs bg-brown text-white px-2 py-1 rounded hover:bg-brown-dark mt-1"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Accounts Section */}
            <div>
              <h3 className="text-lg font-semibold text-brown-dark mb-4 flex items-center">
                <i className="bi bi-bank mr-2"></i>
                Bank Transfer
              </h3>
              <div className="space-y-3">
                {instructions.bank_accounts.map((bank, index) => (
                  <div key={index} className="bg-cream p-4 rounded-lg border border-brown-light">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="font-semibold text-brown">Bank</p>
                        <p className="font-bold text-brown-dark">{bank.provider}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-semibold text-brown">Account Number</p>
                        <div className="text-right">
                          <p className="font-mono font-bold text-brown-dark">{bank.number}</p>
                          <button
                            onClick={() => copyToClipboard(bank.number)}
                            className="text-xs bg-brown text-white px-2 py-1 rounded hover:bg-brown-dark mt-1"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      {bank.account_name && (
                        <div className="flex justify-between">
                          <p className="font-semibold text-brown">Account Name</p>
                          <div className="text-right">
                            <p className="font-bold text-brown-dark">{bank.account_name}</p>
                            <button
                              onClick={() => copyToClipboard(bank.account_name)}
                              className="text-xs bg-brown text-white px-2 py-1 rounded hover:bg-brown-dark mt-1"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center pt-6">
              <Button
                onClick={handlePaidClick}
                className="w-full max-w-md mx-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
              >
                I HAVE PAID
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Click this button after making your payment to upload proof
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentInstructions;
