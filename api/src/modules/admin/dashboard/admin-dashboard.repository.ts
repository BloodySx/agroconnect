import prisma from '../../../database/prisma';

export type DashboardSummary = {
  totalOrders: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalValue: number;
};

export type DashboardRecentOrder = {
  id: string;
  status: string;
  totalValue: number;
  createdAt: string;
  user: { id: string; name: string; email: string | null };
};

export type DashboardData = {
  summary: DashboardSummary;
  recentOrders: DashboardRecentOrder[];
};

export class AdminDashboardRepository {
  async getDashboard() {
    const [totalOrders, pending, confirmed, completed, cancelled, aggregate, recentOrders] =
      await prisma.$transaction([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'CONFIRMED' } }),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.order.aggregate({ _sum: { totalValue: true } }),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true, email: true } } },
        }),
      ]);

    return {
      summary: {
        totalOrders,
        pending,
        confirmed,
        completed,
        cancelled,
        totalValue: aggregate._sum.totalValue ?? 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        status: order.status,
        totalValue: order.totalValue,
        createdAt: order.createdAt.toISOString(),
        user: order.user,
      })),
    };
  }
}

export const adminDashboardRepository = new AdminDashboardRepository();
