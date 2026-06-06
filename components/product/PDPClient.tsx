/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  Heart,
  Shirt,
  Minus,
  Plus,
  ChevronDown,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { PLPProductCard } from "./PLPProductCard";
import { ProductResponse } from "@/lib/api";

const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

const trustItems = [
  { icon: Truck, label: "Free Shipping" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: ShieldCheck, label: "Secure Payment" },
];

interface PDPClientProps {
  product: ProductResponse;
}

export function PDPClient({ product }: PDPClientProps) {
  const { addItem, openCart } = useCartStore();
  const {
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
    isWishlisted,
  } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color).filter(Boolean)));
  const colors = uniqueColors.length > 0 ? uniqueColors.map(c => ({ name: c, value: c })) : [{ name: "Default", value: "#000" }];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const uniqueSizes = Array.from(new Set(product.variants?.map(v => v.size).filter(Boolean)));
  const availableSizes = uniqueSizes.length > 0 ? uniqueSizes : allSizes;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem({
      productId: product.id,
      variantId: `${product.id}-${selectedSize}-${selectedColor.name}`,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name as string,
      quantity,
    });
    openCart();
  };



  const toggleSection = (key: string) =>
    setExpandedSection((prev) => (prev === key ? null : key));

  const savings = (product.comparePrice && product.comparePrice > product.price)
    ? product.comparePrice - product.price
    : 0;

  const related: ProductResponse[] = [];

  return (
    <div className="bg-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-page">

        {/* Main product section */}
        <div className="grid grid-cols-1 gap-6 pb-8 pt-1 lg:grid-cols-2 lg:gap-8">
          {/* ── LEFT: Image gallery ── */}
          <div>
            {/* Main image */}
            <div className="relative w-full h-[420px] overflow-hidden rounded-lg bg-[var(--color-ivory)] border border-[var(--color-border)]">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImage] ?? product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Shirt className="h-14 w-14 text-[var(--color-warm-gray)] opacity-20" />
                </div>
              )}
            </div>

            {/* Thumbnails — only show when there are multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 aspect-square overflow-hidden rounded-md border-2 transition-all ${
                      activeImage === i
                        ? "border-[var(--color-obsidian)] scale-105"
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-[var(--color-border)]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-contain bg-[var(--color-ivory)]"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="flex flex-col">
            {/* Category label */}
            <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)]">
              {product.category?.name ?? "—"}
            </p>

            {/* Product name */}
            <h1 className="mt-0.5 font-display text-xl font-medium text-[var(--color-obsidian)] sm:text-2xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < 5
                        ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                        : "text-[var(--color-border)]"
                      }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-[var(--color-warm-gray)]">
                5.0 &middot; 12 reviews
              </span>
            </div>

            {/* Price */}
            <div className="mt-3 flex items-center gap-2.5">
              <span className="text-lg font-medium text-[var(--color-obsidian)]">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-xs text-[var(--color-warm-gray)] line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--color-gold)]">
                    Save {formatPrice(savings)}
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="mt-3 border-t border-[var(--color-border)]" />

            {/* Color selector */}
            <div className="mt-3">
              <p className="text-[11px] font-medium text-[var(--color-obsidian)]">
                Color:{" "}
                <span className="text-[var(--color-warm-gray)]">
                  {selectedColor.name}
                </span>
              </p>
              <div className="mt-2 flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor.name === color.name
                        ? "border-[var(--color-obsidian)] ring-1 ring-[var(--color-obsidian)] ring-offset-1"
                        : "border-[var(--color-border)]"
                      }`}
                    style={{ backgroundColor: color.value as string }}
                    aria-label={color.name as string}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-[var(--color-obsidian)]">
                  Size
                </p>
                <button className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-gold)]">
                  Size Guide
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allSizes.map((size) => {
                  const isAvailable = availableSizes.includes(size);
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSize(size);
                          setSizeError(false);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`flex h-8 min-w-[32px] items-center justify-center rounded-md border px-2 text-[10px] font-medium transition-colors ${isSelected
                          ? "border-[var(--color-obsidian)] bg-[var(--color-obsidian)] text-[var(--color-ivory)]"
                          : isAvailable
                            ? "border-[var(--color-border)] text-[var(--color-obsidian)] hover:border-[var(--color-obsidian)]"
                            : "cursor-not-allowed border-[var(--color-border)] text-[var(--color-warm-gray)] line-through opacity-50"
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-3">
              <p className="text-[11px] font-medium text-[var(--color-obsidian)]">
                Quantity
              </p>
              <div className="mt-2 inline-flex items-center rounded-md border border-[var(--color-border)]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center text-[var(--color-obsidian)] transition-colors hover:bg-[var(--color-border)]/30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="flex h-8 w-9 items-center justify-center text-[11px] font-medium text-[var(--color-obsidian)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center text-[var(--color-obsidian)] transition-colors hover:bg-[var(--color-border)]/30"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Size error */}
            {sizeError && (
              <p className="mt-3 text-[10px] font-medium text-red-600">
                Please select a size
              </p>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="mt-3 flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-obsidian)] text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]"
            >
              Add to Cart &mdash;{" "}
              {formatPrice(
                product.price * quantity
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                if (wishlisted) {
                  removeWishlistItem(product.id);
                } else {
                  addWishlistItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    slug: product.slug,
                  });
                }
              }}
              className={`mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md border text-[11px] font-medium transition-colors ${wishlisted
                  ? "border-[var(--color-gold)] text-[var(--color-gold)]"
                  : "border-[var(--color-border)] text-[var(--color-obsidian)] hover:border-[var(--color-obsidian)]"
                }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${wishlisted ? "fill-[var(--color-gold)]" : ""}`}
                strokeWidth={1.5}
              />
              {wishlisted ? "Saved" : "Save to Wishlist"}
            </button>

            {/* Divider */}
            <div className="mt-3 border-t border-[var(--color-border)]" />

            {/* Description */}
            <p className="mt-3 text-xs leading-relaxed text-[var(--color-warm-gray)]">
              {product.description}
            </p>

            {/* Accordion sections */}
            <div className="mt-3 space-y-0">
              {[
                {
                  key: "details",
                  label: "Product Details",
                  content: product.description || "No product details available.",
                },
                {
                  key: "fit",
                  label: "Size & Fit",
                  content:
                    "Model is 6'1\" / 185cm and wears size M. Regular fit. For a relaxed fit, size up. Refer to our size guide for detailed measurements.",
                },
                {
                  key: "shipping",
                  label: "Shipping & Returns",
                  content:
                    "Free shipping on orders above ₹2,999. Standard delivery in 5-7 business days. Easy 30-day returns. Refund processed within 5 business days of receiving the return.",
                },
              ].map((section) => (
                <div
                  key={section.key}
                  className="border-b border-[var(--color-border)]"
                >
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full items-center justify-between py-2.5"
                  >
                    <span className="text-[11px] font-medium text-[var(--color-obsidian)]">
                      {section.label}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[var(--color-warm-gray)] transition-transform ${expandedSection === section.key ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {expandedSection === section.key && (
                    <p className="pb-2.5 text-[11px] leading-relaxed text-[var(--color-warm-gray)]">
                      {section.content}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex items-center justify-between">
              {trustItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1"
                >
                  <item.icon
                    className="h-3.5 w-3.5 text-[var(--color-obsidian)]"
                    strokeWidth={1.5}
                  />
                  <span className="text-[9px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews section ── */}
        <div className="border-t border-[var(--color-border)] py-8">
          <h2 className="font-display text-lg font-medium text-[var(--color-obsidian)] sm:text-xl">
            Customer Reviews
          </h2>

          {/* Average rating */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-medium text-[var(--color-obsidian)]">
              5.0
            </span>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < 5
                        ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                        : "text-[var(--color-border)]"
                      }`}
                  />
                ))}
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--color-warm-gray)]">
                Based on 12 reviews
              </p>
            </div>
          </div>

          {/* Mock reviews */}
          <div className="mt-4 space-y-3">
            {[
              {
                name: "Priya M.",
                date: "May 2026",
                rating: 5,
                text: "Absolutely love the quality and fit. The fabric feels premium and the stitching is impeccable. Will definitely be ordering more pieces from BOOGIEBUGI.",
              },
              {
                name: "Arjun K.",
                date: "April 2026",
                rating: 4,
                text: "Great product overall. The sizing was accurate and the material is very comfortable. Took off one star because delivery took a bit longer than expected.",
              },
              {
                name: "Meera S.",
                date: "April 2026",
                rating: 5,
                text: "This has become my go-to brand for everyday luxury. The attention to detail is remarkable. The packaging was also beautiful — felt like a real treat unboxing it.",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[var(--color-obsidian)]">
                      {review.name}
                    </span>
                    <span className="rounded bg-[var(--color-gold)]/15 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-[var(--color-gold)]">
                      Verified
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--color-warm-gray)]">
                    {review.date}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-2.5 w-2.5 ${j < review.rating
                          ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                          : "text-[var(--color-border)]"
                        }`}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-warm-gray)]">
                  {review.text}
                </p>
              </div>
            ))}
          </div>

          <button className="mt-4 flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] px-5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:border-[var(--color-obsidian)]">
            Write a Review
          </button>
        </div>

        {/* ── You may also like ── */}
        {related.length > 0 && (
          <div className="border-t border-[var(--color-border)] py-8">
            <h2 className="font-display text-lg font-medium text-[var(--color-obsidian)] sm:text-xl">
              You May Also Like
            </h2>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:gap-4 lg:pb-0">
              {related.map((p) => (
                <div key={p.id} className="w-44 shrink-0 lg:w-auto">
                  <PLPProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
