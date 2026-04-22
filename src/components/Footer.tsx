import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { generateWhatsAppLink } from '../utils/whatsapp';

const WHATSAPP_NUMBER = '+255694352388';
const PHONE_DISPLAY = '+255 694 352 388';

const Footer: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const waLink = generateWhatsAppLink(t('wa_hello'));

  return (
    <footer className="footer-pahala">
      <div className="container">
        <div className="row g-4 py-5">

          {/* Brand + Contact */}
          <div className="col-12 col-md-4">
            <Link to="/" className="d-flex align-items-center mb-3 text-decoration-none">
              <img
                src="/PAHELA_27_FEBRUARY_2025.svg"
                alt="PAHALA"
                style={{ height: '36px', marginRight: '10px' }}
              />
              <span className="fw-bold fs-5 text-white">Pahala Store</span>
            </Link>
            <p className="footer-tagline mb-4">{t('footer_tagline')}</p>
            <div className="d-flex flex-column gap-2">
              <span className="footer-contact-link">
                <i className="bi bi-telephone-fill me-2"></i>
                {PHONE_DISPLAY}
              </span>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                <i className="bi bi-whatsapp me-2"></i>
                {t('footer_whatsapp_support')}
              </a>
              <span className="footer-contact-link">
                <i className="bi bi-geo-alt-fill me-2"></i>
                {t('footer_address')}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <h6 className="footer-heading">{t('footer_quick_links')}</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">{t('nav_home')}</Link></li>
              <li><Link to="/products">{t('nav_products')}</Link></li>
              <li><Link to="/orders">{t('nav_orders')}</Link></li>
              <li><Link to="/track-order">{t('footer_track_order')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-6 col-md-3">
            <h6 className="footer-heading">{t('footer_customer_service')}</h6>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/how-to-order">{t('footer_how_to_order')}</Link>
              </li>
              <li>
                <Link to="/payment-guide">{t('footer_payment_guide')}</Link>
              </li>
              <li>
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  {t('footer_returns_policy')}
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="col-12 col-md-3">
            <h6 className="footer-heading">{t('footer_payment_methods')}</h6>
            <p className="footer-tagline mb-3" style={{ fontSize: '0.8rem' }}>
              {t('footer_accepted_payments')}
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="payment-badge">
                <i className="bi bi-phone-fill me-1"></i> M-Pesa
              </span>
              <span className="payment-badge">
                <i className="bi bi-phone-fill me-1"></i> Airtel Money
              </span>
              <span className="payment-badge">
                <i className="bi bi-bank me-1"></i> {t('footer_bank_transfer')}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom legal bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center py-3">
            <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
              <span className="footer-legal-text">
                © {new Date().getFullYear()} Pahala Store. {t('footer_rights_reserved')}
              </span>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex justify-content-center justify-content-md-end gap-3 flex-wrap">
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="footer-legal-link">
                  {t('footer_privacy_policy')}
                </a>
                <span className="footer-legal-separator">·</span>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="footer-legal-link">
                  {t('footer_terms_of_sale')}
                </a>
                <span className="footer-legal-separator">·</span>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="footer-legal-link">
                  {t('footer_returns_label')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
