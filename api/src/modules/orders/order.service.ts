import { Prisma } from '@prisma/client';
import { OrderCreateInput, OrderItemCreateInput, orderRepository } from './order.repository';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '../../shared/errors';
import prisma from '../../database/prisma';
import { validateOrderQuantity } from './quotation-policy';
import { clientProductPriceService } from '../product-prices/client-product-price.service';
import { assertPriceVersionMatches } from './price-version';

export class OrderService {
  async create(userId: string, data: { items: Array<{ productId: string; packageId: string; quantity: number; priceVersion: { source: string; priceId: string; updatedAt: string } }>; paymentTerm: string; deliveryTerm: string; priceVersions?: Array<{ productId: string; packageId: string; updatedAt: string }> }) {
    return prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const items: Array<{ productId: string; packageId: string; quantity: number; unitPrice: number; totalPrice: number }> = [];
        let totalValue = 0;

        for (const item of data.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundError(`Produto ${item.productId} não encontrado`);
          }

          if (!product.active) {
            throw new ValidationError(`Produto ${item.productId} não está ativo`);
          }

        const package_ = await tx.package.findUnique({
          where: { id: item.packageId },
        });

        if (!package_) {
          throw new NotFoundError(`Embalagem ${item.packageId} não encontrada`);
        }

        if (!package_.active) {
          throw new ValidationError(`Embalagem ${item.packageId} não está ativa`);
        }

        const resolvedPrice = await clientProductPriceService.getResolvedPriceForOrder(
          userId,
          item.productId,
          item.packageId,
        );

        if (!resolvedPrice) {
          throw new ValidationError(`Preço indisponível para o produto ${item.productId} com a embalagem ${item.packageId}`);
        }

        // Não aceitar preço alterado após a cotação, mesmo que o registro
        // mantenha o mesmo ID; o cliente deve confirmar o novo valor.
        assertPriceVersionMatches(item.priceVersion, resolvedPrice);

        validateOrderQuantity({
          quantity: item.quantity,
          packageType: package_.type,
          sachetBoxVolumeLiters: product.sachetBoxVolumeLiters,
        });

        const unitPrice = resolvedPrice.price;
        const totalPrice = Number((item.quantity * unitPrice).toFixed(2));

        items.push({
          productId: item.productId,
          packageId: item.packageId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });

        totalValue += totalPrice;
      }

      const totalValueRounded = Number(totalValue.toFixed(2));

const order = await tx.order.create({
          data: {
            userId,
            status: 'PENDING',
            paymentTerm: data.paymentTerm,
            deliveryTerm: data.deliveryTerm,
            totalValue: totalValueRounded,
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

        return order;
      },
      {
        timeout: 15000,
      },
    );
  }

  async findById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Pedido não encontrado');
    }
    return order;
  }

  async findByUserId(userId: string) {
    return orderRepository.findByUserId(userId);
  }

  async getUserOrder(userId: string, orderId: string) {
    const order = await this.findById(orderId);
    if (order.userId !== userId) {
      throw new ForbiddenError('Acesso negado a este pedido');
    }
    return order;
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.getUserOrder(userId, orderId);

    if (order.status === 'CANCELLED') {
      throw new ConflictError('Pedido já foi cancelado');
    }

    if (order.status === 'COMPLETED') {
      throw new ConflictError('Não é possível cancelar um pedido concluído');
    }

    return orderRepository.updateStatus(orderId, 'CANCELLED');
  }

  private static readonly ADMIN_STATUS_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  async listAdmin(filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }) {
    return orderRepository.findManyAdmin(filters);
  }

  async getAdminById(id: string) {
    const order = await orderRepository.findByIdAdmin(id);
    if (!order) {
      throw new NotFoundError('Pedido não encontrado');
    }
    return order;
  }

  async changeStatusAdmin(id: string, newStatus: string) {
    const order = await orderRepository.findByIdAdmin(id);
    if (!order) {
      throw new NotFoundError('Pedido não encontrado');
    }

    const allowed = OrderService.ADMIN_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new ConflictError(
        `Não é possível alterar o status de ${order.status} para ${newStatus}`
      );
    }

    return orderRepository.updateStatusAdmin(id, newStatus);
  }

  async deleteAdmin(id: string) {
    const order = await orderRepository.findByIdAdmin(id);
    if (!order) {
      throw new NotFoundError('Pedido não encontrado');
    }
    return orderRepository.deleteAdmin(id);
  }
}

export const orderService = new OrderService();
