import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ApiError } from '../api/client';
import { placePublicOrder } from '../api/catalog';
import { getCustomerEmail, isCustomerLoggedIn } from '../api/customerAuth';
import { validatePromoCode } from '../api/promo';
import { getMyWallet } from '../api/wallet';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import { pageVariants, fadeUp } from '../animations/variants';

const FREE_SHIPPING_AT = 150;
const SHIPPING_COST = 12;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletUseInput, setWalletUseInput] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: '',
    card: '',
    expiry: '',
    cvv: '',
  });

  const set = (key: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  useEffect(() => {
    const em = getCustomerEmail();
    if (em) setForm(f => ({ ...f, email: em }));
  }, []);

  useEffect(() => {
    if (!isCustomerLoggedIn()) return;
    void getMyWallet()
      .then(w => setWalletBalance(Number(w.balance ?? 0)))
      .catch(() => setWalletBalance(0));
  }, []);

  const promoDiscount = appliedPromo?.discountAmount ?? 0;
  const subtotalAfterPromo = Math.max(0, total - promoDiscount);
  const shipping = subtotalAfterPromo >= FREE_SHIPPING_AT ? 0 : SHIPPING_COST;
  const preWalletTotal = subtotalAfterPromo + shipping;
  const maxWalletUse = Math.min(walletBalance, preWalletTotal);
  const parsedWalletUse =
    walletUseInput.trim() === '' ? 0 : Math.max(0, Number(walletUseInput) || 0);
  const effectiveWallet = Math.min(parsedWalletUse, maxWalletUse);
  const payableTotal = Math.max(0, preWalletTotal - effectiveWallet);

  const applyPromo = async () => {
    setPromoLoading(true);
    setPromoError(null);
    try {
      const r = await validatePromoCode(promoInput, total);
      if (!r.valid) {
        setAppliedPromo(null);
        setPromoError(r.message || 'Invalid code');
        return;
      }
      setAppliedPromo({
        code: String(r.code || promoInput).trim(),
        discountAmount: Number(r.discountAmount ?? 0),
      });
    } catch (e) {
      setPromoError(e instanceof Error ? e.message : 'Failed to validate');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await placePublicOrder({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || null,
        address: form.address,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
        promoCode: appliedPromo?.code ?? null,
        walletDiscount: effectiveWallet > 0 ? effectiveWallet : null,
        clientTotal: payableTotal,
        items: items.map(item => ({
          productId: item.product.id,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      clearCart();
      navigate('/order-confirmation');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { state: { from: '/checkout' } });
      }
      setSubmitError(err instanceof Error ? err.message : 'Order placement failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isCustomerLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="pb-32 lg:mx-auto lg:max-w-6xl">
      <div className="flex items-center justify-between px-5 pb-4 pt-6 lg:px-0">
        <button onClick={() => navigate(-1)} className="text-brand-gray transition-colors hover:text-brand-dark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="font-serif text-xl font-medium text-brand-dark">Checkout</h1>
        <button
          onClick={() => setSummaryOpen(true)}
          className="text-[11px] tracking-wide text-brand-gray underline underline-offset-4 lg:hidden"
        >
          Summary
        </button>
        <div className="hidden w-10 lg:block" />
      </div>

      <form onSubmit={handleSubmit} className="px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12 lg:px-0">
        <div className="space-y-6">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:p-6"
          >
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Contact</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="First Name" value={form.firstName} onChange={set('firstName')} required />
                <InputField label="Last Name" value={form.lastName} onChange={set('lastName')} required />
              </div>
              <InputField label="Email" type="email" value={form.email} onChange={set('email')} required />
              <InputField label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:p-6"
          >
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Shipping Address</p>
            <div className="space-y-3">
              <InputField label="Street Address" value={form.address} onChange={set('address')} required />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="City" value={form.city} onChange={set('city')} required />
                <InputField label="Postcode" value={form.postcode} onChange={set('postcode')} required />
              </div>
              <InputField label="Country" value={form.country} onChange={set('country')} required />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:p-6"
          >
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Payment</p>
            {payableTotal <= 0 ? (
              <p className="text-sm text-emerald-400/90">Order fully covered by wallet — no card charge.</p>
            ) : (
              <div className="space-y-3">
                <InputField label="Card Number" value={form.card} onChange={set('card')} required />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="MM / YY" value={form.expiry} onChange={set('expiry')} required />
                  <InputField label="CVV" value={form.cvv} onChange={set('cvv')} required />
                </div>
              </div>
            )}
          </motion.div>

          <div className="lg:hidden">
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
            {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
          </div>
        </div>

        <motion.aside
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="visible"
          className="hidden lg:sticky lg:top-24 lg:block"
        >
          <div className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#0f0f0f)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
            <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Order Summary</p>

            <div className="mb-6 space-y-4 rounded-2xl border border-[#252525] bg-[#141414] p-4">
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                  <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-brand-light-gray">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-sm font-medium text-brand-dark">{item.product.name}</p>
                    <p className="text-xs text-brand-gray">{item.size} · Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-brand-dark">${(item.unitPrice * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 space-y-2 rounded-2xl border border-[#252525] bg-[#141414] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Promo code</p>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  placeholder="Code"
                  className="min-w-0 flex-1 rounded-xl border border-[#333] bg-[#0c0c0c] px-3 py-2 text-sm text-brand-dark outline-none"
                />
                <button
                  type="button"
                  onClick={() => void applyPromo()}
                  disabled={promoLoading || !promoInput.trim()}
                  className="rounded-xl border border-brand-beige/30 px-3 py-2 text-xs uppercase tracking-widest text-brand-cream disabled:opacity-40"
                >
                  {promoLoading ? '…' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-xs text-red-400">{promoError}</p>}
              {appliedPromo && (
                <p className="text-xs text-emerald-400/90">
                  {appliedPromo.code} · −${appliedPromo.discountAmount.toFixed(0)}
                </p>
              )}
            </div>

            <div className="mb-4 space-y-2 rounded-2xl border border-[#252525] bg-[#141414] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Store wallet</p>
              <div className="flex justify-between text-sm text-[#e8e4dc]">
                <span>Balance</span>
                <span className="font-medium text-gold">${walletBalance.toFixed(2)}</span>
              </div>
              {walletBalance > 0 && preWalletTotal > 0 && (
                <>
                  <label htmlFor="wallet-use" className="sr-only">
                    Use from wallet ($)
                  </label>
                  <input
                    id="wallet-use"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Amount to apply"
                    value={walletUseInput}
                    onChange={e => setWalletUseInput(e.target.value)}
                    className="w-full rounded-xl border border-[#333] bg-[#0c0c0c] px-3 py-2 text-sm text-brand-dark outline-none"
                  />
                  <p className="text-[10px] text-[#8a8580]">
                    Up to ${maxWalletUse.toFixed(2)} can be applied to this order.
                  </p>
                </>
              )}
            </div>

            <div className="mb-6 space-y-2 rounded-2xl border border-[#252525] bg-[#141414] p-5">
              <div className="flex justify-between text-sm text-brand-gray">
                <span>Subtotal</span>
                <span>${total.toFixed(0)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400/80">
                  <span>Discount</span>
                  <span>−${promoDiscount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-brand-gray">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
              </div>
              {effectiveWallet > 0 && (
                <div className="flex justify-between text-sm text-emerald-400/85">
                  <span>Wallet</span>
                  <span>−${effectiveWallet.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-[#262626]" />
              <div className="flex justify-between font-medium text-brand-dark">
                <span>{payableTotal <= 0 ? 'Due' : 'Total'}</span>
                <span>${payableTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
            {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
          </div>
        </motion.aside>
      </form>

      <Drawer open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Order Summary">
        <div className="space-y-4">
          {items.map(item => (
            <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
              <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-brand-light-gray">
                <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-serif text-sm font-medium text-brand-dark">{item.product.name}</p>
                <p className="text-xs text-brand-gray">{item.size} · Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-brand-dark">${(item.unitPrice * item.quantity).toFixed(0)}</p>
            </div>
          ))}
          <div className="h-px bg-brand-beige" />
          <div className="space-y-1 text-sm text-brand-gray">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(0)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-400/80">
                <span>Discount</span>
                <span>−${promoDiscount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
            </div>
            {effectiveWallet > 0 && (
              <div className="flex justify-between text-emerald-400/85">
                <span>Wallet</span>
                <span>−${effectiveWallet.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between font-medium text-brand-dark">
            <span>Due</span>
            <span>${payableTotal.toFixed(2)}</span>
          </div>
        </div>
      </Drawer>
    </motion.div>
  );
}
