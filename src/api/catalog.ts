import type {
  CategoryResponse,
  CategoryWithProductsApi,
  JwtLoginResponse,
  OrderApi,
  ProductAdminApi,
  ProductPublicApi,
  StockSummaryApi,
} from './types';
import { authHeaders, fetchJson } from './client';
import type { Product } from '../data/products';
import { meladen1 } from '../data/meladenImages';
import default2 from '../assets/Default 2.jpg';
import default3 from '../assets/DEFAULT 3.png';
import default4 from '../assets/Default 4.png';

function normalizeImagePath(value: string | null | undefined): string {
  if (!value) return '';
  const decoded = decodeURIComponent(value);
  if (decoded.includes('/src/assets/Default 2.jpg')) return default2;
  if (decoded.includes('/src/assets/DEFAULT 3.png')) return default3;
  if (decoded.includes('/src/assets/Default 4.png')) return default4;
  return value;
}

export function apiProductToProduct(p: ProductPublicApi): Product {
  const normalizedImage = normalizeImagePath(p.image);
  const image = normalizedImage?.trim() ? normalizedImage : meladen1;
  const fallbackGallery = [default2, default3, default4];
  const apiGallery = (p.gallery ?? []).map(g => normalizeImagePath(g)).filter(Boolean);
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
    price30Ml: p.price30Ml ?? undefined,
    price50Ml: p.price50Ml ?? undefined,
    price100Ml: p.price100Ml ?? undefined,
    inspiredBy: p.inspiredBy || undefined,
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
  return fetchJson<JwtLoginResponse>('/ladmin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
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

export async function placePublicOrder(body: Record<string, unknown>): Promise<OrderApi> {
  return fetchJson<OrderApi>('/api/public/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
