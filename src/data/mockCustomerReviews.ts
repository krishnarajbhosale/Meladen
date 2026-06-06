import avatar1 from '../assets/1.jpeg';
import avatar2 from '../assets/3.jpeg';
import avatar3 from '../assets/4.jpeg';
import avatar4 from '../assets/5.jpeg';
import attarImg from '../assets/WhatsApp Image 2026-05-23 at 10.56.51 AM.jpeg';
import { meladen6, meladen8, meladen11 } from './meladenImages';

export type CustomerReviewDisplay = {
  id: number | string;
  reviewerName: string;
  reviewText: string;
  sortOrder: number;
  photoUrl: string;
  /** 4 or 5 stars. Omitted on API rows — a stable value is derived from id. */
  starRating?: number;
};

export function resolveReviewStarRating(review: CustomerReviewDisplay): number {
  if (review.starRating === 4 || review.starRating === 5) {
    return review.starRating;
  }
  let hash = 0;
  for (const ch of String(review.id)) {
    hash = (hash + ch.charCodeAt(0)) % 997;
  }
  return hash % 2 === 0 ? 5 : 4;
}

export const MOCK_CUSTOMER_REVIEWS: CustomerReviewDisplay[] = [
  {
    id: 'mock-r1',
    reviewerName: 'Priya S.',
    reviewText:
      'The sillage is incredible — I get compliments hours after a light spray. Feels truly luxury without the markup.',
    sortOrder: 0,
    photoUrl: avatar1,
    starRating: 5,
  },
  {
    id: 'mock-r2',
    reviewerName: 'Arjun M.',
    reviewText:
      'Packaging arrived pristine and the scent profile matches the description perfectly. Already on my second bottle.',
    sortOrder: 1,
    photoUrl: avatar2,
    starRating: 5,
  },
  {
    id: 'mock-r3',
    reviewerName: 'Neha K.',
    reviewText:
      'Subtle, long-lasting, and elegant. Méladen has become my go-to for everyday wear and special evenings alike.',
    sortOrder: 2,
    photoUrl: avatar3,
    starRating: 4,
  },
  {
    id: 'mock-r4',
    reviewerName: 'Rahul V.',
    reviewText:
      'Bought two fragrances for gifting — both were loved. The bottles look premium and the scents stay on clothes all day.',
    sortOrder: 3,
    photoUrl: avatar4,
    starRating: 5,
  },
  {
    id: 'mock-r5',
    reviewerName: 'Ananya T.',
    reviewText:
      'Warm, rich, and not overpowering. Exactly the kind of attar I wanted for evenings. Will order again soon.',
    sortOrder: 4,
    photoUrl: attarImg,
    starRating: 4,
  },
  {
    id: 'mock-r6',
    reviewerName: 'Karan D.',
    reviewText:
      'Fast delivery, beautiful presentation, and the fragrance lasts from morning meetings through dinner. Highly recommend.',
    sortOrder: 5,
    photoUrl: meladen6,
    starRating: 5,
  },
  {
    id: 'mock-r7',
    reviewerName: 'Meera P.',
    reviewText:
      'Love how unique each scent feels. My husband noticed immediately — said it smells like a high-end boutique find.',
    sortOrder: 6,
    photoUrl: meladen8,
    starRating: 4,
  },
  {
    id: 'mock-r8',
    reviewerName: 'Vikram S.',
    reviewText:
      'Great value for the quality. The 30ml size is perfect to try something new without committing to a huge bottle.',
    sortOrder: 7,
    photoUrl: meladen11,
    starRating: 5,
  },
];
