import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import type { OrderApi } from '../api/types';

type LocationState = { order?: OrderApi };

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as LocationState | null)?.order;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col items-center justify-center px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-brand-sage/10"
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
        className="mb-3 text-[10px] uppercase tracking-[0.25em] text-brand-gray"
      >
        Order Confirmed
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.35 }}
        className="mb-4 font-serif text-3xl font-medium text-brand-dark"
      >
        Thank You
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.35 }}
        className="mb-2 max-w-[320px] text-sm leading-relaxed text-brand-gray"
      >
        Your payment was received and your order is being prepared with care. A confirmation email has been sent
        {order?.customerEmail ? ` to ${order.customerEmail}` : ''}.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.35 }}
        className="mb-10 text-xs text-brand-gray/60"
      >
        {order?.orderNumber ? `Order ${order.orderNumber}` : 'Order confirmed'}
      </motion.p>

      {order?.trackingUrl && (
        <motion.a
          href={order.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-sm text-gold underline underline-offset-4"
        >
          Track shipment
        </motion.a>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.35 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button fullWidth onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
        <Button variant="outline" fullWidth onClick={() => navigate('/account')}>
          View your orders
        </Button>
      </motion.div>
    </motion.div>
  );
}
