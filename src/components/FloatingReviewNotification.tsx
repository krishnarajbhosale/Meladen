import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MiniReview = { name: string; text: string };

/** 30 short, single-line reviews shown as floating social proof. */
const MINI_REVIEWS: MiniReview[] = [
  { name: 'Aarav S.', text: 'Lasts all day — incredible projection.' },
  { name: 'Priya M.', text: 'Got so many compliments at work!' },
  { name: 'Rohan K.', text: 'Smells exactly like the original. Love it.' },
  { name: 'Ananya R.', text: 'Packaging felt so premium and elegant.' },
  { name: 'Vikram D.', text: 'Fast delivery and the scent is divine.' },
  { name: 'Sneha P.', text: 'My new signature fragrance, hands down.' },
  { name: 'Karan J.', text: 'Long lasting even in summer heat.' },
  { name: 'Isha T.', text: 'Subtle yet noticeable. Perfect balance.' },
  { name: 'Arjun N.', text: 'Worth every rupee — repurchasing soon.' },
  { name: 'Meera V.', text: 'The longevity genuinely surprised me.' },
  { name: 'Aditya B.', text: 'Bottle looks stunning on my shelf.' },
  { name: 'Riya S.', text: 'Compliment magnet, honestly.' },
  { name: 'Dev P.', text: 'Sophisticated and never overpowering.' },
  { name: 'Nisha G.', text: 'Stayed on my scarf for two days!' },
  { name: 'Kabir M.', text: 'Best perfume I have bought online.' },
  { name: 'Tara A.', text: 'Elegant scent, beautiful sillage.' },
  { name: 'Yash R.', text: 'Ordered again for my brother already.' },
  { name: 'Pooja H.', text: 'Feels luxurious without the luxury price.' },
  { name: 'Sahil K.', text: 'Perfect for date nights — she loved it.' },
  { name: 'Diya L.', text: 'Fresh, clean and incredibly long lasting.' },
  { name: 'Manav S.', text: 'Projection is amazing, fills the room.' },
  { name: 'Kavya N.', text: 'Exactly as described. Very happy.' },
  { name: 'Rahul T.', text: 'Smooth, warm and addictive scent.' },
  { name: 'Simran B.', text: 'My office colleagues keep asking about it.' },
  { name: 'Aryan P.', text: 'Quality is top notch for the price.' },
  { name: 'Neha D.', text: 'Lasted through an entire wedding day.' },
  { name: 'Ishaan V.', text: 'Classy fragrance, super versatile.' },
  { name: 'Anjali M.', text: 'Reordered within a week — that good.' },
  { name: 'Vivaan R.', text: 'Gentle opening, gorgeous dry down.' },
  { name: 'Ritika S.', text: 'Honestly my favourite purchase this year.' },
];

const INITIAL_DELAY_MS = 3500;
const VISIBLE_MS = 5000;
const GAP_MS = 4500;

function pickRandom(exclude: MiniReview | null): MiniReview {
  if (MINI_REVIEWS.length <= 1) return MINI_REVIEWS[0];
  let next = MINI_REVIEWS[Math.floor(Math.random() * MINI_REVIEWS.length)];
  while (exclude && next.name === exclude.name && next.text === exclude.text) {
    next = MINI_REVIEWS[Math.floor(Math.random() * MINI_REVIEWS.length)];
  }
  return next;
}

export default function FloatingReviewNotification() {
  const [current, setCurrent] = useState<MiniReview | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (dismissed) return;
    const clearTimers = () => {
      timers.current.forEach(id => window.clearTimeout(id));
      timers.current = [];
    };

    const cycle = (prev: MiniReview | null) => {
      const next = pickRandom(prev);
      setCurrent(next);
      timers.current.push(
        window.setTimeout(() => {
          setCurrent(null);
          timers.current.push(window.setTimeout(() => cycle(next), GAP_MS));
        }, VISIBLE_MS),
      );
    };

    timers.current.push(window.setTimeout(() => cycle(null), INITIAL_DELAY_MS));
    return clearTimers;
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex justify-start sm:left-auto sm:right-5 sm:bottom-5">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`${current.name}-${current.text}`}
            initial={{ opacity: 0, x: 32, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 32, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-[320px] items-start gap-3 rounded-2xl border border-[#c9a84c]/30 bg-[#141414]/95 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-sage/25 bg-brand-sage/10 text-xs font-semibold text-brand-sage">
              {current.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-[#c9a84c]" aria-hidden>
                ★★★★★
              </p>
              <p className="text-[12px] leading-snug text-[#f5f0e8]">{current.text}</p>
              <p className="mt-0.5 text-[10px] text-brand-gray">
                {current.name} · Verified buyer
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-brand-gray transition-colors hover:text-[#f5f0e8]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
