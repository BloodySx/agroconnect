import { FastifyInstance } from 'fastify';
import { getProductPrices, getProductPriceById, getProductPricesByProductId } from './product-price.controller';
import {
  listAdminPrices,
  createAdminPrice,
  updateAdminPrice,
  setActiveAdminPrice,
  deleteAdminPrice,
} from './product-price.admin.controller';
import {
  createClientPrice,
  updateClientPrice,
  deleteClientPrice,
  listClientPrices,
  listResolvedClientPrices,
  toggleClientPriceActive,
} from './client-product-price.controller';
import { clientProductPriceService } from './client-product-price.service';

export async function registerProductPriceRoutes(app: FastifyInstance) {
  // Os preços gerais só podem ser consultados depois do login.
  // Usuários inativos também são bloqueados pelo app.authenticate.
  app.get('/product-prices', { preHandler: [app.authenticate] }, getProductPrices);
  app.get<{ Params: { id: string } }>('/product-prices/:id', { preHandler: [app.authenticate] }, getProductPriceById);
  app.get<{ Params: { productId: string } }>('/products/:productId/prices', { preHandler: [app.authenticate] }, getProductPricesByProductId);

  // Admin routes for general product prices
  app.get('/admin/product-prices', { preHandler: [app.authenticate, app.authorizeAdmin] }, listAdminPrices);
  app.post('/admin/product-prices', { preHandler: [app.authenticate, app.authorizeAdmin] }, createAdminPrice);
  app.put('/admin/product-prices/:id', { preHandler: [app.authenticate, app.authorizeAdmin] }, updateAdminPrice);
  app.patch(
    '/admin/product-prices/:id/active',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    setActiveAdminPrice
  );
  app.delete(
    '/admin/product-prices/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    deleteAdminPrice
  );

  // Client-specific prices (admin only)
  app.get(
    '/admin/client-product-prices',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    listClientPrices
  );

  app.post(
    '/admin/client-product-prices',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    createClientPrice
  );

  app.patch(
    '/admin/client-product-prices/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    updateClientPrice
  );

  app.patch(
    '/admin/client-product-prices/:id/active',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    toggleClientPriceActive
  );

  app.delete(
    '/admin/client-product-prices/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    deleteClientPrice
  );

  // Client-specific prices for the authenticated user (for mobile app)
  app.get(
    '/client-product-prices',
    { preHandler: [app.authenticate] },
    listResolvedClientPrices
  );

  app.get(
    '/client-product-prices/resolved',
    { preHandler: [app.authenticate] },
    listResolvedClientPrices
  );
}