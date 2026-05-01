import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchMyOrders } from '../api/catalog';
import type { OrderApi } from '../api/types';
import { getMyWallet, type WalletTransactionRow } from '../api/wallet';
import { ApiError } from '../api/client';
import { customerLogout, getCustomerEmail, isCustomerLoggedIn } from '../api/customerAuth';
import { pageVariants, fadeUp } from '../animations/variants';

export default function AccountOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletTx, setWalletTx] = useState<WalletTransactionRow[]>([]);
  const [walletErr, setWalletErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isCustomerLoggedIn()) {
      setLoading(false);
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    const [orderRes, walletRes] = await Promise.allSettled([fetchMyOrders(), getMyWallet()]);

    if (orderRes.status === 'fulfilled') {
      const data = orderRes.value;
      setOrders(Array.isArray(data) ? data : []);
    } else {
      const e = orderRes.reason;
      if (e instanceof ApiError && e.status === 401) {
        customerLogout();
        setError('Your session expired. Please sign in again.');
        setOrders([]);
      } else {
        setError(e instanceof Error ? e.message : 'Could not load orders');
        setOrders([]);
      }
    }

    if (walletRes.status === 'fulfilled') {
      const wallet = walletRes.value;
      setWalletBalance(Number(wallet.balance ?? 0));
      setWalletTx(Array.isArray(wallet.transactions) ? wallet.transactions.slice(0, 15) : []);
      setWalletErr(null);
    } else {
      const w = walletRes.reason;
      setWalletBalance(null);
      setWalletTx([]);
      setWalletErr(w instanceof Error ? w.message : 'Could not load wallet');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isCustomerLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: '/account' }} />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[70vh] px-5 pb-32 pt-6 lg:mx-auto lg:max-w-3xl lg:px-0"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-brand-gray transition-colors hover:text-brand-dark"
        >
          ← Back
        </button>
        <h1 className="font-serif text-xl font-medium text-brand-dark">My orders</h1>
        <Link
          to="/login"
          className="text-[10px] uppercase tracking-widest text-brand-gray underline underline-offset-4"
        >
          Account
        </Link>
      </div>

      <p className="mb-6 text-xs text-brand-gray">
        Signed in as <span className="text-brand-dark">{getCustomerEmail()}</span>
      </p>

      {!loading && (
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="mb-8 rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:p-6"
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Store wallet</p>
          {walletErr ? (
            <p className="text-sm text-amber-400/90">{walletErr}</p>
          ) : walletBalance != null ? (
            <>
              <p className="font-serif text-2xl font-medium text-gold">${walletBalance.toFixed(2)}</p>
              <p className="mt-1 text-xs text-brand-gray">Use your balance at checkout.</p>
              {walletTx.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-[#2a2a2a] pt-4 text-xs text-brand-gray">
                  {walletTx.map(t => (
                    <li key={t.id} className="flex justify-between gap-3">
                      <span className="font-mono text-[10px] text-brand-dark/80">{t.orderId.slice(0, 8)}…</span>
                      <span className={t.amount >= 0 ? 'text-emerald-400/90' : 'text-brand-dark'}>
                        {t.amount >= 0 ? '+' : ''}
                        ${Number(t.amount).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#8a8580]">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-brand-gray">Loading wallet…</p>
          )}
        </motion.div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200/90">
          {error}{' '}
          <Link to="/login" className="font-medium underline">
            Sign in
          </Link>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-brand-gray">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-8 text-center"
        >
          <p className="text-sm text-brand-gray">You have no orders yet.</p>
          <Link
            to="/collection"
            className="mt-4 inline-block text-xs uppercase tracking-widest text-brand-cream underline underline-offset-4"
          >
            Shop collection
          </Link>
        </motion.div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order, idx) => (
            <motion.li
              key={order.id}
              variants={fadeUp}
              custom={idx}
              initial="hidden"
              animate="visible"
              className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2a2a2a] pb-4">
                <div>
                  <p className="font-serif text-base font-medium text-brand-dark">{order.orderNumber}</p>
                  <p className="text-[11px] text-brand-gray">
                    {new Date(order.createdAt).toLocaleString()} · {order.status}
                  </p>
                  {order.promoCode && (order.discountAmount ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-400/90">
                        Coupon
                      </span>
                      <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/45 bg-emerald-950/50 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <span className="font-mono text-xs font-medium text-emerald-100">{order.promoCode}</span>
                        <span className="text-[11px] font-medium text-emerald-300">
                          −${Number(order.discountAmount).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  {(order.walletDiscount ?? 0) > 0 && (
                    <p className="mt-2 text-[11px] text-amber-200/90">
                      Wallet applied: −${Number(order.walletDiscount).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-brand-dark">${Number(order.total).toFixed(0)}</p>
                  <p className="text-[10px] text-brand-gray">
                    {order.items.length} line{order.items.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-brand-gray">
                {order.items.map(item => (
                  <li key={`${order.id}-${item.productId}-${item.size}`} className="flex justify-between gap-2">
                    <span className="text-brand-dark/90">
                      {item.productName} · {item.size} × {item.quantity}
                    </span>
                    <span>${Number(item.lineTotal).toFixed(0)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#2a2a2a] pt-5">
                <Link
                  to={`/returns?orderId=${encodeURIComponent(order.id)}`}
                  className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-full bg-gold px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-black shadow-[0_4px_14px_rgba(201,168,76,0.35)] transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Return or exchange
                </Link>
                <Link
                  to="/collection"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-[#b8b3ac]/50 bg-transparent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#e8e4dc] transition-colors hover:border-gold hover:text-gold"
                >
                  Shop again
                </Link>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
