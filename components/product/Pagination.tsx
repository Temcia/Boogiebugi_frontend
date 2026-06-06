import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 py-6"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-warm-gray)] transition-colors hover:border-[var(--color-obsidian)] hover:text-[var(--color-obsidian)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
            page === currentPage
              ? "bg-[var(--color-obsidian)] text-[var(--color-ivory)]"
              : "border border-[var(--color-border)] text-[var(--color-warm-gray)] hover:border-[var(--color-obsidian)] hover:text-[var(--color-obsidian)]"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-warm-gray)] transition-colors hover:border-[var(--color-obsidian)] hover:text-[var(--color-obsidian)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
