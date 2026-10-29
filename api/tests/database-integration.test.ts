import { test } from 'node:test';
import assert from 'node:assert/strict';

// Fail closed: never allow this test to target a cloud or company database.
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;
if (process.env.SSCONNECT_TEST_DATABASE !== '1' || !databaseUrl || !directUrl) {
  throw new Error('Test database guard: SSCONNECT_TEST_DATABASE=1 and test URLs required');
}
for (const raw of [databaseUrl, directUrl]) {
  const url = new URL(raw);
  if (
    !['localhost', '127.0.0.1'].includes(url.hostname) ||
    url.pathname !== '/ssconnect_ci' ||
    url.protocol !== 'postgresql:'
  ) {
    throw new Error('Test database guard: only local PostgreSQL ssconnect_ci is allowed');
  }
}

test('real PostgreSQL: login, isolated prices, orders, stale price 409, and deactivation', async () => {
  const { default: prisma } = await import('../src/database/prisma');
  const { default: Fastify } = await import('fastify');
  const { hash } = await import('bcrypt');
  const { registerAuthHooks } = await import('../src/shared/auth');
  const { registerAuthRoutes } = await import('../src/modules/auth/routes');
  const { registerOrderRoutes } = await import('../src/modules/orders/routes');
  const { registerProductPriceRoutes } = await import('../src/modules/product-prices/routes');
  const { registerAdminUserRoutes } = await import('../src/modules/admin/users/routes');

  const app = Fastify({ logger: false });
  registerAuthHooks(app);
  await registerAuthRoutes(app);
  await registerOrderRoutes(app);
  await registerProductPriceRoutes(app);
  await registerAdminUserRoutes(app);

  let aId: string | undefined;
  let bId: string | undefined;
  let productId: string | undefined;
  let packageId: string | undefined;

  const get = (url: string, token?: string) => app.inject({
    method: 'GET', url,
    headers: token ? { authorization: 'Bearer ' + token } : {},
  });
  const post = (url: string, payload: object, token?: string) => app.inject({
    method: 'POST', url, payload,
    headers: token ? { authorization: 'Bearer ' + token } : {},
  });

  try {
    await prisma.$connect();

    const passwordHash = await hash('ci-test-password-only', 6);
    const a = await prisma.user.create({
      data: { name: 'Test Client A', username: 'ci_a_' + Date.now(), passwordHash, role: 'USER', active: true },
    });
    aId = a.id;
    const b = await prisma.user.create({
      data: { name: 'Test Client B', username: 'ci_b_' + Date.now(), passwordHash, role: 'USER', active: true },
    });
    bId = b.id;
    const product = await prisma.product.create({
      data: { name: 'Test Product', code: 'CI-' + Date.now(), sachetBoxVolumeLiters: 15 },
    });
    productId = product.id;
    const pack = await prisma.package.create({
      data: { name: 'Test 20L', type: 'BOMBONA_20L', capacity: '20 L', capacityLiters: 20 },
    });
    packageId = pack.id;

    await prisma.productPrice.create({
      data: { productId, packageId, price: 150, unit: 'litro' },
    });
    const special = await prisma.clientProductPrice.create({
      data: { userId: aId, productId, packageId, price: 125, unit: 'litro' },
    });

    const loginA = await post('/auth/login', { identifier: a.username, password: 'ci-test-password-only' });
    const loginB = await post('/auth/login', { identifier: b.username, password: 'ci-test-password-only' });
    assert.equal(loginA.statusCode, 200, loginA.body);
    assert.equal(loginB.statusCode, 200, loginB.body);
    const tokenA: string = loginA.json().token;
    const tokenB: string = loginB.json().token;
    assert.equal(typeof tokenA, 'string');
    assert.equal(typeof tokenB, 'string');

    assert.equal((await post('/auth/register', {
      name: 'No public signup', email: 'none@example.invalid', password: 'abc12345',
    })).statusCode, 404);
    assert.equal((await post('/admin/users', {
      name: 'Forbidden', username: 'forbidden', password: 'abc12345', role: 'USER',
    }, tokenA)).statusCode, 403);
    assert.equal((await get('/product-prices')).statusCode, 401);

    const resolvedA = await get('/client-product-prices?productId=' + productId, tokenA);
    const resolvedB = await get('/client-product-prices?productId=' + productId, tokenB);
    assert.equal(resolvedA.statusCode, 200, resolvedA.body);
    assert.equal(resolvedB.statusCode, 200, resolvedB.body);

    const offerA = resolvedA.json().data.find((v: any) => v.packageId === packageId);
    const offerB = resolvedB.json().data.find((v: any) => v.packageId === packageId);
    assert.equal(offerA.price, 125);
    assert.equal(offerA.priceSource, 'client');
    assert.equal(offerB.price, 150);
    assert.equal(offerB.priceSource, 'default');
    assert.equal(offerA.priceId, special.id);

    const quote = (o: any, quantity = 20) => ({
      productId, packageId, quantity,
      priceVersion: { source: o.priceSource, priceId: o.priceId, updatedAt: o.updatedAt },
    });
    const orderPayload = (items: any[]) => ({
      items, paymentTerm: '28 dias', deliveryTerm: 'a combinar',
    });

    const created = await post('/orders', orderPayload([quote(offerA)]), tokenA);
    assert.equal(created.statusCode, 201, created.body);
    const orderId: string = created.json().id;
    assert.equal(created.json().userId, aId);
    assert.equal(created.json().totalValue, 2500);
    assert.equal(created.json().items[0].unitPrice, 125);
    assert.equal((await get('/orders/' + orderId, tokenB)).statusCode, 403);

    const unauthorizedCancel = await app.inject({
      method: 'PATCH', url: '/orders/' + orderId + '/cancel', payload: {},
      headers: { authorization: 'Bearer ' + tokenB },
    });
    assert.equal(unauthorizedCancel.statusCode, 403);
    assert.equal((await get('/orders', tokenB)).json().length, 0);

    await prisma.clientProductPrice.update({
      where: { id: special.id },
      data: { price: 130, updatedAt: new Date(Date.now() + 10000) },
    });

    const before = await prisma.order.count({ where: { userId: aId } });
    const outdated = await post('/orders', orderPayload([quote(offerA)]), tokenA);
    assert.equal(outdated.statusCode, 409, outdated.body);
    // Atomicity: one stale item prevents writing the entire multi-item order.
    const refreshed = await get('/client-product-prices?productId=' + productId, tokenA);
    assert.equal(refreshed.statusCode, 200, refreshed.body);
    const newOffer = refreshed.json().data.find((v: any) => v.packageId === packageId);
    assert.equal(newOffer.price, 130);

    const mixed = await post('/orders', orderPayload([quote(newOffer), quote(offerA, 40)]), tokenA);
    assert.equal(mixed.statusCode, 409, mixed.body);
    assert.equal(await prisma.order.count({ where: { userId: aId } }), before);

    const accepted = await post('/orders', orderPayload([quote(newOffer)]), tokenA);
    assert.equal(accepted.statusCode, 201, accepted.body);
    assert.equal(accepted.json().totalValue, 2600);

    await prisma.user.update({ where: { id: aId }, data: { active: false } });
    assert.equal((await get('/orders', tokenA)).statusCode, 401);
  } finally {
    await app.close();
    // Only synthetic records in a disposable local PostgreSQL instance.
    try {
      if (aId || bId) {
        await prisma.order.deleteMany({ where: { userId: { in: [aId, bId].filter((v): v is string => !!v) } } });
      }
      if (productId) {
        await prisma.clientProductPrice.deleteMany({ where: { productId } });
        await prisma.productPrice.deleteMany({ where: { productId } });
        await prisma.product.delete({ where: { id: productId } });
      }
      if (packageId) await prisma.package.delete({ where: { id: packageId } });
      if (aId) await prisma.user.delete({ where: { id: aId } });
      if (bId) await prisma.user.delete({ where: { id: bId } });
    } finally {
      await prisma.$disconnect();
    }
  }
});
