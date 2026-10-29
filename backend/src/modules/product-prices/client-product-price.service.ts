import { AppError } from '../../shared/errors';
import { clientProductPriceRepository } from './client-product-price.repository';
import { productPriceService } from './product-price.service';
import { productPriceRepository } from './product-price.repository';

export type ResolvedPrice = {
  productId: string;
  packageId: string;
  price: number;
  unit: string;
  priceSource: 'client' | 'default';
  priceId: string;
  updatedAt: string;
  packageName: string;
  packageType: string;
  packageVolumeLiters: number | null;
  active: boolean;
};

function resolvePackageVolumeLiters(packageType: string, packageCapacityLiters: number | null, sachetBoxVolumeLiters: number | null): number | null {
  if (packageType === 'SACHÊ') {
    if (typeof sachetBoxVolumeLiters === 'number' && Number.isFinite(sachetBoxVolumeLiters) && sachetBoxVolumeLiters > 0) {
      return sachetBoxVolumeLiters;
    }
    if (typeof packageCapacityLiters === 'number' && Number.isFinite(packageCapacityLiters) && packageCapacityLiters > 0) {
      return packageCapacityLiters;
    }
    return null;
  }
  if (typeof packageCapacityLiters === 'number' && Number.isFinite(packageCapacityLiters) && packageCapacityLiters > 0) {
    return packageCapacityLiters;
  }
  return null;
}

export class ClientProductPriceService {
  async getClientPrice(userId: string, productId: string, packageId: string) {
    const clientPrice = await clientProductPriceRepository.findByUserProductAndPackage(
      userId,
      productId,
      packageId,
    );

    if (clientPrice && clientPrice.active) {
      return {
        price: clientPrice.price,
        unit: clientPrice.unit,
        isClientPrice: true,
        updatedAt: clientPrice.updatedAt,
      };
    }

    return null;
  }

  async resolvePrice(userId: string, productId: string, packageId: string): Promise<ResolvedPrice | null> {
    const clientPrice = await clientProductPriceRepository.findByUserProductAndPackage(
      userId,
      productId,
      packageId,
    );

    if (clientPrice && clientPrice.active) {
      return {
        productId: clientPrice.productId,
        packageId: clientPrice.packageId,
        price: clientPrice.price,
        unit: clientPrice.unit,
        priceSource: 'client',
        priceId: clientPrice.id,
        updatedAt: clientPrice.updatedAt.toISOString(),
        packageName: clientPrice.package.name,
        packageType: clientPrice.package.type,
        packageVolumeLiters: resolvePackageVolumeLiters(clientPrice.package.type, clientPrice.package.capacityLiters, (clientPrice as any).product?.sachetBoxVolumeLiters ?? null),
        active: clientPrice.active,
      };
    }

    const defaultPrice = await productPriceService.findByProductAndPackage(productId, packageId);
    if (defaultPrice && defaultPrice.active) {
      return {
        productId: defaultPrice.productId,
        packageId: defaultPrice.packageId,
        price: defaultPrice.price,
        unit: defaultPrice.unit,
        priceSource: 'default',
        priceId: defaultPrice.id,
        updatedAt: defaultPrice.updatedAt.toISOString(),
        packageName: defaultPrice.package.name,
        packageType: defaultPrice.package.type,
        packageVolumeLiters: resolvePackageVolumeLiters(defaultPrice.package.type, defaultPrice.package.capacityLiters, (defaultPrice as any).product?.sachetBoxVolumeLiters ?? null),
        active: defaultPrice.active,
      };
    }

    return null;
  }

  async createClientPrice(data: { userId: string; productId: string; packageId: string; price: number; unit: string }) {
    // Check if user exists
    const userExists = await clientProductPriceRepository.userExists(data.userId);
    if (!userExists) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Check if product exists
    const productExists = await clientProductPriceRepository.productExists(data.productId);
    if (!productExists) {
      throw new AppError('Produto não encontrado', 404);
    }

    // Check if package exists
    const packageExists = await clientProductPriceRepository.packageExists(data.packageId);
    if (!packageExists) {
      throw new AppError('Embalagem não encontrada', 404);
    }

    // Check if combination already exists
    const existing = await clientProductPriceRepository.findByUserProductAndPackage(
      data.userId,
      data.productId,
      data.packageId,
    );

    if (existing) {
      throw new AppError('Já existe um preço específico para este cliente, produto e embalagem', 409);
    }

    return clientProductPriceRepository.create({
      userId: data.userId,
      productId: data.productId,
      packageId: data.packageId,
      price: data.price,
      unit: data.unit,
    });
  }

