import type { CartItem } from '../context/CartContext';
import { formatProductSizeLine } from '../data/products';
import { formatInr, formatInrDiscount } from '../utils/currency';

type AppliedPromo = { code: string; discountAmount: number } | null;

type Props = {
  items: CartItem[];
  total: number;
  promoInput: string;
  onPromoInputChange: (value: string) => void;
  onApplyPromo: () => void;
  promoLoading: boolean;
  promoError: string | null;
  appliedPromo: AppliedPromo;
  walletBalance: number;
  walletUseInput: string;
  onWalletUseChange: (value: string) => void;
  maxWalletUse: number;
  preWalletTotal: number;
  promoDiscount: number;
  effectiveWallet: number;
  shippingFee: number;
  shippingLoading: boolean;
  shippingSource: string | null;
  postcode: string;
  payableTotal: number;
  showLineItems?: boolean;
};

export default function CheckoutSummary({
  items,
  total,
  promoInput,
  onPromoInputChange,
  onApplyPromo,
  promoLoading,
  promoError,
  appliedPromo,
  walletBalance,
  walletUseInput,
  onWalletUseChange,
  maxWalletUse,
  preWalletTotal,
  promoDiscount,
  effectiveWallet,
  shippingFee,
  shippingLoading,
  shippingSource,
  postcode,
  payableTotal,
  showLineItems = true,
}: Props) {
  const postcodeDigits = postcode.replace(/\D/g, '');
  const shippingLabel =
    shippingLoading ? '…' : postcodeDigits.length === 6 ? formatInr(shippingFee) : 'Enter postcode';

  return (
    <div className="space-y-4">
      {showLineItems && items.length > 0 && (
        <div className="space-y-3">
          {items.map(item => (
            <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
              <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-brand-light-gray">
                <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-sm text-brand-dark">{item.product.name}</p>
                <p className="text-xs text-brand-gray">
                  {formatProductSizeLine(item.size)} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm text-brand-dark">{formatInr(item.unitPrice * item.quantity, 0)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Promo code</p>
        <div className="flex gap-2">
          <input
            value={promoInput}
            onChange={e => onPromoInputChange(e.target.value)}
            placeholder="Enter coupon code"
            className="min-w-0 flex-1 rounded-xl border border-[#333] bg-[#0c0c0c] px-3 py-2.5 text-sm text-brand-dark outline-none focus:border-[#c9a84c]/40"
          />
          <button
            type="button"
            onClick={onApplyPromo}
            disabled={promoLoading || !promoInput.trim()}
            className="rounded-xl border border-[#c9a84c]/35 bg-[#c9a84c]/10 px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#e8e4dc] disabled:opacity-40"
          >
            {promoLoading ? '…' : 'Apply'}
          </button>
        </div>
        {promoError && <p className="text-xs text-red-400">{promoError}</p>}
        {appliedPromo && (
          <p className="text-xs text-emerald-400/90">
            {appliedPromo.code} applied · {formatInrDiscount(appliedPromo.discountAmount, 0)} off
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Store wallet</p>
        <div className="flex justify-between text-sm text-[#e8e4dc]">
          <span>Available balance</span>
          <span className="font-medium text-gold">{formatInr(walletBalance)}</span>
        </div>
        {walletBalance > 0 && preWalletTotal > 0 && (
          <>
            <label htmlFor="checkout-wallet-use" className="sr-only">
              Use from wallet (₹)
            </label>
            <input
              id="checkout-wallet-use"
              type="number"
              min={0}
              step={0.01}
              placeholder="Amount to apply from wallet"
              value={walletUseInput}
              onChange={e => onWalletUseChange(e.target.value)}
              className="w-full rounded-xl border border-[#333] bg-[#0c0c0c] px-3 py-2.5 text-sm text-brand-dark outline-none focus:border-[#c9a84c]/40"
            />
            <p className="text-[10px] text-[#8a8580]">
              Up to {formatInr(maxWalletUse)} can be applied to this order.
            </p>
          </>
        )}
      </div>

      <div className="space-y-3 border-t border-[#252525] pt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gray">Bill summary</p>
        <div className="flex justify-between text-sm text-brand-gray">
          <span>Subtotal</span>
          <span>{formatInr(total, 0)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between text-sm text-emerald-400/85">
            <span>Coupon discount</span>
            <span>{formatInrDiscount(promoDiscount, 0)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-brand-gray">
          <span>Shipping{shippingSource === 'SHIPROCKET' ? ' (Shiprocket)' : ''}</span>
          <span>{shippingLabel}</span>
        </div>
        {effectiveWallet > 0 && (
          <div className="flex justify-between text-sm text-emerald-400/85">
            <span>Wallet applied</span>
            <span>{formatInrDiscount(effectiveWallet)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-[#262626] pt-3 font-serif text-lg text-brand-dark">
          <span>{payableTotal <= 0 ? 'Amount due' : 'Total'}</span>
          <span className="text-gold">{formatInr(payableTotal)}</span>
        </div>
      </div>
    </div>
  );
}
