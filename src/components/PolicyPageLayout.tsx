import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, fadeUp } from '../animations/variants';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PolicyPageLayout({ title, subtitle, children }: Props) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[70vh] bg-brand-cream px-5 pb-16 pt-8 lg:mx-auto lg:max-w-4xl lg:px-0"
    >
      <motion.h1
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mb-2 font-serif text-3xl font-medium text-white lg:text-4xl"
      >
        {title}
      </motion.h1>
      {subtitle ? (
        <motion.p
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
          className="mb-8 text-sm text-white/90"
        >
          {subtitle}
        </motion.p>
      ) : (
        <div className="mb-8" />
      )}
      <motion.section
        variants={fadeUp}
        custom={2}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-[#2a2a2a] bg-brand-beige p-5 lg:p-7"
      >
        {children}
      </motion.section>
    </motion.div>
  );
}
