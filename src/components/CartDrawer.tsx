import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { meladen13, meladen14 } from '../data/meladenImages';
import QuantityStepper from './QuantityStepper';

interface Props {
  open: boolean;
  onClose: () => void;
}

const upsells = [
  { name: 'Leather Travel Case', price: 85, img: meladen13 },
  { name: 'Discovery Set', price: 45, img: meladen14 },
];

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeFromCart, updateQty, total, count } = useCart();
  const navigate = useNavigate();
  const shipping = total >= 150 ? 0 : 12;
  const freeShippingThreshold = 150;
  const remaining = Math.max(0, freeShippingThreshold - total);
  const progress = Math.min(100, (total / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-[#242424] bg-[linear-gradient(180deg,#121212,#0d0d0d)] shadow-[0_28px_80px_rgba(0,0,0,0.5)]"
          >
            <div className="border-b border-[#252525] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Shopping Bag</p>
                  <div className="mt-1 flex items-center gap-2">
                    <h2 className="font-serif text-2xl text-brand-dark">Your Cart</h2>
                    <span className="rounded-full border border-[#31291c] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-brand-dark">
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2d2d2d] text-brand-gray transition-colors hover:border-brand-dark hover:text-brand-dark"
                  aria-label="Close cart"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-[#2d2418] bg-[#15120d] px-4 py-3">
                <div className="mb-2 flex items-center justify-between text-[11px] text-brand-gray">
                  <span>
                    {remaining > 0
                      ? `$${remaining.toFixed(0)} away from free shipping`
                      : 'Complimentary shipping applied'}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#242424]">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#8d7440,#c9a84c)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#2d2418] bg-[#181818]">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                        stroke="#666"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 6h18M16 10a4 4 0 01-8 0"
                        stroke="#666"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="font-serif text-2xl text-brand-dark">Your cart is empty</p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-gray">
                    Use the cart icon to save your selections.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/collection');
                    }}
                    className="mt-6 rounded-full bg-brand-dark px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-brand-cream transition-colors hover:bg-brand-dark/85"
                  >
                    Shop Cart
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.article
                        key={`${item.product.id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-[1.4rem] border border-[#252525] bg-[#141414] p-3.5"
                      >
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="h-[84px] w-[72px] flex-shrink-0 overflow-hidden rounded-2xl border border-[#262626] bg-brand-light-gray"
                            onClick={() => {
                              onClose();
                              navigate(`/product/${item.product.id}`);
                            }}
                          >
                            <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-serif text-[15px] leading-tight text-brand-dark">{item.product.name}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-brand-gray">
                                  {item.product.category}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product.id, item.size)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2d2d2d] text-brand-gray transition-colors hover:border-brand-dark hover:text-brand-dark"
                                aria-label={`Remove ${item.product.name}`}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>

                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#3a3121] bg-[#181512] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-brand-dark">
                                {item.size}
                              </span>
                              <span className="rounded-full border border-[#2b2b2b] px-2.5 py-1 text-[10px] text-brand-gray">
                                ${item.unitPrice.toFixed(0)} each
                              </span>
                            </div>

                            <div className="mt-3 flex items-end justify-between gap-3">
                              <QuantityStepper
                                value={item.quantity}
                                onChange={value => updateQty(item.product.id, item.size, value)}
                              />
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-brand-gray">Total</p>
                                <p className="mt-1 font-serif text-lg text-brand-dark">
                                  ${(item.unitPrice * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>

                  <div className="rounded-[1.5rem] border border-[#252525] bg-[#141414] p-4">
                    <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">You May Also Like</p>
                    <div className="grid grid-cols-2 gap-3">
                      {upsells.map(u => (
                        <button
                          type="button"
                          key={u.name}
                          className="overflow-hidden rounded-2xl border border-[#262626] bg-[#101010] text-left transition-opacity hover:opacity-90"
                        >
                          <div className="h-[104px] overflow-hidden">
                            <img src={u.img} alt={u.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="text-[11px] font-medium leading-tight text-brand-dark">{u.name}</p>
                            <p className="mt-1 text-[11px] text-brand-gray">${u.price}.00</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="flex items-center gap-2 text-[11px] text-brand-gray transition-colors hover:text-brand-dark">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-brand-gray/40 text-[10px]">
                      +
                    </span>
                    Add a promo code
                  </button>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#252525] bg-[#101010] px-6 pb-5 pt-4">
                <div className="rounded-[1.4rem] border border-[#252525] bg-[#141414] p-3.5">
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[11px] text-brand-gray">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-brand-gray">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : 'Calculated at checkout'}</span>
                    </div>
                    <div className="h-px bg-[#262626]" />
                    <div className="flex justify-between text-[15px] font-medium text-brand-dark">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <p className="mb-3 mt-3 text-center text-[9px] leading-relaxed text-brand-gray">
                  Taxes and shipping calculated at checkout.
                  <br />
                  Complimentary returns within 30 days.
                </p>

                <button
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-dark py-3.5 text-[11px] font-medium uppercase tracking-[0.15em] text-brand-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-dark/85 hover:shadow-[0_14px_30px_rgba(201,168,76,0.16)]"
                >
                  Proceed to Checkout
                  <span aria-hidden="true">→</span>
                </button>

                <div className="mt-4 flex justify-center gap-2">
                  {['VISA', 'MC', 'AMEX', 'PYPL', 'GPY'].map(p => (
                    <span
                      key={p}
                      className="rounded border border-brand-beige px-1.5 py-0.5 text-[8px] font-medium tracking-wide text-brand-gray/50"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
