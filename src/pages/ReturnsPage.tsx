import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchMyOrders } from '../api/catalog';
import type { OrderApi } from '../api/types';
import {
  getCustomerEmail,
  isCustomerLoggedIn,
  requestCustomerOtp,
  verifyCustomerOtp,
} from '../api/customerAuth';
import { submitReturnRequest } from '../api/returns';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { pageVariants, fadeUp } from '../animations/variants';

export default function ReturnsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');
  const [authOpen, setAuthOpen] = useState(!isCustomerLoggedIn());
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [authEmail, setAuthEmail] = useState(() => getCustomerEmail() || '');
  const [authOtp, setAuthOtp] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authDevOtp, setAuthDevOtp] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    email: '',
    orderId: '',
    issueText: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const preferOrderId = orderIdFromUrl?.trim() || '';
    try {
      const data = await fetchMyOrders();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      const latest = list[0];
      const email = getCustomerEmail();
      setForm(p => ({
        ...p,
        email: String(email || p.email || '').trim(),
        name: latest?.customerName ? String(latest.customerName) : p.name,
        contactNumber: latest?.customerPhone ? String(latest.customerPhone) : p.contactNumber,
        orderId: preferOrderId || (latest?.id != null ? String(latest.id) : p.orderId),
      }));
    } catch {
      const email = getCustomerEmail();
      if (email) {
        setForm(p => ({
          ...p,
          email,
          orderId: preferOrderId || p.orderId,
        }));
      } else if (preferOrderId) {
        setForm(p => ({ ...p, orderId: preferOrderId }));
      }
    }
  }, [orderIdFromUrl]);

  useEffect(() => {
    const id = orderIdFromUrl?.trim();
    if (id) setForm(p => ({ ...p, orderId: id }));
  }, [orderIdFromUrl]);

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      setAuthOpen(false);
      void loadOrders();
    } else {
      setAuthOpen(true);
      setAuthStep('email');
    }
  }, [loadOrders]);

  const onRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const data = await requestCustomerOtp(authEmail.trim());
      setAuthStep('otp');
      setAuthDevOtp(data.devOtp ? String(data.devOtp) : null);
      setAuthMessage(data.message ?? 'Enter the code sent to your email.');
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      await verifyCustomerOtp(authEmail.trim(), authOtp.trim());
      setAuthOpen(false);
      setAuthOtp('');
      setAuthDevOtp(null);
      await loadOrders();
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setAuthLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setDoneMessage(null);
    if (!videoFile) {
      setError('Please attach a video showing the issue. Returns are not accepted without a video.');
      setSubmitting(false);
      return;
    }
    try {
      await submitReturnRequest({
        name: form.name,
        contactNumber: form.contactNumber,
        email: form.email,
        orderId: form.orderId,
        issueText: form.issueText,
        videoFile,
      });
      setDoneMessage('Your return request was submitted. We will follow up by email.');
      setVideoFile(null);
      setForm(p => ({ ...p, issueText: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const set =
    (key: keyof typeof form) =>
    (v: string) =>
      setForm(f => ({ ...f, [key]: v }));

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-[70vh] px-5 pb-32 pt-6 lg:mx-auto lg:max-w-2xl lg:px-0"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-brand-gray transition-colors hover:text-brand-dark"
        >
          ← Back
        </button>
        <h1 className="font-serif text-xl font-medium text-brand-dark">Returns</h1>
        <div className="w-10" />
      </div>

      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:p-6"
      >
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-brand-gray">
          Return or exchange
        </p>
        <p className="mb-6 text-xs text-brand-gray">
          The order id must match an order placed with the same email. A <strong className="text-[#c9a84c]">video</strong>{' '}
          showing the problem is required—we cannot process a return without it. Sign in to pre-fill recent orders.
        </p>

        {orders.length > 0 && (
          <label className="mb-4 block text-xs text-brand-gray">
            <span className="mb-1 block text-[10px] uppercase tracking-widest">Your orders</span>
            <select
              className="w-full rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-brand-dark outline-none"
              value={form.orderId}
              onChange={e => {
                const id = e.target.value;
                const o = orders.find(x => x.id === id);
                setForm(p => ({
                  ...p,
                  orderId: id,
                  name: o?.customerName ?? p.name,
                  email: o?.customerEmail ?? p.email,
                  contactNumber: o?.customerPhone ? String(o.customerPhone) : p.contactNumber,
                }));
              }}
            >
              <option value="">Select order…</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} · {new Date(o.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </label>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <InputField label="Full name" value={form.name} onChange={set('name')} required />
          <InputField label="Email" type="email" value={form.email} onChange={set('email')} required />
          <InputField label="Phone" type="tel" value={form.contactNumber} onChange={set('contactNumber')} required />
          <InputField
            label="Order id (UUID from confirmation)"
            value={form.orderId}
            onChange={set('orderId')}
            required
          />
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-brand-gray">
              Describe the issue
            </label>
            <textarea
              value={form.issueText}
              onChange={e => setForm(f => ({ ...f, issueText: e.target.value }))}
              required
              rows={4}
              className="w-full rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-brand-dark outline-none focus:border-brand-beige/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-brand-gray">
              Video <span className="text-amber-400/90">(required)</span>
            </label>
            <input
              type="file"
              accept="video/*"
              required
              onChange={e => setVideoFile(e.target.files?.[0] ?? null)}
              className="text-xs text-[#a8a29e] file:mr-3 file:rounded-lg file:border-0 file:bg-[#2a2a2a] file:px-3 file:py-1.5 file:text-[#e8e4dc]"
            />
            {!videoFile && (
              <p className="mt-1 text-[11px] text-[#8a8580]">Upload a short clip of the product or packaging issue.</p>
            )}
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {doneMessage && <p className="text-sm text-emerald-300/90">{doneMessage}</p>}
          <Button type="submit" fullWidth disabled={submitting || !videoFile}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </form>
      </motion.div>

      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#333] bg-[#121212] p-6 shadow-xl">
            <h2 className="mb-2 font-serif text-lg text-brand-dark">Sign in</h2>
            <p className="mb-4 text-xs text-brand-gray">
              Sign in with your email to load your orders. You can still submit a return with any email that
              matches the order.
            </p>
            {authStep === 'email' ? (
              <form onSubmit={onRequestOtp} className="space-y-3">
                <InputField
                  label="Email"
                  type="email"
                  value={authEmail}
                  onChange={v => setAuthEmail(v)}
                  required
                />
                {authMessage && <p className="text-xs text-amber-200/90">{authMessage}</p>}
                <Button type="submit" fullWidth disabled={authLoading}>
                  {authLoading ? 'Sending…' : 'Send code'}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-brand-gray underline"
                  onClick={() => setAuthOpen(false)}
                >
                  Continue without signing in
                </button>
              </form>
            ) : (
              <form onSubmit={onVerifyOtp} className="space-y-3">
                {authDevOtp && (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-100">
                    Dev OTP: <span className="font-mono">{authDevOtp}</span>
                  </p>
                )}
                <InputField label="Code" value={authOtp} onChange={v => setAuthOtp(v)} required />
                {authMessage && <p className="text-xs text-red-400/90">{authMessage}</p>}
                <Button type="submit" fullWidth disabled={authLoading}>
                  {authLoading ? 'Checking…' : 'Verify'}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-brand-gray underline"
                  onClick={() => {
                    setAuthStep('email');
                    setAuthOtp('');
                    setAuthDevOtp(null);
                  }}
                >
                  Change email
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
