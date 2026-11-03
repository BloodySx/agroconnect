import { describe, it } from 'node:test';
import { parseClientProductPricesResponse } from '../src/services/api/parseClientProductPrices';

describe('parseClientProductPricesResponse regression', () => {
  it('keeps valid offers when one offer is malformed', () => {
    const input = [
      {
        productId: '1',
        packageId: 'a',
        price: 10,
        unit: 'litro',
        active: true,
        priceSource: 'default',
        priceId: '1',
        packageName: 'IBC 1000L',
        packageType: 'IBC_1000L',
        packageVolumeLiters: 1000,
      },
      {
        productId: '1',
        packageId: 'b',
        price: 'invalid',
        unit: 'litro',
        active: true,
        priceSource: 'default',
        priceId: '2',
        packageName: 'Frasco 1L',
        packageType: 'FRASCO_1L',
        packageVolumeLiters: 1,
      },
      {
        productId: '1',
        packageId: 'c',
        price: 9,
        unit: 'litro',
        active: true,
        priceSource: 'default',
        priceId: '3',
        packageName: 'Sachê',
        packageType: 'SACHÊ',
        packageVolumeLiters: 14,
      },
    ];

    const result = parseClientProductPricesResponse(input);
    if (result.length !== 2) {
      throw new Error(`Expected 2 valid offers, got ${result.length}`);
    }
    const types = result.map((item) => item.packageType).join(', ');
    if (!types.includes('IBC_1000L') || !types.includes('SACHÊ')) {
      throw new Error(`Expected IBC_1000L and SACHÊ, got ${types}`);
    }
  });

  it('accepts normalized package types', () => {
    const input = [
      {
        productId: '1',
        packageId: 'a',
        price: 12,
        unit: 'litro',
        active: true,
        priceSource: 'default',
        priceId: '1',
        packageName: 'Frasco 1L',
        packageType: 'FRASCO_1L',
        packageVolumeLiters: 1,
      },
    ];

    const result = parseClientProductPricesResponse(input);
    if (result.length !== 1) {
      throw new Error(`Expected 1 offer, got ${result.length}`);
    }
    if (result[0].packageType !== 'FRASCO_1L') {
      throw new Error(`Expected FRASCO_1L, got ${result[0].packageType}`);
    }
  });
});