import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { drawerVariants, overlayVariants } from '../animations/variants';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Drawer({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            variants={drawerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#111111] border-t border-[#2a2a2a] rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-[#2a2a2a] rounded-full mx-auto mt-3 mb-4" />
            {title && <h3 className="font-serif text-lg font-medium text-[#b8b3ac] px-5 mb-4">{title}</h3>}
            <div className="px-5 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
