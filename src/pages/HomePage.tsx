import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, type Product } from '../data/products';
import bentoMen from '../assets/BentoMen.png';
import bentoWomen from '../assets/BentoWomen.png';
import heroVideo from '../assets/HeroVideo-optimized.webm';
import heroVideoMp4 from '../assets/Homepagevideo-optimized.mp4';
import { apiProductToProduct, fetchCategoriesWithProducts } from '../api/catalog';
import { BENTO_PRODUCT_FILTERS, buildBentoCollectionUrl } from '../data/collections';
import AutoplayVideo from '../components/AutoplayVideo';
import HeroIntro from '../components/HeroIntro';
import HomeUspBar from '../components/HomeUspBar';
import HomeStatisticsSection from '../components/HomeStatisticsSection';
import HorizontalProductRail from '../components/HorizontalProductRail';
import HomeSectionHeading from '../components/HomeSectionHeading';
import HomeCollectionsSection from '../components/HomeCollectionsSection';
import OurStorySection from '../components/OurStorySection';
import CelebPhotosSection from '../components/CelebPhotosSection';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import { pageVariants, fadeUp } from '../animations/variants';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (location.hash !== '#best-sellers') return;
    const scrollToBestSellers = () => {
      document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const id = window.setTimeout(scrollToBestSellers, 120);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategoriesWithProducts();
        if (cancelled) return;
        const fromApi = data.flatMap(section => section.products.map(apiProductToProduct));
        setCatalogProducts(fromApi.length > 0 ? fromApi : products);
      } catch {
        if (!cancelled) setCatalogProducts(products);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bestSellers = useMemo(() => {
    const source = catalogProducts.length > 0 ? catalogProducts : products;
    return source.filter(product => product.isBestseller);
  }, [catalogProducts]);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="relative isolate overflow-x-clip bg-brand-cream">
      <div className="mx-auto w-full max-w-[1500px] px-3 pb-4 pt-0 lg:px-4 lg:pt-4">
        <div className="min-w-0">
          <section className="relative -mx-3 mb-8 h-[calc(100vh-4rem)] h-[calc(100svh-4rem)] w-[calc(100%+1.5rem)] max-w-[100vw] overflow-hidden rounded-none bg-black lg:mx-0 lg:mb-10 lg:h-[96vh] lg:w-full lg:max-w-none lg:rounded-3xl">
            <AutoplayVideo
              sources={[
                { src: heroVideo, type: 'video/webm' },
                { src: heroVideoMp4, type: 'video/mp4' },
              ]}
              preload="auto"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/90" />
            <div className="absolute inset-x-0 bottom-[10%] z-10 flex flex-col items-center px-4 sm:px-5 md:px-4 lg:px-10">
              <HeroIntro overlay />
            </div>
          </section>

          <HomeUspBar />

          <section className="mt-10 px-3 lg:mt-14 lg:px-4">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <HomeSectionHeading title="Our Specials" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              viewport={{ once: true, margin: '-80px' }}
              className="mx-auto grid max-w-4xl grid-cols-2 grid-rows-[96px_132px_96px] gap-2.5 sm:grid-rows-[190px_178px_118px] lg:grid-rows-[140px_190px_140px] lg:gap-4"
            >
              <motion.article
                variants={fadeUp}
                custom={1}
                onClick={() => navigate(buildBentoCollectionUrl(BENTO_PRODUCT_FILTERS.men))}
                className="group relative row-span-2 flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[radial-gradient(circle_at_50%_105%,rgba(201,168,76,0.18),transparent_42%),linear-gradient(180deg,#1a1a1a,#111111)] px-1 pb-0 pt-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-4 sm:pt-4 lg:rounded-[1.4rem]"
              >
                <p className="relative z-10 shrink-0 font-serif text-base font-semibold text-brand-dark lg:text-2xl">Men&apos;s</p>
                <div className="relative z-0 min-h-0 flex-1">
                  <img
                    src={bentoMen}
                    alt="Men's fragrance"
                    className="pointer-events-none absolute bottom-0 left-0 max-h-[calc(100%+4px)] w-auto max-w-[92%] object-contain object-bottom object-left drop-shadow-[0_20px_28px_rgba(0,0,0,0.45)] sm:max-w-[115%]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#111111]/70 via-transparent to-transparent" aria-hidden />
              </motion.article>

              <motion.button
                type="button"
                variants={fadeUp}
                custom={2}
                onClick={() => navigate(buildBentoCollectionUrl(BENTO_PRODUCT_FILTERS.luxury))}
                className="flex items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[linear-gradient(145deg,#1d1d1d,#141414)] px-3 text-center font-serif text-base font-semibold text-brand-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-[#c9a84c]/50 lg:rounded-[1.4rem] lg:text-2xl"
              >
                Luxury
              </motion.button>

              <motion.article
                variants={fadeUp}
                custom={3}
                onClick={() => navigate(buildBentoCollectionUrl(BENTO_PRODUCT_FILTERS.women))}
                className="group relative row-span-2 flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[radial-gradient(circle_at_50%_105%,rgba(201,168,76,0.18),transparent_42%),linear-gradient(180deg,#1a1a1a,#111111)] px-1 pb-0 pt-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-4 sm:pt-4 lg:rounded-[1.4rem]"
              >
                <p className="relative z-10 shrink-0 font-serif text-base font-semibold text-brand-dark lg:text-2xl">Women&apos;s</p>
                <div className="relative z-0 min-h-0 flex-1">
                  <img
                    src={bentoWomen}
                    alt="Women's fragrance"
                    className="pointer-events-none absolute bottom-0 right-0 max-h-[calc(100%+4px)] w-auto max-w-[98%] origin-bottom-right object-contain object-bottom object-right drop-shadow-[0_20px_28px_rgba(0,0,0,0.45)] sm:max-w-[125%]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#111111]/70 via-transparent to-transparent" aria-hidden />
              </motion.article>

              <motion.button
                type="button"
                variants={fadeUp}
                custom={4}
                onClick={() => navigate(buildBentoCollectionUrl(BENTO_PRODUCT_FILTERS.unisex))}
                className="flex items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[linear-gradient(145deg,#1d1d1d,#141414)] px-3 text-center font-serif text-base font-semibold text-brand-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-[#c9a84c]/50 lg:rounded-[1.4rem] lg:text-2xl"
              >
                Unisex
              </motion.button>
            </motion.div>
          </section>

          <div id="best-sellers" className="scroll-mt-24">
            <HorizontalProductRail
              title="Best Sellers"
              subtitle="The latest additions to our olfactory library."
              products={bestSellers}
              headingStyle="collections"
              showProductRating
            />
          </div>

          <HomeStatisticsSection />

          <CelebPhotosSection />

          <HomeCollectionsSection />

          <CustomerReviewsSection />

          <OurStorySection />
        </div>
      </div>
    </motion.div>
  );
}
