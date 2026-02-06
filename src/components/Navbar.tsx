import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const location = useLocation();

  // Don't show navbar on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Top Navbar - Desktop */}
      <nav className="navbar navbar-pahala navbar-expand-md sticky-top d-none d-md-flex">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="bi bi-shop me-2"></i>
            PAHALA.COM
          </Link>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="nav-link">
              <i className="bi bi-house me-1"></i> Home
            </Link>
            <Link to="/products" className="nav-link">
              <i className="bi bi-grid me-1"></i> Products
            </Link>
            <Link to="/orders" className="nav-link">
              <i className="bi bi-box me-1"></i> Orders
            </Link>
            <Link to="/cart" className="nav-link position-relative">
              <i className="bi bi-cart3 fs-5"></i>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="navbar-pahala py-3 d-md-none">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="text-white text-decoration-none fw-bold fs-5">
            <i className="bi bi-shop me-2"></i>
            PAHALA.COM
          </Link>
          <Link to="/cart" className="text-white position-relative">
            <i className="bi bi-cart3 fs-4"></i>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="bottom-nav d-md-none">
        <div className="container">
          <div className="d-flex justify-content-around">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="bi bi-house"></i>
              <span>Home</span>
            </Link>
            <Link
              to="/products"
              className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}
            >
              <i className="bi bi-grid"></i>
              <span>Products</span>
            </Link>
            <Link
              to="/cart"
              className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
            >
              <i className="bi bi-cart3"></i>
              <span>Cart</span>
            </Link>
            <Link
              to="/orders"
              className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
            >
              <i className="bi bi-box"></i>
              <span>Orders</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
