import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { meladen12 } from '../data/meladenImages';
import { useCart } from '../context/CartContext';
import { pageVariants, fadeUp } from '../animations/variants';

const CONCENTRATIONS = ['Eau de Parfum', 'Extrait de Parfum', 'Eau de Toilette'];
const FAMILIES = ['Woody', 'Floral', 'Citrus', 'Oriental'];
const SORT_OPTIONS = ['Featured', 'Price: Low–High', 'Price: High–Low', 'Newest'];
const PER_PAGE = 6;

export default function CollectionPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedConc, setSelectedConc] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(400);
  const [sort, setSort] = useState('Featured');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const filtered = products
    .filter(p => selectedConc.length === 0 || selectedConc.includes(p.category))
    .filter(p => p.price <= maxPrice)
    .sort((a, b) => {
      if (sort === 'Price: Low–High') return a.price - b.price;
      if (sort === 'Price: High–Low') return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="bg-brand-cream min-h-screen">

      {/* ── PAGE HEADER ── */}
      <div className="text-center pt-12 pb-10 px-5 border-b border-brand-beige">
        <motion.p variants={fadeUp} custom={0} initial="hidden" animate="visible"
          className="text-[9px] text-brand-gray tracking-[0.25em] uppercase mb-3">
          The Signature
        </motion.p>
        <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
          className="font-serif text-4xl lg:text-5xl font-medium text-brand-dark mb-4">
          Signature Collection
        </motion.h1>
        <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
          className="text-[12px] text-brand-gray max-w-md mx-auto leading-relaxed">
          Explore our curated selection of artisanal fragrances. Each scent is a unique journey,
          meticulously crafted with the finest raw materials from around the world.
        </motion.p>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="sticky top-16 z-30 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-beige px-5 lg:px-10 xl:px-16 py-3 flex items-center justify-between gap-4">
        {/* Left: filter toggle + pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className="flex items-center gap-1.5 text-[10px] font-medium text-brand-dark tracking-widest uppercase border border-brand-beige rounded-full px-3 py-1.5 hover:border-brand-dark transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filters
          </button>
          {/* Active filter pills */}
          {selectedConc.map(c => (
            <span key={c} className="flex items-center gap-1 text-[10px] bg-brand-dark text-brand-cream rounded-full px-3 py-1">
              {c}
              <button onClick={() => setSelectedConc(prev => prev.filter(v => v !== c))}>×</button>
            </span>
          ))}
          {/* Desktop quick filter pills */}
          <div className="hidden lg:flex items-center gap-2">
            {['Eau de Parfum', 'New Arrivals', 'Bestsellers'].map(f => (
              <button key={f}
                onClick={() => setSelectedConc(prev => toggle(prev, f))}
                className={`text-[10px] tracking-wide rounded-full px-3 py-1.5 border transition-colors ${selectedConc.includes(f) ? 'bg-brand-dark text-brand-cream border-brand-dark' : 'border-brand-beige text-brand-gray hover:border-brand-dark hover:text-brand-dark'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Right: sort */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-brand-gray tracking-wide hidden lg:inline">Sort by</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-[10px] text-brand-dark bg-transparent border border-brand-beige rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-brand-dark transition-colors"
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex gap-0 lg:gap-8 px-5 lg:px-10 xl:px-16 pt-8 pb-16">

        {/* ── SIDEBAR — desktop only ── */}
        <aside className="hidden lg:block w-52 flex-shrink-0 pr-4">

          {/* Concentration */}
          <div className="mb-8">
            <p className="text-[9px] font-semibold text-brand-dark tracking-[0.2em] uppercase mb-3">Concentration</p>
            {CONCENTRATIONS.map(c => {
              const count = products.filter(p => p.category === c).length;
              return (
                <label key={c} className="flex items-center gap-2 mb-2 cursor-pointer group">
                  <div
                    onClick={() => setSelectedConc(prev => toggle(prev, c))}
                    className={`w-3.5 h-3.5 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors ${selectedConc.includes(c) ? 'bg-brand-dark border-brand-dark' : 'border-brand-gray/40 group-hover:border-brand-dark'}`}
                  >
                    {selectedConc.includes(c) && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-[11px] text-brand-gray group-hover:text-brand-dark transition-colors">
                    {c} <span className="text-brand-gray/50">({count})</span>
                  </span>
                </label>
              );
            })}
          </div>

          {/* Olfactory Family */}
          <div className="mb-8">
            <p className="text-[9px] font-semibold text-brand-dark tracking-[0.2em] uppercase mb-3">Olfactory Family</p>
            {FAMILIES.map(f => (
              <label key={f} className="flex items-center gap-2 mb-2 cursor-pointer group">
                <div
                  onClick={() => setSelectedFamily(prev => toggle(prev, f))}
                  className={`w-3.5 h-3.5 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors ${selectedFamily.includes(f) ? 'bg-brand-dark border-brand-dark' : 'border-brand-gray/40 group-hover:border-brand-dark'}`}
                >
                  {selectedFamily.includes(f) && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-[11px] text-brand-gray group-hover:text-brand-dark transition-colors">{f}</span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <p className="text-[9px] font-semibold text-brand-dark tracking-[0.2em] uppercase mb-3">Price Range</p>
            <input
              type="range" min={100} max={400} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-dark"
            />
            <div className="flex justify-between text-[10px] text-brand-gray mt-1">
              <span>$100</span><span>${maxPrice}</span>
            </div>
          </div>
        </aside>

        {/* ── PRODUCT GRID ── */}
        <div className="flex-1">
          <p className="text-[11px] text-brand-gray mb-5">{filtered.length} products</p>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5"
            layout
          >
            <AnimatePresence mode="popLayout">
              {paginated.map((p, i) => (
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
                  {/* Image */}
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
                    {/* Add to bag on hover */}
                    <AnimatePresence>
                      {hoveredId === p.id && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-3 left-3 right-3 bg-brand-sage text-black text-[9px] font-semibold tracking-widest uppercase py-2 rounded-xl hover:bg-brand-sage/90 transition-colors"
                          onClick={e => { e.stopPropagation(); addToCart(p); }}
                        >
                          Add to Bag
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center">
                    <p className="text-[9px] text-[#888] tracking-[0.2em] uppercase mb-1">{p.category}</p>
                    <p className="font-serif text-sm lg:text-base font-medium text-brand-dark mb-1">{p.name}</p>
                    <p className="text-[10px] text-brand-gray mb-2 truncate">
                      {p.notes.top.join(', ')}
                    </p>
                    <p className="text-sm font-medium text-brand-dark">${p.price}.00</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-full border border-brand-beige flex items-center justify-center text-brand-gray hover:border-brand-dark hover:text-brand-dark transition-colors disabled:opacity-30"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-full text-[11px] font-medium transition-colors ${page === n ? 'bg-brand-dark text-brand-cream' : 'border border-brand-beige text-brand-gray hover:border-brand-dark hover:text-brand-dark'}`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-full border border-brand-beige flex items-center justify-center text-brand-gray hover:border-brand-dark hover:text-brand-dark transition-colors disabled:opacity-30"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── DISCOVERY SET BANNER ── */}
      <section className="mx-4 lg:mx-10 xl:mx-16 mb-12 rounded-3xl bg-brand-beige border border-[#2a2a2a] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <p className="text-[9px] text-brand-gray tracking-[0.2em] uppercase mb-3">New · Discovery</p>
            <h3 className="font-serif text-2xl lg:text-3xl font-medium text-brand-dark mb-3">
              The Discovery Set
            </h3>
            <p className="text-[12px] text-brand-gray leading-relaxed mb-6 max-w-xs">
              Experience our signature collection with five 7ml sample sizes. The perfect introduction to the world of Meladen.
            </p>
            <button
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
