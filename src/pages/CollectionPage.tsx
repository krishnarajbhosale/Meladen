import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductSizeAvailability, products } from '../data/products';
import { meladen12 } from '../data/meladenImages';
import { useCart } from '../context/CartContext';
import { pageVariants, fadeUp } from '../animations/variants';
import { apiProductToProduct, fetchCategoriesWithProducts, fetchPublicStock } from '../api/catalog';
import type { CategoryWithProductsApi } from '../api/types';
import type { Product } from '../data/products';

const CONCENTRATIONS = ['Eau de Parfum', 'Extrait de Parfum', 'Eau de Toilette'];
const FAMILIES = ['Woody', 'Floral', 'Citrus', 'Oriental'];
const SORT_OPTIONS = ['Featured', 'Price: Low–High', 'Price: High–Low', 'Newest'];
const PER_PAGE = 6;

type CatalogSection = {
  key: string;
  title: string;
  description: string | null;
  items: Product[];
};

export default function CollectionPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [apiCatalog, setApiCatalog] = useState<CategoryWithProductsApi[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [selectedConc, setSelectedConc] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState('Featured');
  const [page, setPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const filteredSections: CatalogSection[] = useMemo(() => {
    const familyMatches = (p: Product) => {
      if (selectedFamily.length === 0) return true;
      const mood = (p.mood ?? '').toLowerCase();
      return selectedFamily.some(f => mood.includes(f.toLowerCase()));
    };

    const filterProduct = (p: Product) => {
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
  }, [sections, selectedConc, maxPrice, selectedFamily, sort]);

  const filteredFlat = useMemo(() => filteredSections.flatMap(s => s.items), [filteredSections]);

  const totalPages = Math.ceil(filteredFlat.length / PER_PAGE);
  const paginatedFlat = useApiLayout
    ? filteredFlat
    : filteredFlat.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [selectedConc, selectedFamily, maxPrice, sort, useApiLayout]);

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
      className="bg-brand-beige rounded-2xl overflow-hidden border border-[#2a2a2a] cursor-pointer group"
      onMouseEnter={() => setHoveredId(p.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => navigate(`/product/${p.id}`)}
    >
      <div className="relative h-[200px] lg:h-[260px] bg-brand-beige overflow-hidden">
        <motion.img
          src={p.image}
          alt={p.name}
          className="w-full h-full object-cover object-center"
          animate={{ scale: hoveredId === p.id ? 1.05 : 1 }}
          transition={{ duration: 0.35 }}
        />
        {p.tag && (
          <span className="absolute top-3 left-3 bg-brand-sage text-black text-[8px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full">
            {p.tag}
          </span>
        )}
        <AnimatePresence>
          {hoveredId === p.id && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              disabled={isOutOfStock}
              className={`absolute bottom-3 left-3 right-3 text-[9px] font-semibold tracking-widest uppercase py-2 rounded-xl transition-colors ${
                isOutOfStock
                  ? 'bg-red-200 text-red-800 cursor-not-allowed'
                  : 'bg-brand-sage text-black hover:bg-brand-sage/90'
              }`}
              onClick={e => {
                e.stopPropagation();
                if (!firstAvailable) return;
                addToCart(p, firstAvailable.label, firstAvailable.price);
              }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4 text-center">
        <p className="text-[9px] text-[#888] tracking-[0.2em] uppercase mb-1">{p.category}</p>
        <p className="font-serif text-sm lg:text-base font-medium text-brand-dark mb-1">{p.name}</p>
        <p className="text-[10px] text-brand-gray mb-2 truncate">{p.notes.top.join(', ')}</p>
        <p className="text-sm font-medium text-brand-dark">${p.price}.00</p>
        {isOutOfStock && <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-red-700">Out of stock</p>}
      </div>
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

      <div className="sticky top-16 z-30 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-beige px-5 lg:px-10 xl:px-16 py-3 flex items-center justify-between gap-4">
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
          <p className="text-[11px] text-brand-gray mb-2">{filteredFlat.length} products</p>

          {useApiLayout
            ? filteredSections.map(section => (
                <section key={section.key}>
                  <div className="mb-6 border-b border-brand-beige pb-4">
                    <h2 className="font-serif text-2xl lg:text-3xl font-medium text-brand-dark">{section.title}</h2>
                    {section.description && (
                      <p className="mt-2 text-[12px] text-brand-gray max-w-2xl leading-relaxed">{section.description}</p>
                    )}
                  </div>
                  <motion.div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5" layout>
                    <AnimatePresence mode="popLayout">
                      {section.items.map((p, i) => renderProductCard(p, i))}
                    </AnimatePresence>
                  </motion.div>
                </section>
              ))
            : filteredSections.map(section => (
                <section key={section.key}>
                  <div className="mb-6 border-b border-brand-beige pb-4">
                    <h2 className="font-serif text-2xl lg:text-3xl font-medium text-brand-dark">{section.title}</h2>
                  </div>
                  <motion.div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5" layout>
                    <AnimatePresence mode="popLayout">
                      {section.items
                        .filter(p => paginatedFlat.some(pp => pp.id === p.id))
                        .map((p, i) => renderProductCard(p, i))}
                    </AnimatePresence>
                  </motion.div>
                </section>
              ))}

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

      <section className="mx-4 lg:mx-10 xl:mx-16 mb-12 rounded-3xl bg-brand-beige border border-[#2a2a2a] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <p className="text-[9px] text-brand-gray tracking-[0.2em] uppercase mb-3">New · Discovery</p>
            <h3 className="font-serif text-2xl lg:text-3xl font-medium text-brand-dark mb-3">The Discovery Set</h3>
            <p className="text-[12px] text-brand-gray leading-relaxed mb-6 max-w-xs">
              Experience our signature collection with five 7ml sample sizes. The perfect introduction to the world of
              Meladen.
            </p>
            <button
              type="button"
              onClick={() => navigate('/product/1')}
              className="self-start bg-brand-dark text-brand-cream text-[10px] font-medium tracking-[0.15em] uppercase px-6 py-3 rounded-sm hover:bg-brand-dark/85 transition-colors"
            >
              Shop Discovery Set · $45
            </button>
          </div>
          <div className="h-[220px] lg:h-auto overflow-hidden">
            <img
              src={meladen12}
              alt="Discovery Set"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
}
