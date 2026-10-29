export type Role = 'USER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  active: boolean;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  totalOrders: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalValue: number;
}

export interface DashboardRecentOrder {
  id: string;
  status: OrderStatus;
  totalValue: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface DashboardResponse {
  summary: DashboardSummary;
  recentOrders: DashboardRecentOrder[];
}

export interface OrderItem {
  id: string;
  productId: string;
  packageId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: { id: string; name: string; code: string };
  package: { id: string; name: string; type: string };
}

export interface OrderUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: Role;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalValue: number;
  deliveryTerm: string;
  paymentTerm: string;
  createdAt: string;
  updatedAt: string;
  user: OrderUser;
  items: OrderItem[];
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Product {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { prices: number };
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Package {
  id: string;
  name: string;
  type: string;
  capacity: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackagesResponse {
  data: Package[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductPrice {
  id: string;
  productId: string;
  packageId: string;
  price: number;
  unit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  product: { id: string; name: string };
  package: { id: string; name: string; type: string };
}

export interface ProductPricesResponse {
  data: ProductPrice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientProductPrice {
  id: string;
  userId: string;
  productId: string;
  packageId: string;
  price: number;
  unit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; username: string | null };
  product: { id: string; name: string };
  package: { id: string; name: string; type: string };
}

export interface ClientProductPricesResponse {
  data: ClientProductPrice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error?: string;
  message?: string;
}

export interface UserForm {
  name: string;
  username: string;
  password: string;
  role: Role;
  active: boolean;
}
