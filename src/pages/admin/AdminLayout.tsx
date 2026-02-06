import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
    { path: '/admin/orders', label: 'Orders', icon: 'bi-receipt' },
  ];

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar - Desktop */}
      <div className="admin-sidebar d-none d-md-block p-3" style={{ width: '240px' }}>
        <div className="text-white mb-4">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-shop me-2"></i>
            PAHALA Admin
          </h5>
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
          Back to Store
        </button>
      </div>

      {/* Mobile Header */}
      <div className="d-md-none position-fixed top-0 start-0 end-0 bg-white shadow-sm z-3">
        <div className="container py-2 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold text-brown">PAHALA Admin</h6>
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

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        <div className="p-3 pt-5 pt-md-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
