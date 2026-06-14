import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'info'>('info');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const signedIn = isCustomerLoggedIn();

  const onRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setDevOtp(null);
    try {
      const data = await requestCustomerOtp(email.trim());
      setStep('otp');
      const emailSent = data.emailSent !== false;
      setMessageTone(emailSent ? 'success' : 'info');
      setMessage(
        data.message ??
          (emailSent
            ? 'Check your email for the sign-in code (including spam).'
            : 'Enter the code below.'),
      );
      if (data.devOtp) setDevOtp(String(data.devOtp));
    } catch (err) {
      setMessageTone('error');
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
      setMessageTone('error');
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
    setConfirmLogout(false);
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
              Your orders appear under <strong className="text-[#c9a84c]">My orders</strong>.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link
                to="/account"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-gold px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-black shadow-[0_4px_14px_rgba(201,168,76,0.35)] transition-[filter] hover:brightness-110 sm:flex-initial sm:min-w-[148px]"
              >
                My orders
              </Link>
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
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
              We&apos;ll email you a one-time sign-in code. It expires in 5 minutes.
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
                Dev code (email not sent): <span className="font-mono">{devOtp}</span>
              </p>
            )}
            <InputField label="6-digit code" value={otp} onChange={v => setOtp(v)} required />
            {message && (
              <p
                className={`text-sm ${
                  messageTone === 'success'
                    ? 'text-emerald-400/90'
                    : messageTone === 'error'
                      ? 'text-red-400/90'
                      : 'text-amber-200/90'
                }`}
              >
                {message}
              </p>
            )}
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

      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
            onClick={() => setConfirmLogout(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="signout-title"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-[1.75rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-6 text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 id="signout-title" className="font-serif text-lg font-medium text-[#e8e4dc]">
                Sign out?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#8a8580]">
                Are you sure you want to sign out of your account?
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setConfirmLogout(false)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border-2 border-[#5c5852] bg-[#1a1a1a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#e8e4dc] transition-colors hover:border-[#8a8580] sm:flex-initial sm:min-w-[130px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border-2 border-red-500/55 bg-red-500/10 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-200 transition-colors hover:border-red-400 hover:text-red-100 sm:flex-initial sm:min-w-[130px]"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
