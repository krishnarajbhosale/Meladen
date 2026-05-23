import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api/client';
import Button from '../components/Button';
import type { OrderApi } from '../api/types';
import { formatInr } from '../utils/currency';

type LocationState = { order?: OrderApi };

function itemImage(item: OrderApi['items'][0]) {
  if (item.productImageUrl) return `${API_BASE_URL}${item.productImageUrl}`;
  return null;
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as LocationState | null)?.order;
  const isCod = order?.paymentMethod === 'COD' || order?.status === 'COD';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen px-5 pb-24 pt-10 lg:mx-auto lg:max-w-2xl"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-sage/10"
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

        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-brand-gray">
          {isCod ? 'Order confirmed' : 'Payment successful'}
        </p>
        <h1 className="font-serif text-3xl font-medium text-brand-dark">Thank you</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-gray">
          {isCod
            ? 'Your Cash on Delivery order is confirmed. Pay when your package arrives.'
            : 'Your order is confirmed.'}{' '}
          A receipt was emailed
          {order?.customerEmail ? ` to ${order.customerEmail}` : ''}.
        </p>
        {order?.orderNumber && (
          <p className="mt-2 text-xs text-brand-gray/70">Order {order.orderNumber}</p>
        )}
      </div>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 space-y-4 rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 text-left"
        >
          <section>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Ship to</p>
            <p className="text-sm text-[#e8e4dc]">{order.customerName}</p>
            <p className="text-sm text-brand-gray">{order.customerPhone || order.customerEmail}</p>
            <p className="mt-1 text-sm text-brand-gray">
              {order.address}, {order.city} {order.postcode}, {order.country}
            </p>
          </section>

          <section>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Items</p>
            <div className="space-y-3">
              {order.items.map(item => {
                const img = itemImage(item);
                return (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                    <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-brand-light-gray">
                      {img ? (
                        <img src={img} alt={item.productName} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-dark">{item.productName}</p>
                      <p className="text-xs text-brand-gray">
                        {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-brand-dark">{formatInr(Number(item.lineTotal))}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-[#252525] bg-[#141414] p-4 text-sm">
            <div className="flex justify-between text-brand-gray">
              <span>{isCod ? 'Total due on delivery' : 'Total paid'}</span>
              <span className="font-medium text-gold">{formatInr(Number(order.total))}</span>
            </div>
          </section>

          {(order.trackingUrl || order.trackingAwb) && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
              {order.trackingAwb && <p className="font-medium">AWB: {order.trackingAwb}</p>}
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block underline">
                  Track on Shiprocket
                </a>
              )}
            </div>
          )}
        </motion.div>
      )}

      <div className="mx-auto mt-8 max-w-sm space-y-3">
        <Button fullWidth onClick={() => navigate('/')}>
          Continue shopping
        </Button>
        <Button variant="outline" fullWidth onClick={() => navigate('/account')}>
          View your orders
        </Button>
      </div>
    </motion.div>
  );
}
