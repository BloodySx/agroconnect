import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import {
  adminUserListSchema,
  adminUserCreateSchema,
  adminUserActiveSchema,
  adminUserRoleSchema,
  uuidSchema,
} from './admin-user.schema';
import { adminUserService } from './admin-user.service';
import { ValidationError } from '../../../shared/errors';

export async function listAdminUsers(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminUserListSchema.safeParse(request.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { search, role, active, page, limit } = parsed.data;
  const result = await adminUserService.listAdmin({ search, role, active, page, limit });
  const totalPages = Math.ceil(result.total / limit);

  return reply.send({
    data: result.users,
    pagination: { page, limit, total: result.total, totalPages },
  });
}

export async function createAdminUser(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminUserCreateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const user = await adminUserService.createAdmin(parsed.data);
  return reply.status(201).send(user);
}

export async function getAdminUserById(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do usuário inválido');
  }

  const user = await adminUserService.getByIdAdmin(idParsed.data);
  return reply.send(user);
}

export async function setActiveAdminUser(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = uuidSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do usuário inválido');
  }

  const parsed = adminUserActiveSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const requestUserId = (request.user as { sub: string }).sub;
  const user = await adminUserService.setActiveAdmin(idParsed.data, parsed.data.active, requestUserId);
  return reply.send(user);
}

export async function setRoleAdminUser(
     request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
     reply: FastifyReply
   ) {
     const idParsed = uuidSchema.safeParse(request.params.id);
     if (!idParsed.success) {
       throw new ValidationError('ID do usuário inválido');
     }

     const parsed = adminUserRoleSchema.safeParse(request.body);
     if (!parsed.success) {
       throw new ValidationError(parsed.error.errors[0].message);
     }

     const requestUserId = (request.user as { sub: string }).sub;
     const user = await adminUserService.setRoleAdmin(idParsed.data, parsed.data.role, requestUserId);
     return reply.send(user);
   }

   export async function deleteAdminUser(
     request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
     reply: FastifyReply
   ) {
     const idParsed = uuidSchema.safeParse(request.params.id);
     if (!idParsed.success) {
       throw new ValidationError('ID do usuário inválido');
     }

     const requestUserId = (request.user as { sub: string }).sub;
     const user = await adminUserService.deleteAdmin(idParsed.data, requestUserId);
     return reply.send(user);
   }
