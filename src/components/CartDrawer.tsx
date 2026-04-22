import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { meladen13, meladen14 } from '../data/meladenImages';

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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer — slides from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#111111] z-50 flex flex-col shadow-2xl"
          >
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-beige flex-shrink-0">
              <div>
                <span className="font-serif text-lg font-medium text-brand-dark">Your Cart</span>
                <span className="text-[11px] text-brand-gray ml-2">({count} {count === 1 ? 'item' : 'items'})</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-brand-gray hover:text-brand-dark transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* ── FREE SHIPPING PROGRESS ── */}
            <div className="px-6 py-3 border-b border-brand-beige flex-shrink-0">
              <p className="text-[11px] text-brand-gray text-center mb-2">
                {remaining > 0
                  ? <>You are <span className="text-brand-dark font-medium">${remaining.toFixed(0)}</span> away from free shipping.</>
                  : <span className="text-brand-sage font-medium">You've unlocked free shipping! 🎉</span>
                }
              </p>
              <div className="h-0.5 bg-brand-beige rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand-dark rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <div className="flex-1 overflow-y-auto">

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-serif text-lg text-brand-dark">Your cart is empty</p>
                  <p className="text-sm text-brand-gray">Use the cart icon to save your selections.</p>
                  <button
                    onClick={() => { onClose(); navigate('/collection'); }}
                    className="mt-2 bg-brand-dark text-brand-cream text-[11px] tracking-widest uppercase px-6 py-3 rounded-sm hover:bg-brand-dark/85 transition-colors"
                  >
                    Shop Cart
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-0">

                  {/* Cart items */}
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 py-5 border-b border-brand-beige last:border-0"
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-[72px] h-[80px] rounded-xl overflow-hidden bg-brand-light-gray flex-shrink-0 cursor-pointer"
                          onClick={() => { onClose(); navigate(`/product/${item.product.id}`); }}
                        >
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm font-medium text-brand-dark leading-tight mb-0.5">{item.product.name}</p>
                          <p className="text-[10px] text-brand-gray tracking-widest uppercase mb-0.5">{item.product.category}</p>
                          <p className="text-[11px] text-brand-gray mb-3">{item.product.size}</p>

                          {/* Qty stepper */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-brand-beige rounded-full">
                              <button
                                onClick={() => updateQty(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-brand-gray hover:text-brand-dark transition-colors text-base"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-[12px] font-medium text-brand-dark">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-brand-gray hover:text-brand-dark transition-colors text-base"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price + remove */}
                        <div className="flex flex-col items-end justify-between flex-shrink-0">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-brand-gray/40 hover:text-brand-gray transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <p className="text-sm font-medium text-brand-dark">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Complimentary samples notice */}
                  <div className="flex gap-3 bg-brand-beige/40 rounded-xl p-4 mt-4">
                    <span className="text-lg flex-shrink-0">🎁</span>
                    <div>
                      <p className="text-[11px] font-medium text-brand-dark mb-0.5">Complimentary Samples Included</p>
                      <p className="text-[10px] text-brand-gray leading-relaxed">
                        Your order includes 2 complimentary 2ml samples of our bestselling fragrances. Select at checkout.
                      </p>
                    </div>
                  </div>

                  {/* You may also like */}
                  <div className="pt-6">
                    <p className="text-[9px] text-brand-gray tracking-[0.2em] uppercase mb-4">You May Also Like</p>
                    <div className="grid grid-cols-2 gap-3">
                      {upsells.map(u => (
                        <div key={u.name} className="bg-brand-light-gray rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                          <div className="h-[100px] overflow-hidden">
                            <img src={u.img} alt={u.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="text-[11px] font-medium text-brand-dark leading-tight">{u.name}</p>
                            <p className="text-[11px] text-brand-gray">${u.price}.00</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Promo code */}
                  <div className="pt-6 pb-2">
                    <button className="flex items-center gap-2 text-[11px] text-brand-gray hover:text-brand-dark transition-colors">
                      <span className="w-4 h-4 rounded-full border border-brand-gray/40 flex items-center justify-center text-[9px]">+</span>
                      Add a promo code
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER — totals + CTA ── */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-[#2a2a2a] px-6 pt-4 pb-6 bg-[#111111]">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[12px] text-brand-gray">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-brand-gray">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : 'Calculated at checkout'}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-brand-dark pt-1 border-t border-brand-beige">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-brand-gray text-center mb-3 leading-relaxed">
                  Taxes and shipping calculated at checkout.<br />Complimentary returns within 30 days.
                </p>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-dark text-brand-cream text-[11px] font-medium tracking-[0.15em] uppercase py-4 rounded-sm hover:bg-brand-dark/85 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout →
                </button>

                {/* Payment icons */}
                <div className="flex justify-center gap-2 mt-3">
                  {['VISA', 'MC', 'AMEX', 'PYPL', 'GPY'].map(p => (
                    <span key={p} className="text-[8px] text-brand-gray/50 border border-brand-beige rounded px-1.5 py-0.5 font-medium tracking-wide">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
