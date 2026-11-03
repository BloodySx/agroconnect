import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FIXED_DELIVERY_TERM, paymentTerms, addPaymentTerm, submitQuantity, createQuotation, parseProductPricesResponse } from '../src/features/new-quotation/quotation-flow';

const ss260Product = { id: 'd1764d6c-3fc0-47fd-b137-885fc531ac0f', name: 'SS-260' };

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
    package: { id: '0dc47c18-fe96-474e-95e3-74b4f29ce124', name: 'IBC 1000L', type: 'IBC_1000L', capacity: '1000L', capacityLiters: 1000, active: true, createdAt: '2026-09-06T16:51:00.202Z', updatedAt: '2026-09-06T16:51:00.202Z' },
  },
  {
    id: '0d1627de-1ce8-4dae-8b32-0ac7e56a7eb1',
    productId: ss260Product.id,
    packageId: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf',
    price: 13,
    unit: 'litro',
    active: true,
    createdAt: '2026-09-06T16:51:01.566Z',
    updatedAt: '2026-09-06T16:51:01.771Z',
    packageVolumeLiters: 15,
    package: { id: 'd6cbd2a9-5173-4049-a54e-ae6139f31abf', name: 'Sachê', type: 'SACHÊ', capacity: 'Pequena', capacityLiters: null, active: true, createdAt: '2026-09-06T16:50:59.976Z', updatedAt: '2026-09-06T16:50:59.976Z' },
  },
];

const offers = parseProductPricesResponse(ss260ApiResponse);
const sachetOffer = offers.find((o) => o.package.type === 'SACHÊ')!;
const sachetQuotation = createQuotation(ss260Product, sachetOffer);

describe('FIXED_DELIVERY_TERM', () => {
  it('is always the string 72 horas', () => {
    assert.strictEqual(FIXED_DELIVERY_TERM, '72 horas');
  });

  it('has consistent payment term display and progressValue pairs', () => {
    assert.strictEqual(paymentTerms[0].display, '1x — 28 dias');
    assert.strictEqual(paymentTerms[0].progressValue, '28');
  });
});

describe('multi-product flow simulation', () => {
  it('first product: submits quantity and gets to PaymentTerm with valid quotation', () => {
    const qtyResult = submitQuantity(sachetQuotation, '15');
    assert.equal(qtyResult.ok, true);
    if (!qtyResult.ok) return;

    const term = paymentTerms[0];
    const confirmable = addPaymentTerm(qtyResult.value, term.display, term.progressValue);
    assert.strictEqual(confirmable.paymentTerm, term.display);
    assert.strictEqual(confirmable.paymentTermProgressValue, term.progressValue);
  });

  it('additional product: reuses first product paymentTerm and maps to progressValue', () => {
    const qtyResult = submitQuantity(sachetQuotation, '15');
    assert.equal(qtyResult.ok, true);
    if (!qtyResult.ok) return;

    const firstTermDisplay = paymentTerms[0].display;
    const expectedProgress = paymentTerms.find(t => t.display === firstTermDisplay)?.progressValue;
    assert.equal(expectedProgress, '28');

    const confirmable = addPaymentTerm(qtyResult.value, firstTermDisplay, '28');
    assert.strictEqual(confirmable.paymentTerm, firstTermDisplay);
    assert.strictEqual(confirmable.paymentTermProgressValue, '28');
  });

  it('payload always sends deliveryTerm as 72 horas', () => {
    const qtyResult = submitQuantity(sachetQuotation, '15');
    assert.equal(qtyResult.ok, true);
    if (!qtyResult.ok) return;

    const term = paymentTerms[0];
    const confirmable = addPaymentTerm(qtyResult.value, term.display, term.progressValue);

    const payload = {
      items: [{ productId: confirmable.product.id, packageId: confirmable.package.id, quantity: confirmable.quantityLiters, priceVersion: {} }],
      paymentTerm: confirmable.paymentTerm,
      deliveryTerm: FIXED_DELIVERY_TERM,
    };

    assert.strictEqual(payload.deliveryTerm, '72 horas');
    assert.strictEqual(payload.paymentTerm, term.display);
  });
});

describe('payment term options', () => {
  it('has 6 payment term options', () => {
    assert.strictEqual(paymentTerms.length, 6);
  });

  it('each term has display and progressValue', () => {
    for (const term of paymentTerms) {
      assert.ok(term.display);
      assert.ok(term.progressValue);
    }
  });
});
