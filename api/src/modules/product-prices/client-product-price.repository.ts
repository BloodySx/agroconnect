import { Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

export type CreateClientProductPriceInput = {
  userId: string;
  productId: string;
  packageId: string;
  price: number;
  unit: string;
  active?: boolean;
};

export type UpdateClientProductPriceInput = Partial<CreateClientProductPriceInput>;

export type AdminClientProductPriceFilters = {
  search?: string;
  userId?: string;
  productId?: string;
  packageId?: string;
  active?: boolean;
  page: number;
  limit: number;
};

export class ClientProductPriceRepository {
  async findByUserProductPackage(userId: string, productId: string, packageId: string) {
    return prisma.clientProductPrice.findUnique({
      where: {
        userId_productId_packageId: {
          userId,
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

  async findByUserId(userId: string) {
    return prisma.clientProductPrice.findMany({
      where: { userId, active: true },
      include: {
        product: { select: { sachetBoxVolumeLiters: true } },
        package: true,
      },
    });
  }

  async findByUserIdAndProduct(userId: string, productId: string) {
    return prisma.clientProductPrice.findMany({
      where: { userId, productId, active: true },
      include: {
        product: { select: { id: true, name: true, code: true, sachetBoxVolumeLiters: true } },
        package: true,
      },
    });
  }

  async findByUserProductAndPackage(userId: string, productId: string, packageId: string) {
    return prisma.clientProductPrice.findUnique({
      where: {
        userId_productId_packageId: {
          userId,
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

  async create(data: CreateClientProductPriceInput) {
    return prisma.clientProductPrice.create({
      data,
      include: {
        product: true,
        package: true,
      },
    });
  }

  async update(id: string, data: UpdateClientProductPriceInput) {
    return prisma.clientProductPrice.update({
      where: { id },
      data,
      include: {
        product: true,
        package: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.clientProductPrice.delete({
      where: { id },
    });
  }

  async findManyAdmin(filters: AdminClientProductPriceFilters) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.productId) where.productId = filters.productId;
    if (filters.packageId) where.packageId = filters.packageId;
    if (filters.active !== undefined) where.active = filters.active;

    if (filters.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
        { package: { name: { contains: filters.search, mode: 'insensitive' } } },
        { package: { type: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [prices, total] = await prisma.$transaction([
      prisma.clientProductPrice.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, username: true } },
          product: { select: { id: true, name: true, code: true, sachetBoxVolumeLiters: true } },
          package: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.clientProductPrice.count({ where }),
    ]);

    return { prices, total };
  }

  async setActiveAdmin(id: string, active: boolean) {
    return prisma.clientProductPrice.update({
      where: { id },
      data: { active },
      include: {
        user: { select: { id: true, name: true, username: true } },
        product: { select: { id: true, name: true, code: true, sachetBoxVolumeLiters: true } },
        package: true,
      },
    });
  }

  async userExists(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    return !!user;
  }

  async productExists(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    return !!product;
  }

  async packageExists(id: string) {
    const pkg = await prisma.package.findUnique({ where: { id } });
    return !!pkg;
  }
}

export const clientProductPriceRepository = new ClientProductPriceRepository();