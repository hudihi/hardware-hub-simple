import React from 'react';

const WhatsAppButton: React.FC = () => {
  const handleClick = () => {
    const message = 'Hello! I have a question about PAHALA.COM hardware store.';
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
      <span className="d-none d-md-inline">Chat with us</span>
    </button>
  );
};

export default WhatsAppButton;
