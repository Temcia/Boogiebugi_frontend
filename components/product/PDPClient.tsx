/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { PLPProductCard } from "./PLPProductCard";
import { createClient } from "@/lib/supabase";
import {
  ProductResponse,
  Review,
  getProductReviews,
  submitProductReview,
} from "@/lib/api";

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
  const router = useRouter();
  const { addItem, openCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
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

  // ── Reviews state ──
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReviewsLoading(true);
    getProductReviews(product.id)
      .then((data) => {
        if (!cancelled) {
          setReviews(data.reviews);
          setReviewCount(data.count);
          setAvgRating(data.avgRating);
        }
      })
      .catch(() => {
        // silently fail — show empty state
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => { cancelled = true; };
  }, [product.id]);

  const handleSubmitReview = async () => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const t = session?.access_token;
      if (!t) throw new Error("Not authenticated");
      await submitProductReview(
        product.id,
        { rating: reviewRating, title: reviewTitle || undefined, body: reviewBody || undefined },
        t
      );
      // Refresh reviews
      const data = await getProductReviews(product.id);
      setReviews(data.reviews);
      setReviewCount(data.count);
      setAvgRating(data.avgRating);
      setReviewSuccess(true);
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess(false);
      }, 1500);
    } catch (err: any) {
      setReviewError(err.message ?? "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    // Find the real variant ID from the product's variants list
    const matchedVariant = product.variants?.find(
      (v) =>
        v.size === selectedSize &&
        (!v.color || v.color === selectedColor.name || selectedColor.name === "Default")
    ) ?? product.variants?.find((v) => v.size === selectedSize);

    const variantId = matchedVariant?.id ?? `${product.id}-${selectedSize}-${selectedColor.name}`;

    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? undefined,
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
                    className={`h-3 w-3 ${
                      i < Math.round(avgRating)
                        ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                        : "text-[var(--color-border)]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-[var(--color-warm-gray)]">
                {reviewCount > 0 ? `${avgRating.toFixed(1)} · ${reviewCount} review${reviewCount !== 1 ? "s" : ""}` : "No reviews yet"}
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
                if (!isLoggedIn()) {
                  router.push(`/login?redirect=/product/${product.slug}`);
                  return;
                }
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
              {reviewCount > 0 ? avgRating.toFixed(1) : "—"}
            </span>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(avgRating)
                        ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                        : "text-[var(--color-border)]"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--color-warm-gray)]">
                {reviewCount > 0
                  ? `Based on ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
                  : "No reviews yet — be the first!"}
              </p>
            </div>
          </div>

          {/* Reviews list */}
          <div className="mt-4 space-y-3">
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-[var(--color-warm-gray)]">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[var(--color-obsidian)]">
                        {review.user.name ?? "Customer"}
                      </span>
                      {review.isVerified && (
                        <span className="rounded bg-[var(--color-gold)]/15 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-[var(--color-gold)]">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--color-warm-gray)]">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.title && (
                    <p className="mt-1 text-[11px] font-medium text-[var(--color-obsidian)]">
                      {review.title}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-2.5 w-2.5 ${
                          j < review.rating
                            ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                            : "text-[var(--color-border)]"
                        }`}
                      />
                    ))}
                  </div>
                  {review.body && (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-warm-gray)]">
                      {review.body}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => {
              if (!isLoggedIn()) {
                router.push(`/login?redirect=/product/${product.slug}`);
                return;
              }
              setShowReviewModal(true);
            }}
            className="mt-4 flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] px-5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:border-[var(--color-obsidian)]"
          >
            Write a Review
          </button>
        </div>

        {/* ── Write a Review modal ── */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-ivory)] p-6 shadow-2xl">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewError(null);
                  setReviewSuccess(false);
                }}
                className="absolute right-4 top-4 text-[var(--color-warm-gray)] transition-colors hover:text-[var(--color-obsidian)]"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-display text-base font-medium text-[var(--color-obsidian)]">
                Write a Review
              </h3>
              <p className="mt-0.5 text-[11px] text-[var(--color-warm-gray)]">
                {product.name}
              </p>

              {reviewSuccess ? (
                <div className="mt-6 flex flex-col items-center gap-2 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[12px] font-medium text-green-700">Review submitted!</p>
                </div>
              ) : (
                <>
                  {/* Star rating selector */}
                  <div className="mt-4">
                    <p className="text-[11px] font-medium text-[var(--color-obsidian)]">Your Rating</p>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          onMouseEnter={() => setReviewHover(i + 1)}
                          onMouseLeave={() => setReviewHover(0)}
                          onClick={() => setReviewRating(i + 1)}
                          aria-label={`Rate ${i + 1} star${i !== 0 ? "s" : ""}`}
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              i < (reviewHover || reviewRating)
                                ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                                : "text-[var(--color-border)]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mt-4">
                    <label className="text-[11px] font-medium text-[var(--color-obsidian)]">
                      Title <span className="text-[var(--color-warm-gray)] font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Sum up your experience"
                      className="mt-1.5 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-[12px] text-[var(--color-obsidian)] outline-none placeholder:text-[var(--color-warm-gray)]/60 focus:border-[var(--color-obsidian)]"
                    />
                  </div>

                  {/* Body */}
                  <div className="mt-3">
                    <label className="text-[11px] font-medium text-[var(--color-obsidian)]">
                      Review <span className="text-[var(--color-warm-gray)] font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="Tell us what you think about this product"
                      rows={4}
                      className="mt-1.5 w-full resize-none rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-[12px] text-[var(--color-obsidian)] outline-none placeholder:text-[var(--color-warm-gray)]/60 focus:border-[var(--color-obsidian)]"
                    />
                  </div>

                  {reviewError && (
                    <p className="mt-2 text-[11px] text-red-600">{reviewError}</p>
                  )}

                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                    className="mt-4 flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-obsidian)] text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Submitting…" : "Submit Review"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

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
