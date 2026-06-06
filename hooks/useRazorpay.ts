/**
 * useRazorpay — dynamically loads the Razorpay Checkout.js script
 * and returns an `openRazorpay(options)` function.
 *
 * Usage:
 *   const { openRazorpay, isLoading, error } = useRazorpay();
 *   openRazorpay({ order_id, amount, ... });
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";

type OpenRazorpayFn = (options: Omit<RazorpayOptions, "key">) => void;

interface UseRazorpayReturn {
  openRazorpay: OpenRazorpayFn;
  isScriptLoading: boolean;
  scriptError: string | null;
}

export function useRazorpay(): UseRazorpayReturn {
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  // Load script on mount if not already present in DOM
  useEffect(() => {
    if (document.getElementById(RAZORPAY_SCRIPT_ID)) {
      scriptLoadedRef.current = true;
      return;
    }

    setIsScriptLoading(true);
    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      scriptLoadedRef.current = true;
      setIsScriptLoading(false);
    };

    script.onerror = () => {
      setScriptError("Failed to load payment gateway. Please refresh and try again.");
      setIsScriptLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Do NOT remove on unmount — keep script cached for checkout flow.
    };
  }, []);

  const openRazorpay: OpenRazorpayFn = useCallback(
    (options) => {
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!key) {
        console.error("[Razorpay] NEXT_PUBLIC_RAZORPAY_KEY_ID is not set.");
        return;
      }

      if (!scriptLoadedRef.current || typeof window.Razorpay === "undefined") {
        console.error("[Razorpay] Script not loaded yet.");
        return;
      }

      const rzp = new window.Razorpay({ key, ...options });
      rzp.open();
    },
    []
  );

  return { openRazorpay, isScriptLoading, scriptError };
}
