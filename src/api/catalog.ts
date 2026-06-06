import type {
  CategoryResponse,
  CategoryWithProductsApi,
  JwtLoginResponse,
  OrderApi,
  RazorpayCheckoutApi,
  ProductAdminApi,
  ProductPublicApi,
  PromoCodeRow,
  ReturnRequestRow,
  StockSummaryApi,
} from './types';
import { API_BASE_URL, ApiError, authHeaders, fetchJson } from './client';
import { customerAuthHeaders, isCustomerLoggedIn } from './customerAuth';
import type { Product } from '../data/products';
import { meladen1 } from '../data/meladenImages';
import default2 from '../assets/Default 2.jpg';
import default3 from '../assets/DEFAULT 3.png';
import default4 from '../assets/Default 4.png';

function normalizeImagePath(value: string | null | undefined): string {
  if (!value) return '';
  const decoded = decodeURIComponent(value);
  if (decoded.includes('/src/assets/Default 2.jpg') || /Default\s*2/i.test(decoded)) return default2;
  if (decoded.includes('/src/assets/DEFAULT 3.png') || /DEFAULT\s*3/i.test(decoded)) return default3;
  if (decoded.includes('/src/assets/Default 4.png') || /Default\s*4/i.test(decoded)) return default4;
  return value;
}

/** Resolve API-relative media paths for img src (works with Vite proxy and production API base URL). */
export function resolveProductMediaUrl(value: string | null | undefined): string {
  if (!value?.trim()) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/api/')) {
    return `${API_BASE_URL}${trimmed}`;
  }
  return normalizeImagePath(trimmed);
}

function isStoredGalleryImage(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:')) return trimmed.includes(',') && trimmed.length > 64;
  return true;
}

export function apiProductToProduct(p: ProductPublicApi): Product {
  const normalizedImage = normalizeImagePath(p.image);
  const image = resolveProductMediaUrl(normalizedImage?.trim() ? normalizedImage : p.image) || meladen1;
  const fallbackGallery = [default2, default3, default4];
  const apiGallery = (p.gallery ?? [])
    .map(g => resolveProductMediaUrl(normalizeImagePath(g)))
    .filter(isStoredGalleryImage);
  const gallery = [...apiGallery];
  while (gallery.length < 3) {
    gallery.push(fallbackGallery[gallery.length]);
  }

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    size: p.size || '50ml',
    category: p.category,
    tag: p.tag ?? undefined,
    image,
    gallery: gallery.slice(0, 3),
    description: p.description || p.luxuryDescription || '',
    notes: {
      top: p.notes?.top ?? [],
      heart: p.notes?.heart ?? [],
      base: p.notes?.base ?? [],
    },
    isNew: p.isNew,
    isBestseller: p.isBestseller,
    isPremium: Boolean(p.isPremium),
    price30Ml: p.price30Ml ?? undefined,
    price50Ml: p.price50Ml ?? undefined,
    price100Ml: p.price100Ml ?? undefined,
    inspiredBy: p.inspiredBy?.trim() || undefined,
    luxuryDescription: p.luxuryDescription || undefined,
    mood: p.mood || undefined,
    occasion: p.occasion || undefined,
    season: p.season || undefined,
    idealFor: p.idealFor || undefined,
    moreInformation: p.moreInformation || undefined,
    searchKeywords: p.searchKeywords || undefined,
    category2: p.category2 || undefined,
    productOil: p.productOil ?? undefined,
    concentration: p.concentration || undefined,
  };
}

export async function fetchCategoriesWithProducts(): Promise<CategoryWithProductsApi[]> {
  return fetchJson<CategoryWithProductsApi[]>('/api/public/categories-with-products');
}

export async function fetchPublicProduct(id: string): Promise<ProductPublicApi> {
  return fetchJson<ProductPublicApi>(`/api/public/products/${encodeURIComponent(id)}`);
}

export async function fetchPublicStock(): Promise<StockSummaryApi> {
  return fetchJson<StockSummaryApi>('/api/public/stock');
}

