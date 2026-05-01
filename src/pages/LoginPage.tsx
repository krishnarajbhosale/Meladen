import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  customerLogout,
  getCustomerEmail,
  isCustomerLoggedIn,
  requestCustomerOtp,
  verifyCustomerOtp,
} from '../api/customerAuth';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { pageVariants, fadeUp } from '../animations/variants';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(() => getCustomerEmail() || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signedIn = isCustomerLoggedIn();

  const onRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setDevOtp(null);
    try {
      const data = await requestCustomerOtp(email.trim());
      setStep('otp');
      setMessage(data.message ?? 'Check your email or use the dev code below.');
      if (data.devOtp) setDevOtp(String(data.devOtp));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await verifyCustomerOtp(email.trim(), otp.trim());
      setOtp('');
      setDevOtp(null);
      const from = (location.state as { from?: string } | null)?.from;
      const target =
        from && from.startsWith('/') && !from.startsWith('/ladmin') && from !== '/login'
          ? from
          : '/account';
      navigate(target, { replace: true });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    customerLogout();
    setStep('email');
    setOtp('');
    setDevOtp(null);
    setMessage(null);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[70vh] px-5 pb-32 pt-10 lg:mx-auto lg:max-w-md lg:px-0"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-brand-gray transition-colors hover:text-brand-dark"
        >
          ← Back
        </button>
        <h1 className="font-serif text-xl font-medium text-brand-dark">Account</h1>
        <div className="w-10" />
      </div>

      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-6"
      >
        {signedIn ? (
          <div className="space-y-5 text-center">
            <p className="text-sm text-[#a8a29e]">
              Signed in as{' '}
              <span className="font-medium text-[#e8e4dc]">{getCustomerEmail()}</span>
            </p>
            <p className="text-xs leading-relaxed text-[#8a8580]">
              Your orders appear under <strong className="text-[#c9a84c]">My orders</strong>. Start a return
              or exchange from there or below.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link
                to="/account"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-gold px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-black shadow-[0_4px_14px_rgba(201,168,76,0.35)] transition-[filter] hover:brightness-110 sm:flex-initial sm:min-w-[148px]"
              >
                My orders
              </Link>
              <Link
                to="/returns"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border-2 border-[#b8b3ac]/55 bg-transparent px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#e8e4dc] transition-colors hover:border-gold hover:text-gold sm:flex-initial sm:min-w-[148px]"
              >
                Returns
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border-2 border-[#5c5852] bg-[#1a1a1a] px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#e8e4dc] transition-colors hover:border-[#8a8580] sm:flex-initial sm:min-w-[148px]"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : step === 'email' ? (
          <form onSubmit={onRequestOtp} className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Sign in with email</p>
            <p className="text-xs text-brand-gray">
              We send a one-time code. In development the API may return the code in the response and server
              logs.
            </p>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={v => setEmail(v)}
              required
            />
            {message && <p className="text-sm text-amber-200/90">{message}</p>}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending…' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Enter code</p>
            <p className="text-xs text-brand-gray">Sent to {email}</p>
            {devOtp && (
              <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                Dev OTP: <span className="font-mono">{devOtp}</span>
              </p>
            )}
            <InputField label="6-digit code" value={otp} onChange={v => setOtp(v)} required />
            {message && <p className="text-sm text-red-400/90">{message}</p>}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs text-brand-gray underline underline-offset-4"
              onClick={() => {
                setStep('email');
                setOtp('');
                setDevOtp(null);
                setMessage(null);
              }}
            >
              Use a different email
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
