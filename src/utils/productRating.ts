export type ProductRatingDisplay = {
  starCount: number;
  score: number;
  reviewCount: number;
};

/** Stable pseudo-random rating (4–5 stars) for display on product cards. */
export function resolveProductRating(productId: string): ProductRatingDisplay {
  let hash = 0;
  for (const ch of productId) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 100_000;
  }

  const starCount = hash % 2 === 0 ? 5 : 4;
  const scoreOffset = hash % 4;
  const score =
    starCount === 5
      ? 4.8 + scoreOffset * 0.05
      : 4.4 + scoreOffset * 0.1;
  const reviewCount = 120 + (hash % 880);

  return {
    starCount,
    score: Math.min(5, Math.round(score * 10) / 10),
    reviewCount,
  };
}
