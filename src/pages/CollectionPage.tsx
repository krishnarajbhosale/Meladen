import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductSizeAvailability, products } from '../data/products';
import { useCart } from '../context/CartContext';
import { pageVariants, fadeUp } from '../animations/variants';
import { apiProductToProduct, fetchCategoriesWithProducts, fetchPublicStock } from '../api/catalog';
import type { CategoryWithProductsApi } from '../api/types';
import type { Product } from '../data/products';
import {
  slugifyCategoryName,
  categorySlugMatches,
  matchesLuxuryBentoFilter,
  productFieldMatches,
} from '../data/collections';
import { formatInr } from '../utils/currency';
import ProductCard from '../components/ProductCard';

const CONCENTRATIONS = ['Eau de Parfum', 'Extrait de Parfum', 'Eau de Toilette'];
const FAMILIES = ['Woody', 'Floral', 'Citrus', 'Oriental'];
const SORT_OPTIONS = ['Featured', 'Price: Low–High', 'Price: High–Low', 'Newest'];
const PER_PAGE = 6;

type CatalogSection = {
  key: string;
  slug: string;
  title: string;
  description: string | null;
  items: Product[];
};

type LocationState = { scrollToCategory?: string };

function resolveCategorySlug(location: ReturnType<typeof useLocation>): string {
  const params = new URLSearchParams(location.search);
  const fromQuery = params.get('category');
  if (fromQuery) return decodeURIComponent(fromQuery).toLowerCase().trim();
  const fromHash = location.hash.replace(/^#/, '');
  if (fromHash) return decodeURIComponent(fromHash).toLowerCase().trim();
  const fromState = (location.state as LocationState | null)?.scrollToCategory;
  if (fromState) return fromState.toLowerCase().trim();
  return '';
}

export default function CollectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [apiCatalog, setApiCatalog] = useState<CategoryWithProductsApi[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [selectedConc, setSelectedConc] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState('Featured');
  const [page, setPage] = useState(1);
  const [alcoholStockGm, setAlcoholStockGm] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCatalogLoading(true);
        const data = await fetchCategoriesWithProducts();
        if (!cancelled) {
          setApiCatalog(data);
          setCatalogError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setApiCatalog(null);
          setCatalogError(e instanceof Error ? e.message : 'Could not load catalog');
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
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

  const useApiLayout = !catalogLoading && apiCatalog != null && apiCatalog.length > 0;

  const sections: CatalogSection[] = useMemo(() => {
    if (catalogLoading) return [];
    if (apiCatalog != null && apiCatalog.length > 0) {
      return apiCatalog.map(row => ({
        key: String(row.category.id),
        slug: row.category.slug,
        title: row.category.name,
        description: row.category.description,
        items: row.products.map(apiProductToProduct),
      }));
    }
    const grouped = new Map<string, Product[]>();
    for (const p of products) {
      const key = p.category || 'Uncategorized';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(p);
    }
    return Array.from(grouped.entries()).map(([title, items], idx) => ({
      key: `static-${idx}-${title}`,
      slug: slugifyCategoryName(title),
      title,
      description: null,
      items,
    }));
  }, [catalogLoading, apiCatalog]);

  const allProducts = useMemo(() => sections.flatMap(s => s.items), [sections]);
  const priceCap = useMemo(() => {
    const maxSeen = allProducts.reduce((m, p) => Math.max(m, p.price || 0), 0);
    const rounded = Math.ceil(maxSeen / 100) * 100;
    return Math.max(400, rounded || 400);
  }, [allProducts]);

  useEffect(() => {
    setMaxPrice(prev => (prev < priceCap ? priceCap : prev));
  }, [priceCap]);

  const activeCategorySlug = useMemo(() => resolveCategorySlug(location), [
    location.pathname,
    location.search,
    location.hash,
    location.state,
  ]);

  const filterIdealFor = useMemo(
    () => searchParams.get('idealFor')?.trim() ?? '',
    [searchParams],
  );
  const filterMood = useMemo(() => searchParams.get('mood')?.trim() ?? '', [searchParams]);
  const filterPremium = useMemo(
    () => searchParams.get('premium') === '1' || searchParams.get('premium')?.toLowerCase() === 'true',
    [searchParams],
  );
  const hasBentoFilter = Boolean(filterIdealFor || filterMood || filterPremium);

  const bentoFilterLabel = useMemo(() => {
    if (filterIdealFor) return filterIdealFor;
    if (filterPremium) return 'Luxury';
    if (filterMood) return filterMood;
    return null;
  }, [filterIdealFor, filterMood, filterPremium]);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const filteredSections: CatalogSection[] = useMemo(() => {
    const familyMatches = (p: Product) => {
      if (selectedFamily.length === 0) return true;
      const mood = (p.mood ?? '').toLowerCase();
      return selectedFamily.some(f => mood.includes(f.toLowerCase()));
    };

    const filterProduct = (p: Product) => {
      if (filterIdealFor && !productFieldMatches(p.idealFor, filterIdealFor)) return false;
      if (filterPremium && !matchesLuxuryBentoFilter(p)) return false;
      if (filterMood && !productFieldMatches(p.mood, filterMood)) return false;
      if (selectedConc.length > 0 && !selectedConc.includes(p.category)) return false;
      if (p.price > maxPrice) return false;
      if (!familyMatches(p)) return false;
      return true;
    };

    const sortProducts = (list: Product[]) => {
      const copy = [...list];
      if (sort === 'Price: Low–High') copy.sort((a, b) => a.price - b.price);
      else if (sort === 'Price: High–Low') copy.sort((a, b) => b.price - a.price);
      else if (sort === 'Newest') copy.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      return copy;
    };

    return sections
      .map(s => ({
        ...s,
        items: sortProducts(s.items.filter(filterProduct)),
      }))
      .filter(s => s.items.length > 0);
  }, [sections, selectedConc, maxPrice, selectedFamily, sort, filterIdealFor, filterMood, filterPremium]);

  const visibleSections = useMemo(() => {
    if (hasBentoFilter) return filteredSections;
    if (!activeCategorySlug) return filteredSections;
    return filteredSections.filter(s => categorySlugMatches(activeCategorySlug, s.slug, s.title));
  }, [filteredSections, activeCategorySlug, hasBentoFilter]);

  const activeSectionTitle = useMemo(() => {
    if (bentoFilterLabel) return bentoFilterLabel;
    if (visibleSections.length === 1) return visibleSections[0].title;
    return null;
  }, [bentoFilterLabel, visibleSections]);

  const filteredFlat = useMemo(() => visibleSections.flatMap(s => s.items), [visibleSections]);

  const totalPages = Math.ceil(filteredFlat.length / PER_PAGE);
  const paginatedFlat = useApiLayout
    ? filteredFlat
    : filteredFlat.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [selectedConc, selectedFamily, maxPrice, sort, useApiLayout, filterIdealFor, filterMood, filterPremium]);

  useEffect(() => {
    if (!activeCategorySlug || catalogLoading || visibleSections.length === 0) return;

    const target = visibleSections[0].slug;
    const scrollToSection = () => {
      const el = document.getElementById(`category-${target}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const timers = [120, 350, 700].map(ms => window.setTimeout(scrollToSection, ms));
    return () => timers.forEach(window.clearTimeout);
  }, [activeCategorySlug, catalogLoading, visibleSections, searchParams]);

  const renderProductCard = (p: Product, i: number) => {
    const availability = getProductSizeAvailability(p, alcoholStockGm);
    const firstAvailable = availability.find(size => size.available);
    const isOutOfStock = !firstAvailable;
    return (
      <motion.div
        key={p.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, delay: i * 0.04 }}
        className="min-w-0"
      >
        <ProductCard
          product={p}
          showRating
          skipEntranceAnimation
          cardClassName="w-full"
          addToBag={{
            disabled: isOutOfStock,
            label: isOutOfStock ? 'Out of Stock' : 'Add to Bag',
            onClick: e => {
              if (!firstAvailable) return;
              addToCart(p, firstAvailable.label, firstAvailable.price);
            },
          }}
        />
      </motion.div>
    );
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="bg-brand-cream min-h-screen">
      <div className="text-center pt-12 pb-10 px-5 border-b border-brand-beige">
        <motion.p
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="text-[9px] text-brand-gray tracking-[0.25em] uppercase mb-3"
        >
          The Signature
        </motion.p>
        <motion.h1
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
          className="font-serif text-4xl lg:text-5xl font-medium text-brand-dark mb-4"
        >
          Signature Collection
        </motion.h1>
        {activeSectionTitle && (
          <motion.p
            variants={fadeUp}
            custom={1.5}
            initial="hidden"
            animate="visible"
            className="mt-2 font-serif text-xl text-brand-sage lg:text-2xl"
          >
            {activeSectionTitle}
          </motion.p>
        )}
        {(activeCategorySlug || hasBentoFilter) && (
          <motion.div variants={fadeUp} custom={1.6} initial="hidden" animate="visible" className="mt-4">
            <Link
              to="/collection"
              className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-gray underline-offset-4 hover:text-brand-dark hover:underline"
            >
              View all products
            </Link>
          </motion.div>
        )}
        <motion.p
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
          className="text-[12px] text-brand-gray max-w-md mx-auto leading-relaxed"
        >
          Explore our curated selection of artisanal fragrances. Each scent is a unique journey, meticulously crafted
          with the finest raw materials from around the world.
        </motion.p>
        {catalogLoading && (
          <p className="mt-4 text-[11px] text-brand-gray">Loading catalog…</p>
        )}
        {catalogError && (
          <p className="mt-4 text-[11px] text-amber-800">
            {catalogError} — showing offline sample products. Start the API on port 8080 to use live data.
          </p>
        )}
      </div>

      <div className="border-b border-brand-beige bg-brand-cream px-5 py-3 lg:px-10 xl:px-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {selectedConc.map(c => (
            <span key={c} className="flex items-center gap-1 text-[10px] bg-brand-dark text-brand-cream rounded-full px-3 py-1">
              {c}
              <button type="button" onClick={() => setSelectedConc(prev => prev.filter(v => v !== c))}>
                ×
              </button>
            </span>
          ))}
          <div className="hidden lg:flex items-center gap-2">
            {['Eau de Parfum', 'New Arrivals', 'Bestsellers'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedConc(prev => toggle(prev, f))}
                className={`text-[10px] tracking-wide rounded-full px-3 py-1.5 border transition-colors ${
                  selectedConc.includes(f)
                    ? 'bg-brand-dark text-brand-cream border-brand-dark'
                    : 'border-brand-beige text-brand-gray hover:border-brand-dark hover:text-brand-dark'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-brand-gray tracking-wide hidden lg:inline">Sort by</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-[10px] text-brand-dark bg-transparent border border-brand-beige rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-brand-dark transition-colors"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-5 lg:px-10 xl:px-16 pt-8 pb-16">
        <div className="flex-1 space-y-14">
          <p className="text-[11px] text-brand-gray mb-2">
            {filteredFlat.length} product{filteredFlat.length === 1 ? '' : 's'}
            {hasBentoFilter && filterIdealFor && (
              <span className="text-brand-dark"> · Ideal for: {filterIdealFor}</span>
            )}
            {hasBentoFilter && filterMood && <span className="text-brand-dark"> · Mood: {filterMood}</span>}
          </p>

          {filteredFlat.length === 0 && hasBentoFilter && (
            <p className="mb-8 text-sm text-brand-gray">
              No products match this filter yet. In admin, set{' '}
              {filterIdealFor ? (
                <strong className="text-brand-dark">Ideal for</strong>
              ) : (
                <strong className="text-brand-dark">Mood</strong>
              )}{' '}
              on your products to match &quot;{bentoFilterLabel}&quot;.
            </p>
          )}

          {useApiLayout
            ? visibleSections.map(section => {
                const sectionSlug = section.slug;
                return (
                <section key={section.key} id={`category-${sectionSlug}`} className="scroll-mt-28">
                  <div className="mb-6 border-b border-brand-beige pb-4">
                    <h2 className="font-serif text-2xl lg:text-3xl font-medium text-brand-dark">{section.title}</h2>
                    {section.description && (
                      <p className="mt-2 text-[12px] text-brand-gray max-w-2xl leading-relaxed">{section.description}</p>
                    )}
                  </div>
                  <motion.div
                    key={`${section.key}-${sort}`}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5"
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {section.items.map((p, i) => renderProductCard(p, i))}
                    </AnimatePresence>
                  </motion.div>
                </section>
                );
              })
            : visibleSections.map(section => {
                const sectionSlug = section.slug;
                return (
                <section key={section.key} id={`category-${sectionSlug}`} className="scroll-mt-28">
                  <div className="mb-6 border-b border-brand-beige pb-4">
                    <h2 className="font-serif text-2xl lg:text-3xl font-medium text-brand-dark">{section.title}</h2>
                  </div>
                  <motion.div
                    key={`${section.key}-${sort}-${page}`}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5"
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {section.items
                        .filter(p => paginatedFlat.some(pp => pp.id === p.id))
                        .map((p, i) => renderProductCard(p, i))}
                    </AnimatePresence>
                  </motion.div>
                </section>
                );
              })}

          {!useApiLayout && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-full border border-brand-beige flex items-center justify-center text-brand-gray hover:border-brand-dark hover:text-brand-dark transition-colors disabled:opacity-30"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-full text-[11px] font-medium transition-colors ${
                    page === n ? 'bg-brand-dark text-brand-cream' : 'border border-brand-beige text-brand-gray hover:border-brand-dark hover:text-brand-dark'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-full border border-brand-beige flex items-center justify-center text-brand-gray hover:border-brand-dark hover:text-brand-dark transition-colors disabled:opacity-30"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
