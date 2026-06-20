import Link from 'next/link';

type Props = {
  basePath: string;
  currentPage: number;
  totalPages: number;
};

function hrefFor(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

function getPages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
}

export function PaginationNav({ basePath, currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPages(currentPage, totalPages);

  return (
    <nav className="mt-12 flex flex-col items-center gap-4" aria-label="Pagination">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={hrefFor(basePath, Math.max(1, currentPage - 1))}
          aria-disabled={currentPage === 1}
          className={`pagination-chip ${currentPage === 1 ? 'pointer-events-none opacity-40' : ''}`}
        >
          Previous
        </Link>
        {pages.map((page, index) => {
          const prev = pages[index - 1];
          const showGap = typeof prev === 'number' && page - prev > 1;
          return (
            <span key={page} className="contents">
              {showGap ? <span className="px-2 text-sm text-verse-muted">…</span> : null}
              <Link
                href={hrefFor(basePath, page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`pagination-chip ${page === currentPage ? 'pagination-chip--active' : ''}`}
              >
                {page}
              </Link>
            </span>
          );
        })}
        <Link
          href={hrefFor(basePath, Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage === totalPages}
          className={`pagination-chip ${currentPage === totalPages ? 'pointer-events-none opacity-40' : ''}`}
        >
          Next
        </Link>
      </div>
      <p className="text-sm text-verse-muted">Page {currentPage} of {totalPages}</p>
    </nav>
  );
}
