import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import apiClient from '../services/api';

const UploadPaymentProof: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload an image (JPG, PNG) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null); // No preview for PDF
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!orderId) {
      setError('Order ID is missing');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('file', selectedFile);
      if (reference.trim()) {
        formData.append('reference', reference.trim());
      }

      const response = await apiClient.post('/api/v1/payments/upload-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success || response.status === 200) {
        setSuccess('Payment proof uploaded successfully! Awaiting verification.');
        
        // Redirect to order status after 2 seconds
        setTimeout(() => {
          navigate(`/track/${orderId}`);
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to upload payment proof');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setReference('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-brown-dark">
              Upload Payment Proof
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Please upload a screenshot or receipt of your payment
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Proof *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {preview ? (
                    <div className="space-y-4">
                      {preview.startsWith('data:image') ? (
                        <img 
                          src={preview} 
                          alt="Payment proof preview" 
                          className="mx-auto max-h-64 rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="flex items-center justify-center">
                          <i className="bi bi-file-pdf text-4xl text-red-600"></i>
                          <p className="ml-2 text-sm text-gray-600">PDF Document</p>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove & Choose Different File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <i className="bi bi-cloud-upload text-4xl text-gray-400"></i>
                      <div>
                        <label className="cursor-pointer bg-brown text-white px-4 py-2 rounded-lg hover:bg-brown-dark">
                          Choose File
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supported formats: JPG, PNG, PDF (max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-brown"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Transaction ID from your mobile money or bank confirmation
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-brown hover:bg-brown-dark text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Payment Proof'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPaymentProof;
