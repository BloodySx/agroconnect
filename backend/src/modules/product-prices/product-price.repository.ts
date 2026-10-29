import { Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

export type CreateProductPriceInput = {
  productId: string;
  packageId: string;
  price: number;
  unit: string;
  active?: boolean;
};

export type UpdateProductPriceInput = Partial<CreateProductPriceInput>;

export type AdminProductPriceFilters = {
  search?: string;
  productId?: string;
  packageId?: string;
  active?: boolean;
  page: number;
  limit: number;
};

export type ProductPriceDetails = Prisma.ProductPriceGetPayload<{
  include: {
    product: { select: { sachetBoxVolumeLiters: true } };
    package: true;
  };
}>;

export class ProductPriceRepository {
  async findAll() {
    return prisma.productPrice.findMany({
      where: { active: true },
      include: {
        product: { select: { sachetBoxVolumeLiters: true } },
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.productPrice.findUnique({
      where: { id },
      include: {
        product: { select: { sachetBoxVolumeLiters: true } },
        package: true,
      },
    });
  }

  async findByProductAndPackage(productId: string, packageId: string): Promise<ProductPriceDetails | null> {
    return prisma.productPrice.findUnique({
      where: {
        productId_packageId: {
          productId,
          packageId,
        },
      },
      include: {
        product: { select: { sachetBoxVolumeLiters: true } },
        package: true,
      },
    });
  }

  async findByProductId(productId: string) {
    return prisma.productPrice.findMany({
      where: {
        productId,
        active: true,
      },
      include: {
        product: { select: { sachetBoxVolumeLiters: true } },
        package: true,
      },
      orderBy: { price: 'asc' },
    });
  }

  async create(data: CreateProductPriceInput) {
    return prisma.productPrice.create({
      data,
      include: {
        product: true,
        package: true,
      },
    });
  }

  async update(id: string, data: UpdateProductPriceInput) {
    return prisma.productPrice.update({
      where: { id },
      data,
      include: {
        product: true,
        package: true,
      },
    });
  }

  async delete(id: string) {
    // Check if product price has any dependencies
    // ProductPrice is not referenced by any other model, so it should be safe to delete
    // But let's check if there are any order items that might be indirectly affected
    // (though they store unitPrice directly, so they shouldn't be affected)
    
    // Actually, let's check if there are any dependencies just to be safe
    // Since OrderItem doesn't reference ProductPrice, there should be no dependencies
    
    return prisma.productPrice.delete({
      where: { id },
    });
  }

  async productExists(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    return !!product;
  }

  async packageExists(id: string) {
    const pkg = await prisma.package.findUnique({ where: { id } });
    return !!pkg;
  }

  async findManyAdmin(filters: AdminProductPriceFilters) {
    const where: Prisma.ProductPriceWhereInput = {};

    if (filters.productId) where.productId = filters.productId;
    if (filters.packageId) where.packageId = filters.packageId;
    if (filters.active !== undefined) where.active = filters.active;

    if (filters.search) {
      where.OR = [
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
        { package: { name: { contains: filters.search, mode: 'insensitive' } } },
        { package: { type: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [prices, total] = await prisma.$transaction([
      prisma.productPrice.findMany({
        where,
        include: {
          product: { select: { id: true, name: true } },
          package: { select: { id: true, name: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.productPrice.count({ where }),
    ]);

    return { prices, total };
  }

  async setActiveAdmin(id: string, active: boolean) {
    return prisma.productPrice.update({
      where: { id },
      data: { active },
      include: {
        product: { select: { id: true, name: true } },
        package: { select: { id: true, name: true, type: true } },
      },
    });
  }
}

export const productPriceRepository = new ProductPriceRepository();
