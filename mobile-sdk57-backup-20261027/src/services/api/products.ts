import { ImageSourcePropType } from 'react-native';

import { Product } from '../../types/api';
import {
  PackageType,
  ProductPackageOffer,
  parseProductPricesResponse,
} from '../../features/new-quotation/quotation-flow';
import { authService } from '../auth/auth.service';
import { api } from './api';
import { parseClientProductPricesResponse } from './parseClientProductPrices';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseProductsResponse(value: unknown): Product[] {
  if (!Array.isArray(value)) {
    throw new Error('Resposta inválida do servidor: lista de produtos ausente.');
  }
  return value.map((item) => {
    if (!isRecord(item)
      || typeof item.id !== 'string'
      || typeof item.name !== 'string'
      || typeof item.code !== 'string'
      || typeof item.active !== 'boolean'
      || typeof item.createdAt !== 'string'
      || typeof item.updatedAt !== 'string') {
      throw new Error('Resposta inválida do servidor: produto malformado.');
    }
    return {
      id: item.id,
      name: item.name,
      code: item.code,
      active: item.active,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
}

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const token = await authService.getToken();
    const response = await api.get<unknown>('/products', token ?? undefined);
    return parseProductsResponse(response.data);
  },

  getPackagesWithPrices: async (productId: string): Promise<ProductPackageOffer[]> => {
    const token = await authService.getToken();
    const response = await api.get<unknown>(`/products/${productId}/prices`, token ?? undefined);
    return parseProductPricesResponse(response.data);
  },

  getClientPackagesWithPrices: async (productId?: string): Promise<{
    productId: string;
    packageId: string;
    packageName: string;
    packageType: string;
    packageVolumeLiters: number;
    price: number;
    unit: string;
    active: boolean;
    priceSource: 'client' | 'default';
    priceId: string;
    updatedAt?: string;
  }[]> => {
    const token = await authService.getToken();
    const endpoint = productId ? `/client-product-prices?productId=${encodeURIComponent(productId)}` : '/client-product-prices';
    const response = await api.get<{ data: ReturnType<typeof parseClientProductPricesResponse> }>(endpoint, token ?? undefined);
    const payload = response.data ?? { data: [] };
    const data = await parseClientProductPricesResponse(payload.data);
    return data.filter((item) => item.active);
  },
};

export function getPackageImage(type: PackageType): ImageSourcePropType {
  switch (type) {
    case 'SACHÊ':
      return require('../../assets/package/SACHE.png');
    case 'BOMBONA_20L':
      return require('../../assets/package/BB.png');
    case 'IBC_1000L':
      return require('../../assets/package/IBC.png');
    default:
      return require('../../assets/package/SACHE.png');
  }
}

export function getPackageDescription(type: PackageType): string {
  if (type === 'SACHÊ') return 'Venda somente em caixas fechadas';
  if (type === 'BOMBONA_20L') return 'Embalagem média';
  return 'Embalagem grande';
}
