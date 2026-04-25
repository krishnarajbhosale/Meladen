import { AnimatePresence, motion } from 'framer-motion';

interface CategorySidebarProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
}

function CategoryButtons({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="space-y-2">
      {categories.map(category => {
        const active = category === activeCategory;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`group flex w-full items-center justify-between rounded-[1.25rem] px-4 py-3 text-left transition-all duration-300 ease-in-out ${
              active
                ? 'bg-brand-dark text-brand-cream'
                : 'bg-brand-light-gray text-brand-gray hover:bg-brand-beige hover:text-brand-dark'
            }`}
          >
            <span className="text-[11px] uppercase tracking-[0.18em]">{category}</span>
            <span
              className={`text-sm transition-transform duration-300 ${
                active ? 'translate-x-0' : 'translate-x-0 group-hover:translate-x-1'
              }`}
              aria-hidden="true"
            >
              -&gt;
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CategorySidebar({
  categories,
  activeCategory,
  onSelect,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
}: CategorySidebarProps) {
  return (
    <>
      <aside className="hidden lg:block lg:w-[260px] lg:flex-shrink-0">
        <div className="fixed left-4 top-24 bottom-6 w-[260px] rounded-[2rem] border border-brand-beige bg-brand-cream p-5 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-brand-gray">Categories</p>
          <CategoryButtons categories={categories} activeCategory={activeCategory} onSelect={onSelect} />
        </div>
      </aside>

      <button
        type="button"
        onClick={onMobileOpen}
        className="fixed bottom-5 left-4 z-40 flex h-12 items-center gap-2 rounded-full bg-brand-dark px-4 text-[11px] uppercase tracking-[0.18em] text-brand-cream shadow-[0_16px_36px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-brand-dark/90 lg:hidden"
      >
        <span className="flex flex-col gap-1">
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-3 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
        Categories
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/35 lg:hidden"
              aria-label="Close categories"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 z-50 flex h-full w-[82%] max-w-[320px] flex-col bg-brand-cream px-5 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.24em] text-brand-gray">Categories</p>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-brand-dark"
                  aria-label="Close categories"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <CategoryButtons
                categories={categories}
                activeCategory={activeCategory}
                onSelect={(category) => {
                  onSelect(category);
                  onMobileClose();
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
