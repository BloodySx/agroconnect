import { Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import { ConflictError } from '../../shared/errors';

export type CreatePackageInput = {
  name: string;
  type: string;
  capacity: string;
  capacityLiters?: number | null;
};

export type UpdatePackageInput = Partial<CreatePackageInput>;

export type AdminPackageFilters = {
  search?: string;
  active?: boolean;
  page: number;
  limit: number;
};

export class PackageRepository {
  async findAll() {
    return prisma.package.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.package.findUnique({
      where: { id },
    });
  }

  async findByType(type: string) {
    return prisma.package.findFirst({
      where: { type },
    });
  }

  async create(data: CreatePackageInput) {
    return prisma.package.create({
      data,
    });
  }

  async update(id: string, data: UpdatePackageInput) {
    return prisma.package.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Check if package has any order items (historical data)
    const orderItemCount = await prisma.orderItem.count({
      where: { packageId: id },
    });

    // Check if package has any prices
    const priceCount = await prisma.productPrice.count({
      where: { packageId: id },
    });

    // If package has dependencies, we cannot delete it
    if (orderItemCount > 0 || priceCount > 0) {
      throw new ConflictError('Embalagem possui registros vinculados e não pode ser excluída');
    }

    // Safe to delete - no dependencies
    return prisma.package.delete({
      where: { id },
    });
  }

  async findManyAdmin(filters: AdminPackageFilters) {
    const where: Prisma.PackageWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { type: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    const [packages, total] = await prisma.$transaction([
      prisma.package.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.package.count({ where }),
    ]);

    return { packages, total };
  }

  async setActiveAdmin(id: string, active: boolean) {
    return prisma.package.update({
      where: { id },
      data: { active },
    });
  }
}

export const packageRepository = new PackageRepository();
