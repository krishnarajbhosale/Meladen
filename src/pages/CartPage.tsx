import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { guardCheckout } from '../api/customerAuth';
import { formatProductSizeLine } from '../data/products';
import { useCart } from '../context/CartContext';
import QuantityStepper from '../components/QuantityStepper';
import Button from '../components/Button';
import { pageVariants, fadeUp } from '../animations/variants';
import { formatInr } from '../utils/currency';

export default function CartPage() {
  const { items, removeFromCart, updateQty, total, count } = useCart();
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-brand-cream px-5 pb-24 pt-6 lg:px-10 lg:pt-10 xl:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between lg:mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-brand-gray transition-colors hover:text-brand-dark"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Continue Shopping
          </button>
          <span className="text-xs uppercase tracking-[0.18em] text-brand-gray">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </div>

        {items.length === 0 ? (
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] px-8 py-16 text-center shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#31291c] bg-[#181818]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                  stroke="#7a746d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6h18M16 10a4 4 0 01-8 0"
                  stroke="#7a746d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mb-2 font-serif text-3xl text-brand-dark">Your cart is empty</p>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-brand-gray">
              Discover our curated collection of fine fragrances.
            </p>
            <Button onClick={() => navigate('/collection')} className="px-8">
              Explore Collection
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
            <section className="space-y-0 divide-y divide-[#1f1f1f]/90">
              <div className="pb-8">
                <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gray">Shopping Cart</p>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <h1 className="font-serif text-2xl text-brand-dark lg:text-3xl">Review Your Selection</h1>
                  <button
                    onClick={() => navigate('/collection')}
                    className="hidden text-[11px] uppercase tracking-[0.16em] text-brand-gray transition-colors hover:text-brand-dark lg:inline-flex"
                  >
                    Add More
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.article
                    key={`${item.product.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: i * 0.04 }}
                    className="py-4"
                  >
                    <div className="flex gap-4 lg:gap-5">
                      <button
                        type="button"
                        className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#141414] transition-transform hover:scale-[1.02] lg:h-28 lg:w-24"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-1.5"
                        />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-brand-gray">
                              {item.product.category}
                            </p>
                            <p className="font-serif text-sm leading-snug text-brand-dark lg:text-base">{item.product.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-gray transition-colors hover:bg-white/5 hover:text-brand-dark"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#1a1814] px-2.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-brand-dark">
                            {formatProductSizeLine(item.size)}
                          </span>
                          <span className="text-[9px] text-brand-gray">
                            {formatInr(item.unitPrice, 0)} each
                          </span>
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="mb-1.5 text-[9px] uppercase tracking-[0.16em] text-brand-gray">Quantity</p>
                            <QuantityStepper
                              compact
                              value={item.quantity}
                              onChange={v => updateQty(item.product.id, item.size, v)}
                            />
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-[9px] uppercase tracking-[0.16em] text-brand-gray">Item Total</p>
                            <p className="mt-0.5 font-serif text-lg text-brand-dark">
                              {formatInr(item.unitPrice * item.quantity, 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="py-2 lg:pl-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gray">Order Summary</p>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-xs text-brand-gray">
                    <span>Subtotal</span>
                    <span>{formatInr(total, 0)}</span>
                  </div>
                  <div className="flex justify-between font-serif text-xl text-brand-dark">
                    <span>Total</span>
                    <span>{formatInr(total, 0)}</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  onClick={() => {
                    if (!guardCheckout(navigate)) return;
                    navigate('/checkout');
                  }}
                  className="mt-6"
                >
                  Proceed to Checkout
                </Button>

                <button
                  type="button"
                  onClick={() => navigate('/collection')}
                  className="mt-3 w-full text-center text-[11px] uppercase tracking-[0.16em] text-brand-gray transition-colors hover:text-brand-dark"
                >
                  Continue Shopping
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </motion.div>
  );
}
