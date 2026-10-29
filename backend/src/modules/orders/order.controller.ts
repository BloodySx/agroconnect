import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import { CreateOrderInput, createOrderSchema, cancelOrderSchema } from './order.schema';
import { orderService } from './order.service';
import { UnauthorizedError, ValidationError } from '../../shared/errors';

function getUserId(request: FastifyRequest): string {
  const userId = request.user?.sub;
  if (!userId) throw new UnauthorizedError('Usuário não autenticado');
  return userId;
}

export interface OrderCreator {
  create(userId: string, data: CreateOrderInput): Promise<unknown>;
}

export function buildCreateOrderHandler(creator: OrderCreator) {
  return async function createOrderHandler(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createOrderSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors[0].message);
    }

    const order = await creator.create(getUserId(request), parseResult.data);
    return reply.status(201).send(order);
  };
}

export const createOrder = buildCreateOrderHandler(orderService);

export async function getOrders(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request);
  const orders = await orderService.findByUserId(userId);
  return reply.send(orders);
}

export async function getOrderById(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = getUserId(request);
  const { id } = request.params;

  const order = await orderService.getUserOrder(userId, id);
  return reply.send(order);
}

export async function cancelOrder(
  request: FastifyRequest<RouteGenericInterface & { Params: { id: string } }>,
  reply: FastifyReply
) {
  const parseResult = cancelOrderSchema.safeParse(request.body);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }

  const userId = getUserId(request);
  const { id } = request.params;

  const order = await orderService.cancel(userId, id);
  return reply.send(order);
}
