import { products } from 'C:/SSConnect/backend/prisma/data/products.ts';

const baseUrl = 'http://localhost:3333';

async function login() {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ssconnect.com',
      password: '@ssconnect2026',
    }),
  });
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

async function fetchClientProductPrices(productId: string, token: string) {
  const response = await fetch(`${baseUrl}/client-product-prices?productId=${encodeURIComponent(productId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch client product prices for ${productId}: ${response.status}`);
  }
  return await response.json();
}

async function main() {
  try {
    const loginData = await login();
    console.log('Login data:', loginData);
    let token: string | null = null;
    if (loginData && typeof loginData === 'object') {
      if ('accessToken' in loginData && typeof loginData.accessToken === 'string') {
        token = loginData.accessToken;
      } else if ('token' in loginData && typeof loginData.token === 'string') {
        token = loginData.token;
      }
    }
    if (!token) {
      console.error('Could not find token in login data:', loginData);
      return;
    }

    console.log('Token acquired');

    // First, get all products to map code to id.
    const productsResponse = await fetch(`${baseUrl}/products`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`);
    }
    const productsList = await productsResponse.json();
    const productMap = new Map<string, string>();
    for (const p of productsList) {
      productMap.set(p.code, p.id);
    }

    console.log('Product map:', Array.from(productMap.entries()));

    for (const product of products) {
      const productCode = product.code;
      const productId = productMap.get(productCode);
      if (!productId) {
        console.warn(`No productId found for code ${productCode}`);
        continue;
      }

      try {
        const responseData = await fetchClientProductPrices(productId, token);
        console.log(`\n--- Product: ${productCode} (${productId}) ---`);
        console.log('Response:', JSON.stringify(responseData, null, 2));

        if (responseData && Array.isArray(responseData.data)) {
          for (let i = 0; i < responseData.data.length; i++) {
            const item = responseData.data[i];
            try {
              if (typeof item !== 'object' || item === null) {
                throw new Error('not an object');
              }
              if (typeof item.productId !== 'string') {
                throw new Error(`productId is not a string: ${typeof item.productId}`);
              }
              if (typeof item.packageId !== 'string') {
                throw new Error(`packageId is not a string: ${typeof item.packageId}`);
              }
              if (typeof item.price !== 'number') {
                throw new Error(`price is not a number: ${typeof item.price}`);
              }
              if (!Number.isFinite(item.price) || item.price <= 0) {
                throw new Error(`price is not finite or <=0: ${item.price}`);
              }
              if (typeof item.unit !== 'string') {
                throw new Error(`unit is not a string: ${typeof item.unit}`);
              }
              if (typeof item.active !== 'boolean') {
                throw new Error(`active is not a boolean: ${typeof item.active}`);
              }
              if (typeof item.priceSource !== 'string') {
                throw new Error(`priceSource is not a string: ${typeof item.priceSource}`);
              }
              if (!(item.priceSource === 'client' || item.priceSource === 'default')) {
                throw new Error(`priceSource must be 'client' or 'default', got: ${item.priceSource}`);
              }
              if (typeof item.priceId !== 'string') {
                throw new Error(`priceId is not a string: ${typeof item.priceId}`);
              }
              if (typeof item.packageName !== 'string') {
                throw new Error(`packageName is not a string: ${typeof item.packageName}`);
              }
              if (item.packageName.trim() === '') {
                throw new Error(`packageName is empty after trim`);
              }
              if (!['IBC_1000L', 'BOMBONA_20L', 'SACHÊ'].includes(item.packageType)) {
                throw new Error(`invalid packageType: ${item.packageType}`);
              }
              if (typeof item.packageVolumeLiters !== 'number') {
                throw new Error(`packageVolumeLiters is not a number: ${typeof item.packageVolumeLiters}`);
              }
              if (!Number.isFinite(item.packageVolumeLiters) || item.packageVolumeLiters <= 0) {
                throw new Error(`packageVolumeLiters is not finite or <=0: ${item.packageVolumeLiters}`);
              }
            } catch (e) {
              console.error(`  -> Invalid item at index ${i}:`, (e as Error).message);
              console.log('     Item:', JSON.stringify(item, null, 2));
            }
          }
        } else {
          console.log('Response data is not an array or missing');
        }
      } catch (error) {
        console.error(`\n--- Error for product ${productCode} (${productId}) ---`);
        console.error(error);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main().catch(console.error);
