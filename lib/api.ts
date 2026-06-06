/**
 * API client — typed wrappers around all backend endpoints.
 * Base URL reads from NEXT_PUBLIC_API_URL (fallback: localhost:8080).
 *
 * All functions accept an optional `token` (Supabase JWT).
 * Responses match the standard { success, data } / { success, error, message } shape.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, cache: "no-store" });
  const json = await res.json();

  if (!json.success) {
    throw new ApiError(json.error ?? "UNKNOWN_ERROR", json.message ?? "An error occurred", res.status);
  }

  return json.data as T;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface CreateRazorpayOrderInput {
  amount: number;   // paise
  currency?: string;
  receipt?: string;
}

export interface CreateRazorpayOrderResponse {
  orderId: string;    // Razorpay order id (rzp_order_...)
  amount: number;
  currency: string;
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput,
  token: string
): Promise<CreateRazorpayOrderResponse> {
  return request<CreateRazorpayOrderResponse>("/api/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ currency: "INR", ...input }),
    token,
  });
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  paymentId: string;
  orderId: string;
}

export async function verifyRazorpayPayment(
  input: VerifyPaymentInput,
  token: string
): Promise<VerifyPaymentResponse> {
  return request<VerifyPaymentResponse>("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface OrderItemInput {
  variantId: string;
  quantity: number;
  priceAtOrder: number; // paise
  productName: string;
}

export interface NewAddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  save?: boolean;
}

export interface CreateOrderInput {
  // existing saved address OR inline new address
  addressId?: string;
  newAddress?: NewAddressInput;
  paymentId: string;
  items: OrderItemInput[];
  couponCode?: string;
  discount?: number; // paise
}

export interface CreateOrderResponse {
  message?: string;
  orderId: string;
}

export async function createOrder(
  input: CreateOrderInput,
  token: string
): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  address: ShippingAddress;
  awbNumber?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export async function getOrder(id: string, token: string): Promise<Order> {
  return request<Order>(`/api/orders/${id}`, { token });
}

export async function getOrders(token: string): Promise<{ orders: Order[]; total: number }> {
  return request<{ orders: Order[]; total: number }>("/api/orders", { token });
}

// ---------------------------------------------------------------------------
// Admin: Products
// ---------------------------------------------------------------------------

export interface VariantInput {
  sku: string;
  size: string;
  color?: string;
  stock: number;
  price?: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  comparePrice?: number;
  images: string[];
  tags?: string[];
  variants: VariantInput[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  isActive: boolean;
  variants: any[];
  category?: {
    id: string;
    name: string;
  };
}

export async function getProducts(query?: string): Promise<{ products: ProductResponse[]; total: number }> {
  return request<{ products: ProductResponse[]; total: number }>(`/api/products${query ? `?${query}` : ""}`);
}

export async function getProductBySlug(slug: string): Promise<{ product: ProductResponse }> {
  return request<{ product: ProductResponse }>(`/api/products/${slug}`);
}

export async function getAdminProducts(token: string): Promise<{ products: ProductResponse[]; total: number }> {
  return request<{ products: ProductResponse[]; total: number }>("/api/products", { token }); // Note: GET /api/products is public but we might use it for admin too
}

export async function createAdminProduct(input: CreateProductInput, token: string): Promise<{ product: ProductResponse }> {
  return request<{ product: ProductResponse }>("/api/products/admin", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export async function updateAdminProduct(id: string, input: UpdateProductInput, token: string): Promise<{ product: ProductResponse }> {
  return request<{ product: ProductResponse }>(`/api/products/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });
}

export async function deleteAdminProduct(id: string, token: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/products/admin/${id}`, {
    method: "DELETE",
    token,
  });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  // Returns parent categories each with their children array nested inside
  return request<{ categories: Category[] }>("/api/categories");
}
