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
