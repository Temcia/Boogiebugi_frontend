"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";

const navLinks = [
  { label: "New Arrivals", href: "/products?category=new-arrivals" },
  { label: "Men", href: "/products/men" },
  { label: "Women", href: "/products/women" },
  { label: "Kids", href: "/products/kids" },
  { label: "Sale", href: "/products?category=sale" },
];


export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { openCart, totalItems } = useCartStore();
  const cartCount = totalItems();
  const wishlistCount = useWishlistStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-ivory)] border-b border-[var(--color-border)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-page py-3 lg:py-4">
        {/* Mobile: hamburger */}
        <button
          className="lg:hidden p-1"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-[var(--color-obsidian)]" />
        </button>

        {/* Logo — left on desktop, centered on mobile */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:shrink-0"
        >
          <Image
            src="/images/boogiebugi_logo.png"
            alt="BOOGIEBUGI"
            width={180}
            height={40}
            priority
            className="h-9 w-auto sm:h-10 lg:h-11"
          />
        </Link>

        {/* Desktop nav links — center */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Icons — right */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <button
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="hidden sm:block p-1 text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
            aria-label="Search"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Account — avatar if logged in, icon if not */}
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            className="hidden sm:flex items-center justify-center"
            aria-label="Account"
          >
            {isLoggedIn && user?.name ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-gold)] text-[10px] font-medium text-[var(--color-obsidian)]">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-5 w-5 text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]" strokeWidth={1.5} />
            )}
          </Link>
          {/* Wishlist button with badge */}
          <Link
            href="/wishlist"
            className="relative hidden sm:block p-1 text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[8px] font-medium text-[var(--color-obsidian)]">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart button with badge */}
          <button
            onClick={openCart}
            className="relative p-1 text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[8px] font-medium text-[var(--color-obsidian)]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Animated Search Overlay */}
      <div
        className={`absolute left-0 top-full z-40 w-full overflow-hidden bg-[var(--color-white)] border-b border-[var(--color-border)] shadow-md transition-all duration-300 ease-in-out ${
          searchOpen ? "max-h-40 py-6 opacity-100" : "max-h-0 py-0 opacity-0 border-transparent"
        }`}
      >
        <div className="mx-auto max-w-2xl px-page">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setSearchOpen(false);
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="relative flex items-center w-full"
          >
            <Search className="absolute left-4 h-5 w-5 text-[var(--color-warm-gray)]" strokeWidth={1.5} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-ivory)] py-3 pl-12 pr-24 text-sm text-[var(--color-obsidian)] focus:border-[var(--color-obsidian)] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 h-9 rounded-full bg-[var(--color-obsidian)] px-4 text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]"
            >
              Search
            </button>
            {/* Close Search Overlay Button inside the form (optional) or just rely on the toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute -right-8 p-1 text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] hidden sm:block"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          openCart={openCart}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />
      )}
    </header>
  );
}

function MobileMenu({ onClose, openCart, cartCount, wishlistCount }: { onClose: () => void; openCart: () => void; cartCount: number; wishlistCount: number }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const router = useRouter();
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--color-ivory)] shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-page py-4">
          <span className="font-display text-lg font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
            Menu
          </span>
          <button onClick={onClose} aria-label="Close menu" className="p-1">
            <X className="h-5 w-5 text-[var(--color-obsidian)]" />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto px-page py-6 space-y-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block py-3 text-sm font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--color-border)] px-page py-4 space-y-3">
          {/* Mobile Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (mobileSearchQuery.trim()) {
                onClose();
                router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
              }
            }}
            className="relative flex items-center w-full mb-2"
          >
            <Search className="absolute left-3 h-4 w-4 text-[var(--color-warm-gray)]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search..."
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-white)] py-2 pl-9 pr-3 text-sm text-[var(--color-obsidian)] focus:border-[var(--color-obsidian)] focus:outline-none transition-colors"
            />
          </form>
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            onClick={onClose}
            className="flex items-center gap-3 py-2 text-sm text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
          >
            {isLoggedIn && user?.name ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-gold)] text-[9px] font-medium text-[var(--color-obsidian)]">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-4 w-4" strokeWidth={1.5} />
            )}
            {isLoggedIn ? "Account" : "Sign In"}
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 py-2 text-sm text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
          >
            <Heart className="h-4 w-4" strokeWidth={1.5} />
            Wishlist
            {wishlistCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[8px] font-medium text-[var(--color-obsidian)]">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => { onClose(); openCart(); }}
            className="flex items-center gap-3 py-2 text-sm text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-gold)]"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            Cart
            {cartCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[8px] font-medium text-[var(--color-obsidian)]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
