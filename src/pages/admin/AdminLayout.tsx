import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    { path: '/admin', label: t('admin_dashboard'), icon: 'bi-speedometer2' },
    { path: '/admin/products', label: t('admin_products'), icon: 'bi-box-seam' },
    { path: '/admin/orders', label: t('admin_orders'), icon: 'bi-receipt' },
    { path: '/admin/payment-proofs', label: t('admin_payment_proofs'), icon: 'bi-receipt-cutoff' },
  ];

  return (
    <div className="d-flex min-vh-100">
      <div className="admin-sidebar d-none d-md-block p-3" style={{ width: '240px' }}>
        <div className="text-white mb-4">
          <div className="d-flex align-items-center">
            <img 
              src="/PAHELA_27_FEBRUARY_2025.svg" 
              alt="PAHALA" 
              style={{ height: '40px', marginRight: '12px' }}
            />
            <h5 className="fw-bold mb-0">
              {t('admin_title')}
            </h5>
          </div>
        </div>

        <nav className="nav flex-column">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link d-flex align-items-center gap-2 ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <hr className="my-4 border-secondary" />

        <button
          className="btn btn-outline-light btn-sm w-100"
          onClick={() => navigate('/')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {t('admin_back')}
        </button>
      </div>

      <div className="d-md-none position-fixed top-0 start-0 end-0 bg-white shadow-sm z-3">
        <div className="container py-2 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img 
              src="/PAHELA_27_FEBRUARY_2025.svg" 
              alt="PAHALA" 
              style={{ height: '32px', marginRight: '10px' }}
            />
            <h6 className="mb-0 fw-bold text-brown">{t('admin_title')}</h6>
          </div>
          <div className="d-flex gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`btn btn-sm ${
                  location.pathname === item.path
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                }`}
              >
                <i className={`bi ${item.icon}`}></i>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-grow-1 bg-light">
        <div className="p-3 pt-5 pt-md-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
