import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../data/products';
import ProductCard from './ProductCard';
import HomeSectionHeading from './HomeSectionHeading';

interface HorizontalProductRailProps {
  title: string;
  subtitle?: string;
  products: Product[];
  /** When false, omits the trailing “View All” tile (e.g. product detail “You may also like”). Default true. */
  showViewAll?: boolean;
  /** Max cards before View All; default 10. */
  maxProducts?: number;
  /** `dark` matches product detail page background; `light` for homepage. */
  tone?: 'light' | 'dark';
  /** `collections` uses centered uppercase title + sage divider (homepage). */
  headingStyle?: 'default' | 'collections';
  /** Show star rating on each product card. */
  showProductRating?: boolean;
}

const CARD_GAP_PX = 16;

export default function HorizontalProductRail({
  title,
  subtitle,
  products,
  showViewAll = true,
  maxProducts = 10,
  tone = 'light',
  headingStyle = 'default',
  showProductRating = false,
}: HorizontalProductRailProps) {
  const navigate = useNavigate();
  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ active: boolean; startX: number; scrollLeft: number; pointerId: number | null }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: null,
  });

  const getScrollStep = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 204;
    const first = rail.querySelector<HTMLElement>('[data-rail-item]');
    if (!first) return 204;
    return first.offsetWidth + CARD_GAP_PX;
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * getScrollStep(), behavior: 'smooth' });
  };

  const endDrag = useCallback(() => {
    const rail = railRef.current;
    dragState.current.active = false;
    dragState.current.pointerId = null;
    rail?.classList.remove('cursor-grabbing');
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Mouse: use nav buttons / trackpad scroll so product card clicks still work on desktop.
    if (event.pointerType === 'mouse') return;
    if (event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: rail.scrollLeft,
      pointerId: event.pointerId,
    };
    rail.classList.add('cursor-grabbing');
    rail.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const state = dragState.current;
    if (!rail || !state.active || state.pointerId !== event.pointerId) return;
    const delta = event.clientX - state.startX;
    rail.scrollLeft = state.scrollLeft - delta;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId === event.pointerId) {
      endDrag();
      railRef.current?.releasePointerCapture(event.pointerId);
    }
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId === event.pointerId) {
      endDrag();
    }
  };

  const isDark = tone === 'dark';
  const sectionClass = isDark
    ? 'relative mt-10 border-t border-white/10 bg-brand-cream px-1 pb-10 pt-12 sm:px-3 lg:mt-12 lg:px-2 lg:pb-12 lg:pt-14 xl:px-4'
    : 'relative mt-10 border-t border-white/10 bg-brand-cream px-1 pb-10 pt-12 sm:px-3 lg:mt-12 lg:px-2 lg:pb-12 lg:pt-14 xl:px-4';
  const headingClass = isDark
    ? 'font-serif text-[1.4rem] font-medium text-[#f5f0e8] lg:text-3xl'
    : 'font-serif text-[1.4rem] font-medium text-brand-dark lg:text-3xl';
  const subtitleClass = isDark ? 'mt-1 text-[11px] text-white/50' : 'mt-1 text-[11px] text-brand-gray';
  const navOutline = isDark
    ? 'border-white/20 text-white/60 hover:border-white/50 hover:text-white'
    : 'border-brand-beige text-brand-gray hover:border-brand-dark hover:text-brand-dark';
  const navSolid = isDark ? 'bg-[#f5f0e8] text-[#0a0a0a] hover:bg-white' : 'bg-brand-dark text-white hover:bg-brand-dark/80';
  const useCollectionsHeading = headingStyle === 'collections' && !isDark;

  const navButtons = (
    <>
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${navOutline}`}
        aria-label={`Scroll ${title} left`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${navSolid}`}
        aria-label={`Scroll ${title} right`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );

  return (
    <section className={sectionClass}>
      {useCollectionsHeading ? (
        <div className="mb-5 px-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <HomeSectionHeading title={title} subtitle={subtitle} />
          </motion.div>
          <div className="hidden justify-end lg:flex">
            <div className="flex items-center gap-2">{navButtons}</div>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 pr-2">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className={headingClass}
            >
              {title}
            </motion.h2>
            {subtitle && <p className={subtitleClass}>{subtitle}</p>}
          </div>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">{navButtons}</div>
        </div>
      )}

      <div
        ref={railRef}
        data-rail-scroll
        className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain pb-2 pl-1 pr-4 touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] active:cursor-grabbing lg:cursor-default lg:snap-mandatory lg:scroll-smooth [&::-webkit-scrollbar]:hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={endDrag}
        onPointerCancel={onPointerCancel}
      >
        {products.slice(0, maxProducts).map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            data-rail-item
            className="w-[188px] min-w-[188px] max-w-[188px] shrink-0 snap-start lg:w-[220px] lg:min-w-[220px] lg:max-w-[220px]"
          >
            <ProductCard
              product={product}
              index={index}
              tone={tone}
              inRail
              showRating={showProductRating}
              cardClassName="w-full max-w-full"
            />
          </div>
        ))}

        {showViewAll && (
          <button
            type="button"
            data-rail-item
            onClick={() => navigate('/collection')}
            className="flex h-[286px] w-[188px] snap-start flex-shrink-0 flex-col items-center justify-center rounded-[1.75rem] border border-brand-beige bg-brand-light-gray text-center transition-all duration-300 hover:-translate-y-1 lg:h-[368px] lg:w-[220px]"
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark text-brand-cream">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-serif text-xl text-brand-dark">View All</span>
            <span className="mt-2 px-6 text-[11px] leading-relaxed text-brand-gray">
              Explore the full Meladen collection.
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
