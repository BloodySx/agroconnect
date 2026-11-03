export function parseClientProductPricesResponse(value: unknown): {
  productId: string;
  packageId: string;
  packageName: string;
  packageType: string;
  packageVolumeLiters: number;
  price: number;
  unit: string;
  active: boolean;
  priceSource: 'client' | 'default';
  priceId: string;
  updatedAt?: string;
}[] {
  if (!Array.isArray(value)) {
    throw new Error('Resposta inválida do servidor: lista de preços do cliente ausente.');
  }

  function isNormalizedPackageType(type: string): boolean {
    const trimmed = type.trim();
    if (trimmed === '') return false;
    if (/\s/.test(trimmed)) return false;
    if (!/^[A-Z0-9_À-ÿ]+$/i.test(trimmed)) return false;
    return true;
  }

  return value
    .map((item) => {
      const raw = item as Record<string, unknown>;
      if (typeof raw.productId !== 'string'
        || typeof raw.packageId !== 'string'
        || typeof raw.price !== 'number'
        || !Number.isFinite(raw.price) || raw.price <= 0
        || typeof raw.unit !== 'string'
        || typeof raw.active !== 'boolean'
        || typeof raw.priceSource !== 'string'
        || !(raw.priceSource === 'client' || raw.priceSource === 'default')
        || typeof raw.priceId !== 'string'
        || typeof raw.packageName !== 'string'
        || raw.packageName.trim() === ''
        || typeof raw.packageType !== 'string'
        || !isNormalizedPackageType(raw.packageType)
        || typeof raw.packageVolumeLiters !== 'number'
        || !Number.isFinite(raw.packageVolumeLiters)
        || raw.packageVolumeLiters <= 0) {
        return null;
      }

      return {
        productId: raw.productId,
        packageId: raw.packageId,
        packageName: raw.packageName.trim(),
        packageType: raw.packageType,
        packageVolumeLiters: raw.packageVolumeLiters,
        price: raw.price,
        unit: raw.unit,
        active: raw.active,
        priceSource: raw.priceSource as 'client' | 'default',
        priceId: raw.priceId,
        updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}