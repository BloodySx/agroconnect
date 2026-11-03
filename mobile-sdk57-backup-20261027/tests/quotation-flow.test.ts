import assert from 'node:assert/strict';
import { describe, it, test } from 'node:test';
import { validateQuantity, submitQuantity, createQuotation, addPaymentTerm, getPackageDisplayName, formatCurrency, parseProductPricesResponse } from '../src/features/new-quotation/quotation-flow';

const ss260Product = {
  id: 'd1764d6c-3fc0-47fd-b137-885fc531ac0f',
  name: 'SS-260',
};

const ss260ApiResponse: unknown = [
  {
    id: 'ffa4dc68-12f4-4bc2-82f0-58fff780c7f0',
    productId: ss260Product.id,
    packageId: '0dc47c18-fe96-474e-95e3-74b4f29ce124',
    price: 12.5,
    unit: 'litro',
    active: true,
    createdAt: '2026-09-06T16:51:01.771Z',
    updatedAt: '2026-09-06T16:51:01.771Z',
    packageVolumeLiters: 1000,
    package: {
      id: '0dc47c18-fe96-474e-95e3-74b4f29ce124',
      name: 'IBC 1000L',
      type: 'IBC_1000L',
      capacity: '1000L',
      capacityLiters: 1000,
      active: true,
      createdAt: '2026-09-06T16:51:00.202Z',
      updatedAt: '2026-09-06T16:51:00.202Z',
    },
  },
  {
    id: '0d1627de-1ce8-4dae-8b32-0ac7e56a7eb1',
    productId: ss260Product.id,
    packageId: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
    price: 13,
    unit: 'litro',
    active: true,
    createdAt: '2026-09-06T16:51:01.566Z',
    updatedAt: '2026-09-06T16:51:01.566Z',
    packageVolumeLiters: 15,
    package: {
      id: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
      name: 'Sachê',
      type: 'SACHÊ',
      capacity: 'Pequena',
      capacityLiters: null,
      active: true,
      createdAt: '2026-09-06T16:50:59.976Z',
      updatedAt: '2026-09-06T16:50:59.976Z',
    },
  },
  {
    id: 'd424420c-e145-4516-b037-a31b833d5ffc',
    productId: ss260Product.id,
    packageId: '28e9b723-7ae6-429d-856f-89f58eaebba6',
    price: 13.4,
    unit: 'litro',
    active: true,
    createdAt: '2026-09-06T16:51:01.669Z',
    updatedAt: '2026-09-06T16:51:01.669Z',
    packageVolumeLiters: 20,
    package: {
      id: '28e9b723-7ae6-429d-856f-89f58eaebba6',
      name: 'Bombona 20L',
      type: 'BOMBONA_20L',
      capacity: '20L',
      capacityLiters: 20,
      active: true,
      createdAt: '2026-09-06T16:51:00.101Z',
      updatedAt: '2026-09-06T16:51:00.101Z',
    },
  },
];

test('preserves the real SS-260 price and volume from API through confirmation', () => {
  const offers = parseProductPricesResponse(ss260ApiResponse);
  assert.deepEqual(offers.map((offer) => offer.package.type), [
    'IBC_1000L',
    'BOMBONA_20L',
    'SACHÊ',
  ]);

  const sachet = offers.find((offer) => offer.package.type === 'SACHÊ');
  assert.ok(sachet);
  const quotation = createQuotation(ss260Product, sachet);
  const quantityStep = submitQuantity(quotation, '30');
  assert.equal(quantityStep.ok, true);
  if (!quantityStep.ok) return;

  assert.equal(quantityStep.value.package.volumeLiters, 15);
  assert.equal(quantityStep.value.package.pricePerLiter, 13);
  assert.equal(quantityStep.value.quantityLiters, 30);
  assert.equal(quantityStep.value.boxCount, null);
  assert.equal(quantityStep.value.total, 390);
  assert.equal(getPackageDisplayName(quantityStep.value.package), 'Sachê - 1L');
  assert.equal(formatCurrency(quantityStep.value.package.pricePerLiter).replace(/\s/g, ' '), 'R$ 13,00');
  assert.equal(formatCurrency(quantityStep.value.total).replace(/\s/g, ' '), 'R$ 390,00');

  const confirmation = addPaymentTerm(quantityStep.value, '1x — 28 dias', '28');
  assert.equal(confirmation.package.id, 'd6cbd2a9-5173-4049-a54e-ae6139f31abf');
  assert.equal(confirmation.package.volumeLiters, 15);
  assert.equal(confirmation.package.pricePerLiter, 13);
  assert.equal(confirmation.quantityLiters, 30);
  assert.equal(confirmation.boxCount, null);
  assert.equal(confirmation.total, 390);
});

test('accepts any integer quantity for sachet without enforcing box multiples', () => {
  const cases = [
    [15, '1'],
    [15, '13'],
    [15, '17'],
    [20, '21'],
    [14, '23'],
    [14, '1'],
  ];
  for (const [volume, quantity] of cases) {
    const result = validateQuantity(quantity, 'SACHÊ', volume);
    assert.equal(result.kind, 'valid', `Expected ${quantity} L to be valid for SACHÊ ${volume}L`);
    assert.equal(result.boxCount, null, 'Sachê should no longer enforce boxCount');
  }
});

test('keeps IBC and Bombona free from full-package multiple validation', () => {
  assert.equal(validateQuantity('21', 'IBC_1000L', 1000).kind, 'valid');
  assert.equal(validateQuantity('21', 'BOMBONA_20L', 20).kind, 'valid');
});

test('does not transform empty, decimal or out-of-range quantity text', () => {
  assert.equal(validateQuantity('', 'SACHÊ', 15).kind, 'empty');
  assert.equal(validateQuantity('30,0', 'SACHÊ', 15).kind, 'invalid');
  assert.equal(validateQuantity('30.0', 'SACHÊ', 15).kind, 'invalid');
  assert.equal(validateQuantity('1000000', 'SACHÊ', 15).kind, 'invalid');
});

test('rejects malformed API price and missing structured volume', () => {
  const buildSachetResponse = (price: unknown, volume: unknown): unknown => [{
    id: '0d1627de-1ce8-4dae-8b32-0ac7e56a7eb1',
    productId: ss260Product.id,
    packageId: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
    price,
    unit: 'litro',
    active: true,
    createdAt: '2026-09-06T16:51:01.566Z',
    updatedAt: '2026-09-06T16:51:01.566Z',
    packageVolumeLiters: volume,
    package: {
      id: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
      name: 'Sachê',
      type: 'SACHÊ',
      capacity: 'Pequena',
      capacityLiters: null,
      active: true,
      createdAt: '2026-09-06T16:50:59.976Z',
      updatedAt: '2026-09-06T16:50:59.976Z',
    },
  }];
  assert.throws(() => parseProductPricesResponse(buildSachetResponse('13', 15)), /preço/i);
  assert.throws(() => parseProductPricesResponse(buildSachetResponse(13, undefined)), /volume/i);
});