"use client";

import Link from "next/link";
import { Heart, Shirt, X } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist.store";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { formatPrice } from "@/lib/utils";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Wishlist", href: "/wishlist" },
];

export default function WishlistPage() {
  const { items, totalItems, removeItem } = useWishlistStore();
  const count = totalItems();

  return (
    <div className="bg-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-page">
        <Breadcrumb items={breadcrumbItems} />

        <div className="pb-4">
          <h1 className="font-display text-2xl font-medium text-[var(--color-obsidian)]">
            My Wishlist
          </h1>
          <p className="mt-1 text-xs text-[var(--color-warm-gray)]">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>

        {count === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-10 w-10 text-[var(--color-warm-gray)] opacity-30" />
            <p className="mt-3 text-sm font-medium text-[var(--color-obsidian)]">
              Your wishlist is empty
            </p>
            <p className="mt-1 text-xs text-[var(--color-warm-gray)]">
              Save items you love for later.
            </p>
            <Link
              href="/products"
              className="mt-4 rounded-md bg-[var(--color-obsidian)] px-5 py-2 text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Product grid */
          <div className="grid grid-cols-2 gap-3 pb-10 md:grid-cols-3 lg:gap-4">
            {items.map((item) => (
              <Link
                key={item.productId}
                href={`/product/${item.slug}`}
                className="group relative overflow-hidden rounded-lg bg-[var(--color-white)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                {/* Image placeholder */}
                <div className="relative aspect-[3/4] bg-[var(--color-border)] flex items-center justify-center">
                  <Shirt className="h-8 w-8 text-[var(--color-warm-gray)] opacity-25" />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.productId);
                    }}
                    className="absolute right-2.5 top-2.5 rounded-full bg-[var(--color-white)] p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from wishlist"
                  >
                    <X className="h-3.5 w-3.5 text-[var(--color-obsidian)]" />
                  </button>
                </div>
                {/* Info */}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-[var(--color-obsidian)] truncate">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--color-obsidian)]">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
