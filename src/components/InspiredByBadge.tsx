export function inspiredByBadgeLabel(inspiredBy: string): string {
  const value = inspiredBy.trim();
  if (!value) return '';
  if (/^inspired\s+by\b/i.test(value)) return value;
  return `Inspired by ${value}`;
}

type Props = {
  inspiredBy?: string | null;
  className?: string;
  /** overlay = on product image; inline = in product detail text column */
  variant?: 'overlay' | 'inline';
};

/** Gold pill for inspired-by label on cards and product page. */
export default function InspiredByBadge({
  inspiredBy,
  className = '',
  variant = 'overlay',
}: Props) {
  const label = inspiredBy?.trim() ? inspiredByBadgeLabel(inspiredBy) : '';
  if (!label) return null;

  const base =
    'block max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-[#c9a84c] font-semibold uppercase leading-none tracking-[0.08em] text-black shadow-sm';

  const variantClass =
    variant === 'inline'
      ? 'inline-block px-2 py-0.5 text-[7px] tracking-[0.08em] lg:text-[8px]'
      : 'pointer-events-none absolute left-2 top-2 z-10 px-1.5 py-0.5 text-[6px] tracking-[0.06em] lg:left-2 lg:top-2 lg:px-2 lg:text-[7px]';

  return (
    <span className={`${base} ${variantClass} ${className}`} title={label}>
      {label}
    </span>
  );
}
