import { FastifyRequest, FastifyReply } from 'fastify';
import { clientProductPriceService } from './client-product-price.service';
import { AppError } from '../../shared/errors';

export async function createClientPrice(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId, productId, packageId, price, unit } = request.body as {
      userId: string;
      productId: string;
      packageId: string;
      price: number;
      unit: string;
    };

    if (!userId || !productId || !packageId || price === undefined || !unit) {
      throw new AppError('userId, productId, packageId, price e unit são obrigatórios', 400);
    }

    const clientPrice = await clientProductPriceService.createClientPrice({
      userId,
      productId,
      packageId,
      price,
      unit,
    });

    return reply.status(201).send(clientPrice);
  } catch (err) {
    throw err;
  }
}

export async function updateClientPrice(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const { price, unit, active } = request.body as {
      price?: number;
      unit?: string;
      active?: boolean;
    };

    const updated = await clientProductPriceService.updateClientPrice(id, { price, unit, active });

    return reply.send(updated);
  } catch (err) {
    throw err;
  }
}

export async function deleteClientPrice(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };

    await clientProductPriceService.deleteClientPrice(id);

    return reply.status(204).send();
  } catch (err) {
    throw err;
  }
}

export async function listClientPrices(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId, productId, packageId, active, page = 1, limit = 10, search } = request.query as {
      userId?: string;
      productId?: string;
      packageId?: string;
      active?: string;
      page?: string;
      limit?: string;
      search?: string;
    };

    const isAdmin = request.user?.role === 'ADMIN';
    const userIdFilter = isAdmin ? userId : request.user!.sub;

    const result = await clientProductPriceService.listClientPrices({
      userId: userIdFilter!,
      productId,
      packageId,
      active: active !== undefined ? active === 'true' : undefined,
      page: Number(page),
      limit: Number(limit),
      search,
    });

    return reply.send({
      data: result.prices,
      pagination: {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (Number(limit) || 10)),
      },
    });
  } catch (err) {
    throw err;
  }
}

export async function listResolvedClientPrices(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { productId } = request.query as { productId?: string };
    const userId = request.user!.sub;

    if (!productId) {
      throw new AppError('productId é obrigatório', 400);
    }

    const resolved = await clientProductPriceService.listResolvedPricesForUser(userId, productId);

    return reply.send({
      data: resolved,
    });
  } catch (err) {
    throw err;
  }
}

export async function toggleClientPriceActive(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const { active } = request.body as { active: boolean };

    if (active === undefined) {
      throw new AppError('Campo active é obrigatório', 400);
    }

    const updated = await clientProductPriceService.updateClientPrice(id, { active });

    return reply.send(updated);
  } catch (err) {
    throw err;
  }
}