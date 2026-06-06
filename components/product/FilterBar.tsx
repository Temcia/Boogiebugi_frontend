"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

interface SubcategoryOption {
  id: string;
  name: string;
}

interface FilterBarProps {
  subcategories: SubcategoryOption[];
  activeSubcategory: string;
  onSubcategoryChange: (sub: string) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
  onFilterToggle: () => void;
}

export function FilterBar({
  subcategories,
  activeSubcategory,
  onSubcategoryChange,
  activeSort,
  onSortChange,
  onFilterToggle,
}: FilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);

  const allOptions = [{ id: "all", name: "All" }, ...subcategories];
  const activeLabel = allOptions.find((o) => o.id === activeSubcategory)?.name ?? "All";

  return (
    // sticky top-[57px] positions the bar right below the navbar (navbar height ≈ 57px)
    <div className="sticky top-[57px] z-30 border-b border-[var(--color-border)] bg-[var(--color-white)] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-page py-2.5">

        {/* ── Mobile: category dropdown ── */}
        <div className="relative sm:hidden flex-1">
          <button
            onClick={() => setMobileSubOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:border-[var(--color-obsidian)]"
          >
            {activeLabel}
            <ChevronDown className={`h-3 w-3 transition-transform ${mobileSubOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileSubOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMobileSubOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] py-1 shadow-md">
                {allOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSubcategoryChange(opt.id);
                      setMobileSubOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--color-ivory)] ${
                      activeSubcategory === opt.id
                        ? "font-medium text-[var(--color-obsidian)]"
                        : "text-[var(--color-warm-gray)]"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Desktop: category pills — horizontal scroll ── */}
        <div className="hidden sm:flex flex-1 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSubcategoryChange("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest transition-colors ${
              activeSubcategory === "all"
                ? "bg-[var(--color-obsidian)] text-[var(--color-ivory)]"
                : "border border-[var(--color-border)] text-[var(--color-warm-gray)] hover:border-[var(--color-obsidian)]"
            }`}
          >
            All
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSubcategoryChange(sub.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest transition-colors ${
                activeSubcategory === sub.id
                  ? "bg-[var(--color-obsidian)] text-[var(--color-ivory)]"
                  : "border border-[var(--color-border)] text-[var(--color-warm-gray)] hover:border-[var(--color-obsidian)]"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Right side: sort + filter */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] transition-colors hover:border-[var(--color-obsidian)]"
            >
              Sort
              <ChevronDown className="h-3 w-3" />
            </button>

            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] py-1 shadow-sm">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onSortChange(opt.value);
                        setSortOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--color-ivory)] ${
                        activeSort === opt.value
                          ? "font-medium text-[var(--color-obsidian)]"
                          : "text-[var(--color-warm-gray)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={onFilterToggle}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] transition-colors hover:border-[var(--color-obsidian)] lg:hidden"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filter
          </button>
        </div>
      </div>
    </div>
  );
}
