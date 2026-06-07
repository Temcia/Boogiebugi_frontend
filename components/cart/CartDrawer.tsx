"use client";

import { useRouter } from "next/navigation";
import { X, Minus, Plus, Shirt } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-[var(--color-obsidian)]/40"
        onClick={closeCart}
        aria-hidden
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-sm flex-col bg-[var(--color-white)] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="font-display text-base font-medium text-[var(--color-obsidian)]">
            Your Cart
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="p-1">
            <X className="h-4 w-4 text-[var(--color-obsidian)]" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <Shirt className="h-10 w-10 text-[var(--color-warm-gray)] opacity-30" />
            <p className="mt-3 text-sm font-medium text-[var(--color-obsidian)]">
              Your cart is empty
            </p>
            <p className="mt-1 text-xs text-[var(--color-warm-gray)]">
              Add items to get started.
            </p>
            <button
              onClick={closeCart}
              className="mt-4 rounded-md border border-[var(--color-border)] px-5 py-2 text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:border-[var(--color-obsidian)]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-3 rounded-lg border border-[var(--color-border)] p-2.5"
                  >
                    {/* Product image */}
                    <div className="h-16 w-16 shrink-0 rounded-md bg-[var(--color-ivory)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Shirt className="h-5 w-5 text-[var(--color-warm-gray)] opacity-20" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-obsidian)] leading-tight">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--color-warm-gray)]">
                          {item.size} &middot; {item.color}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="inline-flex items-center rounded border border-[var(--color-border)]">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center text-[var(--color-obsidian)]"
                            aria-label="Decrease"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="flex h-6 w-7 items-center justify-center text-[10px] font-medium text-[var(--color-obsidian)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center text-[var(--color-obsidian)]"
                            aria-label="Increase"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        {/* Price + remove */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[var(--color-obsidian)]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="p-0.5 text-[var(--color-warm-gray)] transition-colors hover:text-[var(--color-obsidian)]"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-obsidian)]">
                  Subtotal
                </span>
                <span className="text-sm font-medium text-[var(--color-obsidian)]">
                  {formatPrice(totalPrice())}
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-warm-gray)]">
                Shipping calculated at checkout
              </p>
              <button
                onClick={handleCheckout}
                className="flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-obsidian)] text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)]"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={closeCart}
                className="flex h-9 w-full items-center justify-center rounded-md border border-[var(--color-border)] text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:border-[var(--color-obsidian)]"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
