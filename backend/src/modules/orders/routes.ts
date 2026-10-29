import { FastifyInstance } from 'fastify';
import { createOrder, getOrders, getOrderById, cancelOrder } from './order.controller';

export async function registerOrderRoutes(app: FastifyInstance) {
  app.post('/orders', { preHandler: [app.authenticate] }, createOrder);
  app.get('/orders', { preHandler: [app.authenticate] }, getOrders);
  app.get('/orders/:id', { preHandler: [app.authenticate] }, getOrderById);
  app.patch('/orders/:id/cancel', { preHandler: [app.authenticate] }, cancelOrder);
}