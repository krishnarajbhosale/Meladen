import type { OrderApi } from '../api/types';

/** Returns/exchanges only after payment is complete (not while checkout payment is pending). */
export function canReturnOrExchangeOrder(order: OrderApi): boolean {
  if (order.status === 'PAYMENT_PENDING') return false;
  if (order.status === 'COD') return Boolean(order.codPaymentReceived);
  return order.status === 'PAID' || order.status === 'PLACED';
}
