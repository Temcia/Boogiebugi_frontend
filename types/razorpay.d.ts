// Type declarations for the Razorpay Checkout.js browser SDK.
// Loaded dynamically via <script> — do NOT import as a module.

interface RazorpayOptions {
  key: string;
  amount: number;        // in paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;      // Razorpay order id from backend
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface Window {
  Razorpay: RazorpayConstructor;
}
