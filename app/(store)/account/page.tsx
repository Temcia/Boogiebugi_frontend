"use client";

// /account — User account dashboard
// Shows user profile, quick-links to orders/wishlist, and sign-out.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Heart,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { signOut } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Quick-link cards
// ---------------------------------------------------------------------------

const ACCOUNT_LINKS = [
  {
    id: "orders",
    label: "My Orders",
    description: "Track, return, or buy again",
    href: "/account/orders",
    icon: Package,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    description: "Items you've saved",
    href: "/wishlist",
    icon: Heart,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoggedIn, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn() || !user) return null;

  async function handleSignOut() {
    await signOut();
    clearAuth();
    router.push("/");
  }

  // Derive display initial
  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.phone
    ? user.phone.charAt(0)
    : "U";

  return (
    <div
      className="min-h-screen bg-[var(--color-ivory)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-[var(--color-white)] border-b border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto px-[var(--page-padding)] py-8">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-obsidian)] flex items-center justify-center flex-shrink-0">
              <span
                className="text-xl font-medium text-[var(--color-ivory)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {initial}
              </span>
            </div>
            <div>
              <h1
                className="text-xl font-medium text-[var(--color-obsidian)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {user.name || "My Account"}
              </h1>
              <p className="text-sm text-[var(--color-warm-gray)] mt-0.5">
                {user.role === "ADMIN" ? "Administrator" : "Customer"}
              </p>
            </div>
          </div>

          {/* Contact details */}
          <div className="mt-5 flex flex-wrap gap-4">
            {user.phone && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--color-warm-gray)]">
                <Phone className="w-3.5 h-3.5" />
                +91 {user.phone}
              </div>
            )}
            {user.email && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--color-warm-gray)]">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </div>
            )}
            {!user.phone && !user.email && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--color-warm-gray)]">
                <User className="w-3.5 h-3.5" />
                No contact info
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-[var(--page-padding)] py-8 flex flex-col gap-3">

        {/* Quick-link cards */}
        {ACCOUNT_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              id={`account-link-${item.id}`}
              className="
                flex items-center gap-4
                bg-[var(--color-white)] border border-[var(--color-border)]
                rounded-[var(--radius-lg)] px-5 py-4
                hover:border-[var(--color-warm-gray)] hover:shadow-sm
                transition-all duration-150 group
              "
            >
              <div className="w-9 h-9 rounded-full bg-[var(--color-ivory)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-obsidian)] group-hover:border-[var(--color-obsidian)] transition-colors duration-150">
                <Icon className="w-4 h-4 text-[var(--color-warm-gray)] group-hover:text-[var(--color-ivory)] transition-colors duration-150" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-[var(--color-obsidian)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.label}
                </p>
                <p className="text-xs text-[var(--color-warm-gray)] mt-0.5">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-warm-gray)] group-hover:text-[var(--color-obsidian)] transition-colors duration-150 flex-shrink-0" />
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-[var(--color-border)] my-1" />

        {/* Sign out */}
        <button
          type="button"
          id="account-sign-out"
          onClick={handleSignOut}
          className="
            flex items-center gap-4
            bg-[var(--color-white)] border border-[var(--color-border)]
            rounded-[var(--radius-lg)] px-5 py-4 w-full text-left
            hover:border-[var(--color-warm-gray)] hover:shadow-sm
            transition-all duration-150 group
          "
        >
          <div className="w-9 h-9 rounded-full bg-[var(--color-ivory)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4 text-[var(--color-warm-gray)]" />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium text-[var(--color-obsidian)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sign Out
            </p>
            <p className="text-xs text-[var(--color-warm-gray)] mt-0.5">
              You&apos;ll be signed out of this device
            </p>
          </div>
        </button>
      </main>
    </div>
  );
}
