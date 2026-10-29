import { Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import { ConflictError } from '../../shared/errors';

export type CreateProductInput = {
  name: string;
  code: string;
  sachetBoxVolumeLiters?: number;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type AdminProductFilters = {
  search?: string;
  active?: boolean;
  page: number;
  limit: number;
};

export type AdminProductWithCount = Prisma.ProductGetPayload<{
  include: { _count: { select: { prices: true } } };
}>;

export class ProductRepository {
  async findAll() {
    return prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return prisma.product.findUnique({
      where: { code },
    });
  }

  async create(data: CreateProductInput) {
    return prisma.product.create({
      data,
    });
  }

  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Check if product has any order items (historical data)
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    // Check if product has any prices
    const priceCount = await prisma.productPrice.count({
      where: { productId: id },
    });

    // If product has dependencies, we cannot delete it
    if (orderItemCount > 0 || priceCount > 0) {
      throw new ConflictError('Produto possui registros vinculados e não pode ser excluído');
    }

    // Safe to delete - no dependencies
    return prisma.product.delete({
      where: { id },
    });
  }

  async findManyAdmin(filters: AdminProductFilters) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { _count: { select: { prices: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async setActiveAdmin(id: string, active: boolean) {
    return prisma.product.update({
      where: { id },
      data: { active },
    });
  }
}

export const productRepository = new ProductRepository();
