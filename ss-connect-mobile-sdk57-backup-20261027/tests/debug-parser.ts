function isNormalizedPackageType(type: string): boolean {
  if (type.trim() === '') return false;
  if (/\s/.test(type)) return false;
  if (!/^[A-Z0-9_]+$/.test(type)) return false;
  return true;
}

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

for (const item of input) {
  const raw = item;
  const issues: string[] = [];
  if (typeof raw.productId !== 'string') issues.push('productId');
  if (typeof raw.packageId !== 'string') issues.push('packageId');
  if (typeof raw.price !== 'number') issues.push('price type');
  if (!Number.isFinite(raw.price)) issues.push('price finite');
  if (raw.price <= 0) issues.push('price > 0');
  if (typeof raw.unit !== 'string') issues.push('unit');
  if (typeof raw.active !== 'boolean') issues.push('active');
  if (typeof raw.priceSource !== 'string') issues.push('priceSource');
  if (!(raw.priceSource === 'client' || raw.priceSource === 'default')) issues.push('priceSource value');
  if (typeof raw.priceId !== 'string') issues.push('priceId');
  if (typeof raw.packageName !== 'string') issues.push('packageName');
  if (raw.packageName.trim() === '') issues.push('packageName empty');
  if (typeof raw.packageType !== 'string') issues.push('packageType');
  if (!isNormalizedPackageType(raw.packageType)) issues.push('packageType normalized');
  if (typeof raw.packageVolumeLiters !== 'number') issues.push('packageVolumeLiters type');
  if (!Number.isFinite(raw.packageVolumeLiters)) issues.push('packageVolumeLiters finite');
  if (raw.packageVolumeLiters <= 0) issues.push('packageVolumeLiters > 0');
  console.log(item.packageType, issues.length === 0 ? 'OK' : issues.join(', '));
}
