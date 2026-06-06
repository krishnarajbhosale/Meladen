import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from './Button';
import { fadeUp } from '../animations/variants';

type Props = {
  overlay?: boolean;
};

export default function HeroIntro({ overlay = false }: Props) {
  const navigate = useNavigate();

  return (
    <motion.section
      variants={fadeUp}
      custom={0}
      initial="hidden"
      animate="visible"
      className={
        overlay
          ? 'pointer-events-none w-full max-w-xl text-center'
          : 'px-5 py-8 text-center lg:px-10 lg:py-10'
      }
    >
      <h1
        className={`font-serif font-bold leading-tight text-[#f5f0e8] ${
          overlay
            ? 'text-[1.35rem] md:text-[1.15rem] lg:text-[1.65rem]'
            : 'text-[1.65rem] lg:text-4xl'
        }`}
      >
        The Art of Fine Fragrance
      </h1>
      <p
        className={`mx-auto max-w-md font-serif italic leading-relaxed ${
          overlay
            ? 'mt-2 max-w-sm text-[11px] md:mt-1.5 md:max-w-xs md:text-[10px] lg:mt-2 lg:max-w-md lg:text-[11px] text-white/70'
            : 'mt-3 text-[13px] lg:mt-4 lg:max-w-xl lg:text-base text-brand-gray'
        }`}
      >
        Premium-inspired fragrances crafted for elegance, confidence, and lasting impressions.
      </p>
      <div className={`pointer-events-auto ${overlay ? 'mt-4 md:mt-3 lg:mt-5' : 'mt-6 lg:mt-7'}`}>
        <Button
          variant="gold"
          onClick={() => navigate('/collection')}
          className={overlay ? 'px-5 py-2 text-[10px] md:px-4 md:py-1.5 md:text-[9px] lg:px-5 lg:py-2 lg:text-[10px]' : ''}
        >
          Explore Collection
        </Button>
      </div>
    </motion.section>
  );
}
