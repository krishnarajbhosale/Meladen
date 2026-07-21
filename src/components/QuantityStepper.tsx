import { motion } from 'framer-motion';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  onMaxReached?: () => void;
  /** Tighter control for cart drawer / dense layouts */
  compact?: boolean;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
  onMaxReached,
  compact = false,
}: Props) {
  const btn = compact ? 'h-7 w-7 text-sm' : 'h-8 w-8 text-base';
  const qty = compact ? 'min-w-[1.5rem] text-xs' : 'min-w-[1.75rem] text-sm';

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2f2a22] bg-[#161616] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className={`flex items-center justify-center rounded-full bg-[#222222] text-[#b8b3ac] transition-colors hover:bg-[#2d2d2d] ${btn}`}
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        -
      </motion.button>
      <span className={`text-center font-medium tracking-[0.06em] text-[#d8d2ca] ${qty}`}>
        {value}
      </span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        aria-disabled={value >= max}
        className={`flex items-center justify-center rounded-full bg-[#c9a84c] text-black transition-colors ${value >= max ? 'cursor-not-allowed opacity-40' : 'hover:bg-[#d7b45d]'} ${btn}`}
        aria-label="Increase quantity"
        onClick={() => {
          if (value >= max) {
            onMaxReached?.();
            return;
          }
          onChange(value + 1);
        }}
      >
        +
      </motion.button>
    </div>
  );
}
