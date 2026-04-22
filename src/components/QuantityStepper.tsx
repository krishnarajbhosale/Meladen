import { motion } from 'framer-motion';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}

export default function QuantityStepper({ value, onChange, min = 1 }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#2f2a22] bg-[#161616] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222222] text-base text-[#b8b3ac] transition-colors hover:bg-[#2d2d2d]"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        -
      </motion.button>
      <span className="min-w-[1.75rem] text-center text-sm font-semibold tracking-[0.08em] text-[#d8d2ca]">
        {value}
      </span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a84c] text-base text-black transition-colors hover:bg-[#d7b45d]"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
      >
        +
      </motion.button>
    </div>
  );
}