  async updateClientPrice(id: string, data: { price?: number; unit?: string; active?: boolean }) {
    return clientProductPriceRepository.update(id, data);
  }

  async deleteClientPrice(id: string) {
    return clientProductPriceRepository.delete(id);
  }

  async listClientPrices(filters: {
    userId?: string;
    productId?: string;
    packageId?: string;
    active?: boolean;
    page: number;
    limit: number;
    search?: string;
  }) {
    return clientProductPriceRepository.findManyAdmin({
      userId: filters.userId,
      productId: filters.productId,
      packageId: filters.packageId,
      active: filters.active,
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
    });
  }

  async listResolvedPricesForUser(userId: string, productId: string): Promise<ResolvedPrice[]> {
    const [clientPrices, defaultPrices] = await Promise.all([
      clientProductPriceRepository.findByUserIdAndProduct(userId, productId),
      productPriceRepository.findByProductId(productId),
    ]);

    const clientMap = new Map(clientPrices.map((p) => [p.packageId, p]));
    const defaultMap = new Map(defaultPrices.map((p) => [p.packageId, p]));

    const packageIds = new Set([
      ...clientPrices.map((p) => p.packageId),
      ...defaultPrices.map((p) => p.packageId),
    ]);

    const resolved: ResolvedPrice[] = [];

    for (const packageId of packageIds) {
      const clientPrice = clientMap.get(packageId);
      const defaultPrice = defaultMap.get(packageId);

      if (clientPrice && clientPrice.active) {
        resolved.push({
          productId: clientPrice.productId,
          packageId: clientPrice.packageId,
          price: clientPrice.price,
          unit: clientPrice.unit,
          priceSource: 'client',
          priceId: clientPrice.id,
          updatedAt: clientPrice.updatedAt.toISOString(),
          packageName: clientPrice.package.name,
          packageType: clientPrice.package.type,
          packageVolumeLiters: resolvePackageVolumeLiters(clientPrice.package.type, clientPrice.package.capacityLiters, clientPrice.product?.sachetBoxVolumeLiters ?? null),
          active: true,
        });
      } else if (defaultPrice && defaultPrice.active) {
        resolved.push({
          productId: defaultPrice.productId,
          packageId: defaultPrice.packageId,
          price: defaultPrice.price,
          unit: defaultPrice.unit,
          priceSource: 'default',
          priceId: defaultPrice.id,
          updatedAt: defaultPrice.updatedAt.toISOString(),
          packageName: defaultPrice.package.name,
          packageType: defaultPrice.package.type,
          packageVolumeLiters: resolvePackageVolumeLiters(defaultPrice.package.type, defaultPrice.package.capacityLiters, defaultPrice.product?.sachetBoxVolumeLiters ?? null),
          active: true,
        });
      }
    }

    return resolved;
  }

  async getClientPriceForOrder(userId: string, productId: string, packageId: string) {
    const clientPrice = await clientProductPriceRepository.findByUserProductAndPackage(
      userId,
      productId,
      packageId,
    );

    if (clientPrice && clientPrice.active) {
      return {
        price: clientPrice.price,
        unit: clientPrice.unit,
        isClientPrice: true,
        updatedAt: clientPrice.updatedAt,
      };
    }

    return null;
  }

  async getResolvedPriceForOrder(userId: string, productId: string, packageId: string) {
    const resolved = await this.resolvePrice(userId, productId, packageId);
    if (!resolved) {
      return null;
    }

    return {
      productId: resolved.productId,
      packageId: resolved.packageId,
      price: resolved.price,
      unit: resolved.unit,
      priceSource: resolved.priceSource,
      priceId: resolved.priceId,
      updatedAt: resolved.updatedAt,
      packageVolumeLiters: resolved.packageVolumeLiters,
    };
  }
}

export const clientProductPriceService = new ClientProductPriceService();