import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { analytics } from '../lib/analytics';
import authService from '../services/auth.service';
import apiClient from '../services/api';

type UploadPaymentProofProps = {
  /** When embedded under a route that uses `:id` instead of `:orderId` */
  orderIdProp?: string;
};

function errMessage(err: any): string {
  const d = err.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x) => JSON.stringify(x)).join('; ');
  return err.response?.data?.message || err.message || 'Something went wrong';
}

interface UploadedFile {
  file: File;
  preview: string | null;
  id: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const UploadPaymentProof: React.FC<UploadPaymentProofProps> = ({ orderIdProp }) => {
  const { orderId: routeOrderId, id: routeId } = useParams<{ orderId?: string; id?: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);

  const resolvedOrderId = (orderIdProp || routeOrderId || routeId || '').trim();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reference, setReference] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [sessionWarning, setSessionWarning] = useState('');

  // Check session status periodically
  useEffect(() => {
    const checkSession = () => {
      if (authService.isCustomerTokenExpired()) {
        setSessionWarning('Your session has expired. Please log in again.');
        return;
      }

      const timeToExpiry = authService.getCustomerTokenTimeToExpiry();
      if (timeToExpiry > 0 && timeToExpiry < 120) {
        setSessionWarning(`Your session will expire in ${Math.floor(timeToExpiry / 60)} minute(s). Please complete upload quickly or log in again.`);
      } else {
        setSessionWarning('');
      }
    };

    // Check immediately and then every 30 seconds
    checkSession();
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, []);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload an image (JPG, PNG) or PDF file';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const createFilePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    await processFiles(Array.from(files));
  };

  const processFiles = async (files: File[]) => {
    const newFiles: UploadedFile[] = [];
    let hasError = false;

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        hasError = true;
        continue;
      }

      const preview = await createFilePreview(file);
      const uploadedFile: UploadedFile = {
        file,
        preview,
        id: Math.random().toString(36).substr(2, 9),
        uploadProgress: 0,
        uploadStatus: 'pending'
      };

