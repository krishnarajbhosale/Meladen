import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { overlayVariants } from '../animations/variants';
import CartDrawer from './CartDrawer';
import sparklingLogo from '../assets/Sparkling Logo.mp4';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Collection', path: '/collection' },
  { label: 'New Arrivals', path: '/collection' },
  { label: 'About', path: '/' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (menuOpen || cartOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, cartOpen]);

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.4)]' : 'bg-[#0f0f0f]/90 backdrop-blur-sm'
        }`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8">

          {/* Mobile: hamburger */}
          <button
            className="lg:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-5 h-px bg-brand-dark rounded-full" />
            <span className="block w-3.5 h-px bg-brand-dark rounded-full self-start" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="absolute left-1/2 flex h-[4.5rem] w-48 -translate-x-1/2 items-center justify-center overflow-hidden lg:static lg:h-20 lg:w-56 lg:translate-x-0 lg:justify-self-start"
            aria-label="Meladen home"
          >
            <video
              src={sparklingLogo}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-contain"
            />
          </Link>

          {/* Desktop: centered nav */}
          <nav className="hidden lg:flex items-center justify-center gap-9">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.path}
                className="text-[11px] font-medium text-brand-dark tracking-[0.12em] uppercase hover:text-brand-gray transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3 lg:justify-self-end">
            <button className="hidden lg:flex w-8 h-8 items-center justify-center text-brand-dark hover:text-brand-gray transition-colors" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Cart — opens drawer */}
            <button
              onClick={() => setCartOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-brand-dark relative hover:text-brand-gray transition-colors"
              aria-label="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-dark text-brand-cream text-[9px] font-medium rounded-full flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── MOBILE NAV DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="fixed top-0 left-0 h-full w-[75%] max-w-[300px] bg-[#111111] z-50 flex flex-col px-8 py-10 lg:hidden"
            >
              <button className="self-end mb-10 text-brand-gray" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <Link
                to="/"
                className="mb-10 flex h-24 w-56 items-center justify-center overflow-hidden"
                onClick={() => setMenuOpen(false)}
                aria-label="Meladen home"
              >
                <video
                  src={sparklingLogo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-contain"
                />
              </Link>
              <ul className="space-y-6 flex-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
                  >
                    <Link
                      to={link.path}
                      className="text-base font-medium text-brand-dark tracking-wide hover:text-brand-gray transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="border-t border-brand-beige pt-6">
                <button
                  className="text-sm text-brand-gray tracking-wide"
                  onClick={() => { setMenuOpen(false); setCartOpen(true); }}
                >
                  Bag {count > 0 && `(${count})`}
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* ── CART DRAWER ── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
