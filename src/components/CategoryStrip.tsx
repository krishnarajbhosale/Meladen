interface CategoryStripProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  className?: string;
}

export default function CategoryStrip({
  categories,
  activeCategory,
  onSelect,
  className = '',
}: CategoryStripProps) {
  return (
    <div className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <div className="flex w-max min-w-full gap-2.5 pb-1">
        {categories.map(category => {
          const active = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-all duration-300 ease-in-out ${
                active
                  ? 'bg-brand-dark text-brand-cream'
                  : 'border border-brand-beige bg-brand-light-gray text-brand-gray hover:border-brand-dark hover:text-brand-dark'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
