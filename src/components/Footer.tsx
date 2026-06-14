import { Link } from 'react-router-dom';

const INSTAGRAM_URL =
  'https://www.instagram.com/melangesecretofficial?igsh=MXNnMHg3bGo1YmM0bQ==';
const GOOGLE_URL = 'https://share.google/sw18DIkyzBtXI9EYD';
const WHATSAPP_URL =
  'https://wa.me/919028980520?text=' +
  encodeURIComponent('Hello, I need help with your product. Can you help me?');
const CODEX_URL = 'https://codex-nine-alpha.vercel.app/';

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
          <p className="mb-1 font-serif text-2xl uppercase tracking-[0.2em] text-brand-cream">Méladen</p>
          <p className="text-xs tracking-wide text-brand-cream/40">The Art of Fine Fragrance</p>
          <div className="mt-5 space-y-3 text-[11px] tracking-wide text-brand-cream/60">
            <p>
              <a href="mailto:support.meladen@gmail.com" className={linkClass}>
                support.meladen@gmail.com
              </a>
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream/70 transition-colors hover:border-brand-cream hover:text-brand-cream"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a
                href={GOOGLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream/70 transition-colors hover:border-brand-cream hover:text-brand-cream"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M21.6 12.23c0-.68-.06-1.34-.18-1.96H12v3.7h5.38a4.6 4.6 0 01-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.26z" fill="currentColor" />
                  <path d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.23-2.5c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.08v2.59A10 10 0 0012 22z" fill="currentColor" />
                  <path d="M6.41 13.91a6 6 0 010-3.82V7.5H3.08a10 10 0 000 9l3.33-2.59z" fill="currentColor" />
                  <path d="M12 5.95c1.47 0 2.78.5 3.82 1.5l2.86-2.86A10 10 0 0012 2a10 10 0 00-8.92 5.5l3.33 2.59C7.2 7.72 9.4 5.95 12 5.95z" fill="currentColor" />
                </svg>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream/70 transition-colors hover:border-brand-cream hover:text-brand-cream"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.5 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
                  <path d="M12.04 2.5a9.46 9.46 0 00-8.04 14.46L2.5 21.5l4.66-1.45A9.46 9.46 0 1012.04 2.5zm0 1.7a7.76 7.76 0 016.6 11.86l-.18.28.66 2.4-2.46-.65-.27.16a7.76 7.76 0 11-4.35-14.25z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 text-[11px] tracking-wide text-brand-cream/60 lg:flex-row lg:gap-16">
          {footerColumns.map(col => (
            <div key={col.label} className="space-y-3">
              <p className="mb-2 text-[9px] uppercase tracking-widest text-brand-cream/30">{col.label}</p>
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

      <div className="flex flex-col gap-2 border-t border-brand-cream/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-[10px] text-brand-cream/30">© 2026 Méladen. All rights reserved.</p>
        <p className="text-[10px] text-brand-cream/30">
          Developed by{' '}
          <a
            href={CODEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-cream/50 underline underline-offset-2 transition-colors hover:text-brand-cream"
          >
            Codex
          </a>
        </p>
        <p className="text-[10px] text-brand-cream/30">India</p>
      </div>
    </footer>
  );
}
