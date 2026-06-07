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
  discount: number;
  couponCode?: string | null;
  paymentId?: string | null;
  awbNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  address: ShippingAddress;
  items: OrderItem[];
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

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color?: string | null;
  stock: number;
  price?: number | null;
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
  variants: ProductVariant[];
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

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export async function getAddresses(token: string): Promise<Address[]> {
  return request<Address[]>("/api/addresses", { token });
}

// ---------------------------------------------------------------------------
// Admin — Dashboard
// ---------------------------------------------------------------------------

export interface AdminDashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: AdminOrderSummary[];
}

export interface AdminOrderSummary {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  date: string;
}

export async function getAdminDashboard(token: string): Promise<AdminDashboardData> {
  return request<AdminDashboardData>("/api/admin/dashboard", { token });
}

// ---------------------------------------------------------------------------
// Admin — Orders
// ---------------------------------------------------------------------------

export interface AdminOrder {
  id: string;
  status: string;
  total: number;
  discount: number;
  paymentId: string | null;
  awbNumber: string | null;
  createdAt: string;
  customer: { name: string; phone: string };
  address: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string | null;
}

export async function getAdminOrders(
  token: string,
  params?: { status?: string; search?: string }
): Promise<{ orders: AdminOrder[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return request<{ orders: AdminOrder[]; total: number }>(`/api/admin/orders${query}`, { token });
}

export async function updateAdminOrder(
  id: string,
  data: { status?: string; awbNumber?: string },
  token: string
): Promise<{ order: AdminOrder }> {
  return request<{ order: AdminOrder }>(`/api/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

// ---------------------------------------------------------------------------
// Admin — Coupons
// ---------------------------------------------------------------------------

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  value: number;
  minOrderValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface CreateCouponInput {
  code: string;
  type: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  value: number;
  minOrderValue?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export async function getCoupons(token: string): Promise<{ coupons: Coupon[] }> {
  return request<{ coupons: Coupon[] }>("/api/admin/coupons", { token });
}

export async function createCoupon(input: CreateCouponInput, token: string): Promise<{ coupon: Coupon }> {
  return request<{ coupon: Coupon }>("/api/admin/coupons", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export async function updateCoupon(
  id: string,
  input: Partial<CreateCouponInput>,
  token: string
): Promise<{ coupon: Coupon }> {
  return request<{ coupon: Coupon }>(`/api/admin/coupons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });
}

export async function deleteCoupon(id: string, token: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/admin/coupons/${id}`, {
    method: "DELETE",
    token,
  });
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: string;
  user: { name: string | null };
}

export interface ReviewsResponse {
  reviews: Review[];
  count: number;
  avgRating: number;
}

export async function getProductReviews(productId: string): Promise<ReviewsResponse> {
  return request<ReviewsResponse>(`/api/reviews/${productId}`);
}

export interface SubmitReviewInput {
  rating: number;
  title?: string;
  body?: string;
}

export async function submitProductReview(
  productId: string,
  input: SubmitReviewInput,
  token: string
): Promise<{ review: Review }> {
  return request<{ review: Review }>(`/api/reviews/${productId}`, {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}
