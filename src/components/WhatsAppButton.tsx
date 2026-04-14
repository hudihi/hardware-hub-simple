import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { openWhatsApp } from '../utils/whatsapp';

const WhatsAppButton: React.FC = () => {
  const { t } = useLanguage();

  const handleClick = () => {
    openWhatsApp(t('wa_hello'));
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-whatsapp btn-lg-mobile d-flex align-items-center gap-2"
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        zIndex: 999,
        borderRadius: '50px',
        padding: '12px 20px',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
      }}
    >
      <i className="bi bi-whatsapp fs-5"></i>
      <span className="d-none d-md-inline">{t('wa_chat')}</span>
    </button>
  );
};

export default WhatsAppButton;
