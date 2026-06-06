import { Link } from 'react-router-dom';

const INSTAGRAM_URL =
  'https://www.instagram.com/melangesecretofficial?igsh=MXNnMHg3bGo1YmM0bQ==';
const GOOGLE_URL = 'https://share.google/sw18DIkyzBtXI9EYD';

const footerColumns = [
  {
    label: 'Shop',
    links: [
      { label: 'Collection', href: '/collection', internal: true as const },
      { label: 'Bestsellers', href: '/#best-sellers', internal: true as const },
    ],
  },
  {
    label: 'Support',
    links: [
      { label: 'Terms & Conditions', href: '/policies#terms', internal: true as const },
      { label: 'Privacy Policy', href: '/policies#privacy', internal: true as const },
      { label: 'Shipping Policy', href: '/policies#shipping', internal: true as const },
      { label: 'Returns & Refund Policy', href: '/policies#returns', internal: true as const },
      { label: 'Law of Jurisdiction', href: '/policies#jurisdiction', internal: true as const },
      { label: 'Return Request', href: '/returns', internal: true as const },
      { label: 'Contact Support', href: 'mailto:support.meladen@gmail.com', internal: false as const },
    ],
  },
] as const;

const linkClass = 'transition-colors hover:text-brand-cream';

export default function Footer() {
  return (
    <footer className="bg-brand-dark px-5 py-14 lg:px-10 xl:px-20">
      <div className="mb-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <div className="max-w-sm">
          <p className="mb-1 font-serif text-2xl uppercase tracking-[0.2em] text-brand-cream">Meladen</p>
          <p className="text-xs tracking-wide text-brand-cream/40">The Art of Fine Fragrance</p>
          <div className="mt-5 space-y-2.5 text-[11px] tracking-wide text-brand-cream/60">
            <p>
              <a href="mailto:support.meladen@gmail.com" className={linkClass}>
                support.meladen@gmail.com
              </a>
            </p>
            <p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Insta
              </a>
            </p>
            <p>
              <a
                href={GOOGLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Google
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 text-[11px] uppercase tracking-widest text-brand-cream/60 lg:flex-row lg:gap-16">
          {footerColumns.map(col => (
            <div key={col.label} className="space-y-3">
              <p className="mb-2 text-[9px] text-brand-cream/30">{col.label}</p>
              {col.links.map(l => (
                <p key={l.label}>
                  {l.internal ? (
                    <Link to={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  )}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-brand-cream/10 pt-6 lg:flex-row lg:justify-between">
        <p className="text-[10px] text-brand-cream/30">© 2026 Meladen. All rights reserved.</p>
        <p className="text-[10px] text-brand-cream/30">India</p>
      </div>
    </footer>
  );
}
