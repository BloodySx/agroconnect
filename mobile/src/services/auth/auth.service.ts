import { api, ApiResponse } from '../api/api';
import { storage } from '../../constants/storage';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (identifier: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { identifier, password });
    if (!response.data) {
      throw new Error('Resposta invÃ¡lida do servidor');
    }
    await storage.setToken(response.data.token);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const token = await storage.getToken();
    if (!token) {
      throw new Error('Token nÃ£o encontrado');
    }
    const response = await api.get<User>('/auth/me', token);
    if (!response.data) {
      throw new Error('Resposta invÃ¡lida do servidor');
    }
    return response.data;
  },

  getToken: async (): Promise<string | null> => {
    return storage.getToken();
  },

  logout: async (): Promise<void> => {
    await storage.removeToken();
  },
};