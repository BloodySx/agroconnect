export const FIXED_DELIVERY_TERM = '72 horas';

export interface PaymentTermOption {
  key: string;
  label: string;
  detail: string;
  display: string;
  progressValue: string;
}

export const paymentTerms: PaymentTermOption[] = [
  { key: '1x-28', label: '1x', detail: '28 dias', display: '1x — 28 dias', progressValue: '28' },
  { key: '2x-28/58', label: '2x', detail: '28/58 dias', display: '2x — 28/58 dias', progressValue: '28/58' },
  { key: '3x-28/56/84', label: '3x', detail: '28/56/84 dias', display: '3x — 28/56/84 dias', progressValue: '28/56/84' },
  { key: '1x-60', label: '1x', detail: '60 dias', display: '1x — 60 dias', progressValue: '60' },
  { key: '3x-0/30/60', label: '3x', detail: '0/30/60 dias', display: '3x — 0/30/60 dias', progressValue: '0/30/60' },
  { key: 'avista', label: 'À vista', detail: '', display: 'À vista', progressValue: 'À vista' },
];

export type PackageType = 'IBC_1000L' | 'BOMBONA_20L' | 'SACHÊ';

export interface ProductSelection {
  id: string;
  name: string;
}

export interface PackageSelection {
  id: string;
  name: string;
  type: PackageType;
  volumeLiters: number;
  pricePerLiter: number;
  unit: 'litro';
  priceVersion?: string;
  priceSource?: 'client' | 'default';
  priceId?: string;
}

export interface Quotation {
  product: ProductSelection;
  package: PackageSelection;
}

export interface QuantityQuotation extends Quotation {
  quantityLiters: number;
  boxCount: number | null;
  total: number;
}

export interface ConfirmableQuotation extends QuantityQuotation {
  paymentTerm: string;
  paymentTermProgressValue: string;
}

export interface OrderDraftItem {
  id: string;
  productId: string;
  productName: string;
  packageId: string;
  packageName: string;
  packageType: PackageType;
  volumeLiters: number;
  quantityLiters: number;
  boxCount: number | null;
  unitPrice: number;
  total: number;
  priceVersion: {
    source: 'client' | 'default';
    priceId: string;
    updatedAt: string;
  };
}

export function createOrderDraftItem(
  quotation: ConfirmableQuotation,
  priceVersion: {
    source: 'client' | 'default';
    priceId: string;
    updatedAt: string;
  }
): OrderDraftItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    productId: quotation.product.id,
    productName: quotation.product.name,
    packageId: quotation.package.id,
    packageName: quotation.package.name,
    packageType: quotation.package.type,
    volumeLiters: quotation.package.volumeLiters,
    quantityLiters: quotation.quantityLiters,
    boxCount: quotation.boxCount,
     unitPrice: quotation.package.pricePerLiter,
     total: quotation.total,
    priceVersion,
  };
}

export interface ProductPackageOffer {
  active: boolean;
  package: PackageSelection;
}

export type QuantityValidation =
  | { kind: 'empty' }
  | { kind: 'invalid'; message: string }
  | { kind: 'valid'; quantityLiters: number; boxCount: number | null };

export type QuantitySubmission =
  | { ok: false; message: string }
  | { ok: true; value: QuantityQuotation };

const MAX_QUANTITY_LITERS = 999999;

const packageOrder: Record<PackageType, number> = {
  IBC_1000L: 0,
  BOMBONA_20L: 1,
  SACHÊ: 2,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Resposta inválida da API: campo ${field} ausente.`);
  }
  return value;
}

function readPackageType(value: unknown): PackageType {
  if (value === 'IBC_1000L' || value === 'BOMBONA_20L' || value === 'SACHÊ') {
    return value;
  }
  throw new Error('Resposta inválida da API: tipo de embalagem desconhecido.');
}

function parseOffer(value: unknown): ProductPackageOffer {
  if (!isRecord(value) || !isRecord(value.package)) {
    throw new Error('Resposta inválida da API: embalagem ausente.');
  }

  const price = value.price;
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    throw new Error('Resposta inválida da API: preço por litro deve ser numérico e positivo.');
  }

  const volume = value.packageVolumeLiters;
  if (typeof volume !== 'number' || !Number.isInteger(volume) || volume <= 0) {
    throw new Error('Resposta inválida da API: volume estruturado da embalagem ausente.');
  }

  if (typeof value.active !== 'boolean') {
    throw new Error('Resposta inválida da API: situação do preço ausente.');
  }

  const unit = readString(value, 'unit');
  if (unit !== 'litro') {
    throw new Error('Resposta inválida da API: unidade de preço não suportada.');
  }

  const packageRecord = value.package;
  return {
    active: value.active,
    package: {
      id: readString(packageRecord, 'id'),
      name: readString(packageRecord, 'name').trim(),
      type: readPackageType(packageRecord.type),
      volumeLiters: volume,
      pricePerLiter: price,
      unit,
    },
  };
}

export function parseProductPricesResponse(value: unknown): ProductPackageOffer[] {
  if (!Array.isArray(value)) {
    throw new Error('Resposta inválida da API: lista de embalagens ausente.');
  }
  return value
    .map(parseOffer)
    .filter((offer) => offer.active)
    .sort((left, right) => packageOrder[left.package.type] - packageOrder[right.package.type]);
}

export function createQuotation(
  product: ProductSelection,
  offer: ProductPackageOffer,
): Quotation {
  return {
    product: { ...product },
    package: { ...offer.package },
  };
}

export function validateQuantity(
  text: string,
  packageType: PackageType,
  volumeLiters: number,
): QuantityValidation {
  if (text === '') return { kind: 'empty' };
  if (!/^\d+$/.test(text)) {
    return { kind: 'invalid', message: 'Informe uma quantidade inteira em litros.' };
  }

  const quantityLiters = Number(text);
  if (!Number.isSafeInteger(quantityLiters) || quantityLiters <= 0) {
    return { kind: 'invalid', message: 'A quantidade deve ser um inteiro positivo.' };
  }
  if (quantityLiters > MAX_QUANTITY_LITERS) {
    return { kind: 'invalid', message: 'A quantidade máxima é 999999 L.' };
  }

  return { kind: 'valid', quantityLiters, boxCount: null };
}

export function submitQuantity(
  quotation: Quotation,
  text: string,
): QuantitySubmission {
  const validation = validateQuantity(
    text,
    quotation.package.type,
    quotation.package.volumeLiters,
  );
  if (validation.kind === 'empty') {
    return { ok: false, message: 'Informe a quantidade em litros.' };
  }
  if (validation.kind === 'invalid') {
    return { ok: false, message: validation.message };
  }
  return {
    ok: true,
    value: {
      ...quotation,
      quantityLiters: validation.quantityLiters,
      boxCount: validation.boxCount,
      total: Number(
        (validation.quantityLiters * quotation.package.pricePerLiter).toFixed(2),
      ),
    },
  };
}

export function addPaymentTerm(
  quotation: QuantityQuotation,
  paymentTerm: string,
  paymentTermProgressValue: string,
): ConfirmableQuotation {
  return {
    ...quotation,
    paymentTerm,
    paymentTermProgressValue,
  };
}

export function getPackageDisplayName(package_: PackageSelection): string {
  return package_.type === 'SACHÊ'
    ? `Sachê - 1L`
    : package_.name;
}

export function getPackageProgressLabel(package_: PackageSelection): string {
  return package_.type === 'SACHÊ'
    ? `Sachê ${package_.volumeLiters} L`
    : package_.name;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
