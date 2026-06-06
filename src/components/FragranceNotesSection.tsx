import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';

type Notes = {
  top: string[];
  heart: string[];
  base: string[];
};

const NOTE_LAYERS = [
  { key: 'top' as const, label: 'Top Notes', hint: 'Opening burst' },
  { key: 'heart' as const, label: 'Heart Notes', hint: 'Core character' },
  { key: 'base' as const, label: 'Base Notes', hint: 'Lasting depth' },
];

type Props = {
  notes: Notes;
  custom?: number;
};

export default function FragranceNotesSection({ notes, custom = 7 }: Props) {
  const layers = NOTE_LAYERS.map(layer => ({
    ...layer,
    items: notes[layer.key].filter(Boolean),
  })).filter(layer => layer.items.length > 0);

  if (layers.length === 0) return null;

  return (
    <motion.section
      variants={fadeUp}
      custom={custom}
      initial="hidden"
      animate="visible"
      className="mb-8 rounded-2xl border border-[#2a2a2a] bg-brand-beige/50 p-5 lg:p-6"
      aria-labelledby="fragrance-notes-heading"
    >
      <div className="mb-5 border-b border-white/10 pb-4">
        <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-brand-gray">Scent profile</p>
        <h2 id="fragrance-notes-heading" className="font-serif text-xl font-medium text-brand-dark lg:text-2xl">
          Fragrance Notes
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-3 lg:gap-4">
        {layers.map(layer => (
          <div
            key={layer.key}
            className="rounded-xl border border-white/10 bg-brand-light-gray/80 px-4 py-4"
          >
            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-sage">
              {layer.label}
            </p>
            <p className="mb-3 text-[10px] text-brand-gray">{layer.hint}</p>
            <ul className="flex flex-wrap gap-2">
              {layer.items.map(note => (
                <li
                  key={note}
                  className="rounded-full border border-white/10 bg-brand-cream px-2.5 py-1 text-[11px] leading-none text-brand-dark"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
