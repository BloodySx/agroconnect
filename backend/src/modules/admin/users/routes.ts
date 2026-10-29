import { FastifyInstance } from 'fastify';
import {
  listAdminUsers,
  createAdminUser,
  getAdminUserById,
  setActiveAdminUser,
  setRoleAdminUser,
  deleteAdminUser,
} from './admin-user.controller';

export async function registerAdminUserRoutes(app: FastifyInstance) {
  app.get('/admin/users', { preHandler: [app.authenticate, app.authorizeAdmin] }, listAdminUsers);
  app.post('/admin/users', { preHandler: [app.authenticate, app.authorizeAdmin] }, createAdminUser);
  app.get('/admin/users/:id', { preHandler: [app.authenticate, app.authorizeAdmin] }, getAdminUserById);
  app.patch(
    '/admin/users/:id/active',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    setActiveAdminUser
  );
  app.patch(
    '/admin/users/:id/role',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    setRoleAdminUser
  );
  app.delete(
    '/admin/users/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    deleteAdminUser
  );
}
