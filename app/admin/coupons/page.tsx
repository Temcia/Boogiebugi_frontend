"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Plus, X, Edit2, Trash2, Search } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_COUPONS = [
  {
    id: "c_1",
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minOrderValue: 0,
    usedCount: 45,
    maxUses: 100,
    expiresAt: "2026-12-31T23:59:59Z",
    isActive: true,
  },
  {
    id: "c_2",
    code: "FESTIVE500",
    type: "FLAT",
    value: 50000, // paise
    minOrderValue: 200000,
    usedCount: 12,
    maxUses: null,
    expiresAt: "2026-10-31T23:59:59Z",
    isActive: true,
  },
  {
    id: "c_3",
    code: "FREESHIP",
    type: "FREE_SHIPPING",
    value: 0,
    minOrderValue: 150000,
    usedCount: 89,
    maxUses: null,
    expiresAt: null,
    isActive: false,
  },
];

// ---------------------------------------------------------------------------
// Drawer Component
// ---------------------------------------------------------------------------

function CouponDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-ivory)] shadow-xl z-50 flex flex-col transform transition-transform overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="font-display text-xl text-[var(--color-obsidian)]">
            Add Coupon
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--color-obsidian)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-1">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Coupon Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Discount Type
            </label>
            <select className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]">
              <option value="PERCENTAGE">Percentage</option>
              <option value="FLAT">Flat Amount</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Value (₹ or %)
            </label>
            <input
              type="number"
              placeholder="10"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Minimum Order Value (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Max Uses (Optional)
            </label>
            <input
              type="number"
              placeholder="Leave empty for unlimited"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="active" className="w-4 h-4 accent-[var(--color-gold)]" defaultChecked />
            <label htmlFor="active" className="text-sm text-[var(--color-obsidian)]">
              Active coupon
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-ivory)] sticky bottom-0">
          <button className="w-full bg-[var(--color-obsidian)] text-[var(--color-ivory)] py-3 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors">
            Create Coupon
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CouponsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-obsidian)]">
            Coupons
          </h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">
            Manage discount codes and promotions
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center justify-center gap-2 bg-[var(--color-obsidian)] text-[var(--color-ivory)] px-6 py-2.5 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-warm-gray)]" />
          <input
            type="text"
            placeholder="Search coupons..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--color-ivory)] border-b border-[var(--color-border)]">
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Code</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Type</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Value</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Min Order</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Uses</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Expires</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Status</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_COUPONS.map((coupon) => {
                let valueStr = "";
                if (coupon.type === "PERCENTAGE") valueStr = `${coupon.value}%`;
                else if (coupon.type === "FLAT") valueStr = formatPrice(coupon.value);
                else valueStr = "-";

                const expiresStr = coupon.expiresAt
                  ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Never";

                const usesStr = coupon.maxUses
                  ? `${coupon.usedCount} / ${coupon.maxUses}`
                  : `${coupon.usedCount}`;

                return (
                  <tr
                    key={coupon.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-[var(--color-obsidian)] bg-[var(--color-ivory)] px-2 py-1 rounded border border-[var(--color-border)]">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                      {coupon.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-obsidian)]">
                      {valueStr}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                      {coupon.minOrderValue > 0 ? formatPrice(coupon.minOrderValue) : "None"}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-obsidian)]">
                      {usesStr}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                      {expiresStr}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded-full border ${
                          coupon.isActive
                            ? "text-[var(--color-gold)] border-[var(--color-gold)]"
                            : "text-[var(--color-warm-gray)] border-[var(--color-warm-gray)]"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)]" aria-label="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-[var(--color-warm-gray)] hover:text-red-600" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CouponDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
