import { FastifyInstance } from 'fastify';
import {
  listAdminOrders,
  getAdminOrderById,
  changeAdminOrderStatus,
  deleteAdminOrder,
} from './admin-order.controller';

export async function registerAdminOrderRoutes(app: FastifyInstance) {
  app.get('/admin/orders', { preHandler: [app.authenticate, app.authorizeAdmin] }, listAdminOrders);
  app.get('/admin/orders/:id', { preHandler: [app.authenticate, app.authorizeAdmin] }, getAdminOrderById);
  app.patch(
    '/admin/orders/:id/status',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    changeAdminOrderStatus
  );
  app.delete(
    '/admin/orders/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    deleteAdminOrder
  );
}
