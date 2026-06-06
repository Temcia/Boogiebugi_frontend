import Link from "next/link";
import {
  Search,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Mail,
  Home,
  LayoutGrid,
  User,
  ShoppingBag,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

import { getCategories, getProducts, Category, ProductResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

const trustItems = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹2,999" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected checkout" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30 day return policy" },
];

/* ──────────────────────────────────────────────
   Page
   ────────────────────────────────────────────── */

export default async function HomePage() {
  let categoriesData: Category[] = [];
  let newArrivalsData: ProductResponse[] = [];

  try {
    const [catsRes, prodsRes] = await Promise.all([
      getCategories(),
      getProducts("sort=newest&limit=5")
    ]);
    categoriesData = catsRes.categories || [];
    newArrivalsData = prodsRes.products || [];
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  return (
    <>
      <MobileSearchBar />
      <HeroSection />
      <TrustBar />
      <CategorySection categories={categoriesData} />
      <SaleBanner />
      <NewArrivalsSection products={newArrivalsData} />
      <NewsletterSection />
      <MobileBottomNav />
    </>
  );
}

/* ── Mobile sticky search ── */

function MobileSearchBar() {
  return (
    <div className="sticky top-[52px] z-40 bg-[var(--color-ivory)] px-page py-1.5 lg:hidden">
      <form action="/search" method="get" className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-2 focus-within:border-[var(--color-obsidian)] transition-colors">
        <Search className="h-3.5 w-3.5 shrink-0 text-[var(--color-warm-gray)]" />
        <input
          type="text"
          name="q"
          placeholder="Search for products..."
          className="w-full bg-transparent text-xs text-[var(--color-obsidian)] focus:outline-none placeholder:text-[var(--color-warm-gray)]"
        />
      </form>
    </div>
  );
}

/* ── 1. Hero Section ── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ivory)]">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero_section1.mp4" type="video/mp4" />
      </video>

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-white/70"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-page py-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-12">
        {/* Left: text */}
        <div className="text-center lg:text-left">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)]">
            New Season Collection
          </p>
          <h1 className="mt-2 font-display text-2xl font-medium leading-tight text-[var(--color-obsidian)] sm:text-3xl lg:text-4xl">
            Timeless Pieces for the Modern Minimalist
          </h1>
          <p className="mt-2 text-sm text-[var(--color-warm-gray)]">
            Curated styles, quality you love, delivered to your door.
          </p>
          <Link href="/products?category=new-arrivals" className="mt-4 inline-block">
            <Button variant="default" size="lg">
              SHOP NOW &rarr;
            </Button>
          </Link>
        </div>

        {/* Right: Image */}
        <div className="relative mt-8 lg:mt-0">
          <div className="relative mx-auto h-[420px] max-w-sm lg:max-w-none flex items-center justify-center">
            <img
              src="/images/hero_section.png"
              alt="Hero Collection"
              className="h-full w-full object-contain scale-[1.3] lg:scale-[1.5] transform transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2. Trust Bar ── */

function TrustBar() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-white)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-page py-5 sm:grid-cols-3 sm:gap-0">
        {trustItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-center gap-2.5 text-center sm:border-r sm:border-[var(--color-border)] last:border-r-0"
          >
            <item.icon className="h-4 w-4 shrink-0 text-[var(--color-obsidian)]" strokeWidth={1.5} />
            <div className="text-left">
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
                {item.title}
              </p>
              <p className="text-[11px] text-[var(--color-warm-gray)]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 3. Shop by Category ── */

function CategorySection({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-page py-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-medium text-[var(--color-obsidian)] sm:text-2xl">
            Shop by Category
          </h2>
          <Link
            href="/products"
            className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-gold)] transition-opacity hover:opacity-80"
          >
            Browse All &rarr;
          </Link>
        </div>

        {/* Category row — horizontal scroll on mobile */}
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-none sm:justify-center sm:gap-16 lg:gap-24 sm:overflow-x-visible sm:pb-0">
          {categories.slice(0, 5).map((cat) => {
            const categoryImages: Record<string, string> = {
              men: '/images/men_circle.png',
              women: '/images/women_circle.png',
              kids: '/images/kid_circle.png',
              kid: '/images/kid_circle.png',
              sale: '/images/sale_circle.png',
            };
            const slugLower = cat.slug.toLowerCase();
            const nameLower = cat.name.toLowerCase();
            const imgSrc = categoryImages[slugLower] || categoryImages[nameLower];

            return (
              <Link
                key={cat.id}
                href={slugLower === 'sale' || nameLower === 'sale' ? '/products?category=sale' : `/products/${cat.slug}`}
                className="group flex w-20 shrink-0 flex-col items-center sm:w-32"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-transparent overflow-hidden transition-transform group-hover:scale-105">
                  {imgSrc ? (
                    <img src={imgSrc} alt={cat.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-border)]">
                      <Shirt className="h-6 w-6 text-[var(--color-warm-gray)] opacity-30" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] text-center">
                  {cat.name}
                </p>
                <p className="text-[10px] text-[var(--color-warm-gray)]">
                  {cat.children?.length ? `${cat.children.length} subcategories` : "Shop now"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 4. Sale Banner ── */

function SaleBanner() {
  return (
    <section className="bg-[var(--color-obsidian)]">
      <div className="mx-auto max-w-7xl px-page py-8 lg:flex lg:items-center lg:justify-between lg:py-10">
        {/* Left: text */}
        <div className="text-center lg:text-left">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)]">
            Limited Time Offer
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium text-[var(--color-ivory)] sm:text-3xl lg:text-4xl">
            MID-SEASON SALE
          </h2>
          <p className="mt-2 text-sm text-[var(--color-warm-gray)]">
            Enjoy up to 30% off on selected collections.
          </p>
          <Link href="/products?category=sale" className="mt-4 inline-block">
            <Button variant="ghost" size="lg" className="border-[var(--color-ivory)] text-[var(--color-ivory)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-obsidian)]">
              EXPLORE DEALS
            </Button>
          </Link>
        </div>

        {/* Right: circular badge */}
        <div className="mt-6 flex justify-center lg:mt-0">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-[var(--color-gold)] sm:h-40 sm:w-40">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-gold)]">
                Up to
              </p>
              <p className="font-display text-3xl font-medium text-[var(--color-gold)] sm:text-4xl">
                30%
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-gold)]">
                Off
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 5. New Arrivals ── */

function NewArrivalsSection({ products }: { products: ProductResponse[] }) {
  return (
    <section className="bg-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-page py-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-medium text-[var(--color-obsidian)] sm:text-2xl">
            New Arrivals
          </h2>
          <Link
            href="/products?category=new-arrivals"
            className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-gold)] transition-opacity hover:opacity-80"
          >
            View All &rarr;
          </Link>
        </div>

        {/* Product cards — 2-col mobile, 5-col desktop */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
}: {
  product: ProductResponse;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative overflow-hidden rounded-lg bg-[var(--color-white)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm"
    >
      {/* Image placeholder */}
      <div className="relative h-[280px] bg-[var(--color-border)] overflow-hidden flex items-center justify-center">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <Shirt className="h-8 w-8 text-[var(--color-warm-gray)] opacity-25" />
        )}

        {/* Wishlist heart — visible on hover */}
        <button
          className="absolute right-2.5 top-2.5 rounded-full bg-[var(--color-white)] p-1.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          aria-label="Add to wishlist"
        >
          <Heart className="h-3.5 w-3.5 text-[var(--color-obsidian)]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-medium text-[var(--color-obsidian)] truncate">
          {product.name}
        </p>
        <p className="mt-0.5 text-xs font-medium text-[var(--color-warm-gray)]">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

/* ── 6. Newsletter ── */

function NewsletterSection() {
  return (
    <section className="bg-[var(--color-charcoal)]">
      <div className="mx-auto max-w-2xl px-page py-8 text-center">
        <Mail className="mx-auto h-6 w-6 text-[var(--color-ivory)] opacity-70" />
        <h2 className="mt-2 font-display text-xl font-medium text-[var(--color-ivory)] sm:text-2xl">
          Join the Inner Circle
        </h2>
        <p className="mt-1.5 text-sm text-[var(--color-warm-gray)]">
          Subscribe for early access to new collections and exclusive styling advice.
        </p>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-0">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-obsidian)] placeholder:text-[var(--color-warm-gray)] focus:border-[var(--color-gold)] focus:outline-none sm:rounded-r-none sm:border-r-0"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-gold)] px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-opacity hover:opacity-90 sm:rounded-l-none"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

/* ── Mobile Bottom Navigation Bar ── */

function MobileBottomNav() {
  const items = [
    { icon: Home, label: "Home", href: "/" },
    { icon: LayoutGrid, label: "Categories", href: "/categories" },
    { icon: User, label: "Account", href: "/account" },
    { icon: ShoppingBag, label: "Cart", href: "/cart" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-charcoal)] bg-[var(--color-obsidian)] lg:hidden">
      <div className="flex items-center justify-around py-1.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-0.5 text-[var(--color-ivory)]"
          >
            <item.icon className="h-4.5 w-4.5" strokeWidth={1.5} />
            <span className="text-[9px] font-medium uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
