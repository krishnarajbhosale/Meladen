import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, getProductSizeOptions } from '../data/products';
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
  const [selectedSizeLabel, setSelectedSizeLabel] = useState('50ml');

  useEffect(() => {
    setSelectedSizeLabel('50ml');
    setQty(1);
    setActiveImg(0);
    setAdded(false);
  }, [id]);

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-brand-gray">Product not found.</p>
      </div>
    );
  }

  const images = [product.image, product.gallery[0], product.gallery[1]];
  const sizeOptions = getProductSizeOptions(product);
  const selectedSize =
    sizeOptions.find(option => option.label === selectedSizeLabel) ?? sizeOptions[1] ?? sizeOptions[0];

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(product, selectedSize.label, selectedSize.price);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div className="px-5 pb-4 pt-6 lg:px-16 xl:px-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-brand-gray transition-colors hover:text-brand-dark"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      </div>

      <div className="px-5 pb-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-16 xl:px-24">
        <div>
          <div className="relative mb-3 h-[340px] overflow-hidden rounded-3xl bg-brand-light-gray lg:h-[580px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={images[activeImg]}
                alt={product.name}
                className="h-full w-full object-cover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </AnimatePresence>
          </div>

          <div className="mb-5 flex gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 lg:h-20 lg:w-20 ${
                  activeImg === i ? 'border-brand-dark' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mb-5 flex justify-center gap-2 lg:hidden">
            {images.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveImg(i)}
                animate={{ width: activeImg === i ? 20 : 6, opacity: activeImg === i ? 1 : 0.35 }}
                transition={{ duration: 0.25 }}
                className="h-1.5 rounded-full bg-brand-dark"
              />
            ))}
          </div>
        </div>

        <div className="lg:pt-4">
          <motion.p
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="mb-1 text-[10px] uppercase tracking-[0.2em] text-brand-gray"
          >
            {product.category}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="mb-2 font-serif text-3xl font-medium text-brand-dark lg:text-5xl"
          >
            {product.name}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mb-5 text-xl font-medium text-brand-dark lg:text-2xl"
          >
            ${selectedSize.price}
            <span className="ml-2 text-sm font-normal text-brand-gray">{selectedSize.label}</span>
          </motion.p>
          <motion.p
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
            className="mb-8 text-sm leading-relaxed text-brand-gray lg:text-base"
          >
            {product.description}
          </motion.p>

          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="mb-8">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Choose Size</p>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map(option => {
                const isActive = selectedSize.label === option.label;
                const badge =
                  option.label === '50ml'
                    ? 'Best Seller'
                    : option.label === '100ml'
                      ? 'Best Saver'
                      : null;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedSizeLabel(option.label)}
                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                      isActive
                        ? 'border-brand-dark bg-brand-beige text-brand-dark'
                        : 'border-[#2a2a2a] bg-brand-light-gray text-brand-gray hover:border-brand-dark'
                    }`}
                  >
                    {badge && (
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-brand-sage/35 bg-brand-sage/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-brand-sage">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-sage" />
                        {badge}
                      </span>
                    )}
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="mt-1 block text-xs">${option.price}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate="visible"
            className="mb-10 flex items-center gap-3"
          >
            <QuantityStepper value={qty} onChange={setQty} />
            <Button onClick={handleAdd} fullWidth className="flex-1">
              {added ? 'Added to Bag' : 'Add to Bag'}
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible">
            <Accordion title="Fragrance Notes">
              <div className="space-y-2">
                {(['top', 'heart', 'base'] as const).map(layer => (
                  <div key={layer}>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-brand-dark">
                      {layer} notes:{' '}
                    </span>
                    <span>{product.notes[layer].join(', ')}</span>
                  </div>
                ))}
              </div>
            </Accordion>
            <Accordion title="How to Apply">
              <p>
                Apply to pulse points, including wrists, neck, and behind the ears. Hold the bottle
                15cm from skin and spray 2-3 times. Layer with our matching body lotion for longer wear.
              </p>
            </Accordion>
            <Accordion title="Ingredients & Safety">
              <p>
                All Meladen fragrances are IFRA compliant and dermatologically tested. Free from
                parabens, phthalates, and artificial colorants. Full ingredient list available on request.
              </p>
            </Accordion>
            <Accordion title="Shipping & Returns">
              <p>
                Free shipping on orders over $150. Standard delivery takes 3-5 business days. Returns
                accepted within 30 days of purchase for unopened items.
              </p>
            </Accordion>
          </motion.div>
        </div>
      </div>

      <section className="border-t border-brand-beige px-5 pb-16 pt-4 lg:px-16 xl:px-24">
        <h3 className="mb-6 pt-10 font-serif text-xl font-medium text-brand-dark lg:text-3xl">
          You May Also Like
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {products
            .filter(p => p.id !== id)
            .slice(0, 4)
            .map(p => (
              <div key={p.id} className="group cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                <div className="mb-3 h-[170px] overflow-hidden rounded-2xl bg-brand-light-gray lg:h-[260px]">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="font-serif text-sm font-medium leading-tight text-brand-dark lg:text-base">{p.name}</p>
                <p className="mt-0.5 text-xs text-brand-gray lg:text-sm">${p.price}</p>
              </div>
            ))}
        </div>
      </section>
    </motion.div>
  );
}
