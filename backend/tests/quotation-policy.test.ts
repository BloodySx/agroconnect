import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getPackageVolumeLiters,
  validateOrderQuantity,
} from '../src/modules/orders/quotation-policy';
import { products } from '../prisma/data/products';
import { packages } from '../prisma/data/packages';
import { toPublicProductPrice } from '../src/modules/product-prices/product-price.service';

function findProduct(code: string) {
  const product = products.find((candidate) => candidate.code === code);
  assert.ok(product);
  return product;
}

function findPackage(type: string) {
  const package_ = packages.find((candidate) => candidate.type === type);
  assert.ok(package_);
  return package_;
}

test('configures only the confirmed existing product exceptions', () => {
  assert.equal(findProduct('ss-260').sachetBoxVolumeLiters, 15);
  assert.equal(findProduct('magnum').sachetBoxVolumeLiters, 20);
  assert.equal(findProduct('cabum').sachetBoxVolumeLiters, 14);
  assert.equal(findProduct('visconde').sachetBoxVolumeLiters, 15);
  assert.equal(products.some((product) => product.code === 'pmag'), false);
});

test('stores IBC and Bombona capacity in structured fields', () => {
  assert.equal(findPackage('IBC_1000L').capacityLiters, 1000);
  assert.equal(findPackage('BOMBONA_20L').capacityLiters, 20);
  assert.equal(findPackage('SACHÊ').capacityLiters, null);
});

test('exposes SS-260 volume beside its numeric API price', () => {
  const response = toPublicProductPrice({
    id: '0d1627de-1ce8-4dae-8b32-0ac7e56a7eb1',
    productId: 'd1764d6c-3fc0-47fd-b137-885fc531ac0f',
    packageId: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
    price: 13,
    unit: 'litro',
    active: true,
    createdAt: new Date('2026-09-06T16:51:01.566Z'),
    updatedAt: new Date('2026-09-06T16:51:01.566Z'),
    product: { sachetBoxVolumeLiters: 15 },
    package: {
      id: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
      name: 'Sachê',
      type: 'SACHÊ',
      capacity: 'Pequena',
      capacityLiters: null,
      active: true,
      createdAt: new Date('2026-09-06T16:50:59.976Z'),
      updatedAt: new Date('2026-09-06T16:50:59.976Z'),
    },
  });
  assert.equal(response.price, 13);
  assert.equal(response.packageVolumeLiters, 15);
  assert.equal('product' in response, false);
});

test('resolves structured package volume without reading presentation text', () => {
  assert.equal(getPackageVolumeLiters(
    { sachetBoxVolumeLiters: 15 },
    { type: 'SACHÊ', capacityLiters: null, capacity: 'Pequena' },
  ), 15);
  assert.equal(getPackageVolumeLiters(
    { sachetBoxVolumeLiters: 20 },
    { type: 'SACHÊ', capacityLiters: null, capacity: 'qualquer texto' },
  ), 20);
  assert.equal(getPackageVolumeLiters(
    { sachetBoxVolumeLiters: 14 },
    { type: 'SACHÊ', capacityLiters: null, capacity: '' },
  ), 14);
});

test('accepts any positive integer quantity for sachet without box-multiple restriction', () => {
  assert.doesNotThrow(() => validateOrderQuantity({
    quantity: 30,
    packageType: 'SACHÊ',
    sachetBoxVolumeLiters: 15,
  }));
  assert.doesNotThrow(() => validateOrderQuantity({
    quantity: 20,
    packageType: 'SACHÊ',
    sachetBoxVolumeLiters: 15,
  }));
  assert.doesNotThrow(() => validateOrderQuantity({
    quantity: 15,
    packageType: 'SACHÊ',
    sachetBoxVolumeLiters: 15,
  }));
});

test('accepts Magnum and Cabum/Pmag complete boxes', () => {
  assert.doesNotThrow(() => validateOrderQuantity({
    quantity: 40,
    packageType: 'SACHÊ',
    sachetBoxVolumeLiters: 20,
  }));
  assert.doesNotThrow(() => validateOrderQuantity({
    quantity: 28,
    packageType: 'SACHÊ',
    sachetBoxVolumeLiters: 14,
  }));
});

test('does not require multiples for IBC or Bombona', () => {
  assert.doesNotThrow(() => validateOrderQuantity({
    quantity: 21,
    packageType: 'IBC_1000L',
    sachetBoxVolumeLiters: 15,
  }));
  assert.doesNotThrow(() => validateOrderQuantity({
    quantity: 21,
    packageType: 'BOMBONA_20L',
    sachetBoxVolumeLiters: 15,
  }));
});

test('reports missing sachet configuration instead of accepting it', () => {
  assert.throws(() => validateOrderQuantity({
    quantity: 30,
    packageType: 'SACHÊ',
    sachetBoxVolumeLiters: null,
  }), /configuração/i);
});
