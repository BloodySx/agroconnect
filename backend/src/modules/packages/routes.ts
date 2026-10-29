import { FastifyInstance } from 'fastify';
import { getPackages, getPackageById } from './package.controller';
import {
  listAdminPackages,
  createAdminPackage,
  updateAdminPackage,
  setActiveAdminPackage,
  deleteAdminPackage,
} from './package.admin.controller';

export async function registerPackageRoutes(app: FastifyInstance) {
  app.get('/packages', getPackages);
  app.get('/packages/:id', getPackageById);

  app.get('/admin/packages', { preHandler: [app.authenticate, app.authorizeAdmin] }, listAdminPackages);
  app.post('/admin/packages', { preHandler: [app.authenticate, app.authorizeAdmin] }, createAdminPackage);
  app.put('/admin/packages/:id', { preHandler: [app.authenticate, app.authorizeAdmin] }, updateAdminPackage);
  app.patch(
    '/admin/packages/:id/active',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    setActiveAdminPackage
  );
  app.delete(
    '/admin/packages/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    deleteAdminPackage
  );
}
