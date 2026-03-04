import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get the return URL from location state or default to /admin
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    try {
      await login({ email, password });
      // Navigation is handled by the auth hook
    } catch (err) {
      // Error is handled by the auth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    clearError();
  };

  return (
    <>
      <style>{`
        :root {
          --pahala-brown: #7C5A3C;
          --pahala-brown-dark: #5C3D2E;
          --pahala-brown-light: #A67C52;
          --pahala-brown-hover: #6B4E35;
          --pahala-white: #FFFFFF;
          --pahala-cream: #FDF8F3;
          --pahala-beige: #F5EDE4;
          --pahala-gray: #6C757D;
          --pahala-gray-light: #F8F9FA;
          --shadow-soft: 0 2px 8px rgba(124, 90, 60, 0.1);
          --shadow-card: 0 4px 12px rgba(124, 90, 60, 0.15);
          --shadow-hover: 0 6px 20px rgba(124, 90, 60, 0.2);
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--pahala-cream) 0%, #fff8f3 60%, var(--pahala-beige) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237C5A3C' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          animation: shimmer 20s linear infinite;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-card);
          border: 1px solid rgba(124, 90, 60, 0.1);
          max-width: 420px;
          width: 100%;
          padding: 3rem;
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.8s ease-out;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
          animation: slideInDown 0.8s ease-out 0.2s both;
        }

        .logo-container {
          width: auto;
          height: auto;
          background: none;
          border-radius: none;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: none;
          animation: slideInDown 0.8s ease-out 0.2s both;
        }

        .form-group {
          margin-bottom: 1.5rem;
          animation: slideInLeft 0.8s ease-out 0.4s both;
        }

        .form-group:nth-child(2) {
          animation-delay: 0.5s;
        }

        .form-control-custom {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid var(--pahala-beige);
          border-radius: var(--radius-lg);
          background: var(--pahala-white);
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-control-custom:focus {
          border-color: var(--pahala-brown);
          box-shadow: 0 0 0 3px rgba(124, 90, 60, 0.1);
          transform: translateY(-2px);
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--pahala-gray);
          transition: color 0.3s ease;
        }

        .form-control-custom:focus ~ .input-icon {
          color: var(--pahala-brown);
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--pahala-gray);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: all 0.3s ease;
        }

        .password-toggle:hover {
          color: var(--pahala-brown);
          background: var(--pahala-beige);
        }

        .btn-login {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--pahala-brown) 0%, var(--pahala-brown-dark) 100%);
          color: var(--pahala-white);
          border: none;
          border-radius: var(--radius-lg);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-login::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn-login:active::before {
          width: 300px;
          height: 300px;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideInRight 0.5s ease-out;
        }

        .success-message {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideInRight 0.5s ease-out;
        }

        .back-link {
          text-align: center;
          margin-top: 2rem;
          animation: fadeInUp 0.8s ease-out 0.8s both;
        }

        .back-link a {
          color: var(--pahala-brown);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .back-link a:hover {
          color: var(--pahala-brown-dark);
          text-decoration: underline;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
          }
          
          .login-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-container d-flex align-items-center justify-content-center">
              <img 
                src="/PAHELA_27_FEBRUARY_2025.svg" 
                alt="PAHALA" 
                style={{ height: '100px', width: 'auto' }}
              />
            </div>
            <h1 className="h3 mb-2 fw-bold" style={{ color: 'var(--pahala-brown-dark)' }}>
              Admin Login
            </h1>
            <p className="text-muted mb-0">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="form-group position-relative">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                className="form-control-custom"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading || isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div className="form-group position-relative">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control-custom"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isLoading || isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isSubmitting}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-login"
              disabled={isLoading || isSubmitting || !email || !password}
            >
              {isLoading || isSubmitting ? (
                <>
                  <div className="loading-spinner d-inline-block me-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeDasharray="31.416" 
                        strokeDashoffset="31.416" 
                        className="loading-spinner" 
                      />
                    </svg>
                  </div>
                  Signing in...
                </>
              ) : (
                <>
                  {/* <Lock size={20} className="me-2" /> */}
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Back to Store */}
          <div className="back-link">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              ← Back to Store
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
