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
