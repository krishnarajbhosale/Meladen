import { motion } from 'framer-motion';
import { HOME_COLLECTIONS } from '../data/collections';
import { fadeUp } from '../animations/variants';
import CollectionCategoryBanner from './CollectionCategoryBanner';

export default function HomeCollectionsSection() {
  return (
    <section className="mt-10 px-3 lg:mt-14 lg:px-4">
      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-6 text-center lg:mb-8"
      >
        <h2 className="font-serif text-[1.35rem] font-semibold uppercase tracking-[0.12em] text-brand-dark lg:text-3xl">
          Collections
        </h2>
        <div className="mx-auto mt-2 h-px w-16 bg-gradient-to-r from-transparent via-brand-sage to-transparent" />
        <p className="mx-auto mt-3 max-w-lg text-[11px] leading-relaxed text-brand-gray lg:text-xs">
          Explore our fragrance families—each crafted for a distinct mood and moment.
        </p>
      </motion.div>

      <div className="mx-auto flex max-w-5xl flex-col gap-3 lg:gap-4">
        {HOME_COLLECTIONS.map((collection, index) => (
          <motion.div
            key={collection.slug}
            variants={fadeUp}
            custom={index + 1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <CollectionCategoryBanner collection={collection} index={index} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
