"use client";

// ─── NOTE ────────────────────────────────────────────────────────────────────
// Payment flow (Phase 3):
//   1. Place Order → POST /api/payments/create-order (backend creates Razorpay order)
//   2. Frontend opens Razorpay modal with returned orderId
//   3. User pays → Razorpay calls handler with { paymentId, orderId, signature }
//   4. POST /api/payments/verify (backend checks HMAC)
//   5. POST /api/orders (backend creates order in DB after verification)
//   6. Redirect → /orders/[id]
//
// Razorpay keys required:
//   backend:  RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
//   frontend: NEXT_PUBLIC_RAZORPAY_KEY_ID
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Shirt, Shield, RefreshCw, Truck, Tag, Check, AlertCircle, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";
import { useRazorpay } from "@/hooks/useRazorpay";
import { createClient } from "@/lib/supabase";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createOrder,
  getAddresses,
  Address,
  ApiError,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddressFormData {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  saveAddress: boolean;
}

// Free shipping threshold in paise (₹2,999)
const FREE_SHIPPING_THRESHOLD = 299900;
const SHIPPING_COST = 9900; // ₹99 in paise

// ---------------------------------------------------------------------------
// State list for the address form
// ---------------------------------------------------------------------------

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep",
  "Puducherry",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-medium text-[var(--color-obsidian)] mb-4"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </h2>
  );
}

