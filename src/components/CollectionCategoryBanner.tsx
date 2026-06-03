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
      aria-label={`${collection.title} collection`}
      className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-[#e8e4dc]/15 transition-opacity duration-200 hover:opacity-95 lg:rounded-3xl"
    >
      <img
        src={collection.image}
        alt={collection.title}
        className="block h-auto w-full"
        loading={index < 2 ? 'eager' : 'lazy'}
        decoding="async"
      />
    </Link>
  );
}
