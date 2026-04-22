import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import QuantityStepper from '../components/QuantityStepper';
import Button from '../components/Button';
import { pageVariants, fadeUp } from '../animations/variants';

export default function CartPage() {
  const { items, removeFromCart, updateQty, total, count } = useCart();
  const navigate = useNavigate();

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="px-5 pt-6 pb-32 min-h-screen lg:max-w-2xl lg:mx-auto lg:pt-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-brand-gray">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="font-serif text-xl font-medium text-brand-dark">Your Bag</h1>
        <span className="text-sm text-brand-gray">{count} {count === 1 ? 'item' : 'items'}</span>
      </div>

      {items.length === 0 ? (
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
          className="flex flex-col items-center justify-center pt-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-serif text-xl text-brand-dark">Your bag is empty</p>
          <p className="text-sm text-brand-gray text-center">Discover our curated collection of fine fragrances.</p>
          <Button onClick={() => navigate('/')} className="mt-2">Explore Collection</Button>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: i * 0.05 }}
                className="flex gap-4 mb-6 pb-6 border-b border-brand-beige last:border-0"
              >
                <div
                  className="w-20 h-24 rounded-2xl overflow-hidden bg-brand-light-gray flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/product/${item.product.id}`)}
                >
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-brand-gray tracking-widest uppercase mb-0.5">{item.product.category}</p>
                  <p className="font-serif text-base font-medium text-brand-dark leading-tight mb-1">{item.product.name}</p>
                  <p className="text-sm text-brand-gray mb-3">{item.product.size}</p>
                  <div className="flex items-center justify-between">
                    <QuantityStepper value={item.quantity} onChange={v => updateQty(item.product.id, v)} />
                    <p className="font-medium text-brand-dark">${(item.product.price * item.quantity).toFixed(0)}</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="self-start text-brand-gray/50 hover:text-brand-gray transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Summary */}
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="bg-brand-beige/40 rounded-2xl p-5 mb-6">
            <div className="flex justify-between text-sm text-brand-gray mb-2">
              <span>Subtotal</span><span>${total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-gray mb-2">
              <span>Shipping</span><span>{total >= 150 ? 'Free' : '$12'}</span>
            </div>
            <div className="h-px bg-brand-beige my-3" />
            <div className="flex justify-between font-medium text-brand-dark">
              <span>Total</span>
              <span>${(total >= 150 ? total : total + 12).toFixed(0)}</span>
            </div>
          </motion.div>

          <Button fullWidth onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
        </>
      )}
    </motion.div>
  );
}
