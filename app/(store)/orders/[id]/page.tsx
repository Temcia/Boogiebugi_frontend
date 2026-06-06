"use client";

// Order Detail / Confirmation page — /orders/[id]
//
// Shows after a successful payment. Pulls order data from the API.
// Until backend is wired, renders a polished mock so the redirect from
// checkout lands on a real, styled page.
//
// Phase 3 TODO: replace mock with real `getOrder(id, token)` call.

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

// ---------------------------------------------------------------------------
// Types (mirrors lib/api.ts shapes)
// ---------------------------------------------------------------------------

interface OrderItem {
  id: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number; // paise
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  status: string;
  total: number; // paise
  subtotal: number;
  shipping: number;
  discount: number;
  createdAt: string;
  estimatedDelivery: string;
  items: OrderItem[];
  address: ShippingAddress;
  awbNumber?: string;
  paymentId: string;
}

// ---------------------------------------------------------------------------
// Mock order — replace with API call when backend is wired
// ---------------------------------------------------------------------------

function buildMockOrder(id: string): Order {
  return {
    id,
    status: "CONFIRMED",
    total: 349900,
    subtotal: 349900,
    shipping: 0,
    discount: 0,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    paymentId: "pay_mock_" + id.slice(-8),
    items: [
      {
        id: "item-1",
        productName: "Linen Structured Shirt",
        size: "M",
        color: "Ivory",
        quantity: 1,
        price: 349900,
      },
    ],
    address: {
      fullName: "Arjun Sharma",
      phone: "9876543210",
      line1: "42, Rose Garden Apartments",
      line2: "Sector 14, Rohini",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110085",
    },
  };
}

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

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    // Phase 3 TODO: replace with real API call:
    //   const token = (session as { access_token?: string } | null)?.access_token ?? "";
    //   const data = await getOrder(params.id, token);
    //   setOrder(data);
    const mock = buildMockOrder(params.id);
    setOrder(mock);
    setIsLoading(false);
  }, [isLoggedIn, params.id, router]);

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-obsidian)] border-t-transparent rounded-full animate-spin" />
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

  const shortId = order.id.slice(-8).toUpperCase();

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
              {order.estimatedDelivery}
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
                  <div
                    className="w-14 h-18 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--color-ivory)] border border-[var(--color-border)] flex items-center justify-center"
                    aria-hidden
                    style={{ height: "4.5rem" }}
                  >
                    <Shirt className="w-5 h-5 text-[var(--color-border)]" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-obsidian)] leading-snug">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[var(--color-warm-gray)] mt-0.5">
                        {item.size} · {item.color}
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
              {order.shipping === 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-warm-gray)]">Shipping</span>
                  <span className="text-[var(--color-gold)]">Free</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-warm-gray)]">Shipping</span>
                  <span className="text-[var(--color-obsidian)]">
                    {formatPrice(order.shipping)}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-gold)]">Discount</span>
                  <span className="text-[var(--color-gold)]">
                    −{formatPrice(order.discount)}
                  </span>
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
