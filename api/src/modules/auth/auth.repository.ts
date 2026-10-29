import { Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

export type CreateUserInput = {
  name: string;
  email: string;
  username?: string;
  passwordHash: string;
};

export type UpdateUserInput = Partial<CreateUserInput> & {
  id: string;
};

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserInput) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const authRepository = new AuthRepository();
