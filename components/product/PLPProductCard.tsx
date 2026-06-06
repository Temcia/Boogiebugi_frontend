import Link from "next/link";
import { Heart, Shirt } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist.store";
import { ProductResponse } from "@/lib/api";

export function PLPProductCard({ product }: { product: ProductResponse }) {
  const { addItem, removeItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlisted) {
      removeItem(product.id);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
      });
    }
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative overflow-hidden rounded-lg bg-[var(--color-white)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm"
    >
      {/* Image placeholder — 3:4 ratio */}
      <div className="relative aspect-[3/4] bg-[var(--color-border)] overflow-hidden flex items-center justify-center">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <Shirt className="h-8 w-8 text-[var(--color-warm-gray)] opacity-25" />
        )}

        {/* Wishlist heart — visible on hover or if wishlisted */}
        <button
          onClick={toggleWishlist}
          className={`absolute right-2.5 top-2.5 rounded-full bg-[var(--color-white)] p-1.5 shadow-sm transition-opacity ${
            wishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              wishlisted
                ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                : "text-[var(--color-obsidian)]"
            }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Out of stock overlay */}
        {product.variants?.length > 0 && product.variants.every(v => v.stock === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-obsidian)]/40">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)]">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        {/* Category label */}
        <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)]">
          {product.category?.name ?? "—"}
        </p>

        {/* Product name */}
        <p className="mt-0.5 text-xs font-medium text-[var(--color-obsidian)] truncate">
          {product.name}
        </p>

        {/* Price row */}
        <div className="mt-1 flex items-center gap-1.5">
          {product.comparePrice && product.comparePrice > product.price ? (
            <>
              <span className="text-xs font-medium text-[var(--color-obsidian)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-[11px] text-[var(--color-warm-gray)] line-through">
                {formatPrice(product.comparePrice)}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-[var(--color-obsidian)]">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Size dots */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          {product.variants?.map((v) => v.size).filter(Boolean).filter((val, i, arr) => arr.indexOf(val) === i).map((size) => (
            <span
              key={size}
              className="flex h-5 min-w-[20px] items-center justify-center rounded-md border border-[var(--color-border)] px-1 text-[9px] font-medium text-[var(--color-warm-gray)]"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
