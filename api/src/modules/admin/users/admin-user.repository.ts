import { Prisma } from '@prisma/client'
import prisma from '../../../database/prisma'
import { ConflictError } from '../../../shared/errors'

export type AdminUserFilters = {
  search?: string;
  role?: 'USER' | 'ADMIN';
  active?: boolean;
  page: number;
  limit: number;
};

export type CreateAdminUserInput = {
  name: string;
  email?: string;
  username: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
};

export const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  active: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class AdminUserRepository {
  async findManyAdmin(filters: AdminUserFilters) {
    const where: Prisma.UserWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: adminUserSelect,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findByIdAdmin(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: adminUserSelect,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: adminUserSelect,
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      select: adminUserSelect,
    });
  }

  async create(data: CreateAdminUserInput) {
    try {
      return await prisma.user.create({
        data,
        select: adminUserSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(',')
          : String(error.meta?.target ?? '');
        if (target.toLowerCase().includes('email')) {
          throw new ConflictError('E-mail já cadastrado');
        }
        throw new ConflictError('Usuário já está em uso');
      }
      throw error;
    }
  }

  async setActive(id: string, active: boolean) {
    return prisma.user.update({
      where: { id },
      data: { active },
      select: adminUserSelect,
    });
  }

async setRole(id: string, role: 'USER' | 'ADMIN') {
     return prisma.user.update({
       where: { id },
       data: { role },
       select: adminUserSelect,
     });
   }

   async delete(id: string) {
     try {
       return await prisma.user.delete({
         where: { id },
         select: adminUserSelect,
       });
     } catch (error) {
       // Handle Prisma foreign key constraint error
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
         throw new ConflictError('Não é possível excluir este usuário pois ele possui pedidos associados.');
       }
       throw error;
     }
   }
 }
 
 export const adminUserRepository = new AdminUserRepository();
