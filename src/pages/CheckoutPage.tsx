import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { analytics } from '../lib/analytics';
import { checkoutService, CheckoutSummaryResponse } from '../services/checkout.service';
import { formatPrice } from '../utils/format';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, cartId } = useCart();
  const { t } = useLanguage();
  const { createOrder } = useOrderFlow();

  type CheckoutStatus = 'form' | 'processing';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>('form');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // Navigate to cart if no items and not in checkout flow
  useEffect(() => {
    if (items.length === 0 && checkoutStatus === "form") {
      navigate('/cart');
    }
  }, [items.length, checkoutStatus, navigate]);

  // Load checkout summary when component mounts or cart changes
  useEffect(() => {
    let isMounted = true;
    
    const loadCheckoutSummary = async () => {
      if (!cartId || !isMounted || checkoutStatus !== "form") return;
      
      try {
        setSummaryLoading(true);
        const summary = await checkoutService.getCheckoutSummary(cartId);
        if (isMounted) {
          setCheckoutSummary(summary);
          setError(''); // Clear any previous errors
        }
      } catch (error: any) {
        if (isMounted) {
          console.error('Failed to load checkout summary:', error);
          
          // Handle specific error cases
          if (error.message?.includes('already checked out')) {
            setError('🛒 This cart has already been used for a previous order. Creating a fresh cart for you...');
            setSummaryLoading(true); // Show loading while creating new cart
            // Clear the checked out cart and create a new one immediately
            await clearCart(true); // This will create a new cart
            // Show success message and redirect to cart page
            setTimeout(() => {
              if (isMounted) {
                setSummaryLoading(false);
                setError('✅ New cart created! Please add items to continue shopping.');
                setTimeout(() => {
                  navigate('/cart');
                }, 2000);
              }
            }, 1500);
          } else if (error.message?.includes('Cart not found') || error.message?.includes('empty')) {
            setError('Your cart appears to be empty. Please add items to proceed.');
            // Optionally redirect to cart page after a delay
            setTimeout(() => {
              if (isMounted) {
                navigate('/cart');
              }
            }, 3000);
          } else if (error.message?.includes('API server not available')) {
            // Handle API server unavailable gracefully
            console.log('API server not available - using local cart data');
            const fallbackSummary = {
              cart_id: cartId || '',
              items: items.map(item => ({
                product_id: item.product.id,
                product_name: item.product.name,
                unit_price: item.product.price,
                quantity: item.quantity,
                total_price: item.product.price * item.quantity
              })),
              total_amount: total
            };
            setCheckoutSummary(fallbackSummary);
            setError('Offline mode: Using local cart data');
          } else {
            // For other errors, create a fallback summary from local cart data
            console.log('Creating fallback summary from local cart data');
            const fallbackSummary = {
              cart_id: cartId || '',
              items: items.map(item => ({
                product_id: item.product.id,
                product_name: item.product.name,
                unit_price: item.product.price,
                quantity: item.quantity,
                total_price: item.product.price * item.quantity
              })),
              total_amount: total
            };
            setCheckoutSummary(fallbackSummary);
            setError('Using local cart data. Some features may be limited.');
          }
        }
      } finally {
        if (isMounted) {
          setSummaryLoading(false);
        }
      }
    };

    loadCheckoutSummary();
    
    return () => {
      isMounted = false;
    };
  }, [cartId, navigate, clearCart, items, total, checkoutStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Place order: create order immediately (OTP only on /track-order)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStatus('processing');
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        setError(t('checkout_name_required'));
        setCheckoutStatus('form');
        return;
      }

      if (!formData.location.trim()) {
        setError(t('checkout_location_required'));
        setCheckoutStatus('form');
        return;
      }

      if (!isPhoneValid || !normalizedPhone) {
        setError(t('checkout_phone_required'));
        setCheckoutStatus('form');
        return;
      }

      const orderResult = await createOrder({
        phone: normalizedPhone,
        amount: total,
        items: items,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_location: formData.location,
        order_notes: formData.notes,
        otp_verified: false,
      });

      localStorage.setItem('lastOrder', JSON.stringify({
        order_id: orderResult.order_id,
        access_token: orderResult.access_token,
        customer_phone: normalizedPhone,
        customer_name: formData.name,
      }));

      try {
        await clearCart();
      } catch (clearErr) {
        console.warn('Cart clear after order:', clearErr);
      }

      analytics.orderSubmitted({ item_count: items.length, total });
      navigate('/order-confirmation');
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to create order');
      setCheckoutStatus('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main checkout form - only show when in form state */}
      {checkoutStatus === "form" && (
        <div className="page-container">
          <div className="container py-3">
            <div className="mx-auto" style={{ maxWidth: 760 }}>
              <button
                className="btn btn-link text-brown p-0 mb-3"
                onClick={() => navigate('/cart')}
              >
                <i className="bi bi-arrow-left me-1"></i>
                {t('checkout_back_cart')}
              </button>

              <h1 className="section-header">{t('checkout_title')}</h1>

              {error && (
                <div className={`alert ${error.includes('✅') ? 'alert-success' : error.includes('🛒') ? 'alert-warning' : 'alert-danger'}`} role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <div className="card-pahala card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-person me-2"></i>
                  {t('checkout_contact')}
                </h6>

                <div className="mb-3">
                  <label className="form-label">{t('checkout_name')} *</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder={t('checkout_name_ph')} />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t('checkout_phone')} *</label>
                  <PhoneInput
                    value={normalizedPhone}
                    onChange={(phone, isValid) => {
                      setNormalizedPhone(phone);
                      setIsPhoneValid(isValid);
                      setFormData(prev => ({ ...prev, phone: phone }));
                    }}
                    defaultCountryCode="TZ"
                    required
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">{t('checkout_location_label')} *</label>
                  <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} required placeholder={t('checkout_location_ph')} />
                </div>
              </div>
            </div>


            {/* Order Notes */}
            <div className="card-pahala card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-sticky me-2"></i>
                  {t('checkout_notes_title')}
                </h6>
                <textarea className="form-control" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder={t('checkout_notes_ph')} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="card-pahala card mb-4">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-receipt me-2"></i>
                  {t('checkout_summary')}
                  {summaryLoading && (
                    <span className="spinner-border spinner-border-sm ms-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                  )}
                </h6>

                {summaryLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    {t('checkout_loading_summary')}
                  </div>
                ) : checkoutSummary ? (
                  <>
                    {checkoutSummary.items.map((item, index) => (
                      <div key={`${item.product_id}-${index}`} className="d-flex justify-content-between mb-2 small">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>{formatPrice(item.total_price)}</span>
                      </div>
                    ))}

                    <hr />

                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">{t('cart_total')}</span>
                      <span className="fw-bold text-brown fs-5">{formatPrice(checkoutSummary.total_amount)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.product.id} className="d-flex justify-content-between mb-2 small">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}

                    <hr />

                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">{t('cart_total')}</span>
                      <span className="fw-bold text-brown fs-5">{formatPrice(total)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

                <button type="submit" className="btn btn-primary btn-lg-mobile w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {t('checkout_loading')}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {t('checkout_submit')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Processing state - show loading overlay */}
      {checkoutStatus === "processing" && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <div className="spinner-border text-brown mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Processing...</span>
          </div>
          <h4 className="text-brown">{t('checkout_processing_title')}</h4>
          <p className="text-muted">{t('checkout_processing_desc')}</p>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
