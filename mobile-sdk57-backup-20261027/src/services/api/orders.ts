import { api, ApiResponse } from '../api/api';
import { authService } from '../auth/auth.service';

export interface CreateOrderItemInput {
  productId: string;
  packageId: string;
  quantity: number;
  priceVersion: {
    source: 'client' | 'default';
    priceId: string;
    updatedAt: string;
  };
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  paymentTerm: string;
  deliveryTerm: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  packageId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    code: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  package: {
    id: string;
    name: string;
    type: string;
    capacity: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface OrderResponse {
  id: string;
  userId: string;
  status: string;
  paymentTerm: string;
  deliveryTerm: string;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const orderService = {
  create: async (data: CreateOrderInput): Promise<OrderResponse> => {
    const token = await authService.getToken();
    if (__DEV__) {
      console.log('createOrder payload:', JSON.stringify(data));
    }
    const response = await api.post<OrderResponse>('/orders', data, token ?? undefined);

    if (__DEV__) {
      console.log('createOrder status:', response.status);
      console.log('createOrder response:', JSON.stringify(response.data));
    }

    if (!response.data) {
      throw new Error('Resposta inválida do servidor');
    }
    return response.data;
  },

  list: async (): Promise<OrderResponse[]> => {
    const token = await authService.getToken();
    const response = await api.get<OrderResponse[]>('/orders', token ?? undefined);
    if (!response.data) {
      throw new Error('Resposta inválida do servidor');
    }
    return response.data;
  },

  getById: async (id: string): Promise<OrderResponse> => {
    const token = await authService.getToken();
    const response = await api.get<OrderResponse>(`/orders/${id}`, token ?? undefined);
    if (!response.data) {
      throw new Error('Resposta inválida do servidor');
    }
    return response.data;
  },

  cancel: async (id: string): Promise<OrderResponse> => {
    const token = await authService.getToken();
    const response = await api.patch<OrderResponse>(`/orders/${id}/cancel`, {}, token ?? undefined);
    if (!response.data) {
      throw new Error('Resposta inválida do servidor');
    }
    return response.data;
  },
};