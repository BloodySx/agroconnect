import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import {
  adminPriceCreateSchema,
  adminPriceUpdateSchema,
  adminPriceActiveSchema,
  adminPriceListSchema,
  uuidSchema,
} from './product-price.admin.schema';
import { productPriceService } from './product-price.service';
import { ValidationError, NotFoundError, ConflictError } from '../../shared/errors';

export async function listAdminPrices(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminPriceListSchema.safeParse(request.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { search, productId, packageId, active, page, limit } = parsed.data;
  const result = await productPriceService.listAdmin({ search, productId, packageId, active, page, limit });
  const totalPages = Math.ceil(result.total / limit);

  return reply.send({
    data: result.prices,
    pagination: { page, limit, total: result.total, totalPages },
  });
}

export async function createAdminPrice(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminPriceCreateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const price = await productPriceService.createAdmin(parsed.data);
  return reply.status(201).send(price);
}

export async function updateAdminPrice(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do preço inválido');
  }

  const parsed = adminPriceUpdateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const price = await productPriceService.updateAdmin(idParsed.data, parsed.data);
  return reply.send(price);
}

export async function setActiveAdminPrice(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do preço inválido');
  }

  const parsed = adminPriceActiveSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const price = await productPriceService.setActiveAdmin(idParsed.data, parsed.data.active);
  return reply.send(price);
}

export async function deleteAdminPrice(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do preço inválido');
  }

  try {
    const price = await productPriceService.delete(idParsed.data);
    return reply.send(price);
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error.code === 'P2002' || error.code === 'P2003')) {
      throw new ConflictError('Preço possui registros vinculados e não pode ser excluído');
    }
    throw error;
  }
}