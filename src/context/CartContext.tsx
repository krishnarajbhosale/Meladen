import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getMaxProductQuantity,
  getProductSizeRecipe,
  type Product,
} from '../data/products';
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
import { newMetaEventId, trackMetaEvent } from '../analytics/metaPixel';

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

function maxQuantityForLine(
  items: CartItem[],
  product: Product,
  size: string,
): number {
  const recipe = getProductSizeRecipe(size);
  if (!recipe || recipe.oil <= 0) return Number.MAX_SAFE_INTEGER;

  const stock = Math.max(0, Number(product.productOil ?? 0));
  const usedByOtherSizes = items.reduce((used, item) => {
    if (item.product.id !== product.id || item.size === size) return used;
    const otherRecipe = getProductSizeRecipe(item.size);
    return used + (otherRecipe?.oil ?? 0) * item.quantity;
  }, 0);
  const remaining = Math.max(0, stock - usedByOtherSizes);
  const stockAdjustedProduct = { ...product, productOil: remaining };
  return getMaxProductQuantity(stockAdjustedProduct, size);
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
    const existing = items.find(i => i.product.id === product.id && i.size === size);
    const maxQty = maxQuantityForLine(items, product, size);
    const currentQty = existing?.quantity ?? 0;
    const nextQty = Math.min(currentQty + qty, maxQty);
    const addedQty = Math.max(0, nextQty - currentQty);
    const limitedByStock = addedQty < qty;

    setItems(prev => {
      if (addedQty <= 0) return prev;
      if (existing)
        return prev.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, product, unitPrice, quantity: nextQty }
            : i,
        );
      return [...prev, { product, size, unitPrice, quantity: addedQty }];
    });
    const label = product.name.length > 36 ? `${product.name.slice(0, 33)}…` : product.name;
    if (limitedByStock) {
      showToast(
        addedQty > 0
          ? `Only ${addedQty} more available. Added to cart.`
          : 'No more quantity available.',
      );
    } else {
      showToast(
        qty > 1 ? `Added ${qty} × ${label} to cart` : `Added ${label} to cart`,
      );
    }
    if (addedQty > 0) {
      trackMetaEvent(
        'AddToCart',
        {
          value: unitPrice * addedQty,
          currency: 'INR',
          content_ids: [product.id],
          contents: [{ id: product.id, quantity: addedQty, item_price: unitPrice }],
          content_type: 'product',
        },
        newMetaEventId('add_to_cart'),
      );
    }
  };

  const removeFromCart = (id: string, size: string) =>
    setItems(prev => prev.filter(i => !(i.product.id === id && i.size === size)));

  const updateQty = (id: string, size: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id, size);
    const target = items.find(i => i.product.id === id && i.size === size);
    if (!target) return;
    const maxQty = maxQuantityForLine(items, target.product, size);
    if (qty > maxQty) {
      showToast('No more quantity available.');
      return;
    }
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
