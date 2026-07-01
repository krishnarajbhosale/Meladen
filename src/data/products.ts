import {
  meladen1,
  meladen2,
  meladen3,
  meladen4,
  meladen5,
  meladen6,
  meladen7,
  meladen8,
  meladen9,
  meladen10,
  meladen11,
  meladen12,
  meladen13,
} from './meladenImages';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  category: string;
  tag?: string;
  image: string;
  /** Extra gallery shots for the product detail page (main `image` is hero). */
  gallery: string[];
  description: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  isNew?: boolean;
  isBestseller?: boolean;
  isPremium?: boolean;
  /** When set (from API), cart size picker uses these list prices. */
  price30Ml?: number;
  price50Ml?: number;
  price100Ml?: number;
  /** Named non-ml variants priced individually (finished products). */
  priceGel?: number;
  priceAttar?: number;
  priceCarPerfume?: number;
  inspiredBy?: string;
  luxuryDescription?: string;
  mood?: string;
  occasion?: string;
  season?: string;
  idealFor?: string;
  moreInformation?: string;
  howToApply?: string;
  searchKeywords?: string;
  category2?: string;
  productOil?: number;
  concentration?: string;
}

export interface ProductSizeOption {
  label: string;
  price: number;
}

export interface ProductSizeAvailability extends ProductSizeOption {
  available: boolean;
}

const SIZE_RECIPES: Record<string, { oil: number; alcohol: number }> = {
  '30ml': { oil: 6, alcohol: 18 },
  '50ml': { oil: 10, alcohol: 30 },
  '100ml': { oil: 20, alcohol: 60 },
  // Finished products: each unit uses 1 of product oil, no alcohol.
  'Perfume Gel': { oil: 1, alcohol: 0 },
  Attar: { oil: 1, alcohol: 0 },
  'Car Perfume': { oil: 1, alcohol: 0 },
  'Body and Hair Mist': { oil: 1, alcohol: 0 },
};

export const SIZE_PERFUME_GEL = 'Perfume Gel';
export const SIZE_ATTAR = 'Attar';
export const SIZE_CAR_PERFUME = 'Car Perfume';
export const SIZE_BODY_HAIR_MIST = 'Body and Hair Mist';

