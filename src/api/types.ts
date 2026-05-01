export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export interface ProductNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductPublicApi {
  id: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  category: string;
  tag: string | null;
  image: string;
  gallery: string[];
  description: string;
  notes: ProductNotes;
  price30Ml: number | null;
  price50Ml: number | null;
  price100Ml: number | null;
  inspiredBy: string;
  luxuryDescription: string;
  mood: string;
  occasion: string;
  season: string;
  idealFor: string;
  moreInformation: string;
  searchKeywords: string;
  category2: string;
  productOil: number | null;
  concentration: string;
  isNew: boolean;
  isBestseller: boolean;
}

export interface CategoryWithProductsApi {
  category: CategoryResponse;
  products: ProductPublicApi[];
}

export interface JwtLoginResponse {
  token: string;
  email: string;
  expiresInSeconds: number;
}

export interface ProductAdminApi {
  id: string;
  categoryId: number;
  categoryName: string;
  meladenFragrance: string;
  inspiredBy: string | null;
  luxuryDescription: string | null;
  mood: string | null;
  occasion: string | null;
  season: string | null;
  idealFor: string | null;
  price30Ml: number | null;
  price50Ml: number | null;
  price100Ml: number | null;
  notesTop: string | null;
  notesMiddle: string | null;
  notesBase: string | null;
  moreInformation: string | null;
  searchKeywords: string | null;
  category2: string | null;
  productOil: number | null;
  concentration: string | null;
  imageUrl: string | null;
  hasImage: boolean;
  galleryImage1: string | null;
  galleryImage2: string | null;
  galleryImage3: string | null;
  tag: string | null;
  isNew: boolean;
  isBestseller: boolean;
}

export interface StockLowOilProductApi {
  productId: string;
  productName: string;
  remainingOilGm: number;
  lowOil: boolean;
}

export interface StockSummaryApi {
  alcoholStockGm: number;
  lowAlcohol: boolean;
  lowOilProducts: StockLowOilProductApi[];
  updatedAt: string;
}

export interface OrderItemApi {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  oilUsedGm: number;
  alcoholUsedGm: number;
}

export interface OrderApi {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  address: string;
  city: string;
  postcode: string;
  country: string;
  subtotal: number;
  discountAmount?: number;
  promoCode?: string | null;
  shipping: number;
  walletDiscount?: number;
  total: number;
  alcoholUsedGm: number;
  status: string;
  createdAt: string;
  items: OrderItemApi[];
}

export interface PromoCodeRow {
  id: number;
  code: string;
  percentOff: number;
  minOrderValue: number;
  maxDiscount: number;
  active: boolean;
  createdAt: string | null;
}

export interface ReturnRequestRow {
  id: number;
  customerName: string;
  contactNumber: string;
  email: string;
  orderId: string;
  issueText: string;
  createdAt: string | null;
  hasVideo: boolean;
}
