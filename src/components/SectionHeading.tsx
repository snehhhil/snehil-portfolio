interface SectionHeadingProps {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({
  id,
  number,
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    <div id={id} className="mb-12 scroll-mt-24">
      <p className="mb-2 font-mono text-sm text-accent-cyan">{number}</p>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>}
    </div>
  );
}
