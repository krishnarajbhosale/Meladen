import { Link } from 'react-router-dom';
import type { HomeCollection } from '../data/collections';

type Props = {
  collection: HomeCollection;
  index?: number;
  /** Resolved slug from API — falls back to collection.slug */
  categorySlug?: string;
};

export default function CollectionCategoryBanner({ collection, index = 0, categorySlug }: Props) {
  const slug = categorySlug ?? collection.slug;
  return (
    <Link
      to={{ pathname: '/collection', search: `?category=${encodeURIComponent(slug)}` }}
      state={{ scrollToCategory: slug }}
      className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-[#2a2a2a] shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.01] lg:rounded-3xl"
    >
      <img
        src={collection.image}
        alt={collection.title}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        loading={index < 2 ? 'eager' : 'lazy'}
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/55 to-black/15" />
      <div className="relative flex min-h-[148px] items-center px-6 py-6 sm:min-h-[168px] sm:px-8 lg:min-h-[200px] lg:px-12 lg:py-8">
        <div className="max-w-[min(100%,520px)] pr-4">
          <h3 className="font-serif text-2xl font-medium italic leading-tight text-white sm:text-3xl lg:text-4xl">
            {collection.title}
          </h3>
          <p className="mt-2 max-w-md text-[11px] leading-relaxed text-white/75 sm:text-xs lg:text-sm">
            {collection.subtitle}
          </p>
          <span className="mt-4 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-brand-sage opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Shop collection →
          </span>
        </div>
      </div>
    </Link>
  );
}
