import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchCategoriesWithProducts } from '../api/catalog';
import { HOME_COLLECTIONS, resolveHomeCollectionSlug } from '../data/collections';
import { fadeUp } from '../animations/variants';
import CollectionCategoryBanner from './CollectionCategoryBanner';
import HomeSectionHeading from './HomeSectionHeading';

export default function HomeCollectionsSection() {
  const [categorySlugs, setCategorySlugs] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    fetchCategoriesWithProducts()
      .then(rows => {
        if (cancelled) return;
        const apiCategories = rows.map(r => r.category);
        const map: Record<string, string> = {};
        for (const home of HOME_COLLECTIONS) {
          map[home.slug] = resolveHomeCollectionSlug(home.slug, apiCategories);
        }
        setCategorySlugs(map);
      })
      .catch(() => {
        /* keep static slugs from collections.ts */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-10 px-3 lg:mt-14 lg:px-4">
      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <HomeSectionHeading title="Shop by Collection" />
      </motion.div>

      <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:gap-5">
        {HOME_COLLECTIONS.map((collection, index) => (
          <motion.div
            key={collection.slug}
            variants={fadeUp}
            custom={index + 1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <CollectionCategoryBanner
              collection={collection}
              index={index}
              categorySlug={categorySlugs[collection.slug]}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
