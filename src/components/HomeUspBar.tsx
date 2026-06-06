import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';

const CHECK_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const USP_ITEMS = [
  { label: '18-24 Hours Long Lasting' },
  { label: '25-30% Oil Concentration' },
  { label: 'Secure Payments' },
  { label: 'COD Available' },
] as const;

type Props = {
  overlay?: boolean;
};

export default function HomeUspBar({ overlay = false }: Props) {
  return (
    <motion.section
      variants={fadeUp}
      custom={1}
      initial="hidden"
      animate={overlay ? 'visible' : undefined}
      whileInView={overlay ? undefined : 'visible'}
      viewport={overlay ? undefined : { once: true, amount: 0.4 }}
      className={
        overlay
          ? 'pointer-events-none mt-4 w-full max-w-md border-t border-white/15 pt-3 md:mt-3 md:max-w-sm md:pt-2.5 lg:mt-5 lg:max-w-lg lg:pt-4'
          : '-mx-3 mb-6 border-y border-white/10 bg-brand-beige/80 px-3 py-3 lg:mx-0 lg:mb-8 lg:rounded-2xl lg:border lg:px-6 lg:py-3.5'
      }
      aria-label="Store highlights"
    >
      <ul
        className={`grid grid-cols-2 gap-x-3 gap-y-2.5 ${
          overlay
            ? 'gap-y-3'
            : 'sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-2 lg:gap-x-10'
        }`}
      >
        {USP_ITEMS.map(item => (
          <li
            key={item.label}
            className={`flex min-w-0 items-center gap-2 ${overlay ? '' : 'sm:flex-none sm:justify-center'}`}
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-full bg-[#c9a84c]/15 text-[#c9a84c] ${
                overlay ? 'h-4 w-4' : 'h-5 w-5'
              }`}
            >
              {overlay ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                CHECK_ICON
              )}
            </span>
            <span
              className={`leading-tight tracking-wide ${
                overlay
                  ? 'text-[9px] md:text-[8px] lg:text-[9px] text-white/85'
                  : 'text-[10px] sm:text-[11px] lg:text-xs text-brand-dark'
              }`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
