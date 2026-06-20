import Link from 'next/link';

export function Breadcrumbs({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-verse-muted">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 ? <span className="text-white/30">/</span> : null}
            {index === items.length - 1 ? (
              <span className="text-white">{item.label}</span>
            ) : (
              <Link href={item.href} className="transition hover:text-verse-soft">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
