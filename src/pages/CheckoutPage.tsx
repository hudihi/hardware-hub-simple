import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { checkoutService, CheckoutSummaryResponse } from '../services/checkout.service';
import { formatPrice } from '../utils/format';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, cartId } = useCart();
  const { user, register, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  type CheckoutStatus = "form" | "processing" | "success" | "redirecting";

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.address?.city || '', // Simplified location field
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("form");
  const [orderId, setOrderId] = useState('');

  // Navigate to cart if no items and not in checkout flow
  useEffect(() => {
    if (items.length === 0 && checkoutStatus === "form") {
      navigate('/cart');
    }
  }, [items.length, checkoutStatus, navigate]);

  // Debug checkoutStatus changes
  useEffect(() => {
    console.log('checkoutStatus changed to:', checkoutStatus, 'orderId:', orderId);
  }, [checkoutStatus, orderId]);

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
            setError('This cart has already been used for checkout. Redirecting you to create a new cart...');
            // Clear the checked out cart and create a new one immediately
            clearCart(true); // This will create a new cart
            // Redirect to cart page so user can add items
            setTimeout(() => {
              if (isMounted) {
                navigate('/cart');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStatus("processing");
    setLoading(true);
    setError('');

    try {
      if (!cartId) {
        setError('Cart not found');
        setCheckoutStatus("form");
        return;
      }

      // For guest checkout, no registration needed
      // Just proceed with checkout directly

      // Process checkout using API
      const checkoutData = {
        cart_id: cartId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.location, // Simplified location
        customer_city: formData.location,
        order_notes: formData.notes,
        payment_method: 'PAY_ON_DELIVERY' as const,
      };

      const order = await checkoutService.processCheckout(checkoutData);
      
      console.log('Order processed successfully:', order);
      console.log('Order response structure:', JSON.stringify(order, null, 2));
      
      // Handle different possible response structures
      let orderFinalId: string;
      if (order && order.order_id) {
        orderFinalId = order.order_id;
      } else {
        console.error('No order ID found in response:', order);
        setError('Order processed but no order ID received');
        setCheckoutStatus("form");
        setLoading(false);
        return;
      }
      
      // Set success state
      console.log('Setting orderId to:', orderFinalId);
      setOrderId(orderFinalId);
      setCheckoutStatus("success");
      
      clearCart(false); // Clear cart but don't create new one immediately
      
      // Hide success message after 3 seconds and navigate to order page
      setTimeout(() => {
        console.log('Timeout triggered, navigating to order page');
        setCheckoutStatus("redirecting");
        navigate(`/orders/${orderFinalId}`, { state: { newOrder: true } });
      }, 3500);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || t('checkout_error'));
      setCheckoutStatus("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Success Message Overlay - Rendered outside normal flow */}
      {checkoutStatus === "success" && (
        <>
          {console.log('Rendering success overlay - checkoutStatus is success, orderId:', orderId)}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '50px',
                textAlign: 'center',
                maxWidth: '500px',
                width: '90%'
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <div 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#28a745',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}
                >
                  <span style={{ color: 'white', fontSize: '2.5rem' }}>✓</span>
                </div>
              </div>
              <h3 style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '16px' }}>
                Order Successful!
              </h3>
              <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '16px' }}>
                Thank you for your order. Your order <strong>#{orderId}</strong> has been received.
              </p>
              <div style={{ color: '#6c757d' }}>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>Redirecting to order tracking page...</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main checkout form - only show when in form state */}
      {checkoutStatus === "form" && (
        <div className="page-container">
          <button
            className="btn btn-link text-brown p-0 mb-3"
            onClick={() => navigate('/cart')}
          >
            <i className="bi bi-arrow-left me-1"></i>
            {t('checkout_back_cart')}
          </button>

          <h1 className="section-header">{t('checkout_title')}</h1>

          {error && (
            <div className="alert alert-danger" role="alert">
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
                  <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required placeholder={t('checkout_phone_ph')} />
                </div>

                <div className="mb-0">
                  <label className="form-label">Location *</label>
                  <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} required placeholder="Enter your location (city/area)" />
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

            {/* Payment Method */}
            <div className="card-pahala card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-credit-card me-2"></i>
                  {t('checkout_payment')}
                </h6>
                <div className="d-flex align-items-center gap-3 p-3 bg-cream rounded">
                  <i className="bi bi-cash-coin fs-4 text-brown"></i>
                  <div>
                    <div className="fw-semibold">{t('checkout_cod_title')}</div>
                    <small className="text-muted">{t('checkout_cod_desc')}</small>
                  </div>
                  <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                </div>
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
                    Loading order summary...
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
          <h4 className="text-brown">Processing Your Order</h4>
          <p className="text-muted">Please wait while we process your checkout...</p>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
