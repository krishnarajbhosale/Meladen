import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { fadeUp } from '../animations/variants';

interface ProductCardProps {
  product: Product;
  index?: number;
  /** `contain` keeps full bottle visible on dark cards (e.g. homepage grids). */
  imageLayout?: 'cover' | 'contain';
  cardClassName?: string;
  /** `dark` = text for cards on dark sections (e.g. product detail rail). */
  tone?: 'light' | 'dark';
}

export default function ProductCard({
  product,
  index = 0,
  imageLayout = 'cover',
  cardClassName = 'w-[160px] lg:w-full',
  tone = 'light',
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const metaClass = tone === 'dark' ? 'text-white/45' : 'text-[#888]';
  const titleClass = tone === 'dark' ? 'text-[#ece8e0]' : 'text-[#b8b3ac]';
  const priceClass = tone === 'dark' ? 'text-[#d4cfc6]' : 'text-[#b8b3ac]';

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      className={`group flex min-w-0 max-w-full flex-shrink-0 flex-col cursor-pointer transition-transform duration-300 ease-in-out hover:scale-[1.02] ${cardClassName}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Image — dark card */}
      <div
        className={`relative mb-3 h-[200px] w-full min-w-0 overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#121212] lg:h-[280px] ${imageLayout === 'contain' ? 'flex items-center justify-center' : ''}`}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <motion.img
          src={product.image}
          alt={product.name}
          className={
            imageLayout === 'contain'
              ? 'max-h-[88%] max-w-[88%] h-auto w-auto object-contain object-center'
              : 'h-full w-full object-cover object-center'
          }
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />

        {product.inspiredBy && (
          <span
            className="absolute left-2.5 top-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-[#c9a84c] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-black shadow-sm"
            title={product.inspiredBy}
          >
            {product.inspiredBy}
          </span>
        )}

        {/* Add to bag: always on touch / small screens; hover-only on md+ */}
        <button
          type="button"
          className="absolute bottom-2.5 left-2.5 right-2.5 rounded-xl bg-[#c9a84c] py-2 text-[10px] font-semibold uppercase tracking-widest text-black opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
          onClick={e => {
            e.stopPropagation();
            addToCart(product);
          }}
        >
          Add to Bag
        </button>
      </div>

      {/* Info */}
      <div className="min-w-0 max-w-full px-0.5" onClick={() => navigate(`/product/${product.id}`)}>
        <p className={`mb-0.5 truncate text-[10px] uppercase tracking-widest ${metaClass}`}>{product.category}</p>
        <p className={`mb-1 line-clamp-2 font-serif text-sm font-medium leading-tight ${titleClass}`}>{product.name}</p>
        <p className={`text-sm font-medium ${priceClass}`}>${product.price}</p>
      </div>
    </motion.div>
  );
}
