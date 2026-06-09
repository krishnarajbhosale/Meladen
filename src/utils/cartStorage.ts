import type { CartItem } from '../context/CartContext';

const STORAGE_PREFIX = 'meladen_cart_';

export function cartStorageKey(email: string): string {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as CartItem;
  return (
    !!item.product &&
    typeof item.product.id === 'string' &&
    typeof item.size === 'string' &&
    typeof item.unitPrice === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
}

export function loadPersistedCart(email: string): CartItem[] {
  if (!email.trim()) return [];
  try {
    const raw = localStorage.getItem(cartStorageKey(email));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
}

export function savePersistedCart(email: string, items: CartItem[]): void {
  if (!email.trim()) return;
  try {
    if (items.length === 0) {
      localStorage.removeItem(cartStorageKey(email));
      return;
    }
    localStorage.setItem(cartStorageKey(email), JSON.stringify(items));
  } catch {
    // ignore quota / private mode errors
  }
}

export function clearPersistedCart(email: string): void {
  if (!email.trim()) return;
  localStorage.removeItem(cartStorageKey(email));
}
