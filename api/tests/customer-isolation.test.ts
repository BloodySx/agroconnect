// Inclui o teste de acesso a preços gerais na suíte executada pelo CI.
import './product-price-access.test';
import './order-price-version.test';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { sign } from 'jsonwebtoken';

const TEST_SECRET = 'ssconnect-security-test-key-not-for-production-123456';
process.env.JWT_SECRET = TEST_SECRET;
process.env.DATABASE_URL = 'postgresql://ci:ci@127.0.0.1:5432/ssconnect_ci';
process.env.DIRECT_URL = process.env.DATABASE_URL;

const clientA = '11111111-1111-4111-8111-111111111111';
const clientB = '22222222-2222-4222-8222-222222222222';
const orderId = '33333333-3333-4333-8333-333333333333';
const productId = '44444444-4444-4444-8444-444444444444';

test('cliente A não consulta nem cancela pedido de B', async () => {
  const { orderService } = await import('../src/modules/orders/order.service');
  const { orderRepository } = await import('../src/modules/orders/order.repository');

  const origFind = orderRepository.findById;
  const origUpdate = orderRepository.updateStatus;
  const origList = orderRepository.findByUserId;
  const filterCalls: string[] = [];
  let updates = 0;

  (orderRepository as any).findById = async (id: string) =>
    id === orderId ? { id: orderId, userId: clientA, status: 'PENDING' } : null;
  (orderRepository as any).updateStatus = async () => {
    updates++;
    return { id: orderId, status: 'CANCELLED' };
  };
  (orderRepository as any).findByUserId = async (id: string) => {
    filterCalls.push(id);
    return [];
  };

  try {
    const ownOrder = await orderService.getUserOrder(clientA, orderId);
    assert.equal(ownOrder.userId, clientA);

    await assert.rejects(
      () => orderService.getUserOrder(clientB, orderId),
      (error: any) => error.statusCode === 403,
    );
    await assert.rejects(
      () => orderService.cancel(clientB, orderId),
      (error: any) => error.statusCode === 403,
    );
    assert.equal(updates, 0, 'Pedido de outro cliente não pode ser alterado');

    await orderService.findByUserId(clientB);
    assert.deepEqual(filterCalls, [clientB], 'Lista deve filtrar pelo cliente logado');
  } finally {
    (orderRepository as any).findById = origFind;
    (orderRepository as any).updateStatus = origUpdate;
    (orderRepository as any).findByUserId = origList;
  }
});

test('rota de preços individuais usa ID autenticado e ignora userId enviado na URL', async () => {
  const { buildAuthenticate, authorizeAdmin } = await import('../src/shared/auth');
  const { registerProductPriceRoutes } = await import('../src/modules/product-prices/routes');
  const { clientProductPriceService } = await import('../src/modules/product-prices/client-product-price.service');

  const origList = clientProductPriceService.listResolvedPricesForUser;
  const lookups: Array<{ userId: string; productId: string }> = [];
  (clientProductPriceService as any).listResolvedPricesForUser = async (userId: string, productId: string) => {
    lookups.push({ userId, productId });
    return [];
  };

  const app = Fastify({ logger: false });
  app.decorate('authenticate', buildAuthenticate(async (id) => ({
    id, email: null, role: 'USER' as const, active: true,
  })));
  app.decorate('authorizeAdmin', authorizeAdmin);
  app.register(registerProductPriceRoutes);

  try {
    const authToken = sign({ sub: clientA, role: 'USER' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    const result = await app.inject({
      method: 'GET',
      url: '/client-product-prices/resolved?productId=' + productId + '&userId=' + clientB,
      headers: { authorization: 'Bearer ' + authToken },
    });

    assert.equal(result.statusCode, 200);
    assert.deepEqual(lookups, [{ userId: clientA, productId }]);
    assert.deepEqual(result.json(), { data: [] });

    const noToken = await app.inject({
      method: 'GET',
      url: '/client-product-prices/resolved?productId=' + productId,
    });
    assert.equal(noToken.statusCode, 401);
  } finally {
    (clientProductPriceService as any).listResolvedPricesForUser = origList;
    await app.close();
  }
});
