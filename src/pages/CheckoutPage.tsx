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
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postcode: '', country: '',
    card: '', expiry: '', cvv: '',
  });

  const set = (key: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [key]: v }));
  const shipping = total >= 150 ? 0 : 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/order-confirmation');
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="pb-32 lg:max-w-5xl lg:mx-auto">

      {/* Page header */}
      <div className="px-5 lg:px-0 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-brand-gray hover:text-brand-dark transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="font-serif text-xl font-medium text-brand-dark">Checkout</h1>
        <button onClick={() => setSummaryOpen(true)} className="text-[11px] text-brand-gray tracking-wide underline underline-offset-4 lg:hidden">
          Summary
        </button>
        <div className="hidden lg:block w-10" />
      </div>

      <form onSubmit={handleSubmit} className="px-5 lg:px-0 lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">

        {/* ── LEFT: Contact + Shipping + Payment ── */}
        <div className="space-y-8">

          {/* Contact */}
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
            <p className="text-[10px] text-brand-gray tracking-[0.2em] uppercase mb-4">Contact</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="First Name" value={form.firstName} onChange={set('firstName')} required />
                <InputField label="Last Name" value={form.lastName} onChange={set('lastName')} required />
              </div>
              <InputField label="Email" type="email" value={form.email} onChange={set('email')} required />
              <InputField label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
          </motion.div>

          {/* Shipping */}
          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
            <p className="text-[10px] text-brand-gray tracking-[0.2em] uppercase mb-4">Shipping Address</p>
            <div className="space-y-3">
              <InputField label="Street Address" value={form.address} onChange={set('address')} required />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="City" value={form.city} onChange={set('city')} required />
                <InputField label="Postcode" value={form.postcode} onChange={set('postcode')} required />
              </div>
              <InputField label="Country" value={form.country} onChange={set('country')} required />
            </div>
          </motion.div>

          {/* Payment */}
          <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
            <p className="text-[10px] text-brand-gray tracking-[0.2em] uppercase mb-4">Payment</p>
            <div className="space-y-3">
              <InputField label="Card Number" value={form.card} onChange={set('card')} required />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="MM / YY" value={form.expiry} onChange={set('expiry')} required />
                <InputField label="CVV" value={form.cvv} onChange={set('cvv')} required />
              </div>
            </div>
          </motion.div>

          {/* Submit — mobile only (desktop has it in right col) */}
          <div className="lg:hidden">
            <Button type="submit" fullWidth>Place Order</Button>
          </div>
        </div>

        {/* ── RIGHT: Order Summary (desktop sticky) ── */}
        <motion.div
          variants={fadeUp} custom={3} initial="hidden" animate="visible"
          className="hidden lg:block lg:sticky lg:top-24"
        >
          <p className="text-[10px] text-brand-gray tracking-[0.2em] uppercase mb-5">Order Summary</p>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-3 items-center">
                <div className="w-14 h-16 rounded-xl overflow-hidden bg-brand-light-gray flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm font-medium text-brand-dark truncate">{item.product.name}</p>
                  <p className="text-xs text-brand-gray">{item.size} · Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-brand-dark">${(item.unitPrice * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-brand-beige/40 rounded-2xl p-5 space-y-2 mb-6">
            <div className="flex justify-between text-sm text-brand-gray">
              <span>Subtotal</span><span>${total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-gray">
              <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
            </div>
            <div className="h-px bg-brand-beige" />
            <div className="flex justify-between font-medium text-brand-dark">
              <span>Total</span><span>${(total + shipping).toFixed(0)}</span>
            </div>
          </div>

          <Button type="submit" fullWidth>Place Order</Button>
        </motion.div>
      </form>

      {/* Mobile summary drawer */}
      <Drawer open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Order Summary">
        <div className="space-y-4">
          {items.map(item => (
            <div key={`${item.product.id}-${item.size}`} className="flex gap-3 items-center">
              <div className="w-14 h-16 rounded-xl overflow-hidden bg-brand-light-gray flex-shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
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
            <span>Total</span><span>${(total + shipping).toFixed(0)}</span>
          </div>
        </div>
      </Drawer>
    </motion.div>
  );
}
