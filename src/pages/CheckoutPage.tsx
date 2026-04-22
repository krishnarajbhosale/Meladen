import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import { pageVariants, fadeUp } from '../animations/variants';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total } = useCart();
  const [summaryOpen, setSummaryOpen] = useState(false);

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
  const shipping = total >= 150 ? 0 : 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/order-confirmation');
  };

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
            <div className="space-y-3">
              <InputField label="Card Number" value={form.card} onChange={set('card')} required />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="MM / YY" value={form.expiry} onChange={set('expiry')} required />
                <InputField label="CVV" value={form.cvv} onChange={set('cvv')} required />
              </div>
            </div>
          </motion.div>

          <div className="lg:hidden">
            <Button type="submit" fullWidth>
              Place Order
            </Button>
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

            <div className="mb-6 space-y-2 rounded-2xl border border-[#252525] bg-[#141414] p-5">
              <div className="flex justify-between text-sm text-brand-gray">
                <span>Subtotal</span>
                <span>${total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-gray">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
              </div>
              <div className="h-px bg-[#262626]" />
              <div className="flex justify-between font-medium text-brand-dark">
                <span>Total</span>
                <span>${(total + shipping).toFixed(0)}</span>
              </div>
            </div>

            <Button type="submit" fullWidth>
              Place Order
            </Button>
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
          <div className="flex justify-between font-medium text-brand-dark">
            <span>Total</span>
            <span>${(total + shipping).toFixed(0)}</span>
          </div>
        </div>
      </Drawer>
    </motion.div>
  );
}
