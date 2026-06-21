import Link from 'next/link';
import { PromptCard } from '@/components/PromptCard';
import { StructuredSearchForm } from '@/components/StructuredSearchForm';
import { PaginationNav } from '@/components/PaginationNav';
import { getStructuredSearchFallbacks, getStructuredSearchOptions, runStructuredSearch } from '@/lib/content';

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function readValue(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] || '' : input || '';
}

export default function SearchResultsPage({ searchParams = {} }: PageProps) {
  const searchText = readValue(searchParams.searchText);
  const category = readValue(searchParams.category);
  const subcategory = readValue(searchParams.subcategory);
  const page = Math.max(1, Number.parseInt(readValue(searchParams.page) || '1', 10) || 1);

  const options = getStructuredSearchOptions();
  const result = runStructuredSearch({ searchText, category: category as any, subcategory }, page);
  const fallback = getStructuredSearchFallbacks(category || undefined);

  const basePath = `/search-results?searchText=${encodeURIComponent(searchText)}&category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="structured-search-page structured-search-page--results">
        <p className="verse-kicker">Search Results</p>
        <h1>Search Results</h1>
        <div className="structured-results-summary">
          <p><strong>Keyword:</strong> {searchText || '—'}</p>
          <p><strong>Category:</strong> {result?.categoryLabel || '—'}</p>
          <p><strong>Subcategory:</strong> {result?.subcategoryLabel || '—'}</p>
          <p><strong>Result Count:</strong> {result ? `Found ${result.total} matching prompts.` : 'Found 0 matching prompts.'}</p>
        </div>
        <StructuredSearchForm
          options={options}
          initialSearchText={searchText}
          initialCategory={category}
          initialSubcategory={subcategory}
          compact
        />
      </section>

      {result && result.total > 0 ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.items.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
          </section>
          <PaginationNav basePath={basePath} currentPage={result.page} totalPages={result.totalPages} />
        </>
      ) : (
        <section className="structured-empty-state">
          <h2>No matching prompts found.</h2>
          <div className="structured-empty-state__group">
            <h3>Related Categories</h3>
            <div className="structured-chip-row">
              {fallback.categories.map((item) => <Link key={item.value} href={`/#structured-search`}>{item.label}</Link>)}
            </div>
          </div>
          <div className="structured-empty-state__group">
            <h3>Popular Searches</h3>
            <div className="structured-chip-row">
              {fallback.popularSearches.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div className="structured-empty-state__group">
            <h3>Suggested Subcategories</h3>
            <div className="structured-chip-row">
              {fallback.subcategories.map((item) => <span key={item.value}>{item.label}</span>)}
            </div>
          </div>
          <div className="structured-empty-state__group">
            <h3>Trending Prompts</h3>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {fallback.trendingPrompts.slice(0, 3).map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
            </section>
          </div>
        </section>
      )}
    </div>
  );
}
