"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const colorSwatches = [
  { name: "Black", value: "#1A1A1A" },
  { name: "White", value: "#FFFFFF" },
  { name: "Beige", value: "#F5F0E8" },
  { name: "Navy", value: "#1E2A3A" },
  { name: "Olive", value: "#5A6B4A" },
  { name: "Brown", value: "#6B4226" },
];

export interface FilterState {
  selectedSizes: string[];
  selectedColors: string[];
  inStockOnly: boolean;
  priceMin: string;
  priceMax: string;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    size: true,
    price: true,
    color: true,
    availability: true,
  });

  const toggleSection = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSize = (size: string) => {
    const next = filters.selectedSizes.includes(size)
      ? filters.selectedSizes.filter((s) => s !== size)
      : [...filters.selectedSizes, size];
    onFiltersChange({ ...filters, selectedSizes: next });
  };

  const toggleColor = (color: string) => {
    const next = filters.selectedColors.includes(color)
      ? filters.selectedColors.filter((c) => c !== color)
      : [...filters.selectedColors, color];
    onFiltersChange({ ...filters, selectedColors: next });
  };

  const content = (
    <div className="space-y-5">
      {/* Size filter */}
      <div>
        <button
          onClick={() => toggleSection("size")}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
            Size
          </span>
          {expanded.size ? (
            <ChevronUp className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          )}
        </button>
        {expanded.size && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`flex h-8 min-w-[32px] items-center justify-center rounded-md border px-2 text-[10px] font-medium transition-colors ${
                  filters.selectedSizes.includes(size)
                    ? "border-[var(--color-obsidian)] bg-[var(--color-obsidian)] text-[var(--color-ivory)]"
                    : "border-[var(--color-border)] text-[var(--color-warm-gray)] hover:border-[var(--color-obsidian)]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price range */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
            Price Range
          </span>
          {expanded.price ? (
            <ChevronUp className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          )}
        </button>
        {expanded.price && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) =>
                onFiltersChange({ ...filters, priceMin: e.target.value })
              }
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-white)] px-2.5 py-1.5 text-xs text-[var(--color-obsidian)] placeholder:text-[var(--color-warm-gray)] focus:border-[var(--color-gold)] focus:outline-none"
            />
            <span className="text-xs text-[var(--color-warm-gray)]">—</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) =>
                onFiltersChange({ ...filters, priceMax: e.target.value })
              }
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-white)] px-2.5 py-1.5 text-xs text-[var(--color-obsidian)] placeholder:text-[var(--color-warm-gray)] focus:border-[var(--color-gold)] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Color filter */}
      <div>
        <button
          onClick={() => toggleSection("color")}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
            Color
          </span>
          {expanded.color ? (
            <ChevronUp className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          )}
        </button>
        {expanded.color && (
          <div className="mt-3 flex gap-2.5">
            {colorSwatches.map((swatch) => (
              <button
                key={swatch.name}
                onClick={() => toggleColor(swatch.name)}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  filters.selectedColors.includes(swatch.name)
                    ? "border-[var(--color-obsidian)] ring-1 ring-[var(--color-obsidian)] ring-offset-1"
                    : "border-[var(--color-border)]"
                }`}
                style={{ backgroundColor: swatch.value }}
                aria-label={swatch.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div>
        <button
          onClick={() => toggleSection("availability")}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
            Availability
          </span>
          {expanded.availability ? (
            <ChevronUp className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-warm-gray)]" />
          )}
        </button>
        {expanded.availability && (
          <label className="mt-3 flex items-center gap-2.5 cursor-pointer">
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                filters.inStockOnly
                  ? "border-[var(--color-obsidian)] bg-[var(--color-obsidian)]"
                  : "border-[var(--color-border)]"
              }`}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  inStockOnly: !filters.inStockOnly,
                })
              }
            >
              {filters.inStockOnly && (
                <svg
                  className="h-3 w-3 text-[var(--color-ivory)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs text-[var(--color-obsidian)]">
              In Stock Only
            </span>
          </label>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-16 space-y-1">
          <h3 className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)]">
            Filters
          </h3>
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-[var(--color-obsidian)]/40 lg:hidden"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-[var(--color-white)] p-page lg:hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
                Filters
              </h3>
              <button onClick={onClose} aria-label="Close filters">
                <X className="h-4 w-4 text-[var(--color-obsidian)]" />
              </button>
            </div>
            <div className="mt-5">{content}</div>
          </div>
        </>
      )}
    </>
  );
}
