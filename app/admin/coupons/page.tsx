"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Plus, X, Edit2, Trash2, Search, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  Coupon, CreateCouponInput,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Coupon Form Drawer (Create / Edit)
// ---------------------------------------------------------------------------

const EMPTY_FORM: CreateCouponInput & { id?: string } = {
  code: "",
  type: "PERCENTAGE",
  value: 0,
  minOrderValue: 0,
  maxUses: null,
  expiresAt: null,
  isActive: true,
};

function CouponDrawer({
  isOpen,
  initial,
  token,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  initial?: Coupon | null;
  token: string;
  onClose: () => void;
  onSaved: (coupon: Coupon) => void;
}) {
  const [form, setForm] = useState<CreateCouponInput & { id?: string }>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id,
        code: initial.code,
        type: initial.type,
        value: initial.type === "FLAT" ? initial.value / 100 : initial.value,
        minOrderValue: initial.minOrderValue / 100,
        maxUses: initial.maxUses,
        expiresAt: initial.expiresAt ? initial.expiresAt.slice(0, 10) : null,
        isActive: initial.isActive,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!form.id;

  async function handleSubmit() {
    setError(null);
    setIsSaving(true);
    try {
      // convert display values back to paise where needed
      const payload: CreateCouponInput = {
        code: form.code,
        type: form.type,
        value: form.type === "FLAT" ? Math.round((form.value ?? 0) * 100) : (form.value ?? 0),
        minOrderValue: Math.round((form.minOrderValue ?? 0) * 100),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };

      let saved: Coupon;
      if (isEdit && form.id) {
        const res = await updateCoupon(form.id, payload, token);
        saved = res.coupon;
      } else {
        const res = await createCoupon(payload, token);
        saved = res.coupon;
      }
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save coupon.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-ivory)] shadow-xl z-50 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="font-display text-xl text-[var(--color-obsidian)]">
            {isEdit ? "Edit Coupon" : "Add Coupon"}
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--color-obsidian)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 flex-1">
          {/* Code */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. WELCOME10"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Discount Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CreateCouponInput["type"] }))}
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount (₹)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>

          {/* Value */}
          {form.type !== "FREE_SHIPPING" && (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
                Value {form.type === "PERCENTAGE" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                min={0}
                value={form.value ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                placeholder={form.type === "PERCENTAGE" ? "10" : "500"}
                className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
              />
            </div>
          )}

          {/* Min Order */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Minimum Order Value (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.minOrderValue ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, minOrderValue: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Max Uses (leave empty for unlimited)
            </label>
            <input
              type="number"
              min={1}
              value={form.maxUses ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value ? parseInt(e.target.value) : null }))}
              placeholder="Unlimited"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">
              Expiry Date (optional)
            </label>
            <input
              type="date"
              value={form.expiresAt ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value || null }))}
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.isActive ?? true}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 accent-[var(--color-gold)]"
            />
            <label htmlFor="active" className="text-sm text-[var(--color-obsidian)]">Active coupon</label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-ivory)] sticky bottom-0">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full bg-[var(--color-obsidian)] text-[var(--color-ivory)] py-3 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving…" : isEdit ? "Update Coupon" : "Create Coupon"}
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token ?? "";
      setToken(tok);
      const { coupons: data } = await getCoupons(tok);
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id, token);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete coupon.");
    }
  }

  function handleSaved(coupon: Coupon) {
    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.id === coupon.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = coupon;
        return next;
      }
      return [coupon, ...prev];
    });
  }

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-obsidian)]">Coupons</h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">Manage discount codes and promotions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-obsidian)] px-4 py-2.5 rounded-md text-xs font-medium uppercase tracking-widest hover:border-[var(--color-obsidian)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => { setEditCoupon(null); setDrawerOpen(true); }}
            className="flex items-center gap-2 bg-[var(--color-obsidian)] text-[var(--color-ivory)] px-6 py-2.5 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-warm-gray)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupons…"
          className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[var(--color-obsidian)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
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
                {filtered.map((coupon) => {
                  let valueStr = "—";
                  if (coupon.type === "PERCENTAGE") valueStr = `${coupon.value}%`;
                  else if (coupon.type === "FLAT") valueStr = formatPrice(coupon.value);

                  const expiresStr = coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
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
                        <span className="font-medium text-[var(--color-obsidian)] bg-[var(--color-ivory)] px-2 py-1 rounded border border-[var(--color-border)] font-mono text-xs">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                        {coupon.type.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-obsidian)]">{valueStr}</td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                        {coupon.minOrderValue > 0 ? formatPrice(coupon.minOrderValue) : "None"}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-obsidian)]">{usesStr}</td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">{expiresStr}</td>
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
                          <button
                            onClick={() => { setEditCoupon(coupon); setDrawerOpen(true); }}
                            className="text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="text-[var(--color-warm-gray)] hover:text-red-600 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[var(--color-warm-gray)]">
                      {coupons.length === 0 ? "No coupons yet. Create your first one!" : "No coupons match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CouponDrawer
        isOpen={drawerOpen}
        initial={editCoupon}
        token={token}
        onClose={() => { setDrawerOpen(false); setEditCoupon(null); }}
        onSaved={handleSaved}
      />
    </div>
  );
}
