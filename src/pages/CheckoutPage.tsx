import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { formatPrice } from '../utils/format';
import { shareOrder } from '../utils/whatsapp';
import { useLanguage } from '../context/LanguageContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user, register, isAuthenticated } = useAuth();
  const { createOrder } = useOrders();
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

  if (items.length === 0) {
    navigate('/cart');
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

      const order = createOrder(
        items,
        {
          id: user?.id || `cust-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
          },
        },
        formData.notes
      );

      clearCart();
      navigate(`/orders/${order.id}`, { state: { newOrder: true } });

      if (window.confirm(t('checkout_wa_confirm'))) {
        shareOrder(order);
      }
    } catch (err) {
      setError(t('checkout_error'));
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
              </h6>

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
