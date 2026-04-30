import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { overlayVariants } from '../animations/variants';
import CartDrawer from './CartDrawer';
import sparklingLogo from '../assets/Sparkling Logo.mp4';
import AutoplayVideo from './AutoplayVideo';
import { apiProductToProduct, fetchCategoriesWithProducts } from '../api/catalog';
import { products as fallbackProducts, type Product } from '../data/products';

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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPool, setSearchPool] = useState<Product[]>([]);
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      if (currentScrollY < 24) {
        setHeaderVisible(true);
      } else {
        const scrollingUp = currentScrollY < lastScrollY.current;
        const delta = Math.abs(currentScrollY - lastScrollY.current);

        if (delta > 6) {
          setHeaderVisible(scrollingUp);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, cartOpen]);

  useEffect(() => {
    setHeaderVisible(true);
    lastScrollY.current = 0;
    setSearchQuery('');
    setMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategoriesWithProducts();
        if (cancelled) return;
        const fromApi = data.flatMap(section => section.products.map(apiProductToProduct));
        setSearchPool(fromApi.length > 0 ? fromApi : fallbackProducts);
      } catch {
        if (!cancelled) setSearchPool(fallbackProducts);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const unique = new Map<string, Product>();
    for (const p of searchPool) {
      const haystack = [p.name, p.category, p.inspiredBy ?? '', p.searchKeywords ?? ''].join(' ').toLowerCase();
      if (haystack.includes(q)) unique.set(p.id, p);
      if (unique.size >= 8) break;
    }
    return Array.from(unique.values());
  }, [searchPool, searchQuery]);

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-400 ${
          scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.4)]' : 'bg-[#0f0f0f]/90 backdrop-blur-sm'
        }`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: headerVisible ? 1 : 0.98, y: headerVisible ? 0 : -108 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:px-10">
          <button
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="block h-px w-5 rounded-full bg-brand-dark" />
            <span className="block h-px w-3.5 self-start rounded-full bg-brand-dark" />
          </button>

          <Link
            to="/"
            className={`absolute left-1/2 flex -translate-x-1/2 items-center justify-center overflow-hidden transition-all duration-200 ${
              mobileSearchOpen ? 'h-12 w-32' : 'h-[4.5rem] w-48'
            } lg:static lg:h-20 lg:w-56 lg:translate-x-0 lg:justify-self-start`}
            aria-label="Meladen home"
          >
            <AutoplayVideo
              sources={[{ src: sparklingLogo, type: 'video/mp4' }]}
              className="pointer-events-none h-full w-full object-contain"
            />
          </Link>

          <nav className="hidden items-center justify-center gap-9 lg:flex">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.path}
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-dark transition-colors duration-200 hover:text-brand-gray"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:justify-self-end">
            <div className="relative hidden lg:block">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="w-52 rounded-full border border-brand-beige/80 bg-[#0f0f0f]/80 px-3 py-1.5 text-[11px] text-brand-dark outline-none transition-colors placeholder:text-brand-gray focus:border-brand-dark"
              />
              {searchQuery.trim() && (
                <div className="absolute right-0 top-10 z-50 max-h-80 w-72 overflow-y-auto rounded-xl border border-brand-beige bg-[#111111] p-2 shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          navigate(`/product/${item.id}`);
                        }}
                        className="mb-1 w-full rounded-lg px-3 py-2 text-left hover:bg-[#1a1a1a]"
                      >
                        <p className="text-sm font-medium text-brand-dark">{item.name}</p>
                        <p className="text-[10px] text-brand-gray">{item.category}</p>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-xs text-brand-gray">No products found</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(prev => !prev)}
              className="flex h-8 w-8 items-center justify-center text-brand-dark transition-colors hover:text-brand-gray lg:hidden"
              aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-8 w-8 items-center justify-center text-brand-dark transition-colors hover:text-brand-gray"
              aria-label="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark text-[9px] font-medium text-brand-cream"
                >
                  {count}
                </motion.span>
              )}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="border-t border-brand-beige/40 px-5 pb-3 pt-2 lg:hidden"
            >
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-full border border-brand-beige/80 bg-[#0f0f0f]/80 px-3 py-2 text-xs text-brand-dark outline-none transition-colors placeholder:text-brand-gray focus:border-brand-dark"
                />
                {searchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-11 z-50 max-h-80 overflow-y-auto rounded-xl border border-brand-beige bg-[#111111] p-2 shadow-xl">
                    {searchResults.length > 0 ? (
                      searchResults.map(item => (
                        <button
                          key={`mobile-${item.id}`}
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setMobileSearchOpen(false);
                            navigate(`/product/${item.id}`);
                          }}
                          className="mb-1 w-full rounded-lg px-3 py-2 text-left hover:bg-[#1a1a1a]"
                        >
                          <p className="text-sm font-medium text-brand-dark">{item.name}</p>
                          <p className="text-[10px] text-brand-gray">{item.category}</p>
                        </button>
                      ))
                    ) : (
                      <p className="px-2 py-2 text-xs text-brand-gray">No products found</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="fixed left-0 top-0 z-50 flex h-full w-[75%] max-w-[300px] flex-col bg-[#111111] px-8 py-10 lg:hidden"
            >
              <button className="mb-10 self-end text-brand-gray" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <Link
                to="/"
                className="mb-10 flex h-24 w-56 items-center justify-center overflow-hidden"
                onClick={() => setMenuOpen(false)}
                aria-label="Meladen home"
              >
                <AutoplayVideo
                  sources={[{ src: sparklingLogo, type: 'video/mp4' }]}
                  className="pointer-events-none h-full w-full object-contain"
                />
              </Link>
              <ul className="flex-1 space-y-6">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
                  >
                    <Link
                      to={link.path}
                      className="text-base font-medium tracking-wide text-brand-dark transition-colors hover:text-brand-gray"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="border-t border-brand-beige pt-6">
                <button
                  className="text-sm tracking-wide text-brand-gray"
                  onClick={() => {
                    setMenuOpen(false);
                    setCartOpen(true);
                  }}
                >
                  Bag {count > 0 && `(${count})`}
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
