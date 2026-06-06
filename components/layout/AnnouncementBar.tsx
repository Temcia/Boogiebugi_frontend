"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-[var(--color-gold)] text-[var(--color-obsidian)]">
      <div className="relative flex items-center justify-center px-page py-2 text-center text-xs font-medium tracking-wide sm:text-sm">
        <span>Free shipping on orders above ₹2,999</span>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
