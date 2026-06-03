import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, getProductSizeAvailability, type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import Accordion from '../components/Accordion';
import Button from '../components/Button';
import InspiredByBadge from '../components/InspiredByBadge';
import HorizontalProductRail from '../components/HorizontalProductRail';
import QuantityStepper from '../components/QuantityStepper';
import { pageVariants, fadeUp } from '../animations/variants';
import { apiProductToProduct, fetchCategoriesWithProducts, fetchPublicProduct, fetchPublicStock } from '../api/catalog';
import { category2Matches } from '../data/collections';
import { formatInr } from '../utils/currency';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState('');
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
    setQty(1);
    setActiveImg(0);
    setAdded(false);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const options = getProductSizeAvailability(product, alcoholStockGm);
    const pick = options.find(option => option.available) ?? options[0];
    if (pick) setSelectedSizeLabel(pick.label);
  }, [product?.id, alcoholStockGm]);

  useEffect(() => {
    if (!product || !selectedSizeLabel) return;
    const options = getProductSizeAvailability(product, alcoholStockGm);
    const selected = options.find(option => option.label === selectedSizeLabel);
    const firstAvailable = options.find(option => option.available);
    if (selected && !selected.available && firstAvailable) {
      setSelectedSizeLabel(firstAvailable.label);
    }
  }, [product, alcoholStockGm, selectedSizeLabel]);

  const relatedProducts = useMemo(() => {
    if (!id || !product) return [];
    const source = catalogProducts.length > 0 ? catalogProducts : products;
    const targetCategory2 = product.category2?.trim();

    if (targetCategory2) {
      return source
        .filter(p => p.id !== id && category2Matches(p.category2, targetCategory2))
        .slice(0, 10);
    }

    return source.filter(p => p.id !== id && p.category === product.category).slice(0, 10);
  }, [id, product, catalogProducts]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [
      product.image,
      product.gallery[0] ?? product.image,
      product.gallery[1] ?? product.gallery[0] ?? product.image,
      product.gallery[2] ?? product.gallery[1] ?? product.gallery[0] ?? product.image,
    ];
  }, [product]);

  const imageCount = Math.max(galleryImages.length, 1);
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD_PX = 48;

  const showPrevImage = useCallback(() => {
    setActiveImg(i => (i - 1 + imageCount) % imageCount);
  }, [imageCount]);

  const showNextImage = useCallback(() => {
    setActiveImg(i => (i + 1) % imageCount);
  }, [imageCount]);

  const onGalleryTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onGalleryTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX == null) return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) showNextImage();
    else showPrevImage();
  };

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

  const sizeOptions = getProductSizeAvailability(product, alcoholStockGm);
  const firstAvailable = sizeOptions.find(option => option.available) ?? null;
  const selectedSize =
    sizeOptions.find(option => option.label === selectedSizeLabel) ??
    firstAvailable ??
    sizeOptions[0] ??
    null;
  const selectedUnavailable = !selectedSize || !selectedSize.available;
  const sizeGridClass =
    sizeOptions.length <= 1 ? 'grid-cols-1' : sizeOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  const handleAdd = () => {
    if (!selectedSize || selectedUnavailable) return;
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
          <div
            className="relative mb-3 h-[340px] touch-pan-y overflow-hidden rounded-3xl bg-brand-light-gray lg:h-[580px]"
            onTouchStart={onGalleryTouchStart}
            onTouchEnd={onGalleryTouchEnd}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={activeImg}
                src={galleryImages[activeImg]}
                alt={product.name}
                className="h-full w-full object-contain p-3"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                draggable={false}
              />
            </AnimatePresence>

            <InspiredByBadge inspiredBy={product.inspiredBy} className="z-20" />

            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevImage}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 lg:flex"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 lg:flex"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="mb-5 flex gap-3">
            {galleryImages.map((img, i) => (
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
            {galleryImages.map((_, i) => (
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
          {product.inspiredBy?.trim() ? (
            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-2">
              <InspiredByBadge inspiredBy={product.inspiredBy} variant="inline" />
            </motion.div>
          ) : null}
          <motion.h1
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mb-2 font-serif text-3xl font-medium text-brand-dark lg:text-5xl"
          >
            {product.name}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
            className="mb-5 text-xl font-medium text-brand-dark lg:text-2xl"
          >
            {selectedSize ? formatInr(selectedSize.price, 0) : formatInr(product.price, 0)}
            {selectedSize && (
              <span className="ml-2 text-sm font-normal text-brand-gray">{selectedSize.label}</span>
            )}
          </motion.p>
          <motion.p
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate="visible"
            className="mb-8 text-sm leading-relaxed text-[#888] lg:text-base"
          >
            {product.description}
          </motion.p>

          {sizeOptions.length > 0 && (
          <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="mb-8">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-brand-gray">Choose Size</p>
            <div className={`grid gap-2.5 ${sizeGridClass}`}>
              {sizeOptions.map(option => {
                    const isActive = selectedSize?.label === option.label;
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
                    <span className="mt-1 block w-full text-center text-xs">{formatInr(option.price, 0)}</span>
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
          )}

          <motion.div
            variants={fadeUp}
            custom={6}
            initial="hidden"
            animate="visible"
            className="mb-10 flex items-center gap-3"
          >
            <QuantityStepper value={qty} onChange={setQty} />
            <Button onClick={handleAdd} fullWidth className="flex-1" disabled={selectedUnavailable}>
              {selectedUnavailable ? 'Out of Stock' : added ? 'Added to Bag' : 'Add to Bag'}
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} custom={7} initial="hidden" animate="visible">
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
              <div className="space-y-3">
                <p>
                  Spray the perfume from a distance of approximately 6 inches onto your clothing to
                  help prevent oil stains. If you wish to apply it directly to your skin, we
                  recommend performing a patch test first to ensure compatibility with your skin
                  type.
                </p>
                <p>
                  For the best performance and long-lasting fragrance experience, apply 8–10 sprays on
                  your clothes and pulse points.
                </p>
              </div>
            </Accordion>
            <Accordion title="More Information">
              {product.moreInformation?.trim() ? (
                <p className="text-sm leading-relaxed text-[#888]">
                  {product.moreInformation.trim().replace(/\s*\r?\n+\s*/g, ' ')}
                </p>
              ) : (
                <p className="text-sm text-[#888]">No additional information available for this fragrance.</p>
              )}
            </Accordion>
            <Accordion title="Disclaimer">
              <p>
                Our perfumes and fragrance oils are uniquely handcrafted blends, inspired by the spirit of
                renowned designer fragrances, yet created as original and independent compositions. We do not
                have any connection, partnership, or authorization from the brands or manufacturers referenced.
                All trademarks and intellectual property rights remain with their respective owners. These
                references are used only to give customers a clearer idea of the scent direction, helping them
                understand the fragrance profile and what we offer.
              </p>
            </Accordion>
          </motion.div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <HorizontalProductRail
          title="You May Also Like"
          products={relatedProducts}
          showViewAll={false}
          tone="dark"
        />
      )}
    </motion.div>
  );
}
