import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { fadeUp } from '../animations/variants';

interface ProductCardProps {
  product: Product;
  index?: number;
  /** `contain` keeps full bottle visible on dark cards (e.g. homepage grids). */
  imageLayout?: 'cover' | 'contain';
}

export default function ProductCard({ product, index = 0, imageLayout = 'cover' }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      className="flex-shrink-0 w-[160px] lg:w-full cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Image — dark card */}
      <div
        className={`relative w-full h-[200px] lg:h-[280px] bg-[#121212] rounded-2xl overflow-hidden mb-3 border border-[#2a2a2a] ${imageLayout === 'contain' ? 'flex items-center justify-center' : ''}`}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <motion.img
          src={product.image}
          alt={product.name}
          className={
            imageLayout === 'contain'
              ? 'max-h-[88%] max-w-[88%] w-auto h-auto object-contain object-center'
              : 'w-full h-full object-cover object-center'
          }
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Tag — gold */}
        {product.tag && (
          <span className="absolute top-2.5 left-2.5 bg-[#c9a84c] text-black text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full">
            {product.tag}
          </span>
        )}

        {/* Wishlist */}
        <motion.button
          className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setWished(w => !w); }}
          whileTap={{ scale: 1.2 }}
          transition={{ duration: 0.15 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={wished ? '#c9a84c' : 'none'}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={wished ? '#c9a84c' : '#888'} strokeWidth="1.5"/>
          </svg>
        </motion.button>

        {/* Add to bag on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#c9a84c] text-black text-[10px] font-semibold tracking-widest uppercase py-2 rounded-xl"
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            >
              Add to Bag
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div onClick={() => navigate(`/product/${product.id}`)}>
        <p className="text-[10px] text-[#888] tracking-widest uppercase mb-0.5">{product.category}</p>
        <p className="font-serif text-sm font-medium text-[#b8b3ac] leading-tight mb-1">{product.name}</p>
        <p className="text-sm text-[#b8b3ac] font-medium">${product.price}</p>
      </div>
    </motion.div>
  );
}
