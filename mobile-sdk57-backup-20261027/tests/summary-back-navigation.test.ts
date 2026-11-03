import { describe, it } from 'node:test';
import { validateQuantity } from '../src/features/new-quotation/quotation-flow';

describe('GO_BACK navigation regression', () => {
  it('does not require a back stack for sachet quantity validation', () => {
    const result = validateQuantity('13', 'SACHÊ', 14);
    if (result.kind !== 'valid') {
      throw new Error('Expected sachet quantity 13 to be valid without box-multiple restriction');
    }
    if (result.boxCount !== null) {
      throw new Error('Sachê should not compute boxCount anymore');
    }
  });
});