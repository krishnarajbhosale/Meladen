import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MobileContainer from './components/MobileContainer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderPendingPage from './pages/OrderPendingPage';
import CollectionPage from './pages/CollectionPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ReturnsPage from './pages/ReturnsPage';
import AccountOrdersPage from './pages/AccountOrdersPage';
import TermsPage from './pages/policies/TermsPage';
import PrivacyPolicyPage from './pages/policies/PrivacyPolicyPage';
import ShippingPolicyPage from './pages/policies/ShippingPolicyPage';
import ReturnsRefundPolicyPage from './pages/policies/ReturnsRefundPolicyPage';
import JurisdictionPage from './pages/policies/JurisdictionPage';
import TrackOrderPage from './pages/TrackOrderPage';

const CHROME_ROUTES = [
  '/',
  '/cart',
  '/checkout',
  '/collection',
  '/login',
  '/returns',
  '/account',
  '/order-confirmation',
];

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const showChrome =
    !location.pathname.startsWith('/ladmin') &&
    (CHROME_ROUTES.includes(location.pathname) ||
      location.pathname.startsWith('/policies') ||
      location.pathname.startsWith('/product') ||
      location.pathname.startsWith('/order-pending'));

  return (
    <MobileContainer>
      <ScrollToTop />
      {showChrome && <Navbar />}
      <AnimatePresence
        mode="wait"
        onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-pending/:orderId" element={<OrderPendingPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountOrdersPage />} />
          <Route path="/track/:orderId" element={<TrackOrderPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/policies" element={<Navigate to="/policies/terms" replace />} />
          <Route path="/policies/terms" element={<TermsPage />} />
          <Route path="/policies/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/policies/shipping" element={<ShippingPolicyPage />} />
          <Route path="/policies/returns" element={<ReturnsRefundPolicyPage />} />
          <Route path="/policies/jurisdiction" element={<JurisdictionPage />} />
          <Route path="/ladmin" element={<AdminPage />} />
        </Routes>
      </AnimatePresence>
      {showChrome && <Footer />}
    </MobileContainer>
  );
}
