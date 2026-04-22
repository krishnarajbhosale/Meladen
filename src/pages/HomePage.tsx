import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import { meladen7, meladen8, meladen9, meladen10, meladen11 } from '../data/meladenImages';
import bento1 from '../assets/Bento1.png';
import bento2 from '../assets/BentoPerfumeRight.png';
import heroVideo from '../assets/HeroVideo.webm';
import ProductCard from '../components/ProductCard';
import { pageVariants, fadeUp, staggerContainer } from '../animations/variants';

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const newArrivals = products.filter(p => p.isNew || p.isBestseller).slice(0, 4);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {});
    };

    tryPlay();

    const frameId = window.requestAnimationFrame(tryPlay);
    const timeoutId = window.setTimeout(tryPlay, 250);

    video.addEventListener('canplay', tryPlay);
    document.addEventListener('visibilitychange', tryPlay);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      video.removeEventListener('canplay', tryPlay);
      document.removeEventListener('visibilitychange', tryPlay);
    };
  }, []);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="relative isolate overflow-x-clip bg-brand-cream">

      {/* ── HERO ── */}
      <section className="relative mx-3 mt-3 mb-8 lg:mx-6 lg:mt-4 lg:mb-10 rounded-3xl overflow-hidden h-[480px] lg:h-[90vh]">
        <video
          ref={heroVideoRef}
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
          disableRemotePlayback
          disablePictureInPicture
          className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center"
          onLoadedData={(e) => {
            e.currentTarget.muted = true;
            e.currentTarget.defaultMuted = true;
            e.currentTarget.play().catch(() => {});
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-black/75" />
        <div className="absolute inset-0 flex flex-col justify-end px-7 pb-10 lg:justify-center lg:pb-0 lg:px-16">
          <motion.p variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="text-white/60 text-[9px] lg:text-[10px] tracking-[0.3em] uppercase mb-2">
            Collection
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="font-serif text-[2.6rem] lg:text-6xl xl:text-7xl font-medium text-white leading-[1.05] mb-3 lg:mb-5">
            The Essence<br />of Midnight
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-white/65 text-[13px] lg:text-lg leading-relaxed mb-7 max-w-[240px] lg:max-w-md">
            A symphony of rare night-blooming jasmine and warm amber, crafted for the twilight hours.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
            <button
              onClick={() => navigate('/product/1')}
              className="bg-white/15 backdrop-blur-sm border border-white/40 text-white text-[11px] lg:text-xs font-medium tracking-[0.1em] uppercase px-7 py-3 lg:px-9 lg:py-4 rounded-full hover:bg-white/30 transition-all duration-200"
            >
              Shop the Collection
            </button>
          </motion.div>
        </div>
      </section>

      <div className="mx-3 lg:mx-8 xl:mx-auto xl:max-w-[1340px]">
      {/* Bento perfume grid */}
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
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto grid max-w-4xl grid-cols-2 grid-rows-[90px_118px_92px] gap-2.5 sm:grid-rows-[120px_170px_120px] lg:grid-rows-[140px_190px_140px] lg:gap-4"
        >
          <motion.article
            variants={fadeUp}
            custom={1}
            onClick={() => navigate('/collection')}
            className="group relative row-span-2 cursor-pointer overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[radial-gradient(circle_at_50%_105%,rgba(201,168,76,0.18),transparent_42%),linear-gradient(180deg,#1a1a1a,#111111)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:rounded-[1.4rem]"
          >
            <p className="relative z-10 font-serif text-base font-semibold text-brand-dark lg:text-2xl">Men's</p>
            <img
              src={bento1}
              alt="Men's fragrance"
              className="pointer-events-none absolute left-1/2 bottom-0 w-[82%] max-w-[250px] -translate-x-1/2 object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] transition-transform duration-700 group-hover:scale-[1.04] lg:bottom-0"
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
            <p className="relative z-10 font-serif text-base font-semibold text-brand-dark lg:text-2xl">Women's</p>
            <img
              src={bento2}
              alt="Women's fragrance"
              className="pointer-events-none absolute left-1/2 bottom-0 w-[82%] max-w-[250px] -translate-x-1/2 object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] transition-transform duration-700 group-hover:scale-[1.04] lg:bottom-0"
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
      {/* ── EDITORIAL SPLIT — desktop only (fixed row height + min-h-0 prevents overlap below) ── */}
      <section className="hidden">
        {/* Left — hero lifestyle */}
        <div className="relative min-h-0 h-full overflow-hidden rounded-2xl group">
          <img
            src={meladen7}
            alt="The Spring Edit — Meladen fragrance"
            className="absolute inset-0 size-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7">
            <p className="font-serif text-white text-xl font-medium mb-1">The Spring Edit</p>
            <p className="text-white/65 text-[12px] mb-4">Fresh florals and grounding woods for the new season.</p>
            <button type="button" className="text-white text-[10px] font-medium tracking-[0.15em] uppercase flex items-center gap-2 hover:gap-3 transition-all duration-200">
              Explore <span>→</span>
            </button>
          </div>
        </div>

        {/* Right — image fills remaining space; quote has natural height */}
        <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3">
          <div className="relative min-h-0 overflow-hidden rounded-2xl group">
            <img
              src={meladen8}
              alt="Raw materials and perfume craft"
              className="absolute inset-0 size-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white/70 text-[9px] tracking-widest uppercase mb-0.5">Raw Materials</p>
              <button type="button" className="text-white/80 text-[9px] tracking-widest uppercase hover:text-white transition-colors">
                Read Story
              </button>
            </div>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-gradient-to-b from-brand-light-gray/95 to-brand-beige/90 flex flex-col items-center justify-center px-8 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-brand-sage/40 font-serif text-2xl mb-2">"</p>
            <p className="font-serif text-brand-dark text-base italic text-center leading-snug mb-2">
              "A fragrance is a memory waiting to be lived."
            </p>
            <p className="text-brand-gray text-[9px] tracking-[0.2em] uppercase">The Founder's Journal</p>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="relative z-20 mt-10 border-t border-white/10 bg-brand-cream pt-12 pb-10 lg:pt-14 lg:pb-12 px-1 sm:px-3 lg:px-2 xl:px-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="font-serif text-[1.4rem] lg:text-3xl font-medium text-brand-dark">
              Our Best Seller's
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[11px] text-brand-gray mt-1">
              The latest additions to our olfactory library.
            </motion.p>
          </div>
          {/* Prev / Next arrows — desktop */}
          <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="hidden lg:flex items-center gap-2 mt-1">
            <button className="w-9 h-9 rounded-full border border-brand-beige flex items-center justify-center text-brand-gray hover:border-brand-dark hover:text-brand-dark transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center text-white hover:bg-brand-dark/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Product grid */}
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5 mt-6"
        >
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} imageLayout="contain" />
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-[11px] text-brand-dark tracking-[0.15em] uppercase border-b border-brand-dark/40 pb-0.5 hover:border-brand-dark transition-colors"
          >
            View All Products
          </button>
        </motion.div>
      </section>
      </div>

      {/* ── NOTES FROM THE ATELIER — desktop only ── */}
      <section className="hidden">
        <div className="grid grid-cols-[1fr_1fr] gap-16 items-center max-w-6xl mx-auto">

          {/* Left — stacked images */}
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative"
          >
            {/* Main large image */}
            <div className="relative rounded-2xl overflow-hidden h-[420px]">
              <img
                src={meladen9}
                alt="Notes from the Atelier"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
            {/* Small inset image bottom-right */}
            <div className="absolute bottom-4 right-4 w-[130px] h-[130px] rounded-xl overflow-hidden border-4 border-brand-cream shadow-lg">
              <img
                src={meladen10}
                alt="Ingredient detail"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>

          {/* Right — text */}
          <div className="pl-4">
            <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[9px] text-brand-gray tracking-[0.25em] uppercase mb-4">
              The Art of Extraction
            </motion.p>
            <motion.h2 variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="font-serif text-[2.8rem] font-medium text-brand-dark leading-[1.1] mb-5">
              Notes from<br />the Atelier.
            </motion.h2>
            <motion.p variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[13px] text-brand-gray leading-relaxed mb-7 max-w-sm">
              Our perfumers travel the globe to source the finest raw materials. From the sun-drenched citrus groves of Calabria to the misty cedar forests of the Atlas Mountains, every ingredient tells a story. We believe in slow perfumery, allowing complex notes to mature and reveal their true character.
            </motion.p>
            {/* Bullet points */}
            <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="space-y-3 mb-8">
              {[
                { title: 'Sustainable Sourcing', desc: 'Partnering directly with artisan farmers.' },
                { title: 'Small Batch Production', desc: 'Blended and aged in our Paris atelier.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-brand-dark mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-brand-dark">{item.title}</p>
                    <p className="text-[11px] text-brand-gray">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <button className="border border-brand-dark text-brand-dark text-[10px] font-medium tracking-[0.15em] uppercase px-7 py-3 hover:bg-brand-dark hover:text-brand-cream transition-all duration-200">
                Read the Journal
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CURATED FAVORITES — desktop only ── */}
      {/* <section className="px-5 lg:px-10 xl:px-20 py-14 lg:py-20">
        <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-serif text-[1.4rem] lg:text-3xl font-medium text-brand-dark text-center mb-9 lg:mb-14">
          Curated Favorites
        </motion.h2>
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {products.slice(0, 3).map((p, i) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              custom={i}
              className="flex flex-col items-center text-center cursor-pointer group"
              onClick={() => navigate(`/product/${p.id}`)}
            > */}
              {/* Circular product background */}
              {/* <div className="w-[190px] h-[190px] lg:w-[220px] lg:h-[220px] rounded-full bg-brand-light-gray flex items-center justify-center mb-5 overflow-hidden group-hover:bg-brand-beige transition-colors duration-300">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-[120px] h-[155px] lg:w-[140px] lg:h-[180px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="font-serif text-base font-medium text-brand-dark mb-1">{p.name}</p>
              <p className="text-[11px] text-brand-gray mb-3">
                {p.notes.top.slice(0, 3).join(', ')}
              </p>
              <button
                className="text-[9px] font-medium tracking-[0.2em] uppercase text-brand-dark border-b border-brand-dark/30 pb-0.5 hover:border-brand-dark transition-colors"
                onClick={e => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
              >
                Shop Now
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section> */}

      {/* ── CRAFTED IN GRASSE — mobile only ── */}
      <section className="hidden">
        <motion.p variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[9px] text-brand-gray tracking-[0.2em] uppercase mb-2">
          The Atelier
        </motion.p>
        <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-serif text-[2rem] font-medium text-brand-dark leading-tight mb-4">
          Crafted in<br /><span className="italic">Grasse, France</span>
        </motion.h2>
        <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative h-[220px] rounded-2xl overflow-hidden mb-5">
          <img
            src={meladen11}
            alt="Crafted in Grasse"
            className="w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <motion.p variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[13px] text-brand-gray leading-relaxed mb-5">
          Every Meladen fragrance begins its journey in the historic perfume capital of the world. We source only the finest botanicals, blending south-facing mimosa, crisp alpine lavender, and long-aged absolutes in a way that celebrates the masterpiece of olfactory art.
        </motion.p>
        <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <button className="text-[12px] text-brand-dark font-medium flex items-center gap-1.5">Read our story ↓</button>
        </motion.div>
      </section>

      {/* ── THE COLLECTION ── */}
      <section className="hidden">
        <div className="flex items-end justify-between mb-6">
          <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="font-serif text-[1.4rem] lg:text-3xl font-medium text-brand-dark">
            The Collection
          </motion.h2>
          <motion.button variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
            onClick={() => navigate('/')}
            className="text-[10px] text-brand-gray tracking-wide border border-brand-beige rounded-full px-4 py-1.5 hover:border-brand-dark transition-colors">
            View All
          </motion.button>
        </div>
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5"
        >
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} imageLayout="contain" />
          ))}
        </motion.div>
      </section>

      {/* ── JOIN THE SOCIETY ── */}
      <section className="hidden lg:block bg-brand-beige px-10 xl:px-20 py-20">
        <div className="grid grid-cols-[1fr_1fr] gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden h-[420px]">
              <img
                src={meladen9}
                alt="Notes from the Atelier"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="absolute bottom-4 right-4 w-[130px] h-[130px] rounded-xl overflow-hidden border-4 border-brand-cream shadow-lg">
              <img
                src={meladen10}
                alt="Ingredient detail"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>

          <div className="pl-4">
            <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[9px] text-brand-gray tracking-[0.25em] uppercase mb-4">
              The Art of Extraction
            </motion.p>
            <motion.h2 variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="font-serif text-[2.8rem] font-medium text-brand-dark leading-[1.1] mb-5">
              Notes from<br />the Atelier.
            </motion.h2>
            <motion.p variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[13px] text-brand-gray leading-relaxed mb-7 max-w-sm">
              Our perfumers travel the globe to source the finest raw materials. From the sun-drenched citrus groves of Calabria to the misty cedar forests of the Atlas Mountains, every ingredient tells a story. We believe in slow perfumery, allowing complex notes to mature and reveal their true character.
            </motion.p>
            <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="space-y-3 mb-8">
              {[
                { title: 'Sustainable Sourcing', desc: 'Partnering directly with artisan farmers.' },
                { title: 'Small Batch Production', desc: 'Blended and aged in our Paris atelier.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-brand-dark mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-brand-dark">{item.title}</p>
                    <p className="text-[11px] text-brand-gray">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <button className="border border-brand-dark text-brand-dark text-[10px] font-medium tracking-[0.15em] uppercase px-7 py-3 hover:bg-brand-dark hover:text-brand-cream transition-all duration-200">
                Read the Journal
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="lg:hidden px-5 pt-10 pb-10">
        <motion.p variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[9px] text-brand-gray tracking-[0.2em] uppercase mb-2">
          The Atelier
        </motion.p>
        <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-serif text-[2rem] font-medium text-brand-dark leading-tight mb-4">
          Crafted in<br /><span className="italic">Grasse, France</span>
        </motion.h2>
        <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative h-[220px] rounded-2xl overflow-hidden mb-5">
          <img
            src={meladen11}
            alt="Crafted in Grasse"
            className="w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <motion.p variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[13px] text-brand-gray leading-relaxed mb-5">
          Every Meladen fragrance begins its journey in the historic perfume capital of the world. We source only the finest botanicals, blending south-facing mimosa, crisp alpine lavender, and long-aged absolutes in a way that celebrates the masterpiece of olfactory art.
        </motion.p>
        <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <button className="text-[12px] text-brand-dark font-medium flex items-center gap-1.5">Read our story â†“</button>
        </motion.div>
      </section>

      <section className="mx-3 mb-4 lg:mx-6 lg:mb-6 rounded-3xl bg-brand-beige/60 px-7 py-12 lg:py-20 text-center">
        <motion.p variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[9px] text-brand-gray tracking-[0.2em] uppercase mb-3">
          Join the Society
        </motion.p>
        <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-serif text-[1.6rem] lg:text-4xl font-medium text-brand-dark mb-2">
          Subscribe for Exclusive<br className="lg:hidden" /> Access
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[12px] text-brand-gray mb-8 max-w-xs mx-auto lg:max-w-sm">
          Be the first to discover new collections, atelier events, and members-only offers.
        </motion.p>
        <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="flex items-center gap-2 max-w-sm mx-auto bg-brand-light-gray rounded-full px-4 py-1.5 border border-[#2a2a2a] shadow-sm">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-[12px] text-brand-dark placeholder:text-brand-gray/50 outline-none py-1.5"
          />
          <button
            onClick={() => setEmail('')}
            className="w-8 h-8 bg-brand-dark text-brand-cream rounded-full flex items-center justify-center flex-shrink-0 hover:bg-brand-dark/80 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </motion.div>

        {/* Social icons */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="flex justify-center gap-5 mt-8">
          {['instagram', 'tiktok', 'pinterest'].map(s => (
            <button key={s} className="w-8 h-8 rounded-full border border-brand-beige flex items-center justify-center text-brand-gray hover:border-brand-dark hover:text-brand-dark transition-colors">
              <span className="text-[9px] uppercase tracking-widest">{s[0]}</span>
            </button>
          ))}
        </motion.div>
      </section>

      {/* â”€â”€ NOTES FROM THE ATELIER â€” desktop only â”€â”€ */}
      <section className="hidden">
        <div className="grid grid-cols-[1fr_1fr] gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden h-[420px]">
              <img
                src={meladen9}
                alt="Notes from the Atelier"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="absolute bottom-4 right-4 w-[130px] h-[130px] rounded-xl overflow-hidden border-4 border-brand-cream shadow-lg">
              <img
                src={meladen10}
                alt="Ingredient detail"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>

          <div className="pl-4">
            <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[9px] text-brand-gray tracking-[0.25em] uppercase mb-4">
              The Art of Extraction
            </motion.p>
            <motion.h2 variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="font-serif text-[2.8rem] font-medium text-brand-dark leading-[1.1] mb-5">
              Notes from<br />the Atelier.
            </motion.h2>
            <motion.p variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-[13px] text-brand-gray leading-relaxed mb-7 max-w-sm">
              Our perfumers travel the globe to source the finest raw materials. From the sun-drenched citrus groves of Calabria to the misty cedar forests of the Atlas Mountains, every ingredient tells a story. We believe in slow perfumery, allowing complex notes to mature and reveal their true character.
            </motion.p>
            <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="space-y-3 mb-8">
              {[
                { title: 'Sustainable Sourcing', desc: 'Partnering directly with artisan farmers.' },
                { title: 'Small Batch Production', desc: 'Blended and aged in our Paris atelier.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-brand-dark mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-brand-dark">{item.title}</p>
                    <p className="text-[11px] text-brand-gray">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <button className="border border-brand-dark text-brand-dark text-[10px] font-medium tracking-[0.15em] uppercase px-7 py-3 hover:bg-brand-dark hover:text-brand-cream transition-all duration-200">
                Read the Journal
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* â”€â”€ CRAFTED IN GRASSE â€” mobile only â”€â”€ */}
      <section className="hidden">
        <motion.p variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[9px] text-brand-gray tracking-[0.2em] uppercase mb-2">
          The Atelier
        </motion.p>
        <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-serif text-[2rem] font-medium text-brand-dark leading-tight mb-4">
          Crafted in<br /><span className="italic">Grasse, France</span>
        </motion.h2>
        <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative h-[220px] rounded-2xl overflow-hidden mb-5">
          <img
            src={meladen11}
            alt="Crafted in Grasse"
            className="w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <motion.p variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-[13px] text-brand-gray leading-relaxed mb-5">
          Every Meladen fragrance begins its journey in the historic perfume capital of the world. We source only the finest botanicals, blending south-facing mimosa, crisp alpine lavender, and long-aged absolutes in a way that celebrates the masterpiece of olfactory art.
        </motion.p>
        <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <button className="text-[12px] text-brand-dark font-medium flex items-center gap-1.5">Read our story â†“</button>
        </motion.div>
      </section>

    </motion.div>
  );
}

