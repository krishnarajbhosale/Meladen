import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ApiError } from '../api/client';
import { placePublicOrder, fetchShippingQuote, fetchMyOrders } from '../api/catalog';
import { getCustomerEmail, isCustomerLoggedIn } from '../api/customerAuth';
import { validatePromoCode } from '../api/promo';
import { getMyWallet } from '../api/wallet';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { INDIA_COUNTRY, INDIAN_STATES, citiesForState } from '../data/indiaLocations';
import Button from '../components/Button';
import CheckoutSummary from '../components/CheckoutSummary';
import Drawer from '../components/Drawer';
import { pageVariants, fadeUp } from '../animations/variants';
import { formatInr } from '../utils/currency';
import { sanitizePhoneDigits } from '../utils/phone';
import { isEnglishOnly, sanitizeEnglishInput } from '../utils/englishInput';
import { newMetaEventId, trackMetaEvent } from '../analytics/metaPixel';

const CITY_NOT_LISTED = 'Other (city not listed)';
const ENGLISH_INPUT_PATTERN = '[\\x20-\\x7E]*';
const PINCODE_PATTERN = '\\d{6}';
const PINCODE_REGEX = /^\d{6}$/;
const ENGLISH_INPUT_TITLE = 'Please enter this in English only.';
const PINCODE_TITLE = 'Please enter a valid 6-digit pincode.';

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
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSource, setShippingSource] = useState<string | null>(null);
  const initiateCheckoutTracked = useRef(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (initiateCheckoutTracked.current || items.length === 0) return;
    initiateCheckoutTracked.current = true;
    trackMetaEvent(
      'InitiateCheckout',
      {
        value: total,
        currency: 'INR',
        content_ids: items.map(item => item.product.id),
        contents: items.map(item => ({
          id: item.product.id,
          quantity: item.quantity,
          item_price: item.unitPrice,
        })),
        content_type: 'product',
        num_items: itemCount,
      },
      newMetaEventId('initiate_checkout'),
    );
  }, [items, itemCount, total]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    apartmentHouseNumber: '',
    address: '',
    nearestLandmark: '',
    city: '',
    state: '',
    postcode: '',
    country: 'India',
  });

  const set = (key: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [key]: v }));
  const setEnglish =
    (key: keyof typeof form) => (v: string) => set(key)(sanitizeEnglishInput(v));
  const setPostcode = (v: string) => set('postcode')(v.replace(/\D/g, '').slice(0, 6));

  // City is a dropdown driven by the chosen state; "Other" falls back to a text input.
  const [cityCustom, setCityCustom] = useState(false);
  const cityOptions = citiesForState(form.state);

  const onStateChange = (v: string) => {
    setForm(f => ({ ...f, state: v, city: '' }));
    setCityCustom(false);
  };

  const onCityChange = (v: string) => {
    if (v === CITY_NOT_LISTED) {
      setCityCustom(true);
      set('city')('');
      return;
    }
    set('city')(v);
  };

  useEffect(() => {
    const em = getCustomerEmail();
    if (em) setForm(f => ({ ...f, email: em }));
  }, []);

  // Prefill the form from the customer's most recent order (name, phone, address…).
  useEffect(() => {
    if (!isCustomerLoggedIn()) return;
    let cancelled = false;
    void fetchMyOrders()
      .then(orders => {
        if (cancelled || orders.length === 0) return;
        const latest = orders[0]; // API returns newest first
        const [firstName = '', ...rest] = (latest.customerName ?? '').trim().split(/\s+/);
        const lastName = rest.join(' ');
        const validState =
          latest.state && INDIAN_STATES.includes(latest.state) ? latest.state : '';
        const prefillCity = (latest.city ?? '').trim();
        const cityInList = validState ? citiesForState(validState).includes(prefillCity) : false;
        setCityCustom(Boolean(prefillCity) && !cityInList);
        // Only fill fields the user hasn't already typed into.
        setForm(f => ({
          ...f,
          firstName: f.firstName || sanitizeEnglishInput(firstName),
          lastName: f.lastName || sanitizeEnglishInput(lastName),
          email: f.email || latest.customerEmail || '',
          phone: f.phone || (latest.customerPhone ?? ''),
          apartmentHouseNumber:
            f.apartmentHouseNumber || sanitizeEnglishInput(latest.apartmentHouseNumber ?? ''),
          address: f.address || sanitizeEnglishInput(latest.address || ''),
          nearestLandmark:
            f.nearestLandmark || sanitizeEnglishInput(latest.nearestLandmark ?? ''),
          city: f.city || sanitizeEnglishInput(prefillCity),
          state: f.state || validState,
          postcode: f.postcode || latest.postcode || '',
          country: f.country || latest.country || 'India',
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isCustomerLoggedIn()) return;
    void getMyWallet()
      .then(w => setWalletBalance(Number(w.balance ?? 0)))
      .catch(() => setWalletBalance(0));
  }, []);

  const promoDiscount = appliedPromo?.discountAmount ?? 0;
  const subtotalAfterPromo = Math.max(0, total - promoDiscount);
  const deliveryTotal = shippingFee;
  const preWalletTotal = subtotalAfterPromo + deliveryTotal;
  const maxWalletUse = Math.min(walletBalance, preWalletTotal);
  const parsedWalletUse =
    walletUseInput.trim() === '' ? 0 : Math.max(0, Number(walletUseInput) || 0);
  const effectiveWallet = Math.min(parsedWalletUse, maxWalletUse);
  const payableTotal = Math.max(0, preWalletTotal - effectiveWallet);

  useEffect(() => {
    const postcode = form.postcode.replace(/\D/g, '');
    if (postcode.length !== 6 || items.length === 0) {
      setShippingFee(0);
      setShippingSource(null);
      return;
    }
    let cancelled = false;
    setShippingLoading(true);
    void fetchShippingQuote({
      postcode,
      orderValue: subtotalAfterPromo,
      itemCount,
      cod: false,
    })
      .then(quote => {
        if (cancelled) return;
        setShippingFee(Number(quote.shippingFee ?? 0));
        setShippingSource(quote.source ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setShippingFee(0);
          setShippingSource(null);
        }
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.postcode, subtotalAfterPromo, itemCount, items.length]);

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

  const summaryProps = {
    items,
    total,
    promoInput,
    onPromoInputChange: setPromoInput,
    onApplyPromo: () => void applyPromo(),
    promoLoading,
    promoError,
    appliedPromo,
    walletBalance,
    walletUseInput,
    onWalletUseChange: setWalletUseInput,
    maxWalletUse,
    preWalletTotal,
    promoDiscount,
    effectiveWallet,
    shippingFee,
    shippingLoading,
    shippingSource,
    postcode: form.postcode,
    payableTotal,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }
    if (!PINCODE_REGEX.test(form.postcode.trim())) {
      setSubmitError(PINCODE_TITLE);
      return;
    }
    const shippingTextFields = [
      form.firstName,
      form.lastName,
      form.apartmentHouseNumber,
      form.address,
      form.nearestLandmark,
      form.city,
      form.state,
      form.country,
    ];
    if (shippingTextFields.some(value => !isEnglishOnly(value))) {
      setSubmitError('Please enter all shipping details in English only.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const cartSnapshot = [...items];
      const order = await placePublicOrder({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || null,
        apartmentHouseNumber: form.apartmentHouseNumber.trim() || null,
        address: form.address,
        nearestLandmark: form.nearestLandmark.trim() || null,
        city: form.city,
        state: form.state.trim() || null,
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
      navigate(`/order-pending/${order.id}`, { state: { cartItems: cartSnapshot } });
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
          type="button"
          onClick={() => setSummaryOpen(true)}
          className="text-[11px] tracking-wide text-brand-gray underline underline-offset-4 lg:hidden"
        >
          {formatInr(payableTotal)}
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
                <InputField
                  label="First Name"
                  value={form.firstName}
                  onChange={setEnglish('firstName')}
                  pattern={ENGLISH_INPUT_PATTERN}
                  title={ENGLISH_INPUT_TITLE}
                  required
                />
                <InputField
                  label="Last Name"
                  value={form.lastName}
                  onChange={setEnglish('lastName')}
                  pattern={ENGLISH_INPUT_PATTERN}
                  title={ENGLISH_INPUT_TITLE}
                  required
                />
              </div>
              <InputField label="Email" type="email" value={form.email} onChange={set('email')} required />
              <InputField
                label="Phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={v => set('phone')(sanitizePhoneDigits(v))}
              />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:p-6"
          >
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Shipping Address</p>
            <p className="mb-4 text-[11px] text-brand-gray/80">
              Enter all address details in English only (Latin letters, numbers, and punctuation).
            </p>
            <div className="space-y-3">
              <InputField
                label="Apartment / House Number"
                value={form.apartmentHouseNumber}
                onChange={setEnglish('apartmentHouseNumber')}
                pattern={ENGLISH_INPUT_PATTERN}
                title={ENGLISH_INPUT_TITLE}
              />
              <InputField
                label="Street Address"
                value={form.address}
                onChange={setEnglish('address')}
                pattern={ENGLISH_INPUT_PATTERN}
                title={ENGLISH_INPUT_TITLE}
                required
              />
              <InputField
                label="Nearest Landmark"
                value={form.nearestLandmark}
                onChange={setEnglish('nearestLandmark')}
                pattern={ENGLISH_INPUT_PATTERN}
                title={ENGLISH_INPUT_TITLE}
              />
              <SelectField
                label="State"
                value={form.state}
                onChange={onStateChange}
                options={INDIAN_STATES}
                placeholder="Select state"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                {cityCustom ? (
                  <div>
                    <InputField
                      label="City"
                      value={form.city}
                      onChange={setEnglish('city')}
                      pattern={ENGLISH_INPUT_PATTERN}
                      title={ENGLISH_INPUT_TITLE}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCityCustom(false);
                        set('city')('');
                      }}
                      className="mt-1 text-[10px] tracking-wide text-[#c9a84c] underline underline-offset-2"
                    >
                      Choose from list
                    </button>
                  </div>
                ) : (
                  <SelectField
                    label="City"
                    value={form.city}
                    onChange={onCityChange}
                    options={[...cityOptions, CITY_NOT_LISTED]}
                    placeholder="Select city"
                    disabled={!form.state}
                    required
                  />
                )}
                <InputField
                  label="Pincode"
                  value={form.postcode}
                  onChange={setPostcode}
                  inputMode="numeric"
                  maxLength={6}
                  pattern={PINCODE_PATTERN}
                  title={PINCODE_TITLE}
                  required
                />
              </div>
              <SelectField
                label="Country"
                value={form.country}
                onChange={set('country')}
                options={[INDIA_COUNTRY]}
                required
              />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="rounded-[2rem] border border-[#2a2a2a] bg-[linear-gradient(180deg,#161616,#101010)] p-5 lg:hidden lg:p-6"
          >
            <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Order &amp; payment</p>
            <CheckoutSummary {...summaryProps} />
          </motion.div>

          <div className="lg:hidden">
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Placing Order...' : `Place Order · ${formatInr(payableTotal)}`}
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
            <CheckoutSummary {...summaryProps} />
            <Button type="submit" fullWidth disabled={submitting} className="mt-6">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
            {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
          </div>
        </motion.aside>
      </form>

      <Drawer open={summaryOpen} onClose={() => setSummaryOpen(false)} title="Order Summary">
        <CheckoutSummary {...summaryProps} />
      </Drawer>
    </motion.div>
  );
}
