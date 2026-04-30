import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, getProductSizeAvailability, type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import Accordion from '../components/Accordion';
import Button from '../components/Button';
import HorizontalProductRail from '../components/HorizontalProductRail';
import QuantityStepper from '../components/QuantityStepper';
import { pageVariants, fadeUp } from '../animations/variants';
import { apiProductToProduct, fetchCategoriesWithProducts, fetchPublicProduct, fetchPublicStock } from '../api/catalog';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState('50ml');
  const [alcoholStockGm, setAlcoholStockGm] = useState<number | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setProduct(null);
      try {
        if (id) {
          const localProduct = products.find(p => p.id === id) ?? null;
          // Static/demo product ids (e.g. "1", "2") should not hit API endpoints.
          if (/^\d+$/.test(id) && localProduct) {
            if (!cancelled) setProduct(localProduct);
            return;
          }
          const api = await fetchPublicProduct(id);
          if (!cancelled) setProduct(apiProductToProduct(api));
        }
      } catch {
        if (!cancelled) setProduct(products.find(p => p.id === id) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stock = await fetchPublicStock();
        if (!cancelled) setAlcoholStockGm(stock.alcoholStockGm);
      } catch {
        if (!cancelled) setAlcoholStockGm(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategoriesWithProducts();
        if (cancelled) return;
        const fromApi = data.flatMap(section => section.products.map(apiProductToProduct));
        setCatalogProducts(fromApi.length > 0 ? fromApi : products);
      } catch {
        if (!cancelled) setCatalogProducts(products);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedSizeLabel('50ml');
    setQty(1);
    setActiveImg(0);
    setAdded(false);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const options = getProductSizeAvailability(product, alcoholStockGm);
    const selected = options.find(option => option.label === selectedSizeLabel);
    const firstAvailable = options.find(option => option.available);
    if ((!selected || !selected.available) && firstAvailable) {
      setSelectedSizeLabel(firstAvailable.label);
    }
  }, [product, alcoholStockGm, selectedSizeLabel]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-brand-gray">Loading…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-brand-gray">Product not found.</p>
      </div>
    );
  }

  const images = [
    product.image,
    product.gallery[0] ?? product.image,
    product.gallery[1] ?? product.gallery[0] ?? product.image,
    product.gallery[2] ?? product.gallery[1] ?? product.gallery[0] ?? product.image,
  ];
  const sizeOptions = getProductSizeAvailability(product, alcoholStockGm);
  const firstAvailable = sizeOptions.find(option => option.available) ?? null;
  const selectedSize = sizeOptions.find(option => option.label === selectedSizeLabel) ?? firstAvailable ?? sizeOptions[1] ?? sizeOptions[0];
  const selectedUnavailable = selectedSize ? !selectedSize.available : true;

  const handleAdd = () => {
    if (!selectedSize || selectedUnavailable) return;
    for (let i = 0; i < qty; i++) {
      addToCart(product, selectedSize.label, selectedSize.price);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sourceProducts = catalogProducts.length > 0 ? catalogProducts : products;
  const normalizedCategory2 = (product.category2 ?? '').trim().toLowerCase();
  const relatedProducts = sourceProducts
    .filter(p => p.id !== id)
    .filter(p => {
      if (!normalizedCategory2) return false;
      return (p.category2 ?? '').trim().toLowerCase() === normalizedCategory2;
    });

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
                className="h-full w-full object-contain p-3"
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
                <img src={img} alt="" className="h-full w-full object-contain bg-brand-light-gray p-1" />
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
            <div className="grid grid-cols-3 gap-2.5">
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
                    disabled={!option.available}
                    onClick={() => setSelectedSizeLabel(option.label)}
                    className={`flex min-h-[112px] flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition-all duration-300 ${
                      isActive
                        ? 'border-brand-dark bg-brand-beige text-brand-dark shadow-[0_14px_30px_rgba(184,179,172,0.16)]'
                        : option.available
                          ? 'border-[#2a2a2a] bg-brand-light-gray text-brand-gray hover:border-brand-dark hover:bg-[#f3ede2]'
                          : 'border-[#2a2a2a] bg-brand-light-gray text-brand-gray'
                    }`}
                  >
                    {badge && (
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-brand-sage/35 bg-brand-sage/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-brand-sage">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-sage" />
                        {badge}
                      </span>
                    )}
                    {!badge && <span className="mb-[18px] block" aria-hidden="true" />}
                    <span className="block w-full text-center text-sm font-medium">{option.label}</span>
                    <span className="mt-1 block w-full text-center text-xs">${option.price}</span>
                    {!option.available && (
                      <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-red-700">
                        Out of stock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedUnavailable && (
              <p className="mt-2 text-xs text-red-700">
                Selected size is out of stock. Choose another size.
              </p>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate="visible"
            className="mb-10 flex items-center gap-3"
          >
            <QuantityStepper value={qty} onChange={setQty} />
            <Button onClick={handleAdd} fullWidth className="flex-1" disabled={selectedUnavailable}>
              {selectedUnavailable ? 'Out of Stock' : added ? 'Added to Bag' : 'Add to Bag'}
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

      {relatedProducts.length > 0 && (
        <div className="px-0 pb-16 pt-4 lg:px-12 xl:px-16">
          <HorizontalProductRail
            title="You May Also Like"
            subtitle="More from the same line."
            products={relatedProducts}
            showViewAll={false}
            maxProducts={50}
            tone="dark"
          />
        </div>
      )}
    </motion.div>
  );
}
