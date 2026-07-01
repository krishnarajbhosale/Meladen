import collectionPerfume from '../assets/3.jpeg';
import collectionAttars from '../assets/WhatsApp Image 2026-05-23 at 10.56.51 AM.jpeg';
import collectionPerfumeGel from '../assets/1.jpeg';
import collectionBodyHairMist from '../assets/4.jpeg';
import collectionCarFragrance from '../assets/5.jpeg';

export type HomeCollection = {
  title: string;
  subtitle: string;
  image: string;
  /** URL hash on /collection — must match slugified category name from admin */
  slug: string;
};

export const HOME_COLLECTIONS: HomeCollection[] = [
  {
    title: 'Perfume',
    subtitle: 'The essence of luxury—a signature of elegance, bottled just for you.',
    image: collectionPerfume,
    slug: 'perfumes',
  },
  {
    title: 'Attars',
    subtitle: 'Pure & timeless—the rich heritage of concentrated oils.',
    image: collectionAttars,
    slug: 'attars',
  },
  {
    title: 'Perfume Gel',
    subtitle: 'A new touch of fragrance—smooth, lasting, and perfectly intimate.',
    image: collectionPerfumeGel,
    slug: 'perfume-gel',
  },
  {
    title: 'Body And Hair Mist',
    subtitle: 'A refreshing aura—a gentle whisper of scent for everyday grace.',
    image: collectionBodyHairMist,
    slug: 'body-and-hair-mist',
  },
  {
    title: 'Car Fragrance',
    subtitle: 'Drive in elegance—elevate every journey with premium aromas.',
    image: collectionCarFragrance,
    slug: 'car-fragrance',
  },
];

export function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Normalize slug for loose matching (perfume ↔ perfumes). */
function normalizeCategorySlug(slug: string): string {
  let s = slug.toLowerCase().trim();
  if (s.endsWith('s') && s.length > 3) s = s.slice(0, -1);
  return s;
}

/** True when a homepage or URL slug refers to the same category as the API section. */
export function categorySlugMatches(
  requested: string,
  sectionSlug: string,
  sectionTitle?: string,
): boolean {
  const r = requested.toLowerCase().trim();
  if (!r) return true;
  const candidates = [sectionSlug, sectionTitle ? slugifyCategoryName(sectionTitle) : '']
    .filter(Boolean)
    .map(s => s.toLowerCase());
  if (candidates.some(c => c === r)) return true;
  const rn = normalizeCategorySlug(r);
  return candidates.some(c => normalizeCategorySlug(c) === rn);
}

/** Pick the API category slug for a homepage collection card. */
export function resolveHomeCollectionSlug(
  homeSlug: string,
  apiCategories: { slug: string; name: string }[],
): string {
  const hit = apiCategories.find(c => categorySlugMatches(homeSlug, c.slug, c.name));
  return hit?.slug ?? homeSlug;
}

/** Bento "Our Specials" → collection filters (admin product fields). */
export type BentoProductFilter =
  | { kind: 'idealFor'; value: string; label: string }
  | { kind: 'mood'; value: string; label: string }
  | { kind: 'premium'; label: string };

export const BENTO_PRODUCT_FILTERS = {
  men: { kind: 'idealFor', value: 'Men', label: "Men's" } as const,
  women: { kind: 'idealFor', value: 'Women', label: "Women's" } as const,
  unisex: { kind: 'idealFor', value: 'Unisex', label: 'Unisex' } as const,
  luxury: { kind: 'premium', label: 'Luxury' } as const,
};

/** Navbar dropdown — same filters and order as the homepage bento grid. */
export const NAV_SHOP_CATEGORIES: BentoProductFilter[] = [
  BENTO_PRODUCT_FILTERS.men,
  BENTO_PRODUCT_FILTERS.luxury,
  BENTO_PRODUCT_FILTERS.women,
  BENTO_PRODUCT_FILTERS.unisex,
];

export function bentoFilterKey(filter: BentoProductFilter): string {
  if (filter.kind === 'idealFor') return `idealFor-${filter.value}`;
  if (filter.kind === 'mood') return `mood-${filter.value}`;
  return 'premium';
}

export function buildBentoCollectionUrl(filter: BentoProductFilter): string {
  const params = new URLSearchParams();
  if (filter.kind === 'idealFor') params.set('idealFor', filter.value);
  else if (filter.kind === 'mood') params.set('mood', filter.value);
  else params.set('premium', '1');
  return `/collection?${params.toString()}`;
}

function normalizeProductField(value: string): string {
  return value.trim().toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ');
}

/** Split admin text like "Women, Unisex" or "Men / Women" into match tokens. */
function productFieldTokens(value: string): string[] {
  const normalized = normalizeProductField(value);
  if (!normalized) return [];
  return normalized
    .split(/[,;/|+]+|\band\b/)
    .map(part => part.replace(/^for\s+/, '').trim())
    .filter(Boolean);
}

function genderTokenMatches(part: string, target: string): boolean {
  if (part === target) return true;
  if (target === 'women' && (part === 'woman' || part === 'womens')) return true;
  if (target === 'men' && (part === 'man' || part === 'mens')) return true;
  return false;
}

/** True when two admin category2 values refer to the same sub-category (case-insensitive). */
export function category2Matches(
  productValue: string | undefined,
  targetValue: string | undefined,
): boolean {
  if (!productValue?.trim() || !targetValue?.trim()) return false;
  return normalizeProductField(productValue) === normalizeProductField(targetValue);
}

/** Match admin idealFor / mood text to a bento filter value (case-insensitive, whole-word). */
export function productFieldMatches(value: string | undefined, target: string): boolean {
  if (!value?.trim() || !target?.trim()) return false;
  const t = normalizeProductField(target);
  const tokens = productFieldTokens(value);
  if (tokens.length === 0) {
    return normalizeProductField(value) === t;
  }
  return tokens.some(part => genderTokenMatches(part, t) || part === t);
}

/** Bento "Luxury" tile: concentration is Premium/Luxury OR mood is Luxury. */
export function matchesLuxuryBentoFilter(product: {
  concentration?: string;
  mood?: string;
  isPremium?: boolean;
}): boolean {
  if (product.isPremium) return true;
  if (productFieldMatches(product.concentration, 'premium')) return true;
  if (productFieldMatches(product.concentration, 'luxury')) return true;
  if (productFieldMatches(product.mood, 'luxury')) return true;
  return false;
}
