import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';
import {
  CUSTOMER_AUTH_CHANGED_EVENT,
  getCustomerEmail,
  isCustomerLoggedIn,
} from '../api/customerAuth';
import {
  clearPersistedCart,
  loadPersistedCart,
  savePersistedCart,
} from '../utils/cartStorage';
import { useToast } from './ToastContext';

export interface CartItem {
  product: Product;
  size: string;
  unitPrice: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, unitPrice?: number, quantity?: number) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

function readLoggedInCart(): CartItem[] {
  if (!isCustomerLoggedIn()) return [];
  const email = getCustomerEmail();
  return email ? loadPersistedCart(email) : [];
}

/** Combine two carts, summing quantities for the same product + size. */
function mergeCarts(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const merged = base.map(item => ({ ...item }));
  for (const item of incoming) {
    const existing = merged.find(
      i => i.product.id === item.product.id && i.size === item.size,
    );
    if (existing) existing.quantity += item.quantity;
    else merged.push({ ...item });
  }
  return merged;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readLoggedInCart());
  const { showToast } = useToast();

  useEffect(() => {
    const onAuthChanged = () => {
      if (isCustomerLoggedIn()) {
        const email = getCustomerEmail();
        // Merge the guest cart (in-memory) into the account's saved cart so
        // items added before signing in are not lost.
        setItems(prev => (email ? mergeCarts(loadPersistedCart(email), prev) : prev));
        return;
      }
      setItems([]);
    };

    window.addEventListener(CUSTOMER_AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(CUSTOMER_AUTH_CHANGED_EVENT, onAuthChanged);
  }, []);

  useEffect(() => {
    if (!isCustomerLoggedIn()) return;
    const email = getCustomerEmail();
    if (!email) return;
    savePersistedCart(email, items);
  }, [items]);

  const addToCart = (
    product: Product,
    size = product.size,
    unitPrice = product.price,
    quantity = 1,
  ) => {
    const qty = Math.max(1, quantity);
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size);
      if (existing)
        return prev.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      return [...prev, { product, size, unitPrice, quantity: qty }];
    });
    const label = product.name.length > 36 ? `${product.name.slice(0, 33)}…` : product.name;
    showToast(
      qty > 1 ? `Added ${qty} × ${label} to cart` : `Added ${label} to cart`,
    );
  };

  const removeFromCart = (id: string, size: string) =>
    setItems(prev => prev.filter(i => !(i.product.id === id && i.size === size)));

  const updateQty = (id: string, size: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id, size);
    setItems(prev =>
      prev.map(i =>
        i.product.id === id && i.size === size ? { ...i, quantity: qty } : i,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    if (isCustomerLoggedIn()) {
      const email = getCustomerEmail();
      if (email) clearPersistedCart(email);
    }
  };

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
