type HomeSectionHeadingProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

/** Centered homepage section title — matches Collections block. */
export default function HomeSectionHeading({ title, subtitle, className = '' }: HomeSectionHeadingProps) {
  return (
    <div className={`mb-6 text-center lg:mb-8 ${className}`.trim()}>
      <h2 className="font-serif text-[1.35rem] font-semibold uppercase tracking-[0.12em] text-brand-dark lg:text-3xl">
        {title}
      </h2>
      <div className="mx-auto mt-2 h-px w-16 bg-gradient-to-r from-transparent via-brand-sage to-transparent" />
      {subtitle ? <p className="mt-3 text-[11px] text-brand-gray">{subtitle}</p> : null}
    </div>
  );
}
