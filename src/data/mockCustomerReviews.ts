import avatar1 from '../assets/1.jpeg';
import avatar2 from '../assets/3.jpeg';
import avatar3 from '../assets/4.jpeg';

export type CustomerReviewDisplay = {
  id: number | string;
  reviewerName: string;
  reviewText: string;
  sortOrder: number;
  photoUrl: string;
};

export const MOCK_CUSTOMER_REVIEWS: CustomerReviewDisplay[] = [
  {
    id: 'mock-r1',
    reviewerName: 'Priya S.',
    reviewText:
      'The sillage is incredible — I get compliments hours after a light spray. Feels truly luxury without the markup.',
    sortOrder: 0,
    photoUrl: avatar1,
  },
  {
    id: 'mock-r2',
    reviewerName: 'Arjun M.',
    reviewText:
      'Packaging arrived pristine and the scent profile matches the description perfectly. Already on my second bottle.',
    sortOrder: 1,
    photoUrl: avatar2,
  },
  {
    id: 'mock-r3',
    reviewerName: 'Neha K.',
    reviewText:
      'Subtle, long-lasting, and elegant. Méladen has become my go-to for everyday wear and special evenings alike.',
    sortOrder: 2,
    photoUrl: avatar3,
  },
];
