import { Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

export type AdminOrderUserSelect = {
  id: true;
  name: true;
  email: true;
  active: true;
  role: true;
};

export type AdminOrderFilters = {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
};

export type OrderItemCreateInput = {
  productId: string;
  packageId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type OrderCreateInput = {
  userId: string;
  status: string;
  paymentTerm: string;
  deliveryTerm: string;
  totalValue: number;
  items: Array<{
    productId: string;
    packageId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
        package: true;
      };
    };
    user: true;
  };
}>;

export class OrderRepository {
  async create(data: OrderCreateInput) {
    const { items, ...orderData } = data;

    return prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            packageId: item.packageId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            package: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            package: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            package: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
            package: true,
          },
        },
      },
    });
  }

  private buildAdminWhere(filters: AdminOrderFilters): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return where;
  }

  async countAdmin(filters: AdminOrderFilters) {
    return prisma.order.count({ where: this.buildAdminWhere(filters) });
  }

  async findManyAdmin(filters: AdminOrderFilters) {
    const where = this.buildAdminWhere(filters);

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              active: true,
              role: true,
            },
          },
          items: {
            include: {
              product: true,
              package: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findByIdAdmin(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            active: true,
            role: true,
          },
        },
        items: {
          include: {
            product: true,
            package: true,
          },
        },
      },
    });
  }

  async updateStatusAdmin(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            active: true,
            role: true,
          },
        },
        items: {
          include: {
            product: true,
            package: true,
          },
        },
      },
    });
  }

  async deleteAdmin(id: string) {
    // First, check if the order exists
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new Error('Pedido não encontrado');
    }
    return prisma.order.delete({ where: { id } });
  }
}

export const orderRepository = new OrderRepository();