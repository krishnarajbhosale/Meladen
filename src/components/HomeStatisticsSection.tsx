import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';

const HOME_STATISTICS = [
  { key: 'rating', value: '4.8★', label: 'Average Rating' },
  { key: 'orders', value: '6,000+', label: 'Orders Delivered' },
  { key: 'fragrances', value: '60+', label: 'Signature Fragrances' },
  { key: 'repeat', value: '70%', label: 'Repeat Customers' },
] as const;

export default function HomeStatisticsSection() {
  return (
    <motion.section
      variants={fadeUp}
      custom={0}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="mt-4 bg-brand-beige/50 px-5 py-10 lg:mt-6 lg:px-10 lg:py-12 xl:px-16"
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
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-brand-light-gray/70 px-3 py-5 text-center sm:gap-1.5 sm:px-4 sm:py-6"
            >
              <span className="font-serif text-2xl font-medium text-brand-sage sm:text-3xl">{stat.value}</span>
              <p className="text-[11px] leading-snug text-brand-dark sm:text-[12px]">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
