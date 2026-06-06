import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-[var(--color-warm-gray)]" />
            )}
            {index === items.length - 1 ? (
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] transition-colors hover:text-[var(--color-obsidian)]"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
