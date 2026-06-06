import Link from "next/link";

const footerLinks = [
  { label: "New Arrivals", href: "/products?category=new-arrivals" },
  { label: "Men", href: "/products/men" },
  { label: "Women", href: "/products/women" },
  { label: "Kids", href: "/products/kids" },
  { label: "Sale", href: "/products?category=sale" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/boogiebugi" },
  { label: "WhatsApp", href: "https://wa.me/919999999999" },
  { label: "Pinterest", href: "https://pinterest.com/boogiebugi" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-obsidian)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-page py-12 sm:py-16">
        {/* Brand */}
        <h2 className="font-display text-2xl font-medium uppercase tracking-widest sm:text-3xl">
          BOOGIEBUGI
        </h2>

        {/* Nav links */}
        <nav className="mt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs font-medium uppercase tracking-widest text-[var(--color-ivory)] opacity-70 transition-opacity hover:opacity-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social */}
        <div className="mt-8 flex gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium uppercase tracking-widest text-[var(--color-ivory)] opacity-70 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="mt-10 text-xs text-[var(--color-warm-gray)] sm:mt-12">
          &copy; {new Date().getFullYear()} BOOGIEBUGI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