export async function loginAdmin(email: string, password: string): Promise<JwtLoginResponse> {
  const data = await fetchJson<JwtLoginResponse & { accessToken?: string }>('/ladmin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const token = String(data.token ?? data.accessToken ?? '').trim();
  if (!token) {
    throw new ApiError(200, 'Login response did not include a token');
  }
  return {
    ...data,
    token,
    email: typeof data.email === 'string' ? data.email : '',
    expiresInSeconds: Number(data.expiresInSeconds) || 0,
  };
}

export async function adminListCategories(token: string) {
  return fetchJson<CategoryResponse[]>('/api/admin/categories', {
    headers: authHeaders(token),
  });
}

export async function adminCreateCategory(
  token: string,
  body: { name: string; description: string; sortOrder: number },
) {
  return fetchJson('/api/admin/categories', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function adminUpdateCategory(
  token: string,
  id: number,
  body: { name: string; description: string; sortOrder: number },
) {
  return fetchJson(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function adminReorderCategories(
  token: string,
  orderedIds: number[],
): Promise<CategoryResponse[]> {
  return fetchJson<CategoryResponse[]>('/api/admin/categories/reorder', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ orderedIds }),
  });
}

export async function adminDeleteCategory(token: string, id: number) {
  return fetchJson(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function adminListProducts(token: string): Promise<ProductAdminApi[]> {
  return fetchJson<ProductAdminApi[]>('/api/admin/products', {
    headers: authHeaders(token),
  });
}

export async function adminCreateProduct(token: string, body: Record<string, unknown>) {
  return fetchJson<ProductAdminApi>('/api/admin/products', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function adminUpdateProduct(token: string, id: string, body: Record<string, unknown>) {
  return fetchJson<ProductAdminApi>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function adminReplaceProductGalleryImage(
  token: string,
  productId: string,
  slot: 1 | 2 | 3,
  image: File,
): Promise<ProductAdminApi> {
  const form = new FormData();
  form.append('image', image);
  const res = await fetch(`${API_BASE_URL}/api/admin/products/${encodeURIComponent(productId)}/gallery/${slot}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Gallery replace failed');
  }
  return res.json() as Promise<ProductAdminApi>;
}

export async function adminDeleteProduct(token: string, id: string) {
  return fetchJson(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function adminGetStock(token: string): Promise<StockSummaryApi> {
  return fetchJson<StockSummaryApi>('/api/admin/stock', {
    headers: authHeaders(token),
  });
}

export async function adminUpdateStock(token: string, alcoholStockGm: number): Promise<StockSummaryApi> {
  return fetchJson<StockSummaryApi>('/api/admin/stock', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ alcoholStockGm }),
  });
}

export async function adminListOrders(token: string): Promise<OrderApi[]> {
  return fetchJson<OrderApi[]>('/api/admin/orders', {
    headers: authHeaders(token),
  });
}

export async function adminMarkCodPaymentReceived(token: string, orderId: string): Promise<OrderApi> {
  return fetchJson<OrderApi>(`/api/admin/orders/${encodeURIComponent(orderId)}/cod-payment-received`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
}

export async function fetchMyOrders(): Promise<OrderApi[]> {
  return fetchJson<OrderApi[]>('/api/public/orders/me', {
    headers: { ...customerAuthHeaders() },
  });
}

export async function fetchShippingQuote(body: {
  postcode: string;
  orderValue: number;
  itemCount: number;
  cod: boolean;
}): Promise<{
  shippingFee: number;
  codFee: number;
  shiprocketAvailable: boolean;
  source: string;
}> {
  return fetchJson('/api/public/checkout/shipping-quote', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function placePublicOrder(body: Record<string, unknown>): Promise<OrderApi> {
  if (!isCustomerLoggedIn()) {
    throw new ApiError(401, 'Please sign in to complete your order.');
  }
  return fetchJson<OrderApi>('/api/public/orders', {
    method: 'POST',
    headers: { ...customerAuthHeaders() },
    body: JSON.stringify(body),
  });
}

export async function fetchPublicOrder(orderId: string): Promise<OrderApi> {
  return fetchJson<OrderApi>(`/api/public/orders/${orderId}`, {
    headers: { ...customerAuthHeaders() },
  });
}

export async function createRazorpayCheckout(orderId: string): Promise<RazorpayCheckoutApi> {
  return fetchJson(`/api/public/orders/${orderId}/razorpay-checkout`, {
    method: 'POST',
    headers: { ...customerAuthHeaders() },
  });
}

export async function verifyOrderPayment(
  orderId: string,
  body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<OrderApi> {
  return fetchJson<OrderApi>(`/api/public/orders/${orderId}/verify-payment`, {
    method: 'POST',
    headers: { ...customerAuthHeaders() },
    body: JSON.stringify(body),
  });
}

export async function completeWalletOrder(orderId: string): Promise<OrderApi> {
  return fetchJson<OrderApi>(`/api/public/orders/${orderId}/complete-wallet`, {
    method: 'POST',
    headers: { ...customerAuthHeaders() },
  });
}

export async function confirmCodOrder(orderId: string): Promise<OrderApi> {
  return fetchJson<OrderApi>(`/api/public/orders/${orderId}/confirm-cod`, {
    method: 'POST',
    headers: { ...customerAuthHeaders() },
  });
}

export async function adminListPromoCodes(token: string): Promise<PromoCodeRow[]> {
  return fetchJson<PromoCodeRow[]>('/api/admin/promocodes', {
    headers: authHeaders(token),
  });
}

export async function adminCreatePromoCode(
  token: string,
  body: { code: string; percentOff: number; minOrderValue: number; maxDiscount: number },
): Promise<{ success: boolean; id?: number }> {
  return fetchJson('/api/admin/promocodes', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function adminDeletePromoCode(token: string, id: number): Promise<void> {
  await fetchJson(`/api/admin/promocodes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function adminListReturnRequests(token: string): Promise<ReturnRequestRow[]> {
  return fetchJson<ReturnRequestRow[]>('/api/admin/returns', {
    headers: authHeaders(token),
  });
}

export async function fetchAdminReturnVideoBlobUrl(token: string, id: number): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/api/admin/returns/${id}/video`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function adminListWalletCustomers(token: string): Promise<string[]> {
  return fetchJson<string[]>('/api/admin/wallet/customers', {
    headers: authHeaders(token),
  });
}

export async function adminWalletOrdersByEmail(token: string, email: string): Promise<{ id: string; orderNumber: string; totalAmount: number }[]> {
  return fetchJson(`/api/admin/wallet/orders?email=${encodeURIComponent(email)}`, {
    headers: authHeaders(token),
  });
}

export async function adminCreditWallet(token: string, orderId: string, amount: number): Promise<{ success: boolean }> {
  return fetchJson('/api/admin/wallet/credit', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ orderId, amount }),
  });
}
