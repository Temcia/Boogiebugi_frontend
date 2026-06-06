"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Shirt,
  Package,
  Layers,
  Tag,
  BarChart2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";

const LINKS = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Products", href: "/admin/products", icon: Shirt },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Layers },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    clearAuth();
    router.push("/");
  };

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between bg-[var(--color-obsidian)] px-4 py-3 shrink-0">
        <div className="flex flex-col">
          <Link href="/admin">
            <span className="font-display text-lg text-[var(--color-ivory)] tracking-widest uppercase">
              BOOGIEBUGI
            </span>
          </Link>
          <span className="text-[10px] text-[var(--color-gold)] font-medium uppercase tracking-widest">
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[var(--color-ivory)] p-1"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col bg-[var(--color-obsidian)] border-t border-gray-800 absolute top-[60px] left-0 right-0 z-50">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-6 py-4 text-sm tracking-widest uppercase transition-colors ${
                  isActive
                    ? "text-[var(--color-gold)] border-l-2 border-[var(--color-gold)] bg-black/20"
                    : "text-[var(--color-warm-gray)] hover:text-[var(--color-ivory)] hover:bg-black/20 border-l-2 border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-6 py-4 text-sm tracking-widest uppercase text-[var(--color-warm-gray)] hover:text-[var(--color-ivory)] hover:bg-black/20 border-l-2 border-transparent text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-[var(--color-obsidian)] shrink-0 h-full overflow-y-auto">
        <div className="p-8 flex flex-col items-center">
          <Link href="/admin">
            <h1 className="font-display text-xl text-[var(--color-ivory)] tracking-widest uppercase text-center">
              BOOGIEBUGI
            </h1>
          </Link>
          <span className="text-[10px] text-[var(--color-gold)] font-medium uppercase tracking-widest mt-1">
            Admin
          </span>
        </div>

        <nav className="flex-1 mt-6">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-8 py-4 text-xs font-medium tracking-widest uppercase transition-colors ${
                  isActive
                    ? "text-[var(--color-gold)] border-l-[3px] border-[var(--color-gold)] bg-black/20"
                    : "text-[var(--color-warm-gray)] hover:text-[var(--color-ivory)] border-l-[3px] border-transparent hover:bg-black/20"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 mt-auto">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-[var(--color-warm-gray)] hover:text-[var(--color-ivory)] transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
