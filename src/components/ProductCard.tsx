import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Product,
  getProductCardListPrice,
  getProductDisplayCategory,
  formatProductSizeDisplay,
} from '../data/products';
import { useCart } from '../context/CartContext';
import { fadeUp } from '../animations/variants';
import { formatInr } from '../utils/currency';
import { resolveProductRating } from '../utils/productRating';
import InspiredByBadge from './InspiredByBadge';
import StarRating from './StarRating';

type AddToBagConfig = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  label?: string;
};

interface ProductCardProps {
  product: Product;
  index?: number;
  cardClassName?: string;
  /** `dark` = text for cards on dark sections (e.g. product detail rail). */
  tone?: 'light' | 'dark';
  /** Horizontal rail: skip entrance motion for smoother touch scrolling. */
  inRail?: boolean;
  /** Collection grid: centered copy, optional notes line, custom add-to-bag. */
  collectionLayout?: boolean;
  /** Show star rating line (e.g. Best Sellers rail). */
  showRating?: boolean;
  /** Parent handles layout motion (e.g. collection page). */
  skipEntranceAnimation?: boolean;
  /** Override the image height (e.g. to keep proportions when the card is wider). */
  imageHeightClass?: string;
  addToBag?: AddToBagConfig;
}

export default function ProductCard({
  product,
  index = 0,
  cardClassName = 'w-[160px] lg:w-full',
  tone = 'light',
  inRail = false,
  collectionLayout = false,
  showRating = false,
  skipEntranceAnimation = false,
  imageHeightClass,
  addToBag,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const listPrice = getProductCardListPrice(product);
  const rating = showRating ? resolveProductRating(product.id) : null;
  const effectiveTone = collectionLayout ? 'dark' : tone;
  const metaClass = effectiveTone === 'dark' ? 'text-white/45' : 'text-[#888]';
  const titleClass = effectiveTone === 'dark' ? 'text-[#ece8e0]' : 'text-[#b8b3ac]';
  const priceClass = effectiveTone === 'dark' ? 'text-[#d4cfc6]' : 'text-[#b8b3ac]';

  const rootClass = `group flex min-w-0 max-w-full flex-shrink-0 flex-col cursor-pointer ${
    inRail || collectionLayout ? '' : 'transition-transform duration-300 ease-in-out hover:scale-[1.02]'
  } ${cardClassName}`;

  const imageHeights =
    imageHeightClass ?? (collectionLayout ? 'h-[200px] lg:h-[260px]' : 'h-[200px] lg:h-[280px]');
  const addButtonClass = addToBag?.disabled
    ? 'bg-red-200 text-red-800 cursor-not-allowed'
    : 'btn-gold-glitter';

  const cardContent = (
    <>
      <div
        className={`relative w-full min-w-0 overflow-hidden rounded-2xl ${imageHeights} ${collectionLayout ? '' : ''}`}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {inRail ? (
          <img
            src={product.image}
            alt={product.name}
            className="relative z-0 h-full w-full object-cover object-center transition-transform duration-300 ease-out lg:group-hover:scale-105"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <motion.img
            src={product.image}
            alt={product.name}
            className="relative z-0 h-full w-full object-cover object-center"
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        )}

        <InspiredByBadge inspiredBy={product.inspiredBy} className="z-20" />

        <button
          type="button"
          disabled={addToBag?.disabled}
          className={`absolute bottom-2.5 left-2.5 right-2.5 z-30 rounded-xl py-2 font-semibold uppercase tracking-widest transition-opacity duration-200 ${
            collectionLayout ? 'text-[9px] tracking-widest' : 'text-[10px] tracking-widest'
          } ${addButtonClass} ${
            collectionLayout
              ? 'opacity-0 group-hover:opacity-100'
              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
          }`}
          onClick={e => {
            e.stopPropagation();
            if (addToBag) {
              addToBag.onClick(e);
              return;
            }
            addToCart(product, listPrice.sizeLabel, listPrice.price);
          }}
        >
          {addToBag?.label ?? 'Add to Cart'}
        </button>
      </div>

      <div
        className={collectionLayout ? 'px-4 py-4 text-center' : 'mt-3 min-w-0 max-w-full px-0.5'}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <p
          className={`mb-0.5 truncate uppercase tracking-widest ${metaClass} ${
            collectionLayout ? 'text-[9px] tracking-[0.2em]' : 'text-[10px]'
          }`}
        >
          {getProductDisplayCategory(product)}
        </p>
        <p
          className={`mb-1 line-clamp-2 font-serif font-medium leading-tight ${titleClass} ${
            collectionLayout ? 'text-sm lg:text-base' : 'text-sm'
          }`}
        >
          {product.name}
        </p>
        {rating && (
          <div
            className={`mb-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 ${collectionLayout ? 'justify-center' : ''}`}
            aria-label={`${rating.score} out of 5 stars, ${rating.reviewCount} reviews`}
          >
            <StarRating
              score={rating.score}
              className="text-[11px]"
              emptyClass={effectiveTone === 'dark' ? 'text-white/15' : 'text-[#444]'}
            />
            <span className={`text-[10px] tabular-nums ${metaClass}`}>
              {rating.score.toFixed(1)} ({rating.reviewCount})
            </span>
          </div>
        )}
        {collectionLayout && product.notes.top.length > 0 && (
          <p className="mb-2 truncate text-[10px] text-brand-gray">{product.notes.top.join(', ')}</p>
        )}
        <p className={`text-sm font-medium ${priceClass}`}>
          {formatInr(listPrice.price, 0)}
          <span className={`ml-1.5 text-[10px] font-normal ${metaClass}`}>
            {formatProductSizeDisplay(listPrice.sizeLabel, product)}
          </span>
        </p>
        {collectionLayout && addToBag?.disabled && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-red-400">Out of stock</p>
        )}
      </div>
    </>
  );

  if (inRail || skipEntranceAnimation) {
    return <div className={rootClass}>{cardContent}</div>;
  }

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      className={rootClass}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {cardContent}
    </motion.div>
  );
}
