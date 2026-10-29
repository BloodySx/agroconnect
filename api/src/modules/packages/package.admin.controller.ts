import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import {
  adminPackageCreateSchema,
  adminPackageUpdateSchema,
  adminPackageActiveSchema,
  adminPackageListSchema,
  uuidSchema,
} from './package.admin.schema';
import { packageService } from './package.service';
import { ValidationError, NotFoundError, ConflictError } from '../../shared/errors';

export async function listAdminPackages(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminPackageListSchema.safeParse(request.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { search, active, page, limit } = parsed.data;
  const result = await packageService.listAdmin({ search, active, page, limit });
  const totalPages = Math.ceil(result.total / limit);

  return reply.send({
    data: result.packages,
    pagination: { page, limit, total: result.total, totalPages },
  });
}

export async function createAdminPackage(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminPackageCreateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const pkg = await packageService.createAdmin(parsed.data);
  return reply.status(201).send(pkg);
}

export async function updateAdminPackage(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID da embalagem inválido');
  }

  const parsed = adminPackageUpdateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const pkg = await packageService.updateAdmin(idParsed.data, parsed.data);
  return reply.send(pkg);
}

export async function setActiveAdminPackage(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID da embalagem inválido');
  }

  const parsed = adminPackageActiveSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const pkg = await packageService.setActiveAdmin(idParsed.data, parsed.data.active);
  return reply.send(pkg);
}

export async function deleteAdminPackage(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID da embalagem inválido');
  }

  const pkg = await packageService.delete(idParsed.data);
  return reply.send(pkg);
}