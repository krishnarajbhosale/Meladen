interface StarRatingProps {
  /** Rating value out of 5 (e.g. 4.7 → last star 70% filled). */
  score: number;
  /** Extra container classes for size/gap/justify (e.g. "text-base gap-0.5"). */
  className?: string;
  /** Colour class for the filled portion. */
  filledClass?: string;
  /** Colour class for the empty portion. */
  emptyClass?: string;
}

/** Five stars with fractional fill based on `score` (so 4.7 shows a 70%-filled 5th star). */
export default function StarRating({
  score,
  className = '',
  filledClass = 'text-gold',
  emptyClass = 'text-[#444]',
}: StarRatingProps) {
  return (
    <span
      className={`inline-flex leading-none ${className}`}
      role="img"
      aria-label={`${Math.round(score * 10) / 10} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, score - i));
        return (
          <span key={i} className="relative inline-block" aria-hidden>
            <span className={emptyClass}>★</span>
            {fill > 0 && (
              <span
                className={`absolute inset-0 overflow-hidden whitespace-nowrap ${filledClass}`}
                style={{ width: `${fill * 100}%` }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
