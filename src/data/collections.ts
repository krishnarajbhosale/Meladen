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
    slug: 'perfume',
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
