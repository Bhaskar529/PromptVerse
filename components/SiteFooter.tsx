import Link from 'next/link';
import type { ReturnTypeOfGetFooterCollections } from '@/components/footerTypes';

export function SiteFooter({ collections }: { collections: ReturnTypeOfGetFooterCollections }) {
  return (
    <footer className="border-t border-white/10 bg-[#0D0D18]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="font-display text-3xl text-white">PromptVerse</p>
          <p className="max-w-xl text-sm leading-7 text-verse-muted">
            A premium static library for AI prompts across image, video, audio, and chat workflows.
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-verse-muted">Top tools</p>
          <ul className="space-y-3 text-sm text-white">
            {collections.tools.map((tool) => (
              <li key={tool.slug}>
                <Link className="transition hover:text-verse-soft" href={`/tools/${tool.slug}`}>
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-verse-muted">Top tags</p>
          <ul className="space-y-3 text-sm text-white">
            {collections.tags.map((tag) => (
              <li key={tag.slug}>
                <Link className="transition hover:text-verse-soft" href={`/tags/${tag.slug}`}>
                  {tag.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
