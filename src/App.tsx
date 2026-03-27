import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import WhatsAppButton from './components/WhatsAppButton';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { OrderProvider } from './context/OrderContext';
import { OrderFlowProvider } from './hooks/useOrderFlow';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrdersPage from './pages/OrdersPage';
import PaymentProcessingPage from './pages/PaymentProcessingPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';

const App: React.FC = () => {
  return (
    <LanguageProvider>
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <OrderFlowProvider>
            <BrowserRouter>
              <Navbar />
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slugWithId" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/otp-verification" element={<OTPVerificationPage />} />
                <Route path="/payment-processing" element={<PaymentProcessingPage />} />
                <Route path="/payment-status" element={<PaymentStatusPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetails />} />
                </Route>
              </Routes>
              <WhatsAppButton />
            </BrowserRouter>
          </OrderFlowProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
