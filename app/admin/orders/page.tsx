"use client";

import { useEffect, useState, useRef } from "react";
import { formatPrice } from "@/lib/utils";
import { Search, X, ChevronRight, Download, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getAdminOrders, updateAdminOrder, AdminOrder } from "@/lib/api";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED:  "var(--color-gold)",
  PROCESSING: "var(--color-gold)",
  SHIPPED:    "var(--color-obsidian)",
  DELIVERED:  "var(--color-obsidian)",
  CANCELLED:  "var(--color-warm-gray)",
  RETURNED:   "var(--color-warm-gray)",
  PENDING:    "var(--color-warm-gray)",
};

const FILTER_TABS = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

// ---------------------------------------------------------------------------
// Order Detail Modal (side drawer)
// ---------------------------------------------------------------------------

function OrderModal({
  order,
  token,
  onClose,
  onUpdated,
}: {
  order: AdminOrder | null;
  token: string;
  onClose: () => void;
  onUpdated: (updated: AdminOrder) => void;
}) {
  const [status, setStatus] = useState(order?.status ?? "");
  const [awb, setAwb] = useState(order?.awbNumber ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setStatus(order?.status ?? "");
    setAwb(order?.awbNumber ?? "");
    setSaveError(null);
    setSaveSuccess(false);
  }, [order]);

  if (!order) return null;

  async function handleUpdate() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const { order: updated } = await updateAdminOrder(order!.id, { status, awbNumber: awb }, token);
      onUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSaveError("Failed to update order. Please try again.");
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
            Order #{order.id.slice(-8).toUpperCase()}
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--color-obsidian)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Customer */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">Customer</h3>
            <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-md p-4 space-y-1">
              <p className="text-sm font-medium text-[var(--color-obsidian)]">{order.customer.name}</p>
              <p className="text-sm text-[var(--color-warm-gray)]">{order.customer.phone}</p>
              <div className="w-full h-px bg-[var(--color-border)] my-2" />
              <p className="text-sm text-[var(--color-obsidian)]">{order.address}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">Items</h3>
            <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-md p-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded border border-[var(--color-border)]" />
                  ) : (
                    <div className="w-10 h-12 rounded border border-[var(--color-border)] bg-[var(--color-ivory)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-obsidian)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--color-warm-gray)]">
                      {item.size}{item.color ? ` · ${item.color}` : ""} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-obsidian)] flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="w-full h-px bg-[var(--color-border)] my-2" />
              <div className="flex justify-between items-center font-display text-lg">
                <span className="text-[var(--color-obsidian)]">Total</span>
                <span className="text-[var(--color-obsidian)]">{formatPrice(order.total)}</span>
              </div>
              {order.discount > 0 && (
                <p className="text-xs text-[var(--color-gold)] text-right">Discount: −{formatPrice(order.discount)}</p>
              )}
            </div>
          </div>

          {/* Payment ID */}
          {order.paymentId && (
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-1">Payment ID</h3>
              <p className="text-xs font-mono text-[var(--color-obsidian)]">{order.paymentId}</p>
            </div>
          )}

          {/* Update Status */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">Update Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            >
              {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].map((s) => (
                <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          {/* AWB */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">AWB / Tracking Number</h3>
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="e.g. AWB123456"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          {saveSuccess && <p className="text-sm text-green-600">Order updated successfully!</p>}
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-ivory)] sticky bottom-0">
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="w-full bg-[var(--color-obsidian)] text-[var(--color-ivory)] py-3 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Update Order"}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadOrders(statusFilter = activeTab, searchQuery = search) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token ?? "";
      setToken(tok);
      const { orders: data } = await getAdminOrders(tok, {
        status: statusFilter === "All" ? undefined : statusFilter.toUpperCase(),
        search: searchQuery || undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    loadOrders(tab, search);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadOrders(activeTab, val), 400);
  }

  function handleUpdated(updated: AdminOrder) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  }

  function exportCSV() {
    const headers = ["Order ID", "Customer", "Total", "Status", "Date", "AWB"];
    const rows = orders.map((o) => [
      o.id, o.customer.name, formatPrice(o.total), o.status,
      new Date(o.createdAt).toLocaleDateString("en-IN"), o.awbNumber ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-obsidian)]">Orders</h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">
            {isLoading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders()}
            className="flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-obsidian)] px-4 py-2.5 rounded-md text-xs font-medium uppercase tracking-widest hover:border-[var(--color-obsidian)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-obsidian)] px-4 py-2.5 rounded-md text-xs font-medium uppercase tracking-widest hover:border-[var(--color-obsidian)] transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-none -mb-px border-b border-[var(--color-border)]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[var(--color-obsidian)] text-[var(--color-obsidian)]"
                  : "border-transparent text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-warm-gray)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search order ID or customer…"
            className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
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
                  <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Order ID</th>
                  <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Customer</th>
                  <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Total</th>
                  <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Status</th>
                  <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Date</th>
                  <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">AWB</th>
                  <th className="px-6 py-4 font-medium text-[var(--color-obsidian)] text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  });
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02] cursor-pointer"
                    >
                      <td className="px-6 py-4 text-[var(--color-obsidian)] font-medium font-mono text-xs">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-obsidian)]">{order.customer.name}</td>
                      <td className="px-6 py-4 text-[var(--color-obsidian)]">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span
                          className="text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded-full border"
                          style={{ color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">{dateStr}</td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">{order.awbNumber || "—"}</td>
                      <td className="px-6 py-4 text-right text-[var(--color-gold)]">
                        <ChevronRight className="w-4 h-4 inline-block" />
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-warm-gray)]">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderModal
        order={selectedOrder}
        token={token}
        onClose={() => setSelectedOrder(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
