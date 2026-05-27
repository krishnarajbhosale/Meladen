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
      className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#111111] shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.01] lg:rounded-3xl"
    >
      <div className="relative h-[180px] sm:h-[220px] lg:h-[260px]">
        <img
          src={collection.image}
          alt={collection.title}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      <div className="border-t border-[#2a2a2a] px-6 py-5 sm:px-8 lg:px-12">
        <h3 className="font-serif text-xl font-medium text-brand-dark sm:text-2xl">
          {collection.title}
        </h3>
        <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-brand-gray sm:text-xs lg:text-sm">
          {collection.subtitle}
        </p>
        <span className="mt-4 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-brand-dark opacity-70 transition-opacity duration-300 group-hover:opacity-100">
          Shop collection →
        </span>
      </div>
    </Link>
  );
}
