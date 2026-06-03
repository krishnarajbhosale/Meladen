import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { celebPhotoImageSrc, fetchPublicCelebPhotos, type CelebPhotoApi } from '../api/celebPhotos';
import {
  groupCelebPhotos,
  MOCK_CELEB_PHOTOS,
  type CelebPhotoDisplay,
  type CelebPhotoSectionGroup,
} from '../data/mockCelebPhotos';
import { fadeUp } from '../animations/variants';

const SLIDE_MS = 4500;

function toDisplay(row: CelebPhotoApi): CelebPhotoDisplay {
  return {
    id: row.id,
    sectionName: row.sectionName,
    sortOrder: row.sortOrder,
    imageUrl: celebPhotoImageSrc(row),
  };
}

function SectionCarousel({
  section,
  showTitle,
}: {
  section: CelebPhotoSectionGroup;
  showTitle: boolean;
}) {
  const photos = section.photos;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex(current => (current + 1) % photos.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  if (photos.length === 0) return null;

  const active = photos[index] ?? photos[0];

  return (
    <div className="space-y-4">
      {showTitle && (
        <h3 className="font-serif text-xl text-brand-dark lg:text-2xl">{section.sectionName}</h3>
      )}
      <div className="relative overflow-hidden rounded-2xl bg-[#141414]">
        <div className="relative w-full sm:aspect-[16/10] lg:aspect-[21/9]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={String(active.id)}
              src={active.imageUrl}
              alt={section.sectionName}
              className="block w-full h-auto max-h-[min(85vh,720px)] object-contain object-center sm:absolute sm:inset-0 sm:h-full sm:max-h-none sm:object-cover"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/50 via-transparent to-black/15 sm:block" />
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setIndex(i => (i - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setIndex(i => (i + 1) % photos.length)}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {photos.map((photo, i) => (
                <button
                  key={String(photo.id)}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CelebPhotosSection() {
  const [items, setItems] = useState<CelebPhotoDisplay[]>(MOCK_CELEB_PHOTOS);
  const [usingApi, setUsingApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicCelebPhotos()
      .then(rows => {
        if (cancelled) return;
        if (rows.length > 0) {
          setItems(rows.map(toDisplay));
          setUsingApi(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems(MOCK_CELEB_PHOTOS);
          setUsingApi(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(() => groupCelebPhotos(items), [items]);
  const multipleSections = sections.length > 1;

  if (sections.length === 0) return null;

  return (
    <section className="mt-10 border-t border-white/10 bg-black px-5 py-12 lg:mt-12 lg:px-10 lg:py-20 xl:px-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-10 text-center lg:mb-12"
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-brand-gray">In the spotlight</p>
          <h2 className="font-serif text-2xl font-medium text-brand-dark lg:text-4xl">Celebrity Moments</h2>
          {!usingApi && (
            <p className="mt-2 text-[10px] uppercase tracking-widest text-brand-gray/80">Preview gallery</p>
          )}
        </motion.div>

        <div className="space-y-12 lg:space-y-16">
          {sections.map(section => (
            <motion.div
              key={section.sectionName}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <SectionCarousel section={section} showTitle={multipleSections} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
