// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // pcs, kg, meter, etc.
  image: string;
  category: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order Types
export interface Order {
  id: string;
  items: CartItem[];
  customer: Customer;
  status: OrderStatus;
  total: number;
  notes: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';

// Customer Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string; // Simplified location field
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: Address;
  isAdmin?: boolean;
}
