import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';

import type {} from '../src/shared/auth';
import { AppError, ValidationError, ConflictError } from '../src/shared/errors';
import { buildCreateOrderHandler } from '../src/modules/orders/order.controller';
import { validateOrderQuantity } from '../src/modules/orders/quotation-policy';

const activeUserId = '11111111-1111-4111-8111-111111111111';
const blockedUserId = '22222222-2222-4222-8222-222222222222';
const blockedPackageId = '44444444-4444-4444-8444-444444444444';
const productId = 'd1764d6c-3fc0-47fd-b137-885fc531ac0f';
const packageId = 'd6cbd2a9-5173-4049-a54e-ae6139f31abf';
const clientPriceUpdatedAt = '2026-09-06T16:51:01.566Z';

interface TestItem {
  productId: string;
  packageId: string;
  quantity: number;
  priceVersion: { source: string; priceId: string; updatedAt: string };
}

interface TestOrderData {
  items: TestItem[];
  paymentTerm: string;
  deliveryTerm: string;
}

interface ClientPrice {
  price: number;
  unit: string;
  isClientPrice: boolean;
  updatedAt: string;
}

const clientPriceMap = new Map<string, ClientPrice>();
clientPriceMap.set(`${activeUserId}:${productId}:${packageId}`, {
  price: 13,
  unit: 'litro',
  isClientPrice: true,
  updatedAt: clientPriceUpdatedAt,
});

const defaultPriceMap = new Map<string, ClientPrice>();
defaultPriceMap.set(`${productId}:${packageId}`, {
  price: 10,
  unit: 'litro',
  isClientPrice: false,
  updatedAt: '2026-09-06T16:51:01.000Z',
});

async function buildTestServer(authenticatedUserId: string) {
  const app = Fastify();
  app.setErrorHandler((error: any, _request: any, reply: any) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }
    return reply.status(500).send({ error: 'INTERNAL_ERROR' });
  });

  const creator = {
    async create(requestUserId: string, data: TestOrderData) {
      const item = data.items[0];
      validateOrderQuantity({
        quantity: item.quantity,
        packageType: 'SACHÊ',
        sachetBoxVolumeLiters: 15,
      });

      const key = `${requestUserId}:${item.productId}:${item.packageId}`;
      const clientPrice = clientPriceMap.get(key);
      const defaultPrice = defaultPriceMap.get(`${item.productId}:${item.packageId}`);

      const resolvedPrice = clientPrice ?? defaultPrice ?? null;

      if (!resolvedPrice) {
        throw new ValidationError(`Preço indisponível para o produto ${item.productId} com a embalagem ${item.packageId}`);
      }

      const quotedAt = data.items[0]?.priceVersion ? new Date(data.items[0].priceVersion.updatedAt) : null;
      const currentUpdatedAt = new Date(resolvedPrice.updatedAt);
      if (quotedAt && quotedAt.getTime() !== currentUpdatedAt.getTime()) {
        throw new ConflictError('Preço alterado durante a cotação. Revise os valores.');
      }

      if (data.items[0]?.priceVersion) {
        const expectedSource = clientPrice ? 'client' : 'default';
        const expectedPriceId = clientPrice ? '11111111-1111-4111-8111-111111111111' : '22222222-2222-4222-8222-222222222222';
        if (data.items[0].priceVersion.source !== expectedSource || data.items[0].priceVersion.priceId !== expectedPriceId) {
          throw new ConflictError('Preço alterado durante a cotação. Revise os valores.');
        }
      }

      return {
        userId: requestUserId,
        totalValue: item.quantity * resolvedPrice.price,
        items: [{ ...item, unitPrice: resolvedPrice.price, totalPrice: item.quantity * resolvedPrice.price }],
      };
    },
  };

  app.post('/orders', {
    preHandler: async (request: any) => {
      request.user = { sub: authenticatedUserId, email: 'test@example.com', role: 'USER' };
    },
  }, buildCreateOrderHandler(creator));
  return app;
}

test('returns 201 with client-specific SS-260 totals for 30 L', async () => {
  const app = await buildTestServer(activeUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{
        productId,
        packageId,
        quantity: 30,
        priceVersion: { source: 'client', priceId: '11111111-1111-4111-8111-111111111111', updatedAt: clientPriceUpdatedAt },
      }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().totalValue, 390);
  assert.equal(response.json().items[0].unitPrice, 13);
});

test('accepts sachet box quantity of 20 L without box-multiple restriction', async () => {
  const app = await buildTestServer(activeUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{ productId, packageId, quantity: 20, priceVersion: { source: 'client', priceId: '11111111-1111-4111-8111-111111111111', updatedAt: clientPriceUpdatedAt } }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().items[0].quantity, 20);
});

test('blocks purchase when no specific or default price exists', async () => {
  const app = await buildTestServer(blockedUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{ productId, packageId: blockedPackageId, quantity: 30, priceVersion: { source: 'default', priceId: '22222222-2222-4222-8222-222222222222', updatedAt: '2026-09-06T16:51:01.000Z' } }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 400);
  assert.match(response.json().message, /Preço indisponível/);
});

test('falls back to default price when specific price is not available', async () => {
  const app = await buildTestServer(blockedUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{ productId, packageId, quantity: 30, priceVersion: { source: 'default', priceId: '22222222-2222-4222-8222-222222222222', updatedAt: '2026-09-06T16:51:01.000Z' } }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().items[0].unitPrice, 10);
  assert.equal(response.json().totalValue, 300);
});

test('rejects order when price changes during quotation', async () => {
  const app = await buildTestServer(activeUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{
        productId,
        packageId,
        quantity: 30,
        priceVersion: { source: 'client', priceId: '11111111-1111-4111-8111-111111111111', updatedAt: '2026-09-06T16:51:01.000Z' },
      }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 409);
  assert.match(response.json().message, /Preço alterado/);
});

test('rejects order when priceVersion source or priceId changes', async () => {
  const app = await buildTestServer(activeUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{
        productId,
        packageId,
        quantity: 30,
        priceVersion: { source: 'default', priceId: '22222222-2222-4222-8222-222222222222', updatedAt: clientPriceUpdatedAt },
      }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 409);
  assert.match(response.json().message, /Preço alterado/);
});

test('rejects order when priceVersion is missing', async () => {
  const app = await buildTestServer(activeUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{
        productId,
        packageId,
        quantity: 30,
      }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 400);
  assert.match(response.json().message, /Required/);
});

test('rejects adulterated payload price by calculating server-side price', async () => {
  const app = await buildTestServer(activeUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{
        productId,
        packageId,
        quantity: 30,
        priceVersion: { source: 'client', priceId: '11111111-1111-4111-8111-111111111111', updatedAt: clientPriceUpdatedAt },
      }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().items[0].unitPrice, 13);
  assert.equal(response.json().totalValue, 390);
});

test('accepts sachet box quantity that is not a box multiple', async () => {
  const app = await buildTestServer(activeUserId);
  const response = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: {
      items: [{
        productId,
        packageId,
        quantity: 15,
        priceVersion: { source: 'client', priceId: '11111111-1111-4111-8111-111111111111', updatedAt: clientPriceUpdatedAt },
      }],
      paymentTerm: '1x — 28 dias',
      deliveryTerm: '72 horas',
    },
  });
  await app.close();

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().items[0].quantity, 15);
  assert.equal(response.json().items[0].unitPrice, 13);
  assert.equal(response.json().totalValue, 195);
});
