import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { meladen9 } from '../data/meladenImages';
import { fadeUp, slideFromLeft, slideFromRight } from '../animations/variants';

const OUR_STORY_PARAGRAPHS = [
  'Founded in 2024, Méladen Luxury Fragrances was created with a vision to craft perfumes that are more than just scents — fragrances that become a lasting part of your identity.',
  'At Méladen, we believe true luxury lies in the details. Every fragrance is carefully designed to create a powerful impression, blending elegance, sophistication, and exceptional long-lasting performance that stays with you throughout the day.',
  'Before entering the world of perfumery, our founder came from a hospitality and culinary background as a chef — where precision, creativity, balance, and unforgettable experiences are everything. Just like crafting a perfect recipe, creating a fragrance requires understanding notes, harmony, depth, and emotion. That same passion for creating memorable experiences became the foundation of Méladen.',
  'Inspired by modern luxury and timeless elegance, each Méladen fragrance is thoughtfully composed to deliver rich character, smooth blends, and a premium scent experience that leaves a lasting memory long after the moment has passed.',
  'From bold and confident creations to soft and refined expressions, every bottle is designed for individuals who appreciate quality, presence, and individuality.',
  'Méladen is not just about smelling good — it is about being remembered.',
];

const OUR_STORY_TAGLINE = 'Crafted for lasting impressions. Designed to stay with you.';

const paragraphClass =
  'text-left text-justify hyphens-auto text-[13px] leading-relaxed text-white/65 lg:text-[14px] lg:leading-[1.75]';

export default function OurStorySection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mt-10 border-t border-white/10 bg-black px-5 py-12 lg:mt-12 lg:px-10 lg:py-20 xl:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-16">
        <motion.div
          variants={slideFromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="lg:sticky lg:top-24"
        >
          <img
            src={meladen9}
            alt="Méladen luxury fragrances"
            className="block h-auto w-full rounded-2xl"
            loading="lazy"
            decoding="async"
          />
        </motion.div>

        <motion.div
          variants={slideFromRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="min-w-0 text-left"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6 text-left font-serif text-[2rem] font-medium leading-tight text-[#f5f0e8] lg:mb-8 lg:text-[2.6rem]"
          >
            Our Story
          </motion.h2>

          <div className="space-y-4 text-left lg:space-y-5">
            <motion.p
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={paragraphClass}
            >
              {OUR_STORY_PARAGRAPHS[0]}
            </motion.p>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="our-story-expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4 overflow-hidden lg:space-y-5"
                >
                  {OUR_STORY_PARAGRAPHS.slice(1).map((paragraph, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className={paragraphClass}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                  <motion.p
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: OUR_STORY_PARAGRAPHS.length * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center font-serif text-[15px] italic leading-relaxed text-[#c9a84c] lg:text-base"
                  >
                    {OUR_STORY_TAGLINE}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="mt-5 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#c9a84c] transition-colors hover:text-[#e0c878] lg:mt-6"
            aria-expanded={expanded}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
