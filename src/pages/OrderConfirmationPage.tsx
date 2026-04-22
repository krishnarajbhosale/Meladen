import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-20 h-20 rounded-full bg-brand-sage/10 flex items-center justify-center mb-8"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="#4A5B4D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className="text-[10px] text-brand-gray tracking-[0.25em] uppercase mb-3"
      >
        Order Confirmed
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.35 }}
        className="font-serif text-3xl font-medium text-brand-dark mb-4"
      >
        Thank You
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.35 }}
        className="text-sm text-brand-gray leading-relaxed mb-2 max-w-[280px]"
      >
        Your order has been placed and is being prepared with care. You'll receive a confirmation email shortly.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.35 }}
        className="text-xs text-brand-gray/60 mb-10"
      >
        Order #MEL-{Math.floor(Math.random() * 90000) + 10000}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.35 }}
        className="w-full space-y-3"
      >
        <Button fullWidth onClick={() => navigate('/')}>Continue Shopping</Button>
        <Button variant="outline" fullWidth onClick={() => navigate('/')}>Track Your Order</Button>
      </motion.div>
    </motion.div>
  );
}
