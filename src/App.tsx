import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MobileContainer from './components/MobileContainer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import CollectionPage from './pages/CollectionPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ReturnsPage from './pages/ReturnsPage';
import AccountOrdersPage from './pages/AccountOrdersPage';

const CHROME_ROUTES = ['/', '/cart', '/checkout', '/collection', '/login', '/returns', '/account'];

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
    (CHROME_ROUTES.includes(location.pathname) || location.pathname.startsWith('/product'));

  return (
    <MobileContainer>
      <ScrollToTop />
      {showChrome && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountOrdersPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/ladmin" element={<AdminPage />} />
        </Routes>
      </AnimatePresence>
      {showChrome && <Footer />}
    </MobileContainer>
  );
}
