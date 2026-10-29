import { FastifyInstance } from 'fastify';
import { getProducts, getProductById } from './product.controller';
import {
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  setActiveAdminProduct,
  deleteAdminProduct,
} from './product.admin.controller';

export async function registerProductRoutes(app: FastifyInstance) {
  app.get('/products', getProducts);
  app.get('/products/:id', getProductById);

  app.get('/admin/products', { preHandler: [app.authenticate, app.authorizeAdmin] }, listAdminProducts);
  app.post('/admin/products', { preHandler: [app.authenticate, app.authorizeAdmin] }, createAdminProduct);
  app.put('/admin/products/:id', { preHandler: [app.authenticate, app.authorizeAdmin] }, updateAdminProduct);
  app.patch(
    '/admin/products/:id/active',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    setActiveAdminProduct
  );
  app.delete(
    '/admin/products/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    deleteAdminProduct
  );
}