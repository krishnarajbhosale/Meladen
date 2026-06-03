import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent as ReactTouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  customerReviewPhotoSrc,
  fetchPublicCustomerReviews,
  type CustomerReviewApi,
} from '../api/customerReviews';
import { MOCK_CUSTOMER_REVIEWS, type CustomerReviewDisplay } from '../data/mockCustomerReviews';
import { fadeUp } from '../animations/variants';

const SLIDE_MS = 5500;
const SWIPE_THRESHOLD_PX = 48;

function toDisplay(row: CustomerReviewApi): CustomerReviewDisplay {
  return {
    id: row.id,
    reviewerName: row.reviewerName,
    reviewText: row.reviewText,
    sortOrder: row.sortOrder,
    photoUrl: customerReviewPhotoSrc(row),
  };
}

function ReviewCard({ review }: { review: CustomerReviewDisplay }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-2 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15 sm:h-20 sm:w-20">
        <img
          src={review.photoUrl}
          alt={review.reviewerName}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <p className="font-serif text-lg leading-relaxed text-brand-dark lg:text-xl">
          &ldquo;{review.reviewText}&rdquo;
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gray">
          {review.reviewerName}
        </p>
      </div>
    </div>
  );
}

function ReviewsCarousel({ reviews }: { reviews: CustomerReviewDisplay[] }) {
  const sorted = useMemo(
    () => [...reviews].sort((a, b) => a.sortOrder - b.sortOrder || String(a.id).localeCompare(String(b.id))),
    [reviews],
  );
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const showPrev = useCallback(() => {
    setIndex(current => (current - 1 + sorted.length) % sorted.length);
  }, [sorted.length]);

  const showNext = useCallback(() => {
    setIndex(current => (current + 1) % sorted.length);
  }, [sorted.length]);

  useEffect(() => {
    if (sorted.length <= 1) return;
    const timer = window.setInterval(showNext, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [sorted.length, showNext]);

  const onTouchStart = (event: ReactTouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: ReactTouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX == null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) showNext();
    else showPrev();
  };

  if (sorted.length === 0) return null;

  const active = sorted[index] ?? sorted[0];

  return (
    <div
      className="relative touch-pan-y select-none"
      onTouchStart={sorted.length > 1 ? onTouchStart : undefined}
      onTouchEnd={sorted.length > 1 ? onTouchEnd : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={String(active.id)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <ReviewCard review={active} />
        </motion.div>
      </AnimatePresence>

      {sorted.length > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {sorted.map((review, i) => (
            <button
              key={String(review.id)}
              type="button"
              aria-label={`Show review ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-brand-dark' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<CustomerReviewDisplay[]>(MOCK_CUSTOMER_REVIEWS);
  const [usingApi, setUsingApi] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicCustomerReviews()
      .then(rows => {
        if (cancelled) return;
        if (rows.length > 0) {
          setUsingApi(true);
          setReviews(rows.map(toDisplay));
        } else {
          setUsingApi(false);
          setReviews(MOCK_CUSTOMER_REVIEWS);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setReviews(MOCK_CUSTOMER_REVIEWS);
          setUsingApi(false);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || reviews.length === 0) return null;

  return (
    <section className="mt-10 border-t border-white/10 bg-black px-5 py-12 lg:mt-12 lg:px-10 lg:py-20 xl:px-16">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-10 text-center lg:mb-12">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-brand-gray">Feedback</p>
          <h2 className="font-serif text-2xl font-medium text-brand-dark lg:text-4xl">Reviews &amp; Testimonials</h2>
          {!usingApi && (
            <p className="mt-2 text-[10px] uppercase tracking-widest text-brand-gray/80">Preview reviews</p>
          )}
        </div>

        <div className="min-h-[220px] rounded-2xl border border-white/10 bg-[#141414] px-5 py-10 lg:min-h-[240px] lg:px-12 lg:py-14">
          <ReviewsCarousel reviews={reviews} />
        </div>
      </motion.div>
    </section>
  );
}
