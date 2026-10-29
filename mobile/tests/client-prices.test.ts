import assert from 'node:assert/strict';
import test from 'node:test';

import { createQuotation } from '../src/features/new-quotation/quotation-flow';
import { parseClientProductPricesResponse } from '../src/services/api/parseClientProductPrices';

const productA = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name: 'Produto A',
};

const productB = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  name: 'Produto B',
};

const packageSachet = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  name: 'Sachê',
  type: 'SACHÊ',
  capacity: 'Pequena',
  capacityLiters: null,
  active: true,
};

const packageIbc = {
  id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  name: 'IBC 1000L',
  type: 'IBC_1000L',
  capacity: '1000L',
  capacityLiters: 1000,
  active: true,
};

const sachetBoxVolumeLiters = 15;

function buildClientPriceResponse(overrides: Record<string, unknown> = {}): unknown {
  return {
    data: [
      {
        productId: productA.id,
        packageId: packageSachet.id,
        price: 12.5,
        unit: 'litro',
        active: true,
        updatedAt: '2026-09-06T16:51:01.566Z',
        priceSource: 'client',
        priceId: '11111111-1111-1111-1111-111111111111',
        packageName: packageSachet.name,
        packageType: packageSachet.type,
        packageVolumeLiters: sachetBoxVolumeLiters,
        ...overrides,
      },
    ],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
  };
}

test('returns only active client prices', () => {
  const response = buildClientPriceResponse({ active: true });
  const parsed = parseClientProductPricesResponse((response as { data: unknown[] }).data);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].productId, productA.id);
});

test('returns inactive client prices as well (filtering is done upstream)', () => {
  const response = buildClientPriceResponse({ active: false });
  const parsed = parseClientProductPricesResponse((response as { data: unknown[] }).data);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].active, false);
});

test('isolates prices between two clients', () => {
  const client1Response = {
    data: [
      {
        productId: productA.id,
        packageId: packageSachet.id,
        price: 12.5,
        unit: 'litro',
        active: true,
        updatedAt: '2026-09-06T16:51:01.566Z',
        priceSource: 'client',
        priceId: '11111111-1111-1111-1111-111111111111',
        packageName: packageSachet.name,
        packageType: packageSachet.type,
        packageVolumeLiters: sachetBoxVolumeLiters,
      },
    ],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
  };

  const client2Response = {
    data: [
      {
        productId: productB.id,
        packageId: packageIbc.id,
        price: 14.0,
        unit: 'litro',
        active: true,
        updatedAt: '2026-09-06T16:51:01.566Z',
        priceSource: 'client',
        priceId: '22222222-2222-2222-2222-222222222222',
        packageName: packageIbc.name,
        packageType: packageIbc.type,
        packageVolumeLiters: packageIbc.capacityLiters,
      },
    ],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
  };

  const client1Prices = parseClientProductPricesResponse((client1Response as { data: unknown[] }).data);
  const client2Prices = parseClientProductPricesResponse((client2Response as { data: unknown[] }).data);

  assert.equal(client1Prices.length, 1);
  assert.equal(client1Prices[0].productId, productA.id);
  assert.equal(client1Prices[0].packageId, packageSachet.id);

  assert.equal(client2Prices.length, 1);
  assert.equal(client2Prices[0].productId, productB.id);
  assert.equal(client2Prices[0].packageId, packageIbc.id);
});

test('preserves priceVersion through quotation flow', () => {
  const response = buildClientPriceResponse({ updatedAt: '2026-09-06T16:51:01.566Z' });
  const parsed = parseClientProductPricesResponse((response as { data: unknown[] }).data);
  assert.equal(parsed[0].updatedAt, '2026-09-06T16:51:01.566Z');
});

test('blocks package selection when no client prices exist', () => {
  const emptyResponse = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  const parsed = parseClientProductPricesResponse((emptyResponse as { data: unknown[] }).data);
  assert.equal(parsed.length, 0);
});

test('accepts default resolved price with real backend shape', () => {
  const defaultPriceResponse = {
    data: [
      {
        productId: productA.id,
        packageId: packageSachet.id,
        price: 10,
        unit: 'litro',
        active: true,
        updatedAt: '2026-09-06T16:51:01.000Z',
        priceSource: 'default',
        priceId: '22222222-2222-4222-8222-222222222222',
        packageName: packageSachet.name,
        packageType: packageSachet.type,
        packageVolumeLiters: sachetBoxVolumeLiters,
      },
    ],
  };

  const parsed = parseClientProductPricesResponse((defaultPriceResponse as { data: unknown[] }).data);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].productId, productA.id);
  assert.equal(parsed[0].packageId, packageSachet.id);
  assert.equal(parsed[0].price, 10);
  assert.equal(parsed[0].priceSource, 'default');
  assert.equal(parsed[0].priceId, '22222222-2222-4222-8222-222222222222');
  assert.equal(parsed[0].packageType, 'SACHÊ');
  assert.equal(parsed[0].packageVolumeLiters, sachetBoxVolumeLiters);
});

test('filters out malformed offer instead of throwing', () => {
  const malformed = {
    data: [
      {
        price: -5,
        packageName: '',
        packageType: 'UNKNOWN',
      },
    ],
  };

  const parsed = parseClientProductPricesResponse((malformed as { data: unknown[] }).data);
  assert.equal(parsed.length, 0, 'expected malformed offer to be filtered out');
});

test('rejects sachete offer without valid volume', () => {
  const malformed = {
    data: [
      {
        productId: productA.id,
        packageId: packageSachet.id,
        price: 10,
        unit: 'litro',
        active: true,
        updatedAt: '2026-09-06T16:51:01.000Z',
        priceSource: 'client',
        priceId: '11111111-1111-1111-1111-111111111111',
        packageName: packageSachet.name,
        packageType: 'SACHÊ',
        packageVolumeLiters: null,
      },
    ],
  };

  const parsed = parseClientProductPricesResponse((malformed as { data: unknown[] }).data);
  assert.equal(parsed.length, 0, 'expected sachete without volume to be filtered out');
});

test('accepts client resolved sachete using product sachetBoxVolumeLiters', () => {
  const clientResponse = {
    data: [
      {
        productId: productA.id,
        packageId: packageSachet.id,
        price: 12.5,
        unit: 'litro',
        active: true,
        updatedAt: '2026-09-06T16:51:01.566Z',
        priceSource: 'client',
        priceId: '11111111-1111-1111-1111-111111111111',
        packageName: packageSachet.name,
        packageType: packageSachet.type,
        packageVolumeLiters: sachetBoxVolumeLiters,
      },
    ],
  };

  const parsed = parseClientProductPricesResponse((clientResponse as { data: unknown[] }).data);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].priceSource, 'client');
  assert.equal(parsed[0].packageVolumeLiters, sachetBoxVolumeLiters);
});
