import { motion } from 'framer-motion';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}

export default function QuantityStepper({ value, onChange, min = 1 }: Props) {
  return (
    <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-1 py-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#b8b3ac] text-lg font-light"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </motion.button>
      <span className="w-5 text-center text-sm font-medium text-[#b8b3ac]">{value}</span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-black text-lg font-light"
        onClick={() => onChange(value + 1)}
      >
        +
      </motion.button>
    </div>
  );
}
