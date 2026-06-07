"use client";

// Order Detail / Confirmation page — /orders/[id]
// Shows after successful payment — pulls REAL order data from the API.

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  ChevronRight,
  Shirt,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { getOrder, Order } from "@/lib/api";

// ---------------------------------------------------------------------------
// Status label + color
// ---------------------------------------------------------------------------

const STATUS_META: Record<string, { label: string; color: string }> = {
  CONFIRMED:  { label: "Confirmed",   color: "var(--color-gold)" },
  PROCESSING: { label: "Processing",  color: "var(--color-gold)" },
  SHIPPED:    { label: "Shipped",     color: "var(--color-obsidian)" },
  DELIVERED:  { label: "Delivered",   color: "var(--color-obsidian)" },
  CANCELLED:  { label: "Cancelled",   color: "var(--color-warm-gray)" },
  RETURNED:   { label: "Returned",    color: "var(--color-warm-gray)" },
  PENDING:    { label: "Pending",     color: "var(--color-warm-gray)" },
};

// ---------------------------------------------------------------------------
// Helper — copy to clipboard with checkmark feedback
// ---------------------------------------------------------------------------

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className="text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step tracker
// ---------------------------------------------------------------------------

const STEPS = [
  { icon: CheckCircle2, label: "Order Placed" },
  { icon: Package,      label: "Processing" },
  { icon: Truck,        label: "Shipped" },
  { icon: MapPin,       label: "Delivered" },
];

const STATUS_STEP_INDEX: Record<string, number> = {
  PENDING:    0,
  CONFIRMED:  0,
  PROCESSING: 1,
  SHIPPED:    2,
  DELIVERED:  3,
};

