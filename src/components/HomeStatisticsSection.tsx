import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';

function HappyCustomersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.5 10.5h.01M15.5 10.5h.01M9 15c.94.83 2.06 1.25 3 1.25s2.06-.42 3-1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const HOME_STATISTICS = [
  { key: 'trusted', accent: '30,000+', text: 'Trusted by 30,000+ Customers' },
  { key: 'happy', icon: <HappyCustomersIcon />, text: 'Thousands of Happy Customers' },
  { key: 'bestseller', accent: '★', text: 'One of Our Best Sellers' },
  { key: 'repeat', accent: '↺', text: 'Loved by Repeat Buyers' },
] as const;

export default function HomeStatisticsSection() {
  return (
    <motion.section
      variants={fadeUp}
      custom={0}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="mt-10 border-y border-white/10 bg-brand-beige/50 px-5 py-10 lg:mt-12 lg:px-10 lg:py-12 xl:px-16"
      aria-label="Customer statistics"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center lg:mb-10">
          <h2 className="font-serif text-2xl font-medium text-[#f5f0e8] lg:text-4xl">
            Trusted by 30,000+ Customers
          </h2>
        </div>

        <ul className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:max-w-4xl sm:gap-4">
          {HOME_STATISTICS.map(stat => (
            <li
              key={stat.key}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-light-gray/70 px-3 py-3.5 sm:gap-4 sm:px-4 sm:py-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-sage/25 bg-brand-sage/10 font-serif text-base text-brand-sage sm:h-12 sm:w-12 sm:text-lg">
                {'icon' in stat ? stat.icon : stat.accent}
              </span>
              <p className="min-w-0 text-[11px] leading-snug text-brand-dark sm:text-[12px]">{stat.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
