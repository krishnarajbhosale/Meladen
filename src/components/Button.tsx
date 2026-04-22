import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'gold';
  onClick?: () => void;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function Button({
  children, variant = 'primary', onClick, fullWidth, className = '', type = 'button', disabled
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-sans text-sm font-medium tracking-[0.08em] uppercase transition-all duration-200 rounded-full px-6 py-3 select-none';
  const variants = {
    primary: 'bg-[#b8b3ac] text-[#0f0f0f] hover:bg-[#a8a39c]',
    outline: 'border border-[#b8b3ac]/20 text-[#b8b3ac] hover:border-[#c9a84c] hover:text-[#c9a84c]',
    ghost: 'text-[#b8b3ac] underline underline-offset-4 hover:text-[#c9a84c]',
    gold: 'bg-[#c9a84c] text-black hover:bg-[#e2c97e]',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}
