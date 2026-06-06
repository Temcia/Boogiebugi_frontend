/** Shared types for BOOGIEBUGI frontend */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // stored in paise (₹1 = 100)
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number; // stored in paise
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number; // stored in paise
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: Address;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}
