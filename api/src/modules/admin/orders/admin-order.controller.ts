import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import { adminOrderQuerySchema, adminOrderIdSchema, adminStatusSchema } from './admin-order.schema';
import { orderService } from '../../orders/order.service';
import { ValidationError } from '../../../shared/errors';

export async function listAdminOrders(request: FastifyRequest, reply: FastifyReply) {
  const parsed = adminOrderQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { status, startDate, endDate, page, limit } = parsed.data;

  const result = await orderService.listAdmin({ status, startDate, endDate, page, limit });
  const totalPages = Math.ceil(result.total / limit);

  return reply.send({
    data: result.orders,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  });
}

export async function getAdminOrderById(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = adminOrderIdSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do pedido inválido');
  }

  const order = await orderService.getAdminById(idParsed.data);
  return reply.send(order);
}

export async function changeAdminOrderStatus(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = adminOrderIdSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do pedido inválido');
  }

  const bodyParsed = adminStatusSchema.safeParse(request.body);
  if (!bodyParsed.success) {
    throw new ValidationError(bodyParsed.error.errors[0].message);
  }

  const order = await orderService.changeStatusAdmin(idParsed.data, bodyParsed.data.status);
  return reply.send(order);
}

export async function deleteAdminOrder(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const idParsed = adminOrderIdSchema.safeParse(request.params.id);
  if (!idParsed.success) {
    throw new ValidationError('ID do pedido inválido');
  }

  await orderService.deleteAdmin(idParsed.data);
  return reply.send({ success: true });
}