function normalizeCategoryName(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Attar, gel, car, mist, etc. — not made via ml + alcohol blending. */
export function isNonMlFragranceCategory(category: string | undefined): boolean {
  const cat = normalizeCategoryName(category ?? '');
  if (!cat) return false;
  return (
    cat.includes('gel') ||
    cat.includes('attar') ||
    cat.includes('car') ||
    cat.includes('mist') ||
    cat.includes('body') ||
    cat.includes('hair')
  );
}

/** True for pourable perfumes sold in 30/50/100ml (uses oil + alcohol stock). */
export function isLiquidPerfumeProduct(
  product: Pick<
    Product,
    | 'category'
    | 'price30Ml'
    | 'price50Ml'
    | 'price100Ml'
    | 'priceGel'
    | 'priceAttar'
    | 'priceCarPerfume'
  >,
): boolean {
  if (isNonMlFragranceCategory(product.category)) return false;

  const hasFinished =
    product.priceGel != null || product.priceAttar != null || product.priceCarPerfume != null;
  const hasMl =
    product.price30Ml != null || product.price50Ml != null || product.price100Ml != null;
  if (hasFinished && !hasMl) return false;
  if (hasMl) return true;

  const cat = normalizeCategoryName(product.category);
  return (
    cat.includes('eau de parfum') ||
    cat.includes('extrait') ||
    cat.includes('eau de toilette') ||
    cat.includes('edp') ||
    cat.includes('edt') ||
    cat === 'perfume' ||
    cat === 'perfumes' ||
    (cat.includes('parfum') && !cat.includes('gel') && !cat.includes('car'))
  );
}

/** Sub-category label above the product name (e.g. Adventure). Falls back to main category. */
export function getProductDisplayCategory(product: Pick<Product, 'category2' | 'category'>): string {
  return product.category2?.trim() || product.category;
}

export function normalizeProductSizeKey(size: string): string {
  const normalized = size.trim().toLowerCase().replace(/\s+/g, '');
  if (normalized === '30ml' || normalized === '30') return '30ml';
  if (normalized === '50ml' || normalized === '50') return '50ml';
  if (normalized === '100ml' || normalized === '100') return '100ml';
  if (normalized === 'perfumegel' || normalized === 'gel') return SIZE_PERFUME_GEL;
  if (normalized === 'attar') return SIZE_ATTAR;
  if (normalized === 'carperfume' || normalized === 'car') return SIZE_CAR_PERFUME;
  if (normalized === 'bodyandhairmist' || normalized === 'mist') return SIZE_BODY_HAIR_MIST;
  return size.trim();
}

export function liquidPerfumeMlVolume(sizeLabel: string): number | null {
  switch (normalizeProductSizeKey(sizeLabel)) {
    case '30ml':
      return 30;
    case '50ml':
      return 50;
    case '100ml':
      return 100;
    default:
      return null;
  }
}

/** USP under ml size tabs — e.g. (14.96/ml). Liquid perfumes only. */
export function formatLiquidPerfumePricePerMl(price: number, sizeLabel: string): string | null {
  const ml = liquidPerfumeMlVolume(sizeLabel);
  if (ml == null || ml <= 0 || !Number.isFinite(price) || price <= 0) return null;
  return `(${(price / ml).toFixed(2)}/ml)`;
}

/** Customer-facing size label for product UI, cart, and checkout. */
export function formatProductSizeDisplay(
  sizeLabel: string,
  product?: Pick<
    Product,
    | 'category'
    | 'price30Ml'
    | 'price50Ml'
    | 'price100Ml'
    | 'priceGel'
    | 'priceAttar'
    | 'priceCarPerfume'
  >,
): string {
  const key = normalizeProductSizeKey(sizeLabel);
  const isMl = key === '30ml' || key === '50ml' || key === '100ml';
  if (isMl && product && !isLiquidPerfumeProduct(product)) {
    return key;
  }
  switch (key) {
    case '30ml':
      return 'Starter Size';
    case '50ml':
      return 'Most Popular ⭐';
    case '100ml':
      return 'Best Value 🔥';
    default:
      return sizeLabel;
  }
}

/** Volume plus marketing label, e.g. "50ml · Most Popular ⭐". */
export function formatProductSizeLine(
  sizeLabel: string,
  product?: Pick<
    Product,
    | 'category'
    | 'price30Ml'
    | 'price50Ml'
    | 'price100Ml'
    | 'priceGel'
    | 'priceAttar'
    | 'priceCarPerfume'
  >,
): string {
  const key = normalizeProductSizeKey(sizeLabel);
  const display = formatProductSizeDisplay(sizeLabel, product);
  if (display === sizeLabel || display === key) return sizeLabel;
  return `${key} · ${display}`;
}

/** List price on product cards — 30ml starter price only for liquid perfumes. */
export function getProductCardListPrice(product: Product): { price: number; sizeLabel: string } {
  if (isLiquidPerfumeProduct(product) && product.price30Ml != null) {
    return { price: product.price30Ml, sizeLabel: '30ml' };
  }
  const options = getProductSizeOptions(product);
  if (options.length > 0) {
    return { price: options[0].price, sizeLabel: options[0].label };
  }
  return {
    price: product.price,
    sizeLabel: product.size || (isLiquidPerfumeProduct(product) ? '50ml' : ''),
  };
}

export function getProductSizeOptions(product: Product): ProductSizeOption[] {
  const options: ProductSizeOption[] = [];
  const liquid = isLiquidPerfumeProduct(product);

  if (liquid) {
    if (product.price30Ml != null) options.push({ label: '30ml', price: product.price30Ml });
    if (product.price50Ml != null) options.push({ label: '50ml', price: product.price50Ml });
    if (product.price100Ml != null) options.push({ label: '100ml', price: product.price100Ml });
  }
  if (product.priceGel != null) options.push({ label: SIZE_PERFUME_GEL, price: product.priceGel });
  if (product.priceAttar != null) options.push({ label: SIZE_ATTAR, price: product.priceAttar });
  if (product.priceCarPerfume != null) {
    options.push({ label: SIZE_CAR_PERFUME, price: product.priceCarPerfume });
  }
  if (options.length > 0) return options;

  // Legacy/demo products with only a single list price
  if (product.price > 0) {
    const fallbackLabel =
      product.size ||
      (liquid ? '50ml' : isNonMlFragranceCategory(product.category) ? product.category : '50ml');
    return [{ label: fallbackLabel, price: product.price }];
  }
  return [];
}

export function getProductSizeAvailability(
  product: Product,
  alcoholStockGm: number | null | undefined,
): ProductSizeAvailability[] {
  const options = getProductSizeOptions(product);
  return options.map(option => {
    const recipe = SIZE_RECIPES[option.label];
    if (!recipe) return { ...option, available: true };
    const oil = product.productOil;
    const alcohol = alcoholStockGm;
    // Only the stocks a recipe actually consumes gate availability.
    const oilOk = recipe.oil <= 0 || (oil != null && oil >= recipe.oil);
    const alcoholOk = recipe.alcohol <= 0 || (alcohol != null && alcohol >= recipe.alcohol);
    return { ...option, available: oilOk && alcoholOk };
  });
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Midnight Oud',
    brand: 'MELADEN',
    price: 285,
    size: '50ml',
    category: 'Eau de Parfum',
    tag: 'NEW',
    image: meladen1,
    gallery: [meladen7, meladen8],
    description: 'A deep, resinous journey through ancient forests. Rich oud wood entwined with smoky incense and warm amber.',
    notes: { top: ['Bergamot', 'Saffron'], heart: ['Oud Wood', 'Rose'], base: ['Amber', 'Musk', 'Sandalwood'] },
    isNew: true,
  },
  {
    id: '2',
    name: 'Blanc Lumière',
    brand: 'MELADEN',
    price: 220,
    size: '50ml',
    category: 'Eau de Parfum',
    image: meladen2,
    gallery: [meladen8, meladen9],
    description: 'A luminous white floral with an airy, powdery heart. Clean, sophisticated, and effortlessly elegant.',
    notes: { top: ['Aldehydes', 'Lemon'], heart: ['White Rose', 'Jasmine', 'Iris'], base: ['White Musk', 'Cedarwood'] },
    isBestseller: true,
  },
  {
    id: '3',
    name: 'Velvet Noir',
    brand: 'MELADEN',
    price: 310,
    size: '50ml',
    category: 'Extrait de Parfum',
    image: meladen3,
    gallery: [meladen9, meladen10],
    description: 'Opulent and mysterious. Dark plum and black rose unfold over a base of vetiver and leather.',
    notes: { top: ['Black Pepper', 'Plum'], heart: ['Black Rose', 'Patchouli'], base: ['Vetiver', 'Leather', 'Benzoin'] },
    isNew: true,
  },
  {
    id: '4',
    name: 'Rose Atelier',
    brand: 'MELADEN',
    price: 195,
    size: '50ml',
    category: 'Eau de Parfum',
    image: meladen4,
    gallery: [meladen10, meladen11],
    description: 'The quintessential rose — dewy, fresh, and alive. A modern interpretation of the classic floral.',
    notes: { top: ['Lychee', 'Peach'], heart: ['Damask Rose', 'Peony'], base: ['Musk', 'Amber'] },
    isBestseller: true,
  },
  {
    id: '5',
    name: 'Cedar & Smoke',
    brand: 'MELADEN',
    price: 265,
    size: '50ml',
    category: 'Eau de Parfum',
    image: meladen5,
    gallery: [meladen11, meladen12],
    description: 'Rugged yet refined. Smoky cedarwood meets cool vetiver in a scent built for quiet confidence.',
    notes: { top: ['Cardamom', 'Grapefruit'], heart: ['Cedarwood', 'Guaiac Wood'], base: ['Vetiver', 'Smoke', 'Musk'] },
  },
  {
    id: '6',
    name: 'Soleil d\'Or',
    brand: 'MELADEN',
    price: 240,
    size: '50ml',
    category: 'Eau de Parfum',
    tag: 'NEW',
    image: meladen6,
    gallery: [meladen12, meladen13],
    description: 'Sun-drenched citrus and golden mimosa. A radiant, joyful fragrance that captures the warmth of golden hour.',
    notes: { top: ['Neroli', 'Mandarin'], heart: ['Mimosa', 'Ylang-Ylang'], base: ['Vanilla', 'Sandalwood'] },
    isNew: true,
  },
];

export const collections = [
  { id: 'signature', name: 'Signature', description: 'Our founding collection' },
  { id: 'atelier', name: 'Atelier', description: 'Artisan limited editions' },
  { id: 'noir', name: 'Noir', description: 'Dark & mysterious' },
];
