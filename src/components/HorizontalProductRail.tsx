import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../data/products';
import ProductCard from './ProductCard';

interface HorizontalProductRailProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export default function HorizontalProductRail({
  title,
  subtitle,
  products,
}: HorizontalProductRailProps) {
  const navigate = useNavigate();
  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ active: boolean; startX: number; scrollLeft: number }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });

  const beginDrag = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return;
    dragState.current = {
      active: true,
      startX: clientX,
      scrollLeft: rail.scrollLeft,
    };
    rail.classList.add('cursor-grabbing');
  };

  const updateDrag = (clientX: number) => {
    const rail = railRef.current;
    if (!rail || !dragState.current.active) return;
    const delta = clientX - dragState.current.startX;
    rail.scrollLeft = dragState.current.scrollLeft - delta;
  };

  const endDrag = () => {
    const rail = railRef.current;
    dragState.current.active = false;
    rail?.classList.remove('cursor-grabbing');
  };

  const scrollByCard = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <section className="relative mt-10 border-t border-white/10 bg-brand-cream px-1 pb-10 pt-12 sm:px-3 lg:mt-12 lg:px-2 lg:pb-12 lg:pt-14 xl:px-4">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="font-serif text-[1.4rem] font-medium text-brand-dark lg:text-3xl"
          >
            {title}
          </motion.h2>
          {subtitle && <p className="mt-1 text-[11px] text-brand-gray">{subtitle}</p>}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-beige text-brand-gray transition-all duration-300 hover:border-brand-dark hover:text-brand-dark"
            aria-label={`Scroll ${title} left`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-white transition-all duration-300 hover:bg-brand-dark/80"
            aria-label={`Scroll ${title} right`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onMouseDown={event => beginDrag(event.clientX)}
        onMouseMove={event => updateDrag(event.clientX)}
        onMouseLeave={endDrag}
        onMouseUp={endDrag}
        onTouchStart={event => beginDrag(event.touches[0].clientX)}
        onTouchMove={event => updateDrag(event.touches[0].clientX)}
        onTouchEnd={endDrag}
      >
        {products.slice(0, 10).map((product, index) => (
          <div key={`${product.id}-${index}`} className="snap-start">
            <ProductCard product={product} index={index} imageLayout="contain" cardClassName="w-[188px] lg:w-[220px]" />
          </div>
        ))}

        <button
          type="button"
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
      </div>
    </section>
  );
}
