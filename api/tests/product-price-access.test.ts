import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { sign } from 'jsonwebtoken';

const TEST_SECRET = 'ssconnect-security-test-key-not-for-production-123456';
process.env.JWT_SECRET = TEST_SECRET;
process.env.DATABASE_URL = 'postgresql://ci:ci@127.0.0.1:5432/ssconnect_ci';
process.env.DIRECT_URL = process.env.DATABASE_URL;

const clientId = '11111111-1111-4111-8111-111111111111';
const sampleId = '22222222-2222-4222-8222-222222222222';

test('preços gerais exigem login e bloqueiam clientes desativados em todas as rotas', async () => {
  const { buildAuthenticate, authorizeAdmin } = await import('../src/shared/auth');
  const { registerProductPriceRoutes } = await import('../src/modules/product-prices/routes');
  const { productPriceService } = await import('../src/modules/product-prices/product-price.service');

  // Não executa consulta ao banco: qualquer invocação de preço é simulada.
  const originalFindAll = productPriceService.findAll;
  const originalFindById = productPriceService.findById;
  const originalFindByProductId = productPriceService.findByProductId;
  let priceCalls = 0;
  (productPriceService as any).findAll = async () => {
    priceCalls++;
    return [];
  };
  (productPriceService as any).findById = async () => {
    priceCalls++;
    return { id: sampleId, price: 120 };
  };
  (productPriceService as any).findByProductId = async () => {
    priceCalls++;
    return [];
  };

  let active = true;
  const app = Fastify({ logger: false });
  app.decorate('authenticate', buildAuthenticate(async (id) => ({
    id, email: 'cliente@example.invalid', role: 'USER' as const, active,
  })));
  app.decorate('authorizeAdmin', authorizeAdmin);
  app.register(registerProductPriceRoutes);

  const token = sign({ sub: clientId, role: 'USER' }, TEST_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
  const routes = [
    '/product-prices',
    '/product-prices/' + sampleId,
    '/products/' + sampleId + '/prices',
  ];

  try {
    for (const route of routes) {
      const noToken = await app.inject({ method: 'GET', url: route });
      assert.equal(noToken.statusCode, 401, 'Sem token: ' + route);

      const invalidToken = await app.inject({
        method: 'GET', url: route,
        headers: { authorization: 'Bearer invalid.token' },
      });
      assert.equal(invalidToken.statusCode, 401, 'Token inválido: ' + route);
    }
    assert.equal(priceCalls, 0, 'Requisições não autorizadas não consultam preços');

    for (const route of routes) {
      const valid = await app.inject({
        method: 'GET', url: route,
        headers: { authorization: 'Bearer ' + token },
      });
      assert.equal(valid.statusCode, 200, 'Cliente ativo: ' + route);
    }
    assert.equal(priceCalls, 3, 'Acesso autenticado executa consulta em cada rota');

    active = false;
    for (const route of routes) {
      const disabled = await app.inject({
        method: 'GET', url: route,
        headers: { authorization: 'Bearer ' + token },
      });
      assert.equal(disabled.statusCode, 401, 'Cliente desativado: ' + route);
    }
    assert.equal(priceCalls, 3, 'Cliente desativado não consulta preços');
  } finally {
    (productPriceService as any).findAll = originalFindAll;
    (productPriceService as any).findById = originalFindById;
    (productPriceService as any).findByProductId = originalFindByProductId;
    await app.close();
  }
});
