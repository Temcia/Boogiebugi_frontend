"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { IndianRupee, ShoppingBag, Users, Clock, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getAdminDashboard, AdminDashboardData } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED:  "var(--color-gold)",
  PROCESSING: "var(--color-gold)",
  SHIPPED:    "var(--color-obsidian)",
  DELIVERED:  "var(--color-obsidian)",
  CANCELLED:  "var(--color-warm-gray)",
  RETURNED:   "var(--color-warm-gray)",
  PENDING:    "var(--color-warm-gray)",
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");
      const result = await getAdminDashboard(session.access_token);
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-[var(--color-obsidian)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <p className="text-sm text-[var(--color-warm-gray)]">{error ?? "No data"}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--color-obsidian)] border border-[var(--color-border)] px-4 py-2 rounded-md hover:border-[var(--color-obsidian)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const STATS = [
    { label: "Total Revenue",   value: data.totalRevenue,   type: "currency", icon: IndianRupee },
    { label: "Total Orders",    value: data.totalOrders,    type: "number",   icon: ShoppingBag },
    { label: "Total Customers", value: data.totalCustomers, type: "number",   icon: Users },
    { label: "Pending Orders",  value: data.pendingOrders,  type: "number",   icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-obsidian)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">Overview of your store&apos;s performance</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
              <Icon className="w-5 h-5 text-[var(--color-gold)] mb-4" />
              <div className="font-display text-2xl text-[var(--color-obsidian)]">
                {stat.type === "currency" ? formatPrice(stat.value) : stat.value.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mt-1">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-display text-lg text-[var(--color-obsidian)]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-medium uppercase tracking-widest text-[var(--color-gold)] hover:underline">
            View all
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--color-warm-gray)]">No orders yet.</div>
        ) : (
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
                {data.recentOrders.map((order) => {
                  const dateStr = new Date(order.date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  });
                  return (
                    <tr key={order.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02]">
                      <td className="px-6 py-4 text-[var(--color-obsidian)] font-mono text-xs">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-obsidian)]">{order.customer}</td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">{order.items}</td>
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
                      <td className="px-6 py-4 text-right">
                        <Link
                          href="/admin/orders"
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
        )}
      </div>
    </div>
  );
}
