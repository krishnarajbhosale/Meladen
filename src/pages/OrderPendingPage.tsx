import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ApiError } from '../api/client';
import {
  completeWalletOrder,
  createRazorpayCheckout,
  fetchPublicOrder,
  verifyOrderPayment,
} from '../api/catalog';
import { isCustomerLoggedIn } from '../api/customerAuth';
import type { OrderApi } from '../api/types';
import type { CartItem } from '../context/CartContext';
import Button from '../components/Button';
import { pageVariants, fadeUp } from '../animations/variants';

function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type LocationState = { cartItems?: CartItem[] };

export default function OrderPendingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = (location.state as LocationState | null)?.cartItems;

  const [order, setOrder] = useState<OrderApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    void fetchPublicOrder(orderId)
      .then(o => {
        setOrder(o);
        if (o.status === 'PAID' || o.status === 'PLACED') {
          navigate('/order-confirmation', { replace: true, state: { order: o } });
        }
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load order'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  const imageForProduct = (productId: string) =>
    cartItems?.find(c => c.product.id === productId)?.product.image;

  const proceedToPayment = async () => {
    if (!order || !orderId) return;
    setPaying(true);
    setError(null);
    try {
      if (order.total <= 0) {
        const paid = await completeWalletOrder(orderId);
        navigate('/order-confirmation', { state: { order: paid } });
        return;
      }

      const checkout = await createRazorpayCheckout(orderId);
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Could not load payment gateway');
      }

      const rzp = new window.Razorpay({
        key: checkout.keyId,
        currency: checkout.currency,
        name: 'Meladen',
        description: checkout.orderNumber,
        order_id: checkout.razorpayOrderId,
        prefill: {
          name: checkout.customerName,
          email: checkout.customerEmail,
          contact: checkout.customerPhone || undefined,
        },
        theme: { color: '#c9a962' },
        handler: async response => {
          try {
            const paid = await verifyOrderPayment(orderId, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate('/order-confirmation', { state: { order: paid } });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { state: { from: `/order-pending/${orderId}` } });
        return;
      }
      setError(err instanceof Error ? err.message : 'Payment could not start');
      setPaying(false);
    }
  };

  if (!isCustomerLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: `/order-pending/${orderId}` }} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-brand-gray">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-sm text-red-400">{error || 'Order not found'}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Home
        </Button>
      </div>
    );
  }

  const due = order.total;

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="pb-24 lg:mx-auto lg:max-w-3xl">
      <div className="px-5 pt-6 lg:px-0">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Order pending</p>
        <h1 className="font-serif text-2xl font-medium text-brand-dark">Review &amp; pay</h1>
        <p className="mt-2 text-sm text-brand-gray">
          We sent a confirmation email to <span className="text-gold">{order.customerEmail}</span>. Complete payment
          below to confirm your order.
        </p>
        <p className="mt-1 text-xs text-brand-gray/70">Order {order.orderNumber}</p>
      </div>

      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mx-5 mt-6 space-y-6 rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:mx-0"
      >
        <section>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Contact &amp; shipping</p>
          <dl className="space-y-1 text-sm text-[#e8e4dc]">
            <div>
              <dt className="text-brand-gray">Name</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-brand-gray">Email</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            {order.customerPhone && (
              <div>
                <dt className="text-brand-gray">Phone</dt>
                <dd>{order.customerPhone}</dd>
              </div>
            )}
            <div>
              <dt className="text-brand-gray">Address</dt>
              <dd>
                {order.address}, {order.city} {order.postcode}, {order.country}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Items</p>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-brand-light-gray">
                  {imageForProduct(item.productId) ? (
                    <img
                      src={imageForProduct(item.productId)}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-brand-gray">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-sm font-medium text-brand-dark">{item.productName}</p>
                  <p className="text-xs text-brand-gray">
                    {item.size} · Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-brand-dark">${Number(item.lineTotal).toFixed(0)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#252525] bg-[#141414] p-4 text-sm">
          <div className="flex justify-between text-brand-gray">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toFixed(0)}</span>
          </div>
          {(order.discountAmount ?? 0) > 0 && (
            <div className="mt-1 flex justify-between text-emerald-400/80">
              <span>Discount</span>
              <span>−${Number(order.discountAmount).toFixed(0)}</span>
            </div>
          )}
          {(order.walletDiscount ?? 0) > 0 && (
            <div className="mt-1 flex justify-between text-emerald-400/85">
              <span>Wallet</span>
              <span>−${Number(order.walletDiscount).toFixed(2)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between font-medium text-brand-dark">
            <span>{due <= 0 ? 'Due' : 'Total due'}</span>
            <span>${due.toFixed(2)}</span>
          </div>
        </section>

        <Button fullWidth disabled={paying} onClick={() => void proceedToPayment()}>
          {paying ? 'Opening payment…' : due <= 0 ? 'Confirm order' : 'Proceed to payment'}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </motion.div>
    </motion.div>
  );
}
