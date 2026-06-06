"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { IndianRupee, ShoppingBag, Users, Clock } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const STATS = [
  { label: "Total Revenue", value: 124500000, type: "currency", icon: IndianRupee },
  { label: "Total Orders", value: 124, type: "number", icon: ShoppingBag },
  { label: "Total Customers", value: 89, type: "number", icon: Users },
  { label: "Pending Orders", value: 12, type: "number", icon: Clock },
];

const RECENT_ORDERS = [
  {
    id: "ord_1a2b3c4d",
    customer: "Swarup Ku",
    items: 2,
    total: 698000,
    status: "CONFIRMED",
    date: "2026-06-05T10:30:00Z",
  },
  {
    id: "ord_5e6f7g8h",
    customer: "Jane Doe",
    items: 1,
    total: 349000,
    status: "PROCESSING",
    date: "2026-06-04T15:45:00Z",
  },
  {
    id: "ord_9i0j1k2l",
    customer: "John Smith",
    items: 3,
    total: 1047000,
    status: "SHIPPED",
    date: "2026-06-03T09:15:00Z",
  },
  {
    id: "ord_3m4n5o6p",
    customer: "Alice Brown",
    items: 1,
    total: 189900,
    status: "DELIVERED",
    date: "2026-06-02T14:20:00Z",
  },
  {
    id: "ord_7q8r9s0t",
    customer: "Bob White",
    items: 2,
    total: 699800,
    status: "PENDING",
    date: "2026-06-05T11:00:00Z",
  },
];

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "var(--color-gold)",
  PROCESSING: "var(--color-gold)",
  SHIPPED: "var(--color-obsidian)",
  DELIVERED: "var(--color-obsidian)",
  CANCELLED: "var(--color-warm-gray)",
  RETURNED: "var(--color-warm-gray)",
  PENDING: "var(--color-warm-gray)",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-obsidian)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--color-warm-gray)] mt-1">
          Overview of your store&apos;s performance
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5"
            >
              <Icon className="w-5 h-5 text-[var(--color-gold)] mb-4" />
              <div className="font-display text-2xl text-[var(--color-obsidian)]">
                {stat.type === "currency" ? formatPrice(stat.value) : stat.value}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mt-1">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-border)]">
          <h2 className="font-display text-lg text-[var(--color-obsidian)]">
            Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--color-ivory)] border-b border-[var(--color-border)]">
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Order ID</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Customer</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Items</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Total</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Status</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Date</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((order) => {
                const dateStr = new Date(order.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02]"
                  >
                    <td className="px-6 py-4 text-[var(--color-obsidian)]">
                      {order.id.slice(0, 12)}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-obsidian)]">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                      {order.items}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-obsidian)]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded-full border"
                        style={{
                          color: STATUS_COLORS[order.status],
                          borderColor: STATUS_COLORS[order.status],
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                      {dateStr}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders?id=${order.id}`}
                        className="text-xs font-medium text-[var(--color-gold)] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
