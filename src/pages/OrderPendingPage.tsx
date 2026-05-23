import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL, ApiError } from '../api/client';
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

type PaymentMethod = 'razorpay' | 'wallet';

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

function productImageSrc(item: OrderApi['items'][0], cartItems?: CartItem[]) {
  const fromCart = cartItems?.find(c => c.product.id === item.productId)?.product.image;
  if (fromCart) return fromCart;
  if (item.productImageUrl) return `${API_BASE_URL}${item.productImageUrl}`;
  return null;
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');

  useEffect(() => {
    if (!orderId) return;
    void fetchPublicOrder(orderId)
      .then(o => {
        setOrder(o);
        if (o.status === 'PAID' || o.status === 'PLACED') {
          navigate('/order-confirmation', { replace: true, state: { order: o } });
          return;
        }
        if (o.total <= 0) setPaymentMethod('wallet');
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load order'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  const proceedToPayment = async () => {
    if (!order || !orderId) return;
    setPaying(true);
    setError(null);
    try {
      if (order.total <= 0 || paymentMethod === 'wallet') {
        const paid = await completeWalletOrder(orderId);
        navigate('/order-confirmation', { state: { order: paid } });
        return;
      }

      const checkout = await createRazorpayCheckout(orderId);
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay. Please try again.');
      }

      const rzp = new window.Razorpay({
        key: checkout.keyId,
        currency: checkout.currency,
        name: 'Meladen Perfumes',
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
        modal: { ondismiss: () => setPaying(false) },
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
        Loading your order…
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
  const walletCoversAll = due <= 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="pb-32 lg:mx-auto lg:max-w-4xl lg:px-0"
    >
      <div className="px-5 pt-6">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Order received</p>
        <h1 className="font-serif text-2xl font-medium text-brand-dark lg:text-3xl">Review your order</h1>
        <p className="mt-2 text-sm text-brand-gray">
          A pending-order email was sent to{' '}
          <span className="text-gold">{order.customerEmail}</span>. Confirm payment below to process
          shipment.
        </p>
        <p className="mt-1 text-xs text-brand-gray/70">
          {order.orderNumber} · Status: {order.status.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="mt-6 space-y-4 px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6 lg:space-y-0">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <section className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5">
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Your details</p>
            <dl className="grid gap-3 text-sm text-[#e8e4dc] sm:grid-cols-2">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-brand-gray">Name</dt>
                <dd className="mt-0.5 font-medium">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-brand-gray">Email</dt>
                <dd className="mt-0.5">{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-brand-gray">Phone</dt>
                <dd className="mt-0.5">{order.customerPhone?.trim() || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] uppercase tracking-wider text-brand-gray">Shipping address</dt>
                <dd className="mt-0.5 leading-relaxed">
                  {order.address}, {order.city} {order.postcode}, {order.country}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5">
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Products</p>
            <div className="space-y-4">
              {order.items.map(item => {
                const img = productImageSrc(item, cartItems);
                return (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-3 rounded-2xl border border-[#252525] bg-[#141414] p-3"
                  >
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-brand-light-gray">
                      {img ? (
                        <img src={img} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-brand-gray">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm font-medium text-brand-dark">{item.productName}</p>
                      <p className="mt-1 text-xs text-brand-gray">
                        {item.size} · Qty {item.quantity} · ${Number(item.unitPrice).toFixed(0)} each
                      </p>
                    </div>
                    <p className="text-sm font-medium text-brand-dark">${Number(item.lineTotal).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </motion.div>

        <motion.aside
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
          className="lg:sticky lg:top-24"
        >
          <div className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#0f0f0f)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Order summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-gray">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-400/85">
                  <span>Promo {order.promoCode ? `(${order.promoCode})` : ''}</span>
                  <span>−${Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-gray">
                <span>Shipping</span>
                <span>${Number(order.shipping).toFixed(2)}</span>
              </div>
              {(order.walletDiscount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-400/85">
                  <span>Wallet applied</span>
                  <span>−${Number(order.walletDiscount).toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-[#262626]" />
              <div className="flex justify-between font-medium text-brand-dark">
                <span>Total due</span>
                <span className="text-gold">${due.toFixed(2)}</span>
              </div>
            </div>

            <p className="mb-3 mt-6 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Payment method</p>
            <div className="space-y-2">
              {!walletCoversAll && (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'border-gold/50 bg-gold/5'
                      : 'border-[#333] bg-[#141414]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1 accent-[#c9a962]"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <span>
                    <span className="block text-sm font-medium text-brand-dark">Pay online — Razorpay</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-brand-gray">
                      UPI · Credit / Debit card · Net banking · Wallets
                    </span>
                  </span>
                </label>
              )}
              {walletCoversAll && (
                <label className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <input type="radio" name="payment" className="mt-1" checked readOnly />
                  <span>
                    <span className="block text-sm font-medium text-emerald-300">Store wallet</span>
                    <span className="mt-0.5 block text-[11px] text-brand-gray">
                      Order fully covered — no online payment needed.
                    </span>
                  </span>
                </label>
              )}
            </div>

            <Button fullWidth className="mt-5" disabled={paying} onClick={() => void proceedToPayment()}>
              {paying
                ? 'Processing…'
                : walletCoversAll
                  ? 'Confirm order'
                  : 'Pay with Razorpay'}
            </Button>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <p className="mt-4 text-center text-[10px] leading-relaxed text-brand-gray">
              After payment, Shiprocket tracking will be emailed when your order ships.
            </p>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
