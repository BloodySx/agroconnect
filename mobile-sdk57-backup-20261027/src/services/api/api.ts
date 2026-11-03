import { config } from '../../config';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(
      data?.message || `HTTP error ${response.status}`,
      response.status,
      data?.code
    );
  }

  return { data: data as T, status: response.status };
}

export const api = {
  get: async <T>(endpoint: string, token?: string): Promise<ApiResponse<T>> => {
    const url = `${config.api.baseUrl}${endpoint}`;
    if (__DEV__) {
      console.log('api get:', url);
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: unknown, token?: string): Promise<ApiResponse<T>> => {
    const url = `${config.api.baseUrl}${endpoint}`;
    if (__DEV__) {
      console.log('api post:', url);
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body: unknown, token?: string): Promise<ApiResponse<T>> => {
    const url = `${config.api.baseUrl}${endpoint}`;
    if (__DEV__) {
      console.log('api patch:', url);
    }
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
};