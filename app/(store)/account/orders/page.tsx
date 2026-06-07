"use client";

// /account/orders — Real order history page

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Shirt,
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { getOrders, Order } from "@/lib/api";

// ---------------------------------------------------------------------------
// Status display config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  CONFIRMED:  { label: "Order Confirmed",  icon: CheckCircle2, color: "var(--color-gold)" },
  PROCESSING: { label: "Processing",       icon: Clock,        color: "var(--color-gold)" },
  SHIPPED:    { label: "Shipped",          icon: Truck,        color: "var(--color-obsidian)" },
  DELIVERED:  { label: "Delivered",        icon: CheckCircle2, color: "var(--color-obsidian)" },
  CANCELLED:  { label: "Cancelled",        icon: XCircle,      color: "var(--color-warm-gray)" },
  RETURNED:   { label: "Returned",         icon: XCircle,      color: "var(--color-warm-gray)" },
  PENDING:    { label: "Pending",          icon: Clock,        color: "var(--color-warm-gray)" },
};

// ---------------------------------------------------------------------------
// Order card component
// ---------------------------------------------------------------------------

function OrderCard({ order }: { order: Order }) {
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"];
  const StatusIcon = statusCfg.icon;

  const createdDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const shortId = order.id.slice(-8).toUpperCase();

  return (
    <Link
      href={`/orders/${order.id}`}
      className="
        block bg-[var(--color-white)] border border-[var(--color-border)]
        rounded-[var(--radius-lg)] p-4 sm:p-5
        hover:border-[var(--color-warm-gray)] hover:shadow-sm
        transition-all duration-150 group
      "
    >
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-warm-gray)] mb-0.5">
            Order #{shortId}
          </p>
          <p className="text-xs text-[var(--color-warm-gray)]">{createdDate}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusIcon
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: statusCfg.color }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* ── Preview items ── */}
      <div className="flex gap-2 mb-4">
        {order.items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="w-12 h-16 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--color-ivory)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center"
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Shirt className="w-4 h-4 text-[var(--color-border)]" />
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="w-12 h-16 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--color-ivory)] border border-[var(--color-border)] flex items-center justify-center">
            <span className="text-xs text-[var(--color-warm-gray)]">
              +{order.items.length - 3}
            </span>
          </div>
        )}
      </div>

      {/* ── Item names ── */}
      <div className="mb-3">
        <p className="text-sm text-[var(--color-obsidian)] leading-snug line-clamp-1">
          {order.items.map((i) => i.productName).join(", ")}
        </p>
        <p className="text-xs text-[var(--color-warm-gray)] mt-0.5">
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {/* ── Footer row ── */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <span
          className="text-base font-medium text-[var(--color-obsidian)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatPrice(order.total)}
        </span>
        <span className="flex items-center gap-1 text-xs text-[var(--color-warm-gray)] group-hover:text-[var(--color-obsidian)] transition-colors">
          View details
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-ivory)] border border-[var(--color-border)] flex items-center justify-center mb-4">
        <Package className="w-6 h-6 text-[var(--color-warm-gray)]" />
      </div>
      <h2
        className="text-lg font-medium text-[var(--color-obsidian)] mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        No orders yet
      </h2>
      <p className="text-sm text-[var(--color-warm-gray)] mb-6 max-w-xs">
        When you place an order it will appear here.
      </p>
      <Link
        href="/products"
        className="
          px-6 py-2.5 text-sm font-medium uppercase tracking-widest
          rounded-[var(--radius-md)]
          bg-[var(--color-obsidian)] text-[var(--color-ivory)]
          hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]
          transition-colors duration-200
        "
      >
        Start Shopping
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

const FILTER_TABS = [
  { label: "All",       value: "all" },
  { label: "Active",    value: "active" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]["value"];

function matchesFilter(order: Order, filter: FilterTab): boolean {
  if (filter === "all") return true;
  if (filter === "active")
    return ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status);
  return order.status === filter;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login?redirect=/account/orders");
      return;
    }

    async function load() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          router.replace("/login?redirect=/account/orders");
          return;
        }
        const { orders: data } = await getOrders(session.access_token);
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isLoggedIn, router]);

  const filteredOrders = orders.filter((o) => matchesFilter(o, activeFilter));

  return (
    <div
      className="min-h-screen bg-[var(--color-ivory)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-[var(--color-white)] border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-[var(--page-padding)] py-6">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-sm text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1
            className="text-2xl font-medium text-[var(--color-obsidian)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Orders
          </h1>
          {!isLoading && (
            <p className="text-sm text-[var(--color-warm-gray)] mt-0.5">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="max-w-3xl mx-auto px-[var(--page-padding)]">
          <div className="flex gap-1 overflow-x-auto scrollbar-none -mb-px">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`
                  flex-shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-widest
                  border-b-2 transition-colors duration-150
                  ${
                    activeFilter === tab.value
                      ? "border-[var(--color-obsidian)] text-[var(--color-obsidian)]"
                      : "border-transparent text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)]"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-[var(--page-padding)] py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--color-obsidian)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
