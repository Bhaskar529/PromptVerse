import Link from 'next/link';

export default function SearchPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="verse-kicker">PromptVerse Search</p>
      <h1 className="text-4xl font-display tracking-[-0.04em] text-white">Search now lives on the homepage</h1>
      <p className="max-w-2xl text-verse-muted">
        Use the structured search section on the homepage to search by keyword, category, and subcategory before browsing results.
      </p>
      <Link href="/#structured-search" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]">
        Go to search section
      </Link>
    </div>
  );
}
