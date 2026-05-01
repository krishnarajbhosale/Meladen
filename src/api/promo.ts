const API_BASE = '/api/promocodes';

export interface PromoValidateResult {
  valid: boolean;
  message?: string;
  code?: string;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  percentOff?: number;
  baseCartValue?: number;
}

export async function validatePromoCode(code: string, baseCartValue: number): Promise<PromoValidateResult> {
  const qs = new URLSearchParams({
    code: String(code || ''),
    baseCartValue: String(baseCartValue ?? 0),
  });
  const res = await fetch(`${API_BASE}/validate?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to validate promo code');
  return res.json() as Promise<PromoValidateResult>;
}
