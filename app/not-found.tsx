import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center shadow-verse sm:p-16">
        <p className="verse-kicker text-xs uppercase">404</p>
        <h1 className="verse-heading mt-4 font-display text-5xl tracking-[-0.05em]">That prompt page drifted out of orbit.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-verse-muted">
          Browse the main library and jump back into a live category collection.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90">
            Go home
          </Link>
          <Link href="/" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]">
            Back to homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
