import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertPriceVersionMatches } from '../src/modules/orders/price-version';

const quoted = {
  source: 'client',
  priceId: '11111111-1111-4111-8111-111111111111',
  updatedAt: '2026-10-16T12:30:00.000Z',
};

const current = {
  priceSource: 'client',
  priceId: quoted.priceId,
  updatedAt: quoted.updatedAt,
};

function isConflict(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
}

test('permite cotação com a mesma origem, ID e instante do preço', () => {
  assert.doesNotThrow(() => assertPriceVersionMatches(quoted, current));
  // Mesmo instante expresso com fuso diferente deve ser aceito.
  assert.doesNotThrow(() => assertPriceVersionMatches({
    ...quoted, updatedAt: '2026-10-16T09:30:00.000-03:00',
  }, current));
});

test('rejeita alteração no registro de preço mesmo mantendo o mesmo ID', () => {
  assert.throws(() => assertPriceVersionMatches(quoted, {
    ...current, updatedAt: '2026-10-16T12:31:00.000Z',
  }), isConflict);
});

test('rejeita preço de outro cliente ou troca entre preço específico e geral', () => {
  assert.throws(() => assertPriceVersionMatches(quoted, {
    ...current, priceId: '22222222-2222-4222-8222-222222222222',
  }), isConflict);
  assert.throws(() => assertPriceVersionMatches(quoted, {
    ...current, priceSource: 'default',
  }), isConflict);
});

test('não aceita versão ausente ou inválida', () => {
  assert.throws(() => assertPriceVersionMatches({
    ...quoted, updatedAt: '',
  }, current), isConflict);
  assert.throws(() => assertPriceVersionMatches(quoted, {
    ...current, updatedAt: 'invalid',
  }), isConflict);
});
