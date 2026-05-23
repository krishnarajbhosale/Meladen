import { useCallback, useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from 'react';
import {
  adminGetStock,
  adminListOrders,
  adminCreatePromoCode,
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminReorderCategories,
  adminDeleteProduct,
  adminDeletePromoCode,
  adminListCategories,
  adminListProducts,
  adminListPromoCodes,
  adminListReturnRequests,
  adminListWalletCustomers,
  adminWalletOrdersByEmail,
  adminCreditWallet,
  adminUpdateStock,
  adminUpdateCategory,
  adminUpdateProduct,
  fetchAdminReturnVideoBlobUrl,
  loginAdmin,
} from '../api/catalog';
import type {
  CategoryResponse,
  OrderApi,
  ProductAdminApi,
  PromoCodeRow,
  ReturnRequestRow,
  StockSummaryApi,
} from '../api/types';
import default2 from '../assets/Default 2.jpg';
import default3 from '../assets/DEFAULT 3.png';
import default4 from '../assets/Default 4.png';
import { formatInr, formatInrDiscount } from '../utils/currency';

const TOKEN_KEY = 'meladen_admin_jwt';
const PRODUCT_MEDIA_DEFAULTS_KEY = 'meladen_product_media_defaults';
const ORDERS_SEEN_AT_KEY = 'meladen_admin_orders_seen_at';
const ORDERS_POLL_MS = 30_000;

function getOrdersSeenAtMs(): number | null {
  const raw = localStorage.getItem(ORDERS_SEEN_AT_KEY);
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : null;
}

function setOrdersSeenWatermark(orders: OrderApi[]) {
  const max = orders.reduce((m, o) => {
    const t = Date.parse(o.createdAt);
    return Number.isFinite(t) ? Math.max(m, t) : m;
  }, 0);
  localStorage.setItem(ORDERS_SEEN_AT_KEY, new Date(max || Date.now()).toISOString());
}

function collectUnseenOrderIds(orders: OrderApi[], seenAtMs: number | null): Set<string> {
  if (seenAtMs === null) return new Set();
  const unseen = new Set<string>();
  for (const o of orders) {
    const t = Date.parse(o.createdAt);
    if (Number.isFinite(t) && t > seenAtMs) unseen.add(o.id);
  }
  return unseen;
}
const PRODUCT_TABS = ['Basics', 'Pricing & Notes', 'Media & Flags'] as const;
const ADMIN_TABS = ['Categories', 'Products', 'Stock', 'Orders', 'Promo codes', 'Returns', 'Wallet'] as const;
type ProductTab = (typeof PRODUCT_TABS)[number];
type AdminTab = (typeof ADMIN_TABS)[number];

type ProductFormState = {
  categoryId: number;
  meladenFragrance: string;
  inspiredBy: string;
  luxuryDescription: string;
  mood: string;
  occasion: string;
  season: string;
  idealFor: string;
  price30Ml: string;
  price50Ml: string;
  price100Ml: string;
  notesTop: string;
  notesMiddle: string;
  notesBase: string;
  moreInformation: string;
  searchKeywords: string;
  category2: string;
  productOil: string;
  concentration: string;
  imageBase64: string;
  imageContentType: string;
  clearImage: boolean;
  galleryImage1: string;
  galleryImage2: string;
  galleryImage3: string;
  tag: string;
  isNew: boolean;
  isBestseller: boolean;
};

type ProductMediaDefaults = Pick<ProductFormState, 'galleryImage1' | 'galleryImage2' | 'galleryImage3'>;

function reorderList<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return list;
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function emptyProductForm(defaultCategoryId: number, defaults?: ProductMediaDefaults): ProductFormState {
  return {
    categoryId: defaultCategoryId,
    meladenFragrance: '',
    inspiredBy: '',
    luxuryDescription: '',
    mood: '',
    occasion: '',
    season: '',
    idealFor: '',
    price30Ml: '',
    price50Ml: '',
    price100Ml: '',
    notesTop: '',
    notesMiddle: '',
    notesBase: '',
    moreInformation: '',
    searchKeywords: '',
    category2: '',
    productOil: '',
    concentration: '',
    imageBase64: '',
    imageContentType: '',
    clearImage: false,
    galleryImage1: defaults?.galleryImage1 ?? default2,
    galleryImage2: defaults?.galleryImage2 ?? default3,
    galleryImage3: defaults?.galleryImage3 ?? default4,
    tag: '',
    isNew: false,
    isBestseller: false,
  };
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [adminLoadError, setAdminLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductAdminApi[]>([]);
  const [stock, setStock] = useState<StockSummaryApi | null>(null);
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [unseenOrderIds, setUnseenOrderIds] = useState<Set<string>>(() => new Set());
  const [promoRows, setPromoRows] = useState<PromoCodeRow[]>([]);
  const [returnRows, setReturnRows] = useState<ReturnRequestRow[]>([]);
  const [alcoholStockInput, setAlcoholStockInput] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('Categories');
  const activeAdminTabRef = useRef<AdminTab>('Categories');
  activeAdminTabRef.current = activeAdminTab;

  const [promoForm, setPromoForm] = useState({
    code: '',
    percentOff: '',
    minOrderValue: '',
    maxDiscount: '',
  });
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestRow | null>(null);
  const [returnVideoUrl, setReturnVideoUrl] = useState<string | null>(null);

  const [walletCustomerEmails, setWalletCustomerEmails] = useState<string[]>([]);
  const [walletEmailInput, setWalletEmailInput] = useState('');
  const [walletOrdersForEmail, setWalletOrdersForEmail] = useState<
    { id: string; orderNumber: string; totalAmount: number }[]
  >([]);
  const [walletSelectedOrderId, setWalletSelectedOrderId] = useState('');
  const [walletCreditAmount, setWalletCreditAmount] = useState('');
  const [walletTabMessage, setWalletTabMessage] = useState<string | null>(null);
  const [walletTabBusy, setWalletTabBusy] = useState(false);

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState(0);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [categoryDragIndex, setCategoryDragIndex] = useState<number | null>(null);
  const [categoryDropIndex, setCategoryDropIndex] = useState<number | null>(null);
  const [categoryOrderBusy, setCategoryOrderBusy] = useState(false);

  const [productForm, setProductForm] = useState<ProductFormState>(() => emptyProductForm(0));
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeProductTab, setActiveProductTab] = useState<ProductTab>('Basics');
  const [mediaDefaults, setMediaDefaults] = useState<ProductMediaDefaults>(() => {
    try {
      const raw = localStorage.getItem(PRODUCT_MEDIA_DEFAULTS_KEY);
      return raw
        ? (JSON.parse(raw) as ProductMediaDefaults)
        : { galleryImage1: default2, galleryImage2: default3, galleryImage3: default4 };
    } catch {
      return { galleryImage1: default2, galleryImage2: default3, galleryImage3: default4 };
    }
  });
  const [selectedImageName, setSelectedImageName] = useState('');

  const readStatus = (err: unknown): number | null => {
    if (typeof err === 'object' && err !== null && 'status' in err) {
      const s = Number((err as { status?: number }).status);
      return Number.isFinite(s) ? s : null;
    }
    return null;
  };

  const readMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return 'Unknown error';
  };

  const syncOrdersNotification = useCallback((list: OrderApi[], tab: AdminTab) => {
    if (tab === 'Orders') {
      setOrdersSeenWatermark(list);
      setUnseenOrderIds(new Set());
      return;
    }
    let seenAt = getOrdersSeenAtMs();
    if (seenAt === null) {
      setOrdersSeenWatermark(list);
      seenAt = getOrdersSeenAtMs();
    }
    setUnseenOrderIds(collectUnseenOrderIds(list, seenAt));
  }, []);

  const applyOrdersFromServer = useCallback(
    (list: OrderApi[]) => {
      setOrders(list);
      syncOrdersNotification(list, activeAdminTabRef.current);
    },
    [syncOrdersNotification],
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    const tokenAtStart = token;
    const [catRes, prodRes, stockRes, orderRes] = await Promise.allSettled([
      adminListCategories(token),
      adminListProducts(token),
      adminGetStock(token),
      adminListOrders(token),
    ]);

    // Ignore results from an older token (e.g. invalid JWT in storage + fresh login).
    if (tokenRef.current !== tokenAtStart) {
      return;
    }

    const catStatus = catRes.status === 'rejected' ? readStatus(catRes.reason) : null;
    const prodStatus = prodRes.status === 'rejected' ? readStatus(prodRes.reason) : null;

    const stockStatus = stockRes.status === 'rejected' ? readStatus(stockRes.reason) : null;
    const orderStatus = orderRes.status === 'rejected' ? readStatus(orderRes.reason) : null;
    const catUnauthorized = catStatus === 401;
    const prodUnauthorized = prodStatus === 401;
    const stockUnauthorized = stockStatus === 401;
    const orderUnauthorized = orderStatus === 401;

    // Only force logout when auth is truly invalid/expired.
    if (catUnauthorized || prodUnauthorized || stockUnauthorized || orderUnauthorized) {
      setSessionError('Session expired. Please sign in again.');
      setAdminLoadError(null);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      return;
    }

    if (catRes.status === 'fulfilled') {
      setCategories(catRes.value);
      setProductForm(f => ({
        ...f,
        categoryId: f.categoryId || catRes.value[0]?.id || 0,
      }));
    }
    if (prodRes.status === 'fulfilled') {
      setProducts(prodRes.value);
    }
    if (stockRes.status === 'fulfilled') {
      setStock(stockRes.value);
      setAlcoholStockInput(String(stockRes.value.alcoholStockGm ?? ''));
    }
    if (orderRes.status === 'fulfilled') {
      applyOrdersFromServer(orderRes.value);
    }

    setSessionError(null);

    if (
      catRes.status === 'rejected' ||
      prodRes.status === 'rejected' ||
      stockRes.status === 'rejected' ||
      orderRes.status === 'rejected'
    ) {
      const catMsg = catRes.status === 'rejected' ? readMessage(catRes.reason) : '';
      const prodMsg = prodRes.status === 'rejected' ? readMessage(prodRes.reason) : '';
      const stockMsg = stockRes.status === 'rejected' ? readMessage(stockRes.reason) : '';
      const orderMsg = orderRes.status === 'rejected' ? readMessage(orderRes.reason) : '';
      setAdminLoadError(
        `Some admin data could not be loaded. Categories: ${catMsg || 'ok'} | Products: ${prodMsg || 'ok'} | Stock: ${stockMsg || 'ok'} | Orders: ${orderMsg || 'ok'}`,
      );
    } else {
      setAdminLoadError(null);
    }
  }, [token, applyOrdersFromServer]);

  useEffect(() => {
    if (!token) return;
    refresh().catch(() => {
      // Non-auth errors are surfaced through action handlers.
    });
  }, [token, refresh]);

  useEffect(() => {
    if (!token) return;
    const pollOrders = async () => {
      try {
        const list = await adminListOrders(token);
        if (tokenRef.current !== token) return;
        applyOrdersFromServer(list);
      } catch {
        // Ignore background poll errors; full refresh surfaces failures.
      }
    };
    const id = window.setInterval(pollOrders, ORDERS_POLL_MS);
    return () => window.clearInterval(id);
  }, [token, applyOrdersFromServer]);

  useEffect(() => {
    if (activeAdminTab === 'Orders' && orders.length >= 0) {
      syncOrdersNotification(orders, 'Orders');
    }
  }, [activeAdminTab, orders, syncOrdersNotification]);

  const hasNewOrders = unseenOrderIds.size > 0;

  useEffect(() => {
    if (!token || activeAdminTab !== 'Promo codes') return;
    let cancelled = false;
    adminListPromoCodes(token)
      .then(rows => {
        if (!cancelled) setPromoRows(rows);
      })
      .catch(() => {
        if (!cancelled) setPromoRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, activeAdminTab]);

  useEffect(() => {
    if (!token || activeAdminTab !== 'Returns') return;
    let cancelled = false;
    adminListReturnRequests(token)
      .then(rows => {
        if (!cancelled) setReturnRows(rows);
      })
      .catch(() => {
        if (!cancelled) setReturnRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, activeAdminTab]);

  useEffect(() => {
    if (!token || activeAdminTab !== 'Wallet') return;
    let cancelled = false;
    adminListWalletCustomers(token)
      .then(emails => {
        if (!cancelled) setWalletCustomerEmails(emails);
      })
      .catch(() => {
        if (!cancelled) setWalletCustomerEmails([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, activeAdminTab]);

  useEffect(() => {
    setReturnVideoUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!selectedReturn || !selectedReturn.hasVideo || !token) {
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    void (async () => {
      const url = await fetchAdminReturnVideoBlobUrl(token, selectedReturn.id);
      if (cancelled || !url) return;
      objectUrl = url;
      setReturnVideoUrl(url);
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedReturn, token]);

  useEffect(() => {
    if (editingProductId) return;
    setProductForm(prev => ({
      ...prev,
      galleryImage1: prev.galleryImage1 || mediaDefaults.galleryImage1,
      galleryImage2: prev.galleryImage2 || mediaDefaults.galleryImage2,
      galleryImage3: prev.galleryImage3 || mediaDefaults.galleryImage3,
    }));
  }, [mediaDefaults, editingProductId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSessionError(null);
    setAdminLoadError(null);
    setBusy(true);
    try {
      const res = await loginAdmin(email, password);
      const jwt = typeof res.token === 'string' ? res.token.trim() : '';
      if (!jwt) {
        setLoginError('Login succeeded but no token was returned. Check API response shape.');
        return;
      }
      localStorage.setItem(TOKEN_KEY, jwt);
      setToken(jwt);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const savePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPromoMessage(null);
    setBusy(true);
    try {
      await adminCreatePromoCode(token, {
        code: promoForm.code.trim(),
        percentOff: Number(promoForm.percentOff),
        minOrderValue: Number(promoForm.minOrderValue),
        maxDiscount: Number(promoForm.maxDiscount),
      });
      setPromoForm({ code: '', percentOff: '', minOrderValue: '', maxDiscount: '' });
      setPromoMessage('Promo code saved.');
      setPromoRows(await adminListPromoCodes(token));
    } catch (err) {
      setPromoMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const removePromo = async (id: number) => {
    if (!token || !confirm('Delete this promo code?')) return;
    try {
      await adminDeletePromoCode(token, id);
      setPromoRows(await adminListPromoCodes(token));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      const sortOrder =
        editingCatId != null
          ? (categories.find(c => c.id === editingCatId)?.sortOrder ?? (Number(catOrder) || 0))
          : categories.length;
      const body = { name: catName, description: catDesc || '', sortOrder };
      if (editingCatId != null) {
        await adminUpdateCategory(token, editingCatId, body);
      } else {
        await adminCreateCategory(token, body);
      }
      setCatName('');
      setCatDesc('');
      setCatOrder(0);
      setEditingCatId(null);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const editCategory = (c: CategoryResponse) => {
    setEditingCatId(c.id);
    setCatName(c.name);
    setCatDesc(c.description ?? '');
    setCatOrder(c.sortOrder);
  };

  const handleCategoryReorder = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!token || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      setCategoryDragIndex(null);
      setCategoryDropIndex(null);
      return;
    }
    const reordered = reorderList(categories, fromIndex, toIndex).map((c, i) => ({
      ...c,
      sortOrder: i,
    }));
    const previous = categories;
    setCategories(reordered);
    setCategoryDragIndex(null);
    setCategoryDropIndex(null);
    setCategoryOrderBusy(true);
    try {
      const saved = await adminReorderCategories(
        token,
        reordered.map(c => c.id),
      );
      setCategories(saved);
    } catch (err) {
      setCategories(previous);
      const msg = err instanceof Error ? err.message : 'Could not save category order. Try again.';
      window.alert(msg);
    } finally {
      setCategoryOrderBusy(false);
    }
  }, [token, categories]);

  const moveCategoryByStep = (index: number, delta: number) => {
    const toIndex = index + delta;
    if (toIndex < 0 || toIndex >= categories.length) return;
    void handleCategoryReorder(index, toIndex);
  };

  const categoryDragIndexRef = useRef<number | null>(null);
  const categoryDropIndexRef = useRef<number | null>(null);

  useEffect(() => {
    categoryDragIndexRef.current = categoryDragIndex;
  }, [categoryDragIndex]);

  useEffect(() => {
    categoryDropIndexRef.current = categoryDropIndex;
  }, [categoryDropIndex]);

  useEffect(() => {
    if (categoryDragIndex === null) return;

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const row = el?.closest('[data-category-index]');
      if (!row) return;
      const idx = Number(row.getAttribute('data-category-index'));
      if (!Number.isNaN(idx)) {
        setCategoryDropIndex(idx);
      }
    };

    const finishTouchDrag = () => {
      const from = categoryDragIndexRef.current;
      const to = categoryDropIndexRef.current;
      setCategoryDragIndex(null);
      setCategoryDropIndex(null);
      if (from !== null && to !== null && from !== to) {
        void handleCategoryReorder(from, to);
      }
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', finishTouchDrag);
    document.addEventListener('touchcancel', finishTouchDrag);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', finishTouchDrag);
      document.removeEventListener('touchcancel', finishTouchDrag);
    };
  }, [categoryDragIndex, handleCategoryReorder]);

  const removeCategory = async (id: number) => {
    if (!token || !confirm('Delete this category? It must have no products.')) return;
    try {
      await adminDeleteCategory(token, id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const toNum = (v: string) => {
    if (v === '' || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const buildProductPayload = () => ({
    categoryId: Number(productForm.categoryId) || categories[0]?.id,
    meladenFragrance: productForm.meladenFragrance,
    inspiredBy: productForm.inspiredBy || null,
    luxuryDescription: productForm.luxuryDescription || null,
    mood: productForm.mood || null,
    occasion: productForm.occasion || null,
    season: productForm.season || null,
    idealFor: productForm.idealFor || null,
    price30Ml: toNum(productForm.price30Ml),
    price50Ml: toNum(productForm.price50Ml),
    price100Ml: toNum(productForm.price100Ml),
    notesTop: productForm.notesTop || null,
    notesMiddle: productForm.notesMiddle || null,
    notesBase: productForm.notesBase || null,
    moreInformation: productForm.moreInformation || null,
    searchKeywords: productForm.searchKeywords || null,
    category2: productForm.category2 || null,
    productOil: toNum(productForm.productOil),
    concentration: productForm.concentration || null,
    imageBase64: productForm.imageBase64 || null,
    imageContentType: productForm.imageContentType || null,
    clearImage: productForm.clearImage,
    galleryImage1: productForm.galleryImage1 || null,
    galleryImage2: productForm.galleryImage2 || null,
    galleryImage3: productForm.galleryImage3 || null,
    tag: productForm.tag || null,
    isNew: productForm.isNew,
    isBestseller: productForm.isBestseller,
  });

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      const payload = buildProductPayload();
      if (editingProductId) {
        await adminUpdateProduct(token, editingProductId, payload);
      } else {
        await adminCreateProduct(token, payload);
      }
      setEditingProductId(null);
      setSelectedImageName('');
      setProductForm(emptyProductForm(categories[0]?.id ?? 0, mediaDefaults));
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const editProduct = (p: ProductAdminApi) => {
    setEditingProductId(p.id);
    setActiveProductTab('Basics');
    setProductForm({
      categoryId: p.categoryId,
      meladenFragrance: p.meladenFragrance,
      inspiredBy: p.inspiredBy ?? '',
      luxuryDescription: p.luxuryDescription ?? '',
      mood: p.mood ?? '',
      occasion: p.occasion ?? '',
      season: p.season ?? '',
      idealFor: p.idealFor ?? '',
      price30Ml: p.price30Ml != null ? String(p.price30Ml) : '',
      price50Ml: p.price50Ml != null ? String(p.price50Ml) : '',
      price100Ml: p.price100Ml != null ? String(p.price100Ml) : '',
      notesTop: p.notesTop ?? '',
      notesMiddle: p.notesMiddle ?? '',
      notesBase: p.notesBase ?? '',
      moreInformation: p.moreInformation ?? '',
      searchKeywords: p.searchKeywords ?? '',
      category2: p.category2 ?? '',
      productOil: p.productOil != null ? String(p.productOil) : '',
      concentration: p.concentration ?? '',
      imageBase64: '',
      imageContentType: '',
      clearImage: false,
      galleryImage1: p.galleryImage1 ?? '',
      galleryImage2: p.galleryImage2 ?? '',
      galleryImage3: p.galleryImage3 ?? '',
      tag: p.tag ?? '',
      isNew: p.isNew,
      isBestseller: p.isBestseller,
    });
    setSelectedImageName(p.hasImage ? 'Existing image present (choose file to replace)' : '');
  };

  const removeProduct = async (id: string) => {
    if (!token || !confirm('Delete this product?')) return;
    try {
      await adminDeleteProduct(token, id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const saveAlcoholStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const value = Number(alcoholStockInput);
    if (!Number.isFinite(value) || value < 0) {
      alert('Please enter valid ALC stock in gm.');
      return;
    }
    setBusy(true);
    try {
      const updated = await adminUpdateStock(token, value);
      setStock(updated);
      setAlcoholStockInput(String(updated.alcoholStockGm));
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update stock');
    } finally {
      setBusy(false);
    }
  };

  const setProductField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setProductForm(prev => ({ ...prev, [key]: value }));
  };

  const saveMediaDefaults = () => {
    const next: ProductMediaDefaults = {
      galleryImage1: productForm.galleryImage1,
      galleryImage2: productForm.galleryImage2,
      galleryImage3: productForm.galleryImage3,
    };
    setMediaDefaults(next);
    localStorage.setItem(PRODUCT_MEDIA_DEFAULTS_KEY, JSON.stringify(next));
    if (!editingProductId) {
      setProductForm(prev => ({ ...prev, ...next }));
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string' && result.includes(',')) {
          resolve(result.split(',')[1] ?? '');
          return;
        }
        reject(new Error('Failed to read file'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Failed to read file'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const onPrimaryImageChange = async (file: File | null) => {
    if (!file) return;
    try {
      const base64 = await readFileAsBase64(file);
      setProductField('imageBase64', base64);
      setProductField('imageContentType', file.type || 'application/octet-stream');
      setProductField('clearImage', false);
      setSelectedImageName(file.name);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Image upload failed');
    }
  };

  const onGalleryReplace = async (
    field: 'galleryImage1' | 'galleryImage2' | 'galleryImage3',
    file: File | null,
  ) => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProductField(field, dataUrl);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Image upload failed');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-brand-cream px-5 py-16 text-brand-dark">
        <div className="mx-auto max-w-md rounded-2xl border border-brand-beige bg-white/60 p-8 shadow-sm">
          <h1 className="font-serif text-2xl font-medium">Meladen Admin</h1>
          <p className="mt-2 text-sm text-brand-gray">Sign in with your admin email and password.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block text-xs font-medium uppercase tracking-widest text-brand-gray">
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-beige bg-white px-3 py-2 text-sm outline-none focus:border-brand-dark"
                autoComplete="username"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-widest text-brand-gray">
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-beige bg-white px-3 py-2 text-sm outline-none focus:border-brand-dark"
                autoComplete="current-password"
              />
            </label>
            {loginError && <p className="text-sm text-red-700">{loginError}</p>}
            {sessionError && <p className="text-sm text-amber-700">{sessionError}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand-dark py-2.5 text-sm font-medium text-brand-cream disabled:opacity-50"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea] px-4 py-10 pb-24 text-[#1f1b16] lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d8cfbe] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#201a13]">Catalog Admin</h1>
            <p className="text-sm text-[#6b5c4b]">Manage categories and fragrance products for the collection page.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-[#c8b89f] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#4b3f32] hover:border-[#7a664e]"
          >
            Log out
          </button>
        </div>
        {adminLoadError && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {adminLoadError}
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-2 rounded-lg bg-[#efe4d2] p-1 sm:grid-cols-3 lg:w-fit lg:grid-cols-7">
          {ADMIN_TABS.map(tab => {
            const isOrdersTab = tab === 'Orders';
            const showOrderAlert = isOrdersTab && hasNewOrders;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveAdminTab(tab)}
                className={`relative rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeAdminTab === tab ? 'bg-white text-[#3e2f1f] shadow-sm' : 'text-[#7a6b57] hover:bg-white/60'
                } ${
                  showOrderAlert
                    ? 'shadow-[0_0_16px_rgba(239,68,68,0.55)] ring-2 ring-red-500/70'
                    : ''
                }`}
              >
                {tab}
                {showOrderAlert && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeAdminTab === 'Categories' && (
            <section className="max-w-2xl">
            <h2 className="text-lg font-semibold text-[#241d14]">Categories</h2>
            <p className="mt-1 text-xs text-[#7a6b57]">
              Drag rows (or use ↑↓ on mobile) to set display order on the collection page.
            </p>
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
              {categories.map((c, index) => (
                <li
                  key={c.id}
                  data-category-index={index}
                  draggable={!categoryOrderBusy}
                  onDragStart={() => setCategoryDragIndex(index)}
                  onDragEnd={() => {
                    setCategoryDragIndex(null);
                    setCategoryDropIndex(null);
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                    setCategoryDropIndex(index);
                  }}
                  onDragLeave={() => {
                    setCategoryDropIndex(prev => (prev === index ? null : prev));
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    if (categoryDragIndex !== null) {
                      void handleCategoryReorder(categoryDragIndex, index);
                    }
                  }}
                  className={`flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-[#2a2118] shadow-sm transition ${
                    categoryDropIndex === index && categoryDragIndex !== index
                      ? 'border-[#8c7458] ring-2 ring-[#d7c4aa]'
                      : 'border-[#dbcdb8]'
                  } ${categoryDragIndex === index ? 'opacity-50' : ''} ${categoryOrderBusy ? 'pointer-events-none opacity-70' : ''}`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="flex h-10 w-8 flex-shrink-0 touch-none cursor-grab flex-col items-center justify-center text-[#9a8b78] active:cursor-grabbing"
                      aria-hidden
                      title="Drag to reorder"
                      onTouchStart={(e: ReactTouchEvent) => {
                        e.stopPropagation();
                        setCategoryDragIndex(index);
                        setCategoryDropIndex(index);
                      }}
                    >
                      <span className="block h-0.5 w-3 rounded-full bg-current" />
                      <span className="mt-0.5 block h-0.5 w-3 rounded-full bg-current" />
                      <span className="mt-0.5 block h-0.5 w-3 rounded-full bg-current" />
                    </span>
                    <span className="min-w-0">
                      <span className="font-medium">{c.name}</span>
                      <span className="ml-2 text-[10px] text-[#7a6b57]">#{index + 1}</span>
                    </span>
                  </span>
                  <span className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                    <span className="flex flex-col gap-0.5 sm:hidden">
                      <button
                        type="button"
                        aria-label={`Move ${c.name} up`}
                        disabled={index === 0 || categoryOrderBusy}
                        onClick={() => moveCategoryByStep(index, -1)}
                        className="rounded border border-[#dbcdb8] px-2 py-0.5 text-[10px] text-[#5d4d3b] disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${c.name} down`}
                        disabled={index === categories.length - 1 || categoryOrderBusy}
                        onClick={() => moveCategoryByStep(index, 1)}
                        className="rounded border border-[#dbcdb8] px-2 py-0.5 text-[10px] text-[#5d4d3b] disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </span>
                    <button type="button" className="text-xs font-medium text-[#5d4d3b] underline" onClick={() => editCategory(c)}>
                      Edit
                    </button>
                    <button type="button" className="text-xs font-medium text-red-700 underline" onClick={() => removeCategory(c.id)}>
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            {categoryOrderBusy && (
              <p className="mt-2 text-xs text-[#7a6b57]">Saving order…</p>
            )}
            <form onSubmit={saveCategory} className="mt-6 space-y-3 rounded-xl border border-[#dbcdb8] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">
                {editingCatId != null ? 'Update category' : 'New category'}
              </p>
              <input
                placeholder="Name"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                required
              />
              <textarea
                placeholder="Description"
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
                className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                rows={2}
              />
              {editingCatId != null && (
                <p className="text-xs text-[#7a6b57]">
                  Position on collection page: drag this category in the list above, or it stays at #
                  {(categories.find(c => c.id === editingCatId)?.sortOrder ?? 0) + 1}.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-[#2f2418] px-4 py-2 text-sm font-medium text-[#f8f2e8] disabled:opacity-50"
                >
                  Save
                </button>
                {editingCatId != null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName('');
                      setCatDesc('');
                      setCatOrder(0);
                    }}
                    className="rounded-lg border border-[#ccbca7] bg-white px-4 py-2 text-sm text-[#4e4134]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            </section>
          )}

          {activeAdminTab === 'Products' && (
            <section>
            <h2 className="text-lg font-semibold text-[#241d14]">Products</h2>
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[#dbcdb8] bg-white p-3 text-sm shadow-sm">
              {products.map(p => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#eadfce] bg-[#fffdfa] px-3 py-2"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{p.meladenFragrance}</span>
                    <span className="ml-2 text-[#7a6b57]">({p.categoryName})</span>
                  </span>
                  <span className="flex shrink-0 gap-2">
                    <button type="button" className="text-xs font-medium text-[#5d4d3b] underline" onClick={() => editProduct(p)}>
                      Edit
                    </button>
                    <button type="button" className="text-xs text-red-700 underline" onClick={() => removeProduct(p.id)}>
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <form onSubmit={saveProduct} className="mt-6 space-y-4 rounded-xl border border-[#dbcdb8] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">
                  {editingProductId ? 'Update product' : 'New product'}
                </p>
                <span className="rounded-full bg-[#f3eadb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7d654a]">
                  Step {PRODUCT_TABS.indexOf(activeProductTab) + 1}/3
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#f6efe4] p-1">
                {PRODUCT_TABS.map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveProductTab(tab)}
                    className={`rounded-md px-2 py-2 text-xs font-semibold transition ${
                      activeProductTab === tab
                        ? 'bg-white text-[#3e2f1f] shadow-sm'
                        : 'text-[#7a6b57] hover:bg-white/70'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeProductTab === 'Basics' && (
                <div className="space-y-3">
                  <select
                    value={productForm.categoryId || ''}
                    onChange={e => setProductField('categoryId', Number(e.target.value))}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Méladen Fragrance (name)"
                    value={productForm.meladenFragrance}
                    onChange={e => setProductField('meladenFragrance', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    required
                  />
                  <input
                    placeholder="Inspired By"
                    value={productForm.inspiredBy}
                    onChange={e => setProductField('inspiredBy', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                  />
                  <input
                    placeholder="Concentration (e.g. Eau de Parfum — used in filters)"
                    value={productForm.concentration}
                    onChange={e => setProductField('concentration', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                  />
                  <input
                    placeholder="Category2"
                    value={productForm.category2}
                    onChange={e => setProductField('category2', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Product OIL"
                    value={productForm.productOil}
                    onChange={e => setProductField('productOil', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                  />
                  <textarea
                    placeholder="Luxury description"
                    value={productForm.luxuryDescription}
                    onChange={e => setProductField('luxuryDescription', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    rows={3}
                  />
                  {(['mood', 'occasion', 'season', 'idealFor'] as const).map(field => (
                    <input
                      key={field}
                      placeholder={field}
                      value={productForm[field]}
                      onChange={e => setProductField(field, e.target.value)}
                      className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    />
                  ))}
                </div>
              )}

              {activeProductTab === 'Pricing & Notes' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(['price30Ml', 'price50Ml', 'price100Ml'] as const).map(field => (
                      <input
                        key={field}
                        type="number"
                        step="0.01"
                        placeholder={field}
                        value={productForm[field]}
                        onChange={e => setProductField(field, e.target.value)}
                        className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-2 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                      />
                    ))}
                  </div>
                  {(['notesTop', 'notesMiddle', 'notesBase'] as const).map(field => (
                    <input
                      key={field}
                      placeholder={`${field} (comma-separated)`}
                      value={productForm[field]}
                      onChange={e => setProductField(field, e.target.value)}
                      className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    />
                  ))}
                  <textarea
                    placeholder="More information"
                    value={productForm.moreInformation}
                    onChange={e => setProductField('moreInformation', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    rows={3}
                  />
                  <textarea
                    placeholder="Search keywords (top 10 priority)"
                    value={productForm.searchKeywords}
                    onChange={e => setProductField('searchKeywords', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    rows={3}
                  />
                </div>
              )}

              {activeProductTab === 'Media & Flags' && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-[#eadfce] bg-[#fffdfa] p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a6b57]">
                      Primary image (BLOB upload)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0] ?? null;
                        void onPrimaryImageChange(file);
                      }}
                      className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    />
                    {selectedImageName && (
                      <p className="mt-2 text-xs text-[#6b5c4b]">{selectedImageName}</p>
                    )}
                    <label className="mt-2 flex items-center gap-2 text-xs text-[#6b5c4b]">
                      <input
                        type="checkbox"
                        checked={productForm.clearImage}
                        onChange={e => {
                          setProductField('clearImage', e.target.checked);
                          if (e.target.checked) {
                            setProductField('imageBase64', '');
                            setProductField('imageContentType', '');
                            setSelectedImageName('');
                          }
                        }}
                      />
                      Remove current image
                    </label>
                  </div>

                  {(['galleryImage1', 'galleryImage2', 'galleryImage3'] as const).map((field, idx) => (
                    <div key={field} className="rounded-lg border border-[#eadfce] bg-[#fffdfa] p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a6b57]">
                        Default image {idx + 2}
                      </p>
                      <img
                        src={productForm[field]}
                        alt={`Preview ${idx + 2}`}
                        className="mb-2 h-28 w-full rounded-md border border-[#e5d7c2] object-cover"
                      />
                      <div className="flex gap-2">
                        <label className="cursor-pointer rounded-lg border border-[#ccbca7] bg-white px-3 py-2 text-xs font-medium text-[#4e4134]">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0] ?? null;
                              void onGalleryReplace(field, file);
                            }}
                          />
                        </label>
                        <input
                          placeholder="or paste image URL"
                          value={productForm[field]}
                          onChange={e => setProductField(field, e.target.value)}
                          className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={saveMediaDefaults}
                    className="rounded-lg border border-[#ccbca7] bg-white px-3 py-2 text-xs font-medium text-[#4e4134]"
                  >
                    Save gallery defaults for next products
                  </button>
                  <input
                    placeholder="tag"
                    value={productForm.tag}
                    onChange={e => setProductField('tag', e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                  />
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#eadfce] bg-[#fffdfa] p-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#4d3f31]">
                      <input
                        type="checkbox"
                        checked={productForm.isNew}
                        onChange={e => setProductField('isNew', e.target.checked)}
                      />
                      New
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#4d3f31]">
                      <input
                        type="checkbox"
                        checked={productForm.isBestseller}
                        onChange={e => setProductField('isBestseller', e.target.checked)}
                      />
                      Bestseller
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveProductTab(prev =>
                        prev === 'Pricing & Notes' ? 'Basics' : prev === 'Media & Flags' ? 'Pricing & Notes' : 'Basics',
                      )
                    }
                    className="rounded-lg border border-[#ccbca7] bg-white px-3 py-2 text-xs font-medium text-[#4e4134]"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveProductTab(prev =>
                        prev === 'Basics' ? 'Pricing & Notes' : prev === 'Pricing & Notes' ? 'Media & Flags' : 'Media & Flags',
                      )
                    }
                    className="rounded-lg border border-[#ccbca7] bg-white px-3 py-2 text-xs font-medium text-[#4e4134]"
                  >
                    Next
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy || categories.length === 0}
                    className="rounded-lg bg-[#2f2418] px-4 py-2 text-sm font-medium text-[#f8f2e8] disabled:opacity-50"
                  >
                    Save product
                  </button>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setActiveProductTab('Basics');
                      setSelectedImageName('');
                      setProductForm(emptyProductForm(categories[0]?.id ?? 0, mediaDefaults));
                      }}
                      className="rounded-lg border border-[#ccbca7] bg-white px-4 py-2 text-sm text-[#4e4134]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {categories.length === 0 && (
                <p className="text-xs text-amber-800">Create a category before adding products.</p>
              )}
            </form>
            </section>
          )}

          {activeAdminTab === 'Stock' && (
            <section className="max-w-3xl space-y-5">
              <h2 className="text-lg font-semibold text-[#241d14]">Stock Management</h2>
              <form onSubmit={saveAlcoholStock} className="rounded-xl border border-[#dbcdb8] bg-white p-4 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">
                  ALC stock (gm)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={alcoholStockInput}
                    onChange={e => setAlcoholStockInput(e.target.value)}
                    className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm text-[#251d15] outline-none focus:border-[#8c7458] focus:ring-1 focus:ring-[#d7c4aa]"
                    placeholder="Enter total alcohol stock in gm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-[#2f2418] px-4 py-2 text-sm font-medium text-[#f8f2e8] disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
                {stock && (
                  <p className="mt-2 text-xs text-[#6b5c4b]">
                    Last updated: {new Date(stock.updatedAt).toLocaleString()}
                  </p>
                )}
              </form>

              {stock && (
                <>
                  <div
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      stock.lowAlcohol ? 'border-red-300 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    Alcohol stock: {stock.alcoholStockGm} gm {stock.lowAlcohol ? '(LOW: below/equal 200 gm)' : '(OK)'}
                  </div>
                  <div className="rounded-xl border border-[#dbcdb8] bg-white p-4 shadow-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">
                      Product oil stock alerts (threshold: 100 gm)
                    </p>
                    <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
                      {stock.lowOilProducts.map(item => (
                        <li
                          key={item.productId}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                            item.lowOil
                              ? 'border-red-300 bg-red-50 text-red-800'
                              : 'border-[#eadfce] bg-[#fffdfa] text-[#2a2118]'
                          }`}
                        >
                          <span>{item.productName}</span>
                          <span>{item.remainingOilGm} gm</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </section>
          )}

          {activeAdminTab === 'Orders' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-[#241d14]">Customer Orders</h2>
                {hasNewOrders && (
                  <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                    {unseenOrderIds.size} new
                  </span>
                )}
              </div>
              {orders.length === 0 ? (
                <div className="rounded-xl border border-[#dbcdb8] bg-white p-4 text-sm text-[#6b5c4b] shadow-sm">
                  No orders yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => {
                    const isNewOrder = unseenOrderIds.has(order.id);
                    const statusLabel = order.status.replace(/_/g, ' ');
                    const statusTone =
                      order.status === 'PAID' || order.status === 'PLACED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : order.status === 'PAYMENT_PENDING'
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'bg-[#f0ebe3] text-[#5c4f40] border-[#dbcdb8]';
                    return (
                    <article
                      key={order.id}
                      className={`rounded-xl border bg-white p-4 shadow-sm ${
                        isNewOrder
                          ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-2 ring-red-400/40'
                          : 'border-[#dbcdb8]'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eadfce] pb-3">
                        <div>
                          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#241d14]">
                            {order.orderNumber}
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusTone}`}
                            >
                              {statusLabel}
                            </span>
                            {isNewOrder && (
                              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                                New
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-[10px] text-[#9a8b78]">ID {order.id}</p>
                        </div>
                        <p className="text-xs text-[#6b5c4b]">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-[#eadfce] bg-[#fffdfa] p-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7a6b57]">
                            Customer
                          </p>
                          <dl className="space-y-1 text-xs text-[#3a2f25]">
                            <div>
                              <dt className="text-[#9a8b78]">Name</dt>
                              <dd className="font-medium">{order.customerName}</dd>
                            </div>
                            <div>
                              <dt className="text-[#9a8b78]">Email</dt>
                              <dd>
                                <a href={`mailto:${order.customerEmail}`} className="text-[#5c4a38] underline">
                                  {order.customerEmail}
                                </a>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[#9a8b78]">Phone</dt>
                              <dd>{order.customerPhone?.trim() || '—'}</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="rounded-lg border border-[#eadfce] bg-[#fffdfa] p-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7a6b57]">
                            Shipping address
                          </p>
                          <p className="text-xs leading-relaxed text-[#3a2f25]">
                            {order.address}
                            <br />
                            {order.city}, {order.postcode}
                            <br />
                            {order.country}
                          </p>
                        </div>

                        <div className="rounded-lg border border-[#eadfce] bg-[#fffdfa] p-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#7a6b57]">
                            Order totals
                          </p>
                          <dl className="space-y-1 text-xs text-[#3a2f25]">
                            <div className="flex justify-between gap-2">
                              <dt className="text-[#9a8b78]">Subtotal</dt>
                              <dd>{formatInr(Number(order.subtotal))}</dd>
                            </div>
                            {(order.discountAmount ?? 0) > 0 && (
                              <div className="flex justify-between gap-2 text-emerald-700">
                                <dt>Promo {order.promoCode ? `(${order.promoCode})` : ''}</dt>
                                <dd>{formatInrDiscount(Number(order.discountAmount))}</dd>
                              </div>
                            )}
                            <div className="flex justify-between gap-2">
                              <dt className="text-[#9a8b78]">Shipping</dt>
                              <dd>{formatInr(Number(order.shipping))}</dd>
                            </div>
                            {(order.walletDiscount ?? 0) > 0 && (
                              <div className="flex justify-between gap-2 text-emerald-700">
                                <dt>Wallet</dt>
                                <dd>{formatInrDiscount(Number(order.walletDiscount))}</dd>
                              </div>
                            )}
                            <div className="flex justify-between gap-2 border-t border-[#eadfce] pt-1 font-semibold text-[#241d14]">
                              <dt>Total</dt>
                              <dd>{formatInr(Number(order.total))}</dd>
                            </div>
                            <div className="flex justify-between gap-2 pt-1 text-[#6b5c4b]">
                              <dt>Alcohol used</dt>
                              <dd>{order.alcoholUsedGm} gm</dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {(order.trackingUrl || order.trackingAwb) && (
                        <div className="mt-3 rounded-lg border border-[#d4e8dc] bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
                          <span className="font-semibold">Tracking: </span>
                          {order.trackingAwb && <span className="mr-2">AWB {order.trackingAwb}</span>}
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Track shipment
                            </a>
                          )}
                        </div>
                      )}

                      <div className="mt-3 overflow-x-auto rounded-lg border border-[#eadfce] bg-[#fffdfa]">
                        <table className="min-w-full text-xs text-[#3a2f25]">
                          <thead>
                            <tr className="border-b border-[#eadfce] text-left text-[10px] uppercase tracking-widest text-[#7a6b57]">
                              <th className="px-3 py-2 font-semibold">Product</th>
                              <th className="px-3 py-2 font-semibold">Size</th>
                              <th className="px-3 py-2 font-semibold">Qty</th>
                              <th className="px-3 py-2 font-semibold">Unit</th>
                              <th className="px-3 py-2 font-semibold">Line</th>
                              <th className="px-3 py-2 font-semibold">Oil / Alc</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map(item => (
                              <tr
                                key={`${order.id}-${item.productId}-${item.size}`}
                                className="border-b border-[#f0ebe3] last:border-0"
                              >
                                <td className="px-3 py-2 font-medium">{item.productName}</td>
                                <td className="px-3 py-2">{item.size}</td>
                                <td className="px-3 py-2">{item.quantity}</td>
                                <td className="px-3 py-2">{formatInr(Number(item.unitPrice))}</td>
                                <td className="px-3 py-2">{formatInr(Number(item.lineTotal))}</td>
                                <td className="px-3 py-2 text-[#6b5c4b]">
                                  {item.oilUsedGm} gm / {item.alcoholUsedGm} gm
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeAdminTab === 'Promo codes' && (
            <section className="max-w-3xl space-y-6">
              <h2 className="text-lg font-semibold text-[#241d14]">Promo codes</h2>
              <form
                onSubmit={savePromo}
                className="space-y-3 rounded-xl border border-[#dbcdb8] bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">Add code</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Code (e.g. MELADEN10)"
                    value={promoForm.code}
                    onChange={e => setPromoForm(f => ({ ...f, code: e.target.value }))}
                    className="rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#8c7458]"
                    required
                  />
                  <input
                    type="number"
                    placeholder="% off"
                    min={1}
                    max={100}
                    value={promoForm.percentOff}
                    onChange={e => setPromoForm(f => ({ ...f, percentOff: e.target.value }))}
                    className="rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#8c7458]"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Min order (₹)"
                    min={0}
                    step="0.01"
                    value={promoForm.minOrderValue}
                    onChange={e => setPromoForm(f => ({ ...f, minOrderValue: e.target.value }))}
                    className="rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#8c7458]"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Max discount (₹)"
                    min={1}
                    step="0.01"
                    value={promoForm.maxDiscount}
                    onChange={e => setPromoForm(f => ({ ...f, maxDiscount: e.target.value }))}
                    className="rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#8c7458]"
                    required
                  />
                </div>
                {promoMessage && <p className="text-sm text-[#6b5c4b]">{promoMessage}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-[#3e2f1f] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
                >
                  Save promo
                </button>
              </form>
              {promoRows.length === 0 ? (
                <p className="text-sm text-[#6b5c4b]">No promo codes yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#dbcdb8] bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#eadfce] text-xs uppercase tracking-wide text-[#7a6b57]">
                        <th className="px-3 py-2">Code</th>
                        <th className="px-3 py-2">%</th>
                        <th className="px-3 py-2">Min</th>
                        <th className="px-3 py-2">Max</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {promoRows.map(r => (
                        <tr key={r.id} className="border-b border-[#f0e8dc]">
                          <td className="px-3 py-2 font-medium">{r.code}</td>
                          <td className="px-3 py-2">{r.percentOff}%</td>
                          <td className="px-3 py-2">{r.minOrderValue}</td>
                          <td className="px-3 py-2">{r.maxDiscount}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              className="text-xs text-red-700 underline"
                              onClick={() => removePromo(r.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeAdminTab === 'Wallet' && (
            <section className="max-w-xl space-y-4">
              <h2 className="text-lg font-semibold text-[#241d14]">Customer wallet</h2>
              <p className="text-sm text-[#6b5c4b]">
                Credit store wallet for a customer order (refunds / goodwill). Amount is added to their balance.
              </p>
              <form
                className="space-y-3 rounded-xl border border-[#dbcdb8] bg-white p-4 shadow-sm"
                onSubmit={async e => {
                  e.preventDefault();
                  if (!token || !walletSelectedOrderId.trim()) {
                    setWalletTabMessage('Select an order.');
                    return;
                  }
                  const amt = Number(walletCreditAmount);
                  if (!Number.isFinite(amt) || amt <= 0) {
                    setWalletTabMessage('Enter a positive amount.');
                    return;
                  }
                  setWalletTabBusy(true);
                  setWalletTabMessage(null);
                  try {
                    await adminCreditWallet(token, walletSelectedOrderId.trim(), amt);
                    setWalletTabMessage(`Credited ${formatInr(amt)} to wallet for order ${walletSelectedOrderId.slice(0, 8)}…`);
                    setWalletCreditAmount('');
                  } catch (err) {
                    setWalletTabMessage(readMessage(err));
                  } finally {
                    setWalletTabBusy(false);
                  }
                }}
              >
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">
                  Customer email
                </label>
                <input
                  list="wallet-customer-emails"
                  value={walletEmailInput}
                  onChange={e => setWalletEmailInput(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#8c7458]"
                />
                <datalist id="wallet-customer-emails">
                  {walletCustomerEmails.map(em => (
                    <option key={em} value={em} />
                  ))}
                </datalist>
                <button
                  type="button"
                  disabled={walletTabBusy || !walletEmailInput.trim()}
                  onClick={async () => {
                    if (!token || !walletEmailInput.trim()) return;
                    setWalletTabBusy(true);
                    setWalletTabMessage(null);
                    try {
                      const rows = await adminWalletOrdersByEmail(token, walletEmailInput.trim());
                      setWalletOrdersForEmail(rows);
                      setWalletSelectedOrderId(rows[0]?.id ?? '');
                    } catch (err) {
                      setWalletOrdersForEmail([]);
                      setWalletSelectedOrderId('');
                      setWalletTabMessage(readMessage(err));
                    } finally {
                      setWalletTabBusy(false);
                    }
                  }}
                  className="rounded-lg border border-[#ccbca7] bg-[#f6efe4] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#4b3f32] disabled:opacity-50"
                >
                  Load orders
                </button>
                {walletOrdersForEmail.length > 0 && (
                  <>
                    <label className="mt-2 block text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">
                      Order
                    </label>
                    <select
                      value={walletSelectedOrderId}
                      onChange={e => setWalletSelectedOrderId(e.target.value)}
                      className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#8c7458]"
                    >
                      {walletOrdersForEmail.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} · total {o.totalAmount}
                        </option>
                      ))}
                    </select>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#7a6b57]">
                      Credit amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={walletCreditAmount}
                      onChange={e => setWalletCreditAmount(e.target.value)}
                      className="w-full rounded-lg border border-[#ccbca7] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#8c7458]"
                    />
                    <button
                      type="submit"
                      disabled={walletTabBusy}
                      className="w-full rounded-lg bg-[#2f2418] px-4 py-2.5 text-sm font-medium text-[#f8f2e8] disabled:opacity-50"
                    >
                      {walletTabBusy ? 'Saving…' : 'Credit wallet'}
                    </button>
                  </>
                )}
                {walletTabMessage && (
                  <p className="text-sm text-[#5d4d3b]">{walletTabMessage}</p>
                )}
              </form>
            </section>
          )}

          {activeAdminTab === 'Returns' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#241d14]">Return requests</h2>
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      setReturnRows(await adminListReturnRequests(token));
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="rounded-full border border-[#c8b89f] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#4b3f32]"
                >
                  Refresh
                </button>
              </div>
              {returnRows.length === 0 ? (
                <div className="rounded-xl border border-[#dbcdb8] bg-white p-4 text-sm text-[#6b5c4b] shadow-sm">
                  No return requests yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#dbcdb8] bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#eadfce] text-xs uppercase tracking-wide text-[#7a6b57]">
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Order</th>
                        <th className="px-3 py-2">Video</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {returnRows.map(r => (
                        <tr key={r.id} className="border-b border-[#f0e8dc]">
                          <td className="px-3 py-2 text-[#6b5c4b]">
                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-medium text-[#241d14]">{r.customerName}</span>
                            <br />
                            <span className="text-xs text-[#6b5c4b]">{r.email}</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">{r.orderId}</td>
                          <td className="px-3 py-2">{r.hasVideo ? 'Yes' : '—'}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              className="text-xs font-semibold uppercase tracking-wide text-[#5d4d3b] underline"
                              onClick={() => setSelectedReturn(r)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedReturn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-[#dbcdb8] bg-[#fffdfa] p-5 shadow-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-serif text-lg text-[#241d14]">
                        Return #{selectedReturn.id}
                      </h3>
                      <button
                        type="button"
                        className="text-2xl leading-none text-[#6b5c4b] hover:text-[#241d14]"
                        onClick={() => setSelectedReturn(null)}
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-[#3a2f25]">
                      <p>
                        <span className="text-[#7a6b57]">Name:</span> {selectedReturn.customerName}
                      </p>
                      <p>
                        <span className="text-[#7a6b57]">Email:</span> {selectedReturn.email}
                      </p>
                      <p>
                        <span className="text-[#7a6b57]">Contact:</span> {selectedReturn.contactNumber}
                      </p>
                      <p>
                        <span className="text-[#7a6b57]">Order id:</span> {selectedReturn.orderId}
                      </p>
                      <p>
                        <span className="text-[#7a6b57]">Issue:</span> {selectedReturn.issueText}
                      </p>
                      {selectedReturn.hasVideo && returnVideoUrl && (
                        <video src={returnVideoUrl} controls className="mt-4 w-full max-h-[50vh] rounded-lg bg-black" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
