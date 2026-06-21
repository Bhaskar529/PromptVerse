"use client";

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

type SearchOption = {
  value: string;
  label: string;
  type: string;
  subcategories: Array<{ value: string; label: string; count: number }>;
};

type Props = {
  options: SearchOption[];
  initialSearchText?: string;
  initialCategory?: string;
  initialSubcategory?: string;
  compact?: boolean;
  className?: string;
};

export function StructuredSearchForm({
  options,
  initialSearchText = '',
  initialCategory = '',
  initialSubcategory = '',
  compact = false,
  className = '',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchText, setSearchText] = useState(initialSearchText);
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setSearchText(initialSearchText);
    setCategory(initialCategory);
    setSubcategory(initialSubcategory);
  }, [initialSearchText, initialCategory, initialSubcategory]);

  const activeCategory = useMemo(
    () => options.find((option) => option.value === category) || null,
    [options, category],
  );

  const subcategoryOptions = activeCategory?.subcategories || [];

  useEffect(() => {
    if (!activeCategory) {
      if (subcategory) setSubcategory('');
      return;
    }
    const exists = subcategoryOptions.some((item) => item.value === subcategory);
    if (!exists) setSubcategory('');
  }, [activeCategory, subcategory, subcategoryOptions]);

  function validate() {
    const next: string[] = [];
    if (!searchText.trim()) next.push('Please enter search text.');
    if (!category.trim()) next.push('Please select a category.');
    if (!subcategory.trim()) next.push('Please select a subcategory.');
    setErrors(next);
    return next.length === 0;
  }

  function clearForm() {
    setSearchText('');
    setCategory('');
    setSubcategory('');
    setErrors([]);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const params = new URLSearchParams({
      searchText: searchText.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      page: '1',
    });
    startTransition(() => {
      router.push(`/search-results?${params.toString()}`);
    });
  }

  return (
    <form className={`structured-search ${compact ? 'structured-search--compact' : ''} ${className}`.trim()} onSubmit={onSubmit} noValidate>
      <div className="structured-search__grid">
        <label className="structured-search__field">
          <span className="structured-search__label">Search</span>
          <div className="structured-search__inputWrap">
            <Search size={18} aria-hidden="true" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search prompts..."
              aria-label="Search prompts"
            />
          </div>
        </label>

        <label className="structured-search__field">
          <span className="structured-search__label">Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Select category">
            <option value="">Select Category</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="structured-search__field">
          <span className="structured-search__label">Subcategory</span>
          <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)} aria-label="Select subcategory" disabled={!activeCategory}>
            <option value="">Select Subcategory</option>
            {subcategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {errors.length > 0 && (
        <div className="structured-search__errors" aria-live="polite">
          {errors.map((error) => <p key={error}>{error}</p>)}
        </div>
      )}

      <div className="structured-search__actions">
        <button type="button" className="structured-search__clear" onClick={clearForm} disabled={isPending}>
          <X size={16} aria-hidden="true" />
          <span>Clear</span>
        </button>
        <button type="submit" className="structured-search__submit" disabled={isPending}>
          {isPending ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
}
