"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FilterBar } from "./FilterBar";
import { FilterSidebar, type FilterState } from "./FilterSidebar";
import { PLPProductCard } from "./PLPProductCard";
import { Pagination } from "./Pagination";
import { ProductResponse, Category } from "@/lib/api";

interface PLPClientProps {
  initialProducts: ProductResponse[];
  categories: Category[];
  currentCategory?: Category;
}

const ITEMS_PER_PAGE = 9;

const defaultFilters: FilterState = {
  selectedSizes: [],
  selectedColors: [],
  inStockOnly: false,
  priceMin: "",
  priceMax: "",
};

export function PLPClient({ initialProducts, categories, currentCategory }: PLPClientProps) {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category"); // new-arrivals | sale
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [activeSort, setActiveSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Filter products
  const filtered = useMemo(() => {
    let result = [...initialProducts];

    // Subcategory filter
    if (activeSubcategory !== "all") {
      result = result.filter((p) => p.categoryId === activeSubcategory);
    }

    // Query category filter (?category=new-arrivals or ?category=sale)
    if (queryCategory === "new-arrivals") {
      // In MVP, maybe limit to newly created or just rely on the server? We rely on server.
      // But we can filter out items that don't have images for now or just do nothing if server handled it.
    } else if (queryCategory === "sale") {
      result = result.filter((p) => p.comparePrice && p.comparePrice > p.price);
    }



    // Size filter
    if (filters.selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) => filters.selectedSizes.includes(v.size))
      );
    }

    if (filters.priceMin) {
      const min = Number(filters.priceMin) * 100;
      result = result.filter((p) => p.price >= min);
    }
    if (filters.priceMax) {
      const max = Number(filters.priceMax) * 100;
      result = result.filter((p) => p.price <= max);
    }

    // In stock only filter
    if (filters.inStockOnly) {
      result = result.filter((p) => p.variants?.some((v) => v.stock > 0));
    }

    // Sort
    switch (activeSort) {
      case "newest":
        // Sort by ID or creation time if available. We will assume newer products have larger IDs or just reverse.
        result.reverse();
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        // featured — keep original order
        break;
    }

    return result;
  }, [initialProducts, queryCategory, activeSubcategory, activeSort, filters]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const subcategoryOptions = currentCategory
    ? currentCategory.children?.map((c) => ({ id: c.id, name: c.name })) ?? []
    : categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="bg-[var(--color-ivory)]">
      {/* Filter bar — sticky just below the navbar */}
      <FilterBar
        subcategories={subcategoryOptions}
        activeSubcategory={activeSubcategory}
        onSubcategoryChange={(sub) => {
          setActiveSubcategory(sub);
          setCurrentPage(1);
        }}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        onFilterToggle={() => setFilterOpen(true)}
      />

      {/* Content area */}
      <div className="mx-auto max-w-7xl px-page py-6">
        <div className="flex gap-8">
          {/* Desktop filter sidebar */}
          <FilterSidebar
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
            filters={filters}
            onFiltersChange={(next) => {
              setFilters(next);
              setCurrentPage(1);
            }}
          />

          {/* Product grid */}
          <div className="flex-1">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-[var(--color-obsidian)]">
                  No products found
                </p>
                <p className="mt-1 text-xs text-[var(--color-warm-gray)]">
                  Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
                {paginated.map((product) => (
                  <PLPProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
