"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ProductResponse } from "@/lib/api";
import { PLPProductCard } from "@/components/product/PLPProductCard";

interface SearchClientProps {
  initialProducts: ProductResponse[];
  query: string;
}

export function SearchClient({ initialProducts, query }: SearchClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(query);

  // Sync input if query param changes
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] pb-16">
      {/* Search Header */}
      <div className="bg-[var(--color-white)] border-b border-[var(--color-border)] py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-page">
          <h1 className="text-center font-display text-2xl font-medium text-[var(--color-obsidian)] mb-6">
            Search
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 h-5 w-5 text-[var(--color-warm-gray)]" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search products, categories, styles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-ivory)] py-3 pl-12 pr-24 text-sm text-[var(--color-obsidian)] focus:border-[var(--color-obsidian)] focus:outline-none transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 h-9 rounded-full bg-[var(--color-obsidian)] px-4 text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-7xl px-page pt-8">
        {query ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--color-obsidian)]">
                Results for &quot;{query}&quot;
              </h2>
              <span className="text-xs text-[var(--color-warm-gray)]">
                {initialProducts.length} items
              </span>
            </div>

            {initialProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-white)]">
                <Search className="h-8 w-8 text-[var(--color-warm-gray)] mb-4 opacity-50" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[var(--color-obsidian)]">
                  No products found
                </p>
                <p className="mt-1 text-xs text-[var(--color-warm-gray)]">
                  We couldn't find anything matching "{query}". Try checking your spelling or using more general terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {initialProducts.map((product) => (
                  <PLPProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Search className="h-10 w-10 text-[var(--color-warm-gray)] mb-4" strokeWidth={1} />
            <p className="text-sm text-[var(--color-warm-gray)]">
              Enter a search term above to find products.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
