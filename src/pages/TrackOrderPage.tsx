import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchPublicOrder } from '../api/catalog';
import { isCustomerLoggedIn } from '../api/customerAuth';
import Button from '../components/Button';
import { pageVariants, fadeUp } from '../animations/variants';

export default function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'missing' | 'notReady' | 'ready' | 'error'>('loading');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!orderId) {
      setStatus('missing');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const o = await fetchPublicOrder(orderId);
        const url = String(o.trackingUrl ?? '').trim();
        if (cancelled) return;
        if (!url) {
          setStatus('notReady');
          setMessage('Tracking is not available yet. Please check again after your order is shipped.');
          return;
        }
        setTrackingUrl(url);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'Could not load tracking.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (status === 'ready' && trackingUrl) {
      window.location.href = trackingUrl;
    }
  }, [status, trackingUrl]);

  if (!isCustomerLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: orderId ? `/track/${orderId}` : '/account' }} />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[70vh] px-5 pb-24 pt-8 lg:mx-auto lg:max-w-xl"
    >
      <button type="button" onClick={() => navigate(-1)} className="mb-5 text-brand-gray hover:text-brand-dark">
        ← Back
      </button>

      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-6"
      >
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Track order</p>

        {status === 'loading' && <p className="text-sm text-brand-gray">Loading tracking…</p>}
        {status === 'missing' && <p className="text-sm text-brand-gray">Order id missing.</p>}
        {status === 'ready' && (
          <p className="text-sm text-brand-gray">
            Redirecting you to Shiprocket tracking…
          </p>
        )}
        {status === 'notReady' && <p className="text-sm text-brand-gray">{message}</p>}
        {status === 'error' && <p className="text-sm text-amber-400/90">{message}</p>}

        {(status === 'notReady' || status === 'error') && (
          <div className="mt-5 flex flex-col gap-3">
            <Button fullWidth onClick={() => navigate('/account')}>
              Back to orders
            </Button>
            <Button variant="outline" fullWidth onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

