import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import Accordion from '../components/Accordion';
import Button from '../components/Button';
import QuantityStepper from '../components/QuantityStepper';
import { pageVariants, fadeUp } from '../animations/variants';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-brand-gray">Product not found.</p>
    </div>
  );

  const images = [product.image, product.gallery[0], product.gallery[1]];

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">

      {/* Back */}
      <div className="px-5 lg:px-16 xl:px-24 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-gray text-sm hover:text-brand-dark transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>

      {/* ── MAIN CONTENT: 2-col on desktop ── */}
      <div className="px-5 lg:px-16 xl:px-24 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start pb-12">

        {/* LEFT — Gallery */}
        <div>
          <div className="relative h-[340px] lg:h-[580px] rounded-3xl overflow-hidden bg-brand-light-gray mb-3">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </AnimatePresence>
          </div>

          {/* Thumbnails row */}
          <div className="flex gap-3 mb-5">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                  activeImg === i ? 'border-brand-dark' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Dot indicators — mobile only */}
          <div className="flex justify-center gap-2 mb-5 lg:hidden">
            {images.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveImg(i)}
                animate={{ width: activeImg === i ? 20 : 6, opacity: activeImg === i ? 1 : 0.35 }}
                transition={{ duration: 0.25 }}
                className="h-1.5 bg-brand-dark rounded-full"
              />
            ))}
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="lg:pt-4">
          <motion.p variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="text-[10px] text-brand-gray tracking-[0.2em] uppercase mb-1">
            {product.category}
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="font-serif text-3xl lg:text-5xl font-medium text-brand-dark mb-2">
            {product.name}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-xl lg:text-2xl font-medium text-brand-dark mb-5">
            ${product.price}
            <span className="text-sm text-brand-gray font-normal ml-2">{product.size}</span>
          </motion.p>
          <motion.p variants={fadeUp} custom={3} initial="hidden" animate="visible"
            className="text-sm lg:text-base text-brand-gray leading-relaxed mb-8">
            {product.description}
          </motion.p>

          {/* Qty + Add */}
          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
            className="flex items-center gap-3 mb-10">
            <QuantityStepper value={qty} onChange={setQty} />
            <Button onClick={handleAdd} fullWidth className="flex-1">
              {added ? '✓ Added to Bag' : 'Add to Bag'}
            </Button>
          </motion.div>

          {/* Accordions */}
          <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible">
            <Accordion title="Fragrance Notes">
              <div className="space-y-2">
                {(['top', 'heart', 'base'] as const).map(layer => (
                  <div key={layer}>
                    <span className="text-[10px] tracking-widest uppercase text-brand-dark font-medium">{layer} notes: </span>
                    <span>{product.notes[layer].join(', ')}</span>
                  </div>
                ))}
              </div>
            </Accordion>
            <Accordion title="How to Apply">
              <p>Apply to pulse points — wrists, neck, and behind the ears. Hold the bottle 15cm from skin and spray 2–3 times. Layer with our matching body lotion for lasting intensity.</p>
            </Accordion>
            <Accordion title="Ingredients & Safety">
              <p>All Meladen fragrances are IFRA compliant and dermatologically tested. Free from parabens, phthalates, and artificial colorants. Full ingredient list available on request.</p>
            </Accordion>
            <Accordion title="Shipping & Returns">
              <p>Free shipping on orders over $150. Standard delivery 3–5 business days. Returns accepted within 30 days of purchase for unopened items.</p>
            </Accordion>
          </motion.div>
        </div>
      </div>

      {/* ── RELATED ── */}
      <section className="px-5 lg:px-16 xl:px-24 pt-4 pb-16 border-t border-brand-beige">
        <h3 className="font-serif text-xl lg:text-3xl font-medium text-brand-dark mb-6 pt-10">You May Also Like</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.filter(p => p.id !== id).slice(0, 4).map((p) => (
            <div key={p.id} className="cursor-pointer group" onClick={() => navigate(`/product/${p.id}`)}>
              <div className="h-[170px] lg:h-[260px] rounded-2xl overflow-hidden bg-brand-light-gray mb-3">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="font-serif text-sm lg:text-base font-medium text-brand-dark leading-tight">{p.name}</p>
              <p className="text-xs lg:text-sm text-brand-gray mt-0.5">${p.price}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
