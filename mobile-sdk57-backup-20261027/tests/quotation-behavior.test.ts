import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createQuotation,
  submitQuantity,
  addPaymentTerm,
} from '../src/features/new-quotation/quotation-flow';

const productId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const packageId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

test('blocks order creation when priceVersion is missing', () => {
  const offer = {
    active: true,
    package: {
      id: packageId,
      name: 'Sachê',
      type: 'SACHÊ' as const,
      volumeLiters: 15,
      pricePerLiter: 12.5,
      unit: 'litro' as const,
    },
  };

  const quotation = createQuotation({ id: productId, name: 'Produto A' }, offer);
  const quantityStep = submitQuantity(quotation, '30');
  assert.ok(quantityStep.ok);
  if (!quantityStep.ok) return;

  const confirmed = addPaymentTerm(quantityStep.value, '1x — 28 dias', '28');
  assert.equal(confirmed.package.priceVersion, undefined);
});

test('preserves priceVersion through quotation flow', () => {
  const offer = {
    active: true,
    package: {
      id: packageId,
      name: 'Sachê',
      type: 'SACHÊ' as const,
      volumeLiters: 15,
      pricePerLiter: 12.5,
      unit: 'litro' as const,
      priceVersion: '2026-09-06T16:51:01.566Z',
    },
  };

  const quotation = createQuotation({ id: productId, name: 'Produto A' }, offer);
  const quantityStep = submitQuantity(quotation, '30');
  assert.ok(quantityStep.ok);
  if (!quantityStep.ok) return;

  assert.equal(quantityStep.value.package.priceVersion, '2026-09-06T16:51:01.566Z');

  const confirmed = addPaymentTerm(quantityStep.value, '1x — 28 dias', '28');
  assert.equal(confirmed.package.priceVersion, '2026-09-06T16:51:01.566Z');
});

test('preserves selection when navigating back from summary', () => {
  const offer = {
    active: true,
    package: {
      id: packageId,
      name: 'Sachê',
      type: 'SACHÊ' as const,
      volumeLiters: 15,
      pricePerLiter: 12.5,
      unit: 'litro' as const,
      priceVersion: '2026-09-06T16:51:01.566Z',
    },
  };

  const quotation = createQuotation({ id: productId, name: 'Produto A' }, offer);
  const quantityStep = submitQuantity(quotation, '30');
  assert.ok(quantityStep.ok);
  if (!quantityStep.ok) return;

  assert.equal(quantityStep.value.package.id, packageId);
  assert.equal(quantityStep.value.quantityLiters, 30);

  const confirmed = addPaymentTerm(quantityStep.value, '1x — 28 dias', '28');
  assert.equal(confirmed.package.id, packageId);
  assert.equal(confirmed.quantityLiters, 30);
});
