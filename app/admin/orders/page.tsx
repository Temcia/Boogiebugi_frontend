"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Search, X, ChevronRight, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

type OrderItem = {
  name: string;
  size: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer: { name: string; email: string; phone: string };
  total: number;
  status: string;
  date: string;
  awb: string;
  items: OrderItem[];
  address: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ord_1a2b3c4d",
    customer: { name: "Swarup Ku", email: "swarup@example.com", phone: "9876543210" },
    total: 698000,
    status: "CONFIRMED",
    date: "2026-06-05T10:30:00Z",
    awb: "",
    items: [
      { name: "Linen Structured Shirt", size: "M", price: 349000, quantity: 1 },
      { name: "Relaxed Cargo Pants", size: "32", price: 349000, quantity: 1 },
    ],
    address: "123 Main St, Mumbai, MH, 400001",
  },
  {
    id: "ord_5e6f7g8h",
    customer: { name: "Jane Doe", email: "jane@example.com", phone: "9876543211" },
    total: 349000,
    status: "PROCESSING",
    date: "2026-06-04T15:45:00Z",
    awb: "",
    items: [
      { name: "Relaxed Cargo Pants", size: "28", price: 349000, quantity: 1 },
    ],
    address: "456 Park Ave, Delhi, DL, 110001",
  },
  {
    id: "ord_9i0j1k2l",
    customer: { name: "John Smith", email: "john@example.com", phone: "9876543212" },
    total: 1047000,
    status: "SHIPPED",
    date: "2026-06-03T09:15:00Z",
    awb: "AWB123456789",
    items: [
      { name: "Linen Structured Shirt", size: "L", price: 349000, quantity: 3 },
    ],
    address: "789 Lake Rd, Bangalore, KA, 560001",
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

const FILTER_TABS = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

// ---------------------------------------------------------------------------
// Drawer Component
// ---------------------------------------------------------------------------

function OrderModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-ivory)] shadow-xl z-50 flex flex-col transform transition-transform overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="font-display text-xl text-[var(--color-obsidian)]">
            Order #{order.id.slice(0, 8)}
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--color-obsidian)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Customer Details */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">
              Customer
            </h3>
            <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-md p-4 space-y-1">
              <p className="text-sm font-medium text-[var(--color-obsidian)]">{order.customer.name}</p>
              <p className="text-sm text-[var(--color-warm-gray)]">{order.customer.email}</p>
              <p className="text-sm text-[var(--color-warm-gray)]">+91 {order.customer.phone}</p>
              <div className="w-full h-px bg-[var(--color-border)] my-2" />
              <p className="text-sm text-[var(--color-obsidian)]">{order.address}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">
              Items
            </h3>
            <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-md p-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-obsidian)]">{item.name}</p>
                    <p className="text-xs text-[var(--color-warm-gray)]">Size: {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-obsidian)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="w-full h-px bg-[var(--color-border)] my-2" />
              <div className="flex justify-between items-center font-display text-lg">
                <span className="text-[var(--color-obsidian)]">Total</span>
                <span className="text-[var(--color-obsidian)]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">
              Update Status
            </h3>
            <select
              defaultValue={order.status}
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* AWB Number */}
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-warm-gray)] mb-3">
              AWB / Tracking Number
            </h3>
            <input
              type="text"
              defaultValue={order.awb}
              placeholder="e.g. AWB123456"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-ivory)] sticky bottom-0">
          <button className="w-full bg-[var(--color-obsidian)] text-[var(--color-ivory)] py-3 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors">
            Update Order
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
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = MOCK_ORDERS.filter(o => 
    activeTab === "All" ? true : o.status === activeTab.toUpperCase()
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-obsidian)]">
            Orders
          </h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">
            Manage and fulfill orders
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-obsidian)] px-6 py-2.5 rounded-md text-xs font-medium uppercase tracking-widest hover:border-[var(--color-obsidian)] transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-none -mb-px border-b border-[var(--color-border)]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors duration-150 border-b-2 ${
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
            placeholder="Search order ID..."
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
              {filteredOrders.map((order) => {
                const dateStr = new Date(order.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02] cursor-pointer"
                  >
                    <td className="px-6 py-4 text-[var(--color-obsidian)] font-medium">
                      {order.id.slice(0, 12)}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-obsidian)]">
                      {order.customer.name}
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
                    <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                      {order.awb || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[var(--color-gold)]">
                        <ChevronRight className="w-4 h-4 inline-block" />
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--color-warm-gray)]">
                    No orders found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