function OrderTracker({ status }: { status: string }) {
  const activeIndex = STATUS_STEP_INDEX[status] ?? 0;

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const isCompleted = i <= activeIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-colors duration-300
                  ${isCompleted
                    ? "bg-[var(--color-obsidian)]"
                    : "bg-[var(--color-border)]"}
                `}
              >
                <step.icon
                  className={`w-4 h-4 ${isCompleted ? "text-[var(--color-ivory)]" : "text-[var(--color-warm-gray)]"}`}
                />
              </div>
              <span
                className={`
                  text-[10px] uppercase tracking-widest whitespace-nowrap
                  ${isCompleted ? "text-[var(--color-obsidian)]" : "text-[var(--color-warm-gray)]"}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`
                  flex-1 h-px mx-2 mb-5 transition-colors duration-300
                  ${i < activeIndex ? "bg-[var(--color-obsidian)]" : "bg-[var(--color-border)]"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isLoggedIn } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          router.replace("/login");
          return;
        }
        const data = await getOrder(params.id, session.access_token);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Could not load order. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isLoggedIn, params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-obsidian)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex flex-col items-center justify-center gap-4">
        <Package className="w-10 h-10 text-[var(--color-warm-gray)]" />
        <p className="text-sm text-[var(--color-warm-gray)]">{error ?? "Order not found."}</p>
        <Link href="/account/orders" className="text-sm font-medium text-[var(--color-obsidian)] underline">
          View all orders
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_META[order.status] ?? STATUS_META["PENDING"];
  const createdDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Estimate delivery: +7 days from placed date
  const estimatedDelivery = new Date(
    new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const shortId = order.id.slice(-8).toUpperCase();

  // Derive subtotal from items
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order.total - subtotal + (order.discount ?? 0);

  return (
    <div
      className="min-h-screen bg-[var(--color-ivory)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Minimal header ─────────────────────────────────────────────────── */}
      <header className="bg-[var(--color-white)] border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-[var(--page-padding)] h-14 flex items-center justify-between">
          <Link
            href="/products"
            className="text-xl font-medium tracking-widest text-[var(--color-obsidian)] uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Boogiebugi
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors"
          >
            Continue Shopping
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-[var(--page-padding)] py-10 flex flex-col gap-8">

        {/* ── Success banner ────────────────────────────────────────────────── */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--color-obsidian)] flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-[var(--color-ivory)]" />
          </div>
          <div>
            <h1
              className="text-2xl font-medium text-[var(--color-obsidian)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Order Placed
            </h1>
            <p className="text-sm text-[var(--color-warm-gray)] mt-1">
              Thank you! Your order{" "}
              <span className="font-medium text-[var(--color-obsidian)]">
                #{shortId}
              </span>{" "}
              has been confirmed.
            </p>
          </div>

          {/* Status pill */}
          <span
            className="text-xs font-medium uppercase tracking-widest px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-white)]"
            style={{ color: statusMeta.color }}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* ── Tracker ──────────────────────────────────────────────────────── */}
        <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <OrderTracker status={order.status} />
          <p className="text-xs text-center text-[var(--color-warm-gray)] mt-5">
            Estimated delivery:{" "}
            <span className="font-medium text-[var(--color-obsidian)]">
              {estimatedDelivery}
            </span>
          </p>
        </div>

        {/* ── Two-column detail ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left — items */}
          <div className="flex-1 bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4">
            <h2
              className="text-base font-medium text-[var(--color-obsidian)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Items
            </h2>

            <ul className="flex flex-col gap-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  {/* Product image or fallback */}
                  <div
                    className="w-14 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--color-ivory)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center"
                    style={{ height: "4.5rem" }}
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shirt className="w-5 h-5 text-[var(--color-border)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-obsidian)] leading-snug">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[var(--color-warm-gray)] mt-0.5">
                        {item.size}{item.color ? ` · ${item.color}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[var(--color-warm-gray)]">
                        Qty {item.quantity}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-obsidian)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Price summary */}
            <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-warm-gray)]">Subtotal</span>
                <span className="text-[var(--color-obsidian)]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-warm-gray)]">Shipping</span>
                <span className={shipping <= 0 ? "text-[var(--color-gold)]" : "text-[var(--color-obsidian)]"}>
                  {shipping <= 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-gold)]">Discount</span>
                  <span className="text-[var(--color-gold)]">−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between mt-1">
                <span
                  className="text-base font-medium text-[var(--color-obsidian)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Total
                </span>
                <span
                  className="text-lg font-medium text-[var(--color-obsidian)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Right — address + order info */}
          <div className="w-full md:w-56 flex flex-col gap-4">

            {/* Delivery address */}
            <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
              <h2
                className="text-sm font-medium text-[var(--color-obsidian)] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Delivery To
              </h2>
              <p className="text-sm font-medium text-[var(--color-obsidian)]">
                {order.address.fullName}
              </p>
              <p className="text-xs text-[var(--color-warm-gray)] leading-snug mt-0.5">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ""}
                <br />
                {order.address.city}, {order.address.state}
                <br />
                {order.address.pincode}
              </p>
              <p className="text-xs text-[var(--color-warm-gray)] mt-1.5">
                {order.address.phone}
              </p>
            </div>

            {/* Order meta */}
            <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-3">
              <h2
                className="text-sm font-medium text-[var(--color-obsidian)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Order Info
              </h2>

              <div className="flex flex-col gap-2">
                {/* Order ID */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-warm-gray)] mb-0.5">
                    Order ID
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-[var(--color-obsidian)]">
                      #{shortId}
                    </span>
                    <CopyButton value={order.id} />
                  </div>
                </div>

                {/* Payment ID */}
                {order.paymentId && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-warm-gray)] mb-0.5">
                      Payment ID
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[var(--color-obsidian)] truncate max-w-[120px]">
                        {order.paymentId}
                      </span>
                      <CopyButton value={order.paymentId} />
                    </div>
                  </div>
                )}

                {/* Placed at */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-warm-gray)] mb-0.5">
                    Placed On
                  </p>
                  <span className="text-xs text-[var(--color-obsidian)]">
                    {createdDate}
                  </span>
                </div>

                {/* AWB */}
                {order.awbNumber && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-warm-gray)] mb-0.5">
                      Tracking (AWB)
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[var(--color-obsidian)]">
                        {order.awbNumber}
                      </span>
                      <CopyButton value={order.awbNumber} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="
              px-6 py-3 text-sm font-medium uppercase tracking-widest text-center
              rounded-[var(--radius-md)]
              bg-[var(--color-obsidian)] text-[var(--color-ivory)]
              hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]
              transition-colors duration-200
            "
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="
              px-6 py-3 text-sm font-medium uppercase tracking-widest text-center
              rounded-[var(--radius-md)]
              border border-[var(--color-border)]
              text-[var(--color-obsidian)] bg-transparent
              hover:bg-[var(--color-ivory)]
              transition-colors duration-200
            "
          >
            My Orders
          </Link>
        </div>

      </main>
    </div>
  );
}
