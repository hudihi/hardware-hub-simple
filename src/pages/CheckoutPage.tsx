import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { checkoutService, CheckoutSummaryResponse } from '../services/checkout.service';
import { formatPrice } from '../utils/format';
import { shareOrder } from '../utils/whatsapp';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, cartId } = useCart();
  const { user, register, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    province: user?.address?.province || '',
    postalCode: user?.address?.postalCode || '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Navigate to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      setShouldNavigate(true);
    }
  }, [items.length]);

  useEffect(() => {
    if (shouldNavigate) {
      navigate('/cart');
    }
  }, [shouldNavigate, navigate]);

  // Load checkout summary when component mounts or cart changes
  useEffect(() => {
    let isMounted = true;
    
    const loadCheckoutSummary = async () => {
      if (!cartId || !isMounted) return;
      
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
  }, [cartId, navigate, clearCart, items, total]);

  if (items.length === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!cartId) {
        setError('Cart not found');
        return;
      }

      if (!isAuthenticated) {
        const success = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: {
            street: formData.street,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
          },
        });

        if (!success) {
          setError(t('checkout_email_taken'));
          setLoading(false);
          return;
        }
      }

      // Process checkout using API
      const checkoutData = {
        cart_id: cartId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: `${formData.street}, ${formData.city}, ${formData.province}, ${formData.postalCode}`,
        customer_city: formData.city,
        order_notes: formData.notes,
        payment_method: 'PAY_ON_DELIVERY' as const,
      };

      const order = await checkoutService.processCheckout(checkoutData);
      
      clearCart(false); // Clear cart but don't create new one immediately
      navigate(`/orders/${order.id}`, { state: { newOrder: true } });

      if (window.confirm(t('checkout_wa_confirm'))) {
        // Create a mock order object for WhatsApp sharing
        const mockOrder = {
          id: order.id,
          items: items.map(item => ({
            product: item.product,
            quantity: item.quantity
          })),
          total: total,
          customer: {
            id: user?.id || `cust-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              street: formData.street,
              city: formData.city,
              province: formData.province,
              postalCode: formData.postalCode
            }
          },
          notes: formData.notes,
          status: 'pending' as const,
          createdAt: new Date().toISOString()
        };
        shareOrder(mockOrder);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || t('checkout_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container py-3">
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
                <label className="form-label">{t('checkout_email')} *</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required placeholder={t('checkout_email_ph')} disabled={isAuthenticated} />
              </div>

              <div className="mb-3">
                <label className="form-label">{t('checkout_phone')} *</label>
                <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required placeholder={t('checkout_phone_ph')} />
              </div>

              {!isAuthenticated && (
                <div className="mb-0">
                  <label className="form-label">{t('checkout_password')} *</label>
                  <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder={t('checkout_password_ph')} />
                  <small className="text-muted">{t('checkout_password_hint')}</small>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card-pahala card mb-3">
            <div className="card-body">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-geo-alt me-2"></i>
                {t('checkout_address')}
              </h6>

              <div className="mb-3">
                <label className="form-label">{t('checkout_street')} *</label>
                <input type="text" className="form-control" name="street" value={formData.street} onChange={handleChange} required placeholder={t('checkout_street_ph')} />
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label">{t('checkout_city')} *</label>
                  <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} required placeholder={t('checkout_city')} />
                </div>
                <div className="col-6">
                  <label className="form-label">{t('checkout_province')} *</label>
                  <input type="text" className="form-control" name="province" value={formData.province} onChange={handleChange} required placeholder={t('checkout_province')} />
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label">{t('checkout_postal')} *</label>
                <input type="text" className="form-control" name="postalCode" value={formData.postalCode} onChange={handleChange} required placeholder={t('checkout_postal')} />
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
    </div>
  );
};

export default CheckoutPage;
