import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import { meladen7, meladen8, meladen9, meladen10, meladen11 } from '../data/meladenImages';
import bento1 from '../assets/Bento1.png';
import bento2 from '../assets/BentoPerfumeRight.png';
import heroVideo from '../assets/HeroVideo.webm';
import heroVideoMp4 from '../assets/Homepagevideo.mp4';
import heroPoster from '../assets/hero.png';
import AutoplayVideo from '../components/AutoplayVideo';
import CategorySidebar from '../components/CategorySidebar';
import CategoryStrip from '../components/CategoryStrip';
import HorizontalProductRail from '../components/HorizontalProductRail';
import { pageVariants, fadeUp } from '../animations/variants';

const categoryOptions = [
  'Perfumes',
  'Room Freshner',
  'Perfume Gel',
  'Attars',
  'Dukhoon',
  'Gift Sets',
];

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryOptions[0]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const bestSellers = useMemo(() => {
    const featured = products.filter(product => product.isNew || product.isBestseller);
    const source = featured.length ? featured : products;
    return Array.from({ length: 10 }, (_, index) => source[index % source.length]);
  }, []);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="relative isolate overflow-x-clip bg-brand-cream">
      <div className="mx-auto flex w-full max-w-[1500px] gap-0 px-3 pb-4 pt-3 lg:px-4 lg:pt-4">
        <CategorySidebar
          categories={categoryOptions}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          mobileOpen={mobileSidebarOpen}
          onMobileOpen={() => setMobileSidebarOpen(true)}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <section className="relative mb-8 h-[480px] overflow-hidden rounded-3xl lg:mb-10 lg:h-[90vh]">
            <AutoplayVideo
              sources={[
                { src: heroVideoMp4, type: 'video/mp4' },
                { src: heroVideo, type: 'video/webm' },
              ]}
              poster={heroPoster}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-black/75" />
            <div className="absolute inset-0 flex flex-col justify-end px-7 pb-10 lg:justify-center lg:px-16 lg:pb-0">
              <motion.p
                variants={fadeUp}
                custom={0}
                initial="hidden"
                animate="visible"
                className="mb-2 text-[9px] uppercase tracking-[0.3em] text-white/60 lg:text-[10px]"
              >
                {activeCategory}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                custom={1}
                initial="hidden"
                animate="visible"
                className="mb-3 font-serif text-[2.6rem] font-medium leading-[1.05] text-white lg:mb-5 lg:text-6xl xl:text-7xl"
              >
                The Essence
                <br />
                of Midnight
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={2}
                initial="hidden"
                animate="visible"
                className="mb-7 max-w-[240px] text-[13px] leading-relaxed text-white/65 lg:max-w-md lg:text-lg"
              >
                A symphony of rare night-blooming jasmine and warm amber, crafted for the twilight hours.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
                <button
                  onClick={() => navigate('/product/1')}
                  className="rounded-full border border-white/40 bg-white/15 px-7 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 lg:px-9 lg:py-4 lg:text-xs"
                >
                  Shop the Collection
                </button>
              </motion.div>
            </div>
          </section>

          <section className="mt-6 lg:mt-8">
            <motion.h2
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-4 text-center font-serif text-[1.35rem] font-semibold text-brand-dark lg:mb-5 lg:text-3xl"
            >
              Our Specials
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              viewport={{ once: true, margin: '-80px' }}
              className="mx-auto grid max-w-4xl grid-cols-2 grid-rows-[90px_118px_92px] gap-2.5 sm:grid-rows-[120px_170px_120px] lg:grid-rows-[140px_190px_140px] lg:gap-4"
            >
              <motion.article
                variants={fadeUp}
                custom={1}
                onClick={() => navigate('/collection')}
                className="group relative row-span-2 cursor-pointer overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[radial-gradient(circle_at_50%_105%,rgba(201,168,76,0.18),transparent_42%),linear-gradient(180deg,#1a1a1a,#111111)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:rounded-[1.4rem]"
              >
                <p className="relative z-10 font-serif text-base font-semibold text-brand-dark lg:text-2xl">Men&apos;s</p>
                <img
                  src={bento1}
                  alt="Men's fragrance"
                  className="pointer-events-none absolute left-1/2 bottom-0 w-[82%] max-w-[250px] -translate-x-1/2 object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] lg:bottom-0"
                  loading="lazy"
                  decoding="async"
                />
              </motion.article>

              <motion.button
                type="button"
                variants={fadeUp}
                custom={2}
                onClick={() => navigate('/collection')}
                className="flex items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[linear-gradient(145deg,#1d1d1d,#141414)] px-3 text-center font-serif text-base font-semibold text-brand-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-[#c9a84c]/50 lg:rounded-[1.4rem] lg:text-2xl"
              >
                Luxury
              </motion.button>

              <motion.article
                variants={fadeUp}
                custom={3}
                onClick={() => navigate('/collection')}
                className="group relative row-span-2 cursor-pointer overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[radial-gradient(circle_at_50%_105%,rgba(201,168,76,0.18),transparent_42%),linear-gradient(180deg,#1a1a1a,#111111)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:rounded-[1.4rem]"
              >
                <p className="relative z-10 font-serif text-base font-semibold text-brand-dark lg:text-2xl">Women&apos;s</p>
                <img
                  src={bento2}
                  alt="Women's fragrance"
                  className="pointer-events-none absolute left-1/2 bottom-0 w-[82%] max-w-[250px] -translate-x-1/2 object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] lg:bottom-0"
                  loading="lazy"
                  decoding="async"
                />
              </motion.article>

              <motion.button
                type="button"
                variants={fadeUp}
                custom={4}
                onClick={() => navigate('/collection')}
                className="flex items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[linear-gradient(145deg,#1d1d1d,#141414)] px-3 text-center font-serif text-base font-semibold text-brand-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-[#c9a84c]/50 lg:rounded-[1.4rem] lg:text-2xl"
              >
                Unisex
              </motion.button>
            </motion.div>
          </section>

          <div className="mt-6">
            <CategoryStrip
              categories={categoryOptions}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          <HorizontalProductRail
            title="Best Sellers"
            subtitle="The latest additions to our olfactory library."
            products={bestSellers}
          />

          <section className="hidden bg-brand-beige px-10 py-20 lg:mt-6 lg:block xl:px-20">
            <div className="mx-auto grid max-w-6xl grid-cols-[1fr_1fr] items-center gap-16">
              <motion.div
                variants={fadeUp}
                custom={0}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative h-[420px] overflow-hidden rounded-2xl">
                  <img
                    src={meladen9}
                    alt="Notes from the Atelier"
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="absolute bottom-4 right-4 h-[130px] w-[130px] overflow-hidden rounded-xl border-4 border-brand-cream shadow-lg">
                  <img
                    src={meladen10}
                    alt="Ingredient detail"
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </motion.div>

              <div className="pl-4">
                <motion.p
                  variants={fadeUp}
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mb-4 text-[9px] tracking-[0.25em] text-brand-gray"
                >
                  The Art of Extraction
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={2}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mb-5 font-serif text-[2.8rem] font-medium leading-[1.1] text-brand-dark"
                >
                  Notes from
                  <br />
                  the Atelier.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={3}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mb-7 max-w-sm text-[13px] leading-relaxed text-brand-gray"
                >
                  Our perfumers travel the globe to source the finest raw materials. From the sun-drenched citrus groves of Calabria to the misty cedar forests of the Atlas Mountains, every ingredient tells a story. We believe in slow perfumery, allowing complex notes to mature and reveal their true character.
                </motion.p>
                <motion.div
                  variants={fadeUp}
                  custom={4}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mb-8 space-y-3"
                >
                  {[
                    { title: 'Sustainable Sourcing', desc: 'Partnering directly with artisan farmers.' },
                    { title: 'Small Batch Production', desc: 'Blended and aged in our Paris atelier.' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-brand-dark" />
                      <div>
                        <p className="text-[12px] font-medium text-brand-dark">{item.title}</p>
                        <p className="text-[11px] text-brand-gray">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
                <motion.div variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <button className="border border-brand-dark px-7 py-3 text-[10px] font-medium uppercase tracking-[0.15em] text-brand-dark transition-all duration-200 hover:bg-brand-dark hover:text-brand-cream">
                    Read the Journal
                  </button>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="px-5 pb-10 pt-10 lg:hidden">
            <motion.p
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-2 text-[9px] uppercase tracking-[0.2em] text-brand-gray"
            >
              The Atelier
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-4 font-serif text-[2rem] font-medium leading-tight text-brand-dark"
            >
              Crafted in
              <br />
              <span className="italic">Grasse, France</span>
            </motion.h2>
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative mb-5 h-[220px] overflow-hidden rounded-2xl"
            >
              <img
                src={meladen11}
                alt="Crafted in Grasse"
                className="h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
            <motion.p
              variants={fadeUp}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-5 text-[13px] leading-relaxed text-brand-gray"
            >
              Every Meladen fragrance begins its journey in the historic perfume capital of the world. We source only the finest botanicals, blending south-facing mimosa, crisp alpine lavender, and long-aged absolutes in a way that celebrates the masterpiece of olfactory art.
            </motion.p>
            <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <button className="flex items-center gap-1.5 text-[12px] font-medium text-brand-dark">Read our story</button>
            </motion.div>
          </section>

          <section className="mx-1 mb-4 mt-10 rounded-3xl bg-brand-beige/60 px-7 py-12 text-center lg:mx-0 lg:mt-14 lg:py-20">
            <motion.p
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-3 text-[9px] uppercase tracking-[0.2em] text-brand-gray"
            >
              Join the Society
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-2 font-serif text-[1.6rem] font-medium text-brand-dark lg:text-4xl"
            >
              Subscribe for Exclusive
              <br className="lg:hidden" /> Access
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto mb-8 max-w-xs text-[12px] text-brand-gray lg:max-w-sm"
            >
              Be the first to discover new collections, atelier events, and members-only offers.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto flex max-w-sm items-center gap-2 rounded-full border border-[#2a2a2a] bg-brand-light-gray px-4 py-1.5 shadow-sm"
            >
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-transparent py-1.5 text-[12px] text-brand-dark outline-none placeholder:text-brand-gray/50"
              />
              <button
                onClick={() => setEmail('')}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-dark text-brand-cream transition-colors hover:bg-brand-dark/80"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8 flex justify-center gap-5"
            >
              {['instagram', 'tiktok', 'pinterest'].map(s => (
                <button
                  key={s}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-beige text-brand-gray transition-colors hover:border-brand-dark hover:text-brand-dark"
                >
                  <span className="text-[9px] uppercase tracking-widest">{s[0]}</span>
                </button>
              ))}
            </motion.div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