function InputField({
  id,
  label,
  optional,
  ...props
}: {
  id: string;
  label: string;
  optional?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)]"
      >
        {label}
        {optional && (
          <span className="normal-case tracking-normal ml-1 text-[var(--color-warm-gray)] opacity-60">
            (optional)
          </span>
        )}
      </label>
      <input
        id={id}
        className="
          w-full px-3 py-2.5 text-sm rounded-[var(--radius-md)]
          bg-[var(--color-white)] text-[var(--color-obsidian)]
          border border-[var(--color-border)]
          placeholder:text-[var(--color-warm-gray)] placeholder:opacity-60
          focus:outline-none focus:border-[var(--color-gold)]
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        {...props}
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  children,
  ...props
}: {
  id: string;
  label: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)]"
      >
        {label}
      </label>
      <select
        id={id}
        className="
          w-full px-3 py-2.5 text-sm rounded-[var(--radius-md)]
          bg-[var(--color-white)] text-[var(--color-obsidian)]
          border border-[var(--color-border)]
          focus:outline-none focus:border-[var(--color-gold)]
          transition-colors duration-150
          appearance-none cursor-pointer
        "
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Address Card
// ---------------------------------------------------------------------------

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full text-left px-4 py-3 rounded-[var(--radius-md)]
        border transition-all duration-150
        ${
          selected
            ? "border-[var(--color-obsidian)] bg-[var(--color-white)]"
            : "border-[var(--color-border)] bg-[var(--color-white)] hover:border-[var(--color-warm-gray)]"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Radio dot */}
        <span
          className={`
            mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center
            ${selected ? "border-[var(--color-obsidian)]" : "border-[var(--color-border)]"}
          `}
        >
          {selected && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-obsidian)]" />
          )}
        </span>

        {/* Address content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-warm-gray)]">
              {address.name.split(' ')[0]}'s Address
            </span>
            {address.isDefault && (
              <span className="text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 bg-[var(--color-ivory)] text-[var(--color-warm-gray)] rounded-sm">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-obsidian)] font-medium">
            {address.name}
          </p>
          <p className="text-sm text-[var(--color-warm-gray)] leading-snug mt-0.5">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
            <br />
            {address.city}, {address.state} — {address.pincode}
          </p>
          <p className="text-xs text-[var(--color-warm-gray)] mt-1">
            {address.phone}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, session, isLoggedIn } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();
  const { openRazorpay, isScriptLoading } = useRazorpay();

  // — guards
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login?redirect=/checkout");
    } else if (items.length === 0) {
      router.replace("/products");
    }
  }, [isLoggedIn, items.length, router]);

  // — address state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [addressForm, setAddressForm] = useState<AddressFormData>({
    fullName: user?.name ?? "",
    phone: user?.phone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    saveAddress: true,
  });

  // Fetch saved addresses on mount
  useEffect(() => {
    async function loadAddresses() {
      if (!isLoggedIn()) return;
      try {
        const supabase = createClient();
        const { data: { session: liveSession } } = await supabase.auth.getSession();
        if (!liveSession?.access_token) return;

        const data = await getAddresses(liveSession.access_token);
        setSavedAddresses(data);
        if (data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.id);
          setShowAddForm(false);
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [isLoggedIn]);

  // — contact
  const [email, setEmail] = useState(user?.email ?? "");

  // — coupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // — order placing
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // — derived prices
  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping - discountAmount;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleAddressFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleApplyCoupon() {
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    // Mock coupon logic — real validation hits /api/admin/coupons in Phase 4
    if (code === "WELCOME10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon(code);
      setDiscountAmount(discount);
    } else if (code === "FLAT500") {
      setAppliedCoupon(code);
      setDiscountAmount(50000); // ₹500 in paise
    } else {
      setCouponError("Invalid or expired coupon code.");
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput("");
    setCouponError(null);
  }

  async function handlePlaceOrder() {
    setOrderError(null);

    // Validate: all required address fields filled if adding new, or existing selected
    const hasNewAddress =
      showAddForm &&
      addressForm.fullName &&
      addressForm.phone &&
      addressForm.line1 &&
      addressForm.city &&
      addressForm.state &&
      addressForm.pincode;
      
    const hasSavedAddress = !showAddForm && !!selectedAddressId;

    if (!hasNewAddress && !hasSavedAddress) {
      setOrderError(
        showAddForm
          ? "Please fill in all required address fields."
          : "Please select or add a delivery address."
      );
      return;
    }

    // Get a fresh Supabase session — auto-refreshes if the token is expired.
    // Do NOT rely on the persisted Zustand session; it can be stale/expired.
    const supabase = createClient();
    const { data: { session: liveSession } } = await supabase.auth.getSession();
    const token = liveSession?.access_token ?? "";

    if (!token) {
      router.replace("/login?redirect=/checkout");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Step 1 — create Razorpay order on backend
      const rzpOrder = await createRazorpayOrder(
        { amount: total, currency: "INR", receipt: `rcpt_${Date.now()}` },
        token
      );

      // Step 2 — open Razorpay checkout modal
      openRazorpay({
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.orderId,
        name: "BOOGIEBUGI",
        description: `${items.length} item${items.length > 1 ? "s" : ""} · ${formatPrice(total)}`,
        prefill: {
          name: user?.name,
          email: email || undefined,
          contact: user?.phone,
        },
        theme: { color: "#1A1A1A" },
        handler: async (paymentResponse) => {
          try {
            // Step 3 — verify HMAC on backend
            await verifyRazorpayPayment(
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
              token
            );

            // Step 4 — create order in DB
            const addressPayload = hasSavedAddress
              ? { addressId: selectedAddressId! }
              : {
                  newAddress: {
                    name: addressForm.fullName,
                    phone: addressForm.phone,
                    line1: addressForm.line1,
                    line2: addressForm.line2 || undefined,
                    city: addressForm.city,
                    state: addressForm.state,
                    pincode: addressForm.pincode,
                    save: addressForm.saveAddress,
                  },
                };

            const order = await createOrder(
              {
                ...addressPayload,
                paymentId: paymentResponse.razorpay_payment_id,
                items: items.map((item) => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                  priceAtOrder: item.price,
                  productName: item.name,
                })),
                couponCode: appliedCoupon ?? undefined,
                discount: discountAmount,
              },
              token
            );

            // Step 5 — clear cart and redirect to confirmation
            clearCart();
            router.push(`/orders/${order.orderId}`);
          } catch (err) {
            const msg =
              err instanceof ApiError
                ? err.message
                : "Payment verification failed. Contact support with your payment ID.";
            setOrderError(msg);
            setIsPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
          },
        },
      });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not initiate payment. Please try again.";
      setOrderError(msg);
      setIsPlacingOrder(false);
    }
  }


  // ---------------------------------------------------------------------------
  // Render guard — if not logged in or empty cart, render nothing (redirecting)
  // ---------------------------------------------------------------------------

  if (!isLoggedIn() || items.length === 0) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <div
      className="min-h-screen bg-[var(--color-ivory)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="bg-[var(--color-white)] border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-[var(--page-padding)] h-14 flex items-center justify-between">
          {/* Back to cart */}
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-sm text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors duration-150"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to cart
          </Link>

          {/* Logo */}
          <span
            className="text-xl font-medium tracking-widest text-[var(--color-obsidian)] uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Boogiebugi
          </span>

          {/* Spacer — mirrors back link width */}
          <div className="w-24" aria-hidden />
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-[var(--page-padding)] py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">

          {/* ================================================================
              LEFT COLUMN — Checkout form
              ================================================================ */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* ── Section A — Contact ────────────────────────────────────── */}
            <section>
              <SectionHeading>Contact</SectionHeading>
              <div className="flex flex-col gap-4">
                <InputField
                  id="contact-phone"
                  label="Phone"
                  type="tel"
                  value={user?.phone ?? ""}
                  readOnly
                  disabled
                />
                <InputField
                  id="contact-email"
                  label="Email"
                  type="email"
                  optional
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </section>

            {/* ── Section B — Delivery Address ───────────────────────────── */}
            <section>
              <SectionHeading>Delivery Address</SectionHeading>

              {isLoadingAddresses ? (
                <div className="p-4 text-sm text-[var(--color-warm-gray)]">Loading addresses...</div>
              ) : (
                <>
                  {/* Saved address cards */}
                  {savedAddresses.length > 0 && (
                    <div className="flex flex-col gap-3 mb-4">
                      {savedAddresses.map((addr) => (
                        <AddressCard
                          key={addr.id}
                          address={addr}
                          selected={selectedAddressId === addr.id && !showAddForm}
                          onSelect={() => {
                            setSelectedAddressId(addr.id);
                            setShowAddForm(false);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Add new address toggle (only show toggle if user has saved addresses) */}
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm((v) => !v);
                        if (!showAddForm) setSelectedAddressId(null);
                      }}
                      className="
                        flex items-center gap-2 text-sm font-medium mb-4
                        text-[var(--color-obsidian)] hover:text-[var(--color-warm-gray)]
                        transition-colors duration-150
                      "
                    >
                      {showAddForm ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {showAddForm ? "Cancel" : "Add New Address"}
                    </button>
                  )}

                  {/* New address form */}
                  {showAddForm && (
                    <div className="p-4 bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-md)] flex flex-col gap-4">
                      <InputField
                        id="addr-fullName"
                        name="fullName"
                        label="Full Name"
                        placeholder="As on ID"
                        value={addressForm.fullName}
                        onChange={handleAddressFormChange}
                      />
                      <InputField
                        id="addr-phone"
                        name="phone"
                        label="Phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={addressForm.phone}
                        onChange={handleAddressFormChange}
                      />
                      <InputField
                        id="addr-line1"
                        name="line1"
                        label="Address Line 1"
                        placeholder="House / Flat no., Building name"
                        value={addressForm.line1}
                        onChange={handleAddressFormChange}
                      />
                      <InputField
                        id="addr-line2"
                        name="line2"
                        label="Address Line 2"
                        optional
                        placeholder="Area, Locality, Landmark"
                        value={addressForm.line2}
                        onChange={handleAddressFormChange}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          id="addr-city"
                          name="city"
                          label="City"
                          placeholder="e.g. Mumbai"
                          value={addressForm.city}
                          onChange={handleAddressFormChange}
                        />
                        <SelectField
                          id="addr-state"
                          name="state"
                          label="State"
                          value={addressForm.state}
                          onChange={handleAddressFormChange}
                        >
                          <option value="" disabled>
                            Select state
                          </option>
                          {INDIA_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </SelectField>
                      </div>
                      <InputField
                        id="addr-pincode"
                        name="pincode"
                        label="Pincode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="6-digit pincode"
                        value={addressForm.pincode}
                        onChange={handleAddressFormChange}
                      />

                      {/* Save address checkbox */}
                      <label
                        htmlFor="addr-save"
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                      >
                        <span
                          className={`
                            w-4 h-4 flex-shrink-0 rounded-sm border flex items-center justify-center
                            transition-colors duration-150
                            ${
                              addressForm.saveAddress
                                ? "bg-[var(--color-obsidian)] border-[var(--color-obsidian)]"
                                : "bg-[var(--color-white)] border-[var(--color-border)]"
                            }
                          `}
                        >
                          {addressForm.saveAddress && (
                            <Check className="w-2.5 h-2.5 text-[var(--color-ivory)]" />
                          )}
                        </span>
                        <input
                          id="addr-save"
                          type="checkbox"
                          name="saveAddress"
                          className="sr-only"
                          checked={addressForm.saveAddress}
                          onChange={handleAddressFormChange}
                        />
                        <span className="text-sm text-[var(--color-warm-gray)]">
                          Save this address for future orders
                        </span>
                      </label>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* ================================================================
              RIGHT COLUMN — Order summary
              ================================================================ */}
          <aside className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-5">
              <SectionHeading>Order Summary</SectionHeading>

              {/* ── Cart items ── */}
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-3">
                    {/* Product image */}
                    <div
                      className="w-16 h-20 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--color-ivory)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center"
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Shirt className="w-5 h-5 text-[var(--color-border)]" />
                      )}
                    </div>

                    {/* Item info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-obsidian)] leading-snug line-clamp-2">
                          {item.name}
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

              {/* ── Coupon ── */}
              <div className="pt-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-ivory)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                      <span className="text-sm font-medium text-[var(--color-obsidian)]">
                        {appliedCoupon}
                      </span>
                      <span className="text-xs text-[var(--color-gold)]">
                        −{formatPrice(discountAmount)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors"
                      aria-label="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id="coupon-input"
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="
                        flex-1 px-3 py-2.5 text-sm rounded-[var(--radius-md)]
                        bg-[var(--color-white)] text-[var(--color-obsidian)]
                        border border-[var(--color-border)]
                        placeholder:text-[var(--color-warm-gray)] placeholder:opacity-60
                        focus:outline-none focus:border-[var(--color-gold)]
                        transition-colors duration-150 uppercase
                      "
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="
                        px-3 py-2.5 text-xs font-medium uppercase tracking-widest
                        rounded-[var(--radius-md)]
                        border border-[var(--color-border)]
                        text-[var(--color-obsidian)] bg-transparent
                        hover:bg-[var(--color-ivory)]
                        transition-colors duration-150
                      "
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                )}
              </div>

              {/* ── Price rows ── */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-warm-gray)]">Subtotal</span>
                  <span className="text-[var(--color-obsidian)]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-warm-gray)]">Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? "text-[var(--color-gold)]"
                        : "text-[var(--color-obsidian)]"
                    }
                  >
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-gold)]">
                      Discount ({appliedCoupon})
                    </span>
                    <span className="text-[var(--color-gold)]">
                      −{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-[var(--color-border)] my-1" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-base font-medium text-[var(--color-obsidian)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-xl font-medium text-[var(--color-obsidian)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                {shipping === 0 && (
                  <p className="text-xs text-[var(--color-gold)] text-right -mt-1">
                    You saved {formatPrice(SHIPPING_COST)} on shipping
                  </p>
                )}
              </div>

              {/* ── Order error ── */}
              {orderError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-ivory)] border border-[var(--color-border)]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--color-warm-gray)]" />
                  <p className="text-xs text-[var(--color-warm-gray)] leading-snug">{orderError}</p>
                </div>
              )}

              {/* ── Place order button ── */}
              <button
                type="button"
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || isScriptLoading}
                className="
                  w-full py-3.5 text-sm font-medium uppercase tracking-widest
                  rounded-[var(--radius-md)]
                  bg-[var(--color-obsidian)] text-[var(--color-ivory)]
                  hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]
                  transition-colors duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isScriptLoading
                  ? "Loading Payment…"
                  : isPlacingOrder
                  ? "Processing…"
                  : "Place Order"}
              </button>

              {/* ── Trust badges ── */}
              <div className="flex items-center justify-around pt-1 border-t border-[var(--color-border)]">
                {[
                  { icon: Shield, label: "Secure Payment" },
                  { icon: RefreshCw, label: "Easy Returns" },
                  { icon: Truck, label: "Free Shipping" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 text-center"
                  >
                    <Icon className="w-4 h-4 text-[var(--color-warm-gray)]" />
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-warm-gray)]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Free shipping nudge */}
            {shipping > 0 && (
              <p className="text-xs text-center text-[var(--color-warm-gray)] mt-3">
                Add{" "}
                <span className="font-medium text-[var(--color-obsidian)]">
                  {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                </span>{" "}
                more for free shipping
              </p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