      newFiles.push(uploadedFile);
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setError('');
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadSingleFile = async (fileData: UploadedFile, formData: FormData): Promise<void> => {
    try {
      // Use apiClient so the correct base URL (https://api.pahala.store) and
      // customer auth token are applied automatically via the request interceptor.
      await apiClient.post('/api/v1/payments/upload-proof', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileData.id ? { ...f, uploadProgress: progress } : f
            ));
          }
        },
      });
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileData.id ? { ...f, uploadStatus: 'success', uploadProgress: 100 } : f
      ));
    } catch (error: any) {
      const status = error.response?.status;
      let errorMsg = 'Upload failed';
      if (status === 401)      errorMsg = 'Authentication expired - please log in again';
      else if (status === 413) errorMsg = 'File too large - please use a smaller file';
      else if (status === 415) errorMsg = 'Unsupported file type - please use JPG, PNG, or PDF';
      else if (status >= 500)  errorMsg = 'Server error - please try again later';
      else if (error.message)  errorMsg = error.message;

      setUploadedFiles(prev => prev.map(f =>
        f.id === fileData.id ? { ...f, uploadStatus: 'error', error: errorMsg } : f
      ));
      throw new Error(errorMsg);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check authentication and token validity
    if (!authService.getCustomerToken()) {
      navigate(`/track-order?next=${encodeURIComponent(`/upload-proof/${resolvedOrderId}`)}`);
      return;
    }

    // Check if token is expired
    if (authService.isCustomerTokenExpired()) {
      setError('Your session has expired. Please log in again.');
      authService.removeCustomerToken();
      navigate(`/track-order?next=${encodeURIComponent(`/upload-proof/${resolvedOrderId}`)}`);
      return;
    }

    // Warn if token expires soon (less than 2 minutes)
    const timeToExpiry = authService.getCustomerTokenTimeToExpiry();
    if (timeToExpiry > 0 && timeToExpiry < 120) {
      setError(`Your session will expire in ${Math.floor(timeToExpiry / 60)} minute(s). Please complete upload quickly or log in again.`);
    }

    if (uploadedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    if (!resolvedOrderId) {
      setError('Order ID is missing');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Reset file statuses
      setUploadedFiles(prev => prev.map(f => ({ ...f, uploadStatus: 'pending' as const, uploadProgress: 0, error: undefined })));

      // Upload files sequentially
      for (const fileData of uploadedFiles) {
        const formData = new FormData();
        formData.append('order_id', resolvedOrderId);
        formData.append('file', fileData.file);
        if (reference.trim()) {
          formData.append('payment_reference', reference.trim());
        }

        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, uploadStatus: 'uploading' as const } : f
        ));

        await uploadSingleFile(fileData, formData);

        // Update overall progress
        const completedFiles = uploadedFiles.filter(f => f.uploadStatus === 'success').length + 1;
        const progress = Math.round((completedFiles / uploadedFiles.length) * 100);
        setOverallProgress(progress);
      }

      analytics.paymentProofUploaded({ file_count: uploadedFiles.length });
      setSuccess('Payment proof uploaded successfully! We will verify it shortly.');
      setTimeout(() => {
        navigate(`/orders/${resolvedOrderId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      analytics.uploadError({ reason: err.message || 'unknown' });
      
      // Handle authentication errors specifically
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Your session expired during upload. Please log in and try again.');
        authService.removeCustomerToken();
        setTimeout(() => {
          navigate(`/track-order?next=${encodeURIComponent(`/upload-proof/${resolvedOrderId}`)}`);
        }, 2000);
      } else {
        setError(err.message || 'Failed to upload payment proof');
      }
    } finally {
      setUploading(false);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setOverallProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.file.type === 'application/pdf') {
      return 'bi-file-pdf text-danger';
    } else if (file.file.type.includes('image')) {
      return 'bi-file-image text-success';
    }
    return 'bi-file-earmark text-secondary';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="page-container py-4 py-md-8">
      <div className="max-w-2xl mx-auto px-3 px-md-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-brown-dark">Upload payment proof</CardTitle>
            <p className="text-sm text-gray-600 mt-2">Screenshot or PDF of your mobile money / bank payment</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment proof * {uploadedFiles.length > 0 && `(${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} selected)`}
                </label>
                <div
                  ref={dragAreaRef}
                  className={`border-2 border-dashed rounded-lg p-4 p-md-6 text-center transition-all ${
                    isDragging 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedFiles.length === 0 ? (
                    <div className="space-y-4">
                      <i className="bi bi-cloud-upload text-4xl text-gray-400"></i>
                      <div>
                        <p className="text-gray-600 mb-2">Drag and drop your payment proof here</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                          <label className="cursor-pointer bg-brown text-white px-4 py-2 rounded-lg hover:bg-brown-dark transition-colors">
                            Choose file
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              onChange={handleFileSelect}
                              className="hidden"
                              multiple
                            />
                          </label>
                          <span className="text-gray-500 text-sm">or</span>
                          <span className="text-gray-500 text-sm">drag files here</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">JPG, PNG, or PDF (max 5MB each, multiple files allowed)</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File List */}
                      <div className="space-y-3">
                        {uploadedFiles.map((fileData) => (
                          <div key={fileData.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-start gap-3">
                              {fileData.preview ? (
                                <img
                                  src={fileData.preview}
                                  alt="Preview"
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              ) : (
                                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-100">
                                  <i className={`bi ${getFileIcon(fileData)} text-2xl`}></i>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {fileData.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(fileData.file.size)} • {fileData.file.type}
                                </p>
                                
                                {/* Upload Progress */}
                                {fileData.uploadStatus === 'uploading' && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                      <span>Uploading...</span>
                                      <span>{fileData.uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${fileData.uploadProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Status Indicators */}
                                {fileData.uploadStatus === 'success' && (
                                  <div className="flex items-center text-green-600 text-xs mt-1">
                                    <i className="bi bi-check-circle-fill mr-1"></i>
                                    Uploaded successfully
                                  </div>
                                )}
                                
                                {fileData.uploadStatus === 'error' && (
                                  <div className="flex items-center text-red-600 text-xs mt-1">
                                    <i className="bi bi-exclamation-triangle-fill mr-1"></i>
                                    {fileData.error || 'Upload failed'}
                                  </div>
                                )}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => removeFile(fileData.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                                disabled={uploading}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add More Files Button */}
                      <div className="flex justify-center">
                        <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                          <i className="bi bi-plus-circle me-2"></i>
                          Add more files
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            multiple
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Progress Bar */}
              {uploading && uploadedFiles.length > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
                    <span>Overall Progress</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Transaction Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction reference (optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. M-Pesa confirmation code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-brown"
                  disabled={uploading}
                />
              </div>

              {/* Session Warning */}
              {sessionWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {sessionWarning}
                  </p>
                </div>
              )}

              {/* Error and Success Messages */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Upload Button - Always visible when files are selected */}
                {uploadedFiles.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700 mb-2 text-center">
                      <i className="bi bi-info-circle me-1"></i>
                      Ready to upload {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} - click below to submit
                    </p>
                  </div>
                )}
                
                {/* Upload button with brand color */}
                <button
                  type="submit"
                  disabled={uploading || uploadedFiles.length === 0}
                  className="w-full bg-[var(--pahala-brown)] hover:bg-[var(--pahala-brown-dark)] text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] text-lg shadow-lg"
                  style={{ display: 'block', visibility: 'visible' }}
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline-block align-middle"></span>
                      {uploadedFiles.length > 1 ? `Uploading ${uploadedFiles.length} files...` : 'Uploading payment proof...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2"></i>
                      <span className="font-semibold">
                        Upload Payment Proof{uploadedFiles.length > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </button>
                
                {/* Secondary Actions */}
                <div className="flex gap-2">
                  {uploadedFiles.length > 0 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary flex-1 py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors" 
                      onClick={clearAllFiles}
                      disabled={uploading}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Clear All
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="btn btn-link flex-1 text-gray-600 hover:text-gray-800 transition-colors" 
                    onClick={() => navigate(-1)}
                    disabled={uploading}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back
                  </button>
                </div>
                
                {/* Help Text */}
                {uploadedFiles.length === 0 && (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    <p>Select payment proof files above to enable upload</p>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPaymentProof;
