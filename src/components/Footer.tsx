import { Link } from 'react-router-dom';

const footerColumns = [
  { label: 'Shop', links: ['New Arrivals', 'Collection', 'Bestsellers'] as const },
  { label: 'Company', links: ['About', 'Atelier', 'Contact'] as const },
  {
    label: 'Support',
    links: [
      { label: 'Shipping', href: '#' },
      { label: 'Returns', href: '/returns' },
      { label: 'Privacy', href: '#' },
    ] as const,
  },
] as const;

export default function Footer() {
  return (
    <footer className="bg-brand-dark px-5 lg:px-10 xl:px-20 py-14">
      <div className="lg:flex lg:items-start lg:justify-between mb-10">
        <div className="mb-8 lg:mb-0">
          <p className="font-serif text-2xl text-brand-cream tracking-[0.2em] uppercase mb-1">Meladen</p>
          <p className="text-xs text-brand-cream/40 tracking-wide">The Art of Fine Fragrance</p>
        </div>
        <div className="grid grid-cols-3 lg:flex lg:gap-16 gap-6 text-[11px] text-brand-cream/60 tracking-widest uppercase">
          {footerColumns.map(col => (
            <div key={col.label} className="space-y-3">
              <p className="text-brand-cream/30 text-[9px] mb-2">{col.label}</p>
              {col.label === 'Support'
                ? col.links.map(l => (
                    <p key={l.label}>
                      {l.href.startsWith('/') ? (
                        <Link to={l.href} className="hover:text-brand-cream transition-colors">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="hover:text-brand-cream transition-colors">
                          {l.label}
                        </a>
                      )}
                    </p>
                  ))
                : col.links.map(l => (
                    <p key={l}>
                      <a href="#" className="hover:text-brand-cream transition-colors">
                        {l}
                      </a>
                    </p>
                  ))}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-brand-cream/10 pt-6 flex flex-col lg:flex-row lg:justify-between gap-2">
        <p className="text-[10px] text-brand-cream/30">© 2026 Meladen. All rights reserved.</p>
        <p className="text-[10px] text-brand-cream/30">Grasse · Paris · New York</p>
      </div>
    </footer>
  );
}
