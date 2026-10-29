import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import {
  adminProductCreateSchema,
  adminProductUpdateSchema,
  adminProductActiveSchema,
  adminProductListSchema,
  uuidSchema,
} from './product.admin.schema';
import { productService } from './product.service';
import { ValidationError, NotFoundError, ConflictError } from '../../shared/errors';

export async function listAdminProducts(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminProductListSchema.safeParse(request.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { search, active, page, limit } = parsed.data;
  const result = await productService.listAdmin({ search, active, page, limit });
  const totalPages = Math.ceil(result.total / limit);

  return reply.send({
    data: result.products,
    pagination: { page, limit, total: result.total, totalPages },
  });
}

export async function createAdminProduct(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminProductCreateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const product = await productService.createAdmin(parsed.data);
  return reply.status(201).send(product);
}

export async function updateAdminProduct(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do produto inválido');
  }

  const parsed = adminProductUpdateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const product = await productService.updateAdmin(idParsed.data, parsed.data);
  return reply.send(product);
}

export async function setActiveAdminProduct(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do produto inválido');
  }

  const parsed = adminProductActiveSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const product = await productService.setActiveAdmin(idParsed.data, parsed.data.active);
  return reply.send(product);
}

export async function deleteAdminProduct(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do produto inválido');
  }

  const product = await productService.delete(idParsed.data);
  return reply.send(product);
}