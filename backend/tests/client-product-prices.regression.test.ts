import { describe, it } from 'node:test';
import { clientProductPriceService } from '../src/modules/product-prices/client-product-price.service';

describe('ClientProductPriceService regression', () => {
  it('ignores packages without price', async () => {
    const resolved = await clientProductPriceService.listResolvedPricesForUser('user-without-prices', 'product-without-prices');
    if (resolved.length !== 0) {
      throw new Error(`Expected empty resolved list, got ${resolved.length}`);
    }
  });
});