import { ValidationError } from '../../shared/errors';

export type PackageType = 'IBC_1000L' | 'BOMBONA_20L' | 'SACHÊ';

export interface ProductVolumeConfiguration {
  sachetBoxVolumeLiters: number | null;
}

export interface PackageVolumeConfiguration {
  type: string;
  capacityLiters: number | null;
  capacity: string;
}

export function getPackageVolumeLiters(
  product: ProductVolumeConfiguration,
  package_: PackageVolumeConfiguration,
): number | null {
  const configuredVolume = package_.type === 'SACHÊ'
    ? product.sachetBoxVolumeLiters
    : package_.capacityLiters;
  return typeof configuredVolume === 'number'
    && Number.isInteger(configuredVolume)
    && configuredVolume > 0
    ? configuredVolume
    : null;
}

export function validateOrderQuantity(input: {
  quantity: number;
  packageType: string;
  sachetBoxVolumeLiters: number | null;
}): void {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new ValidationError('Quantidade deve ser um número inteiro positivo');
  }
  if (input.quantity > 999999) {
    throw new ValidationError('Quantidade deve ser menor ou igual a 999999 L');
  }
  if (input.packageType !== 'SACHÊ') return;

  const boxVolume = input.sachetBoxVolumeLiters;
  if (boxVolume === null || !Number.isInteger(boxVolume) || boxVolume <= 0) {
    throw new ValidationError('Configuração do volume da caixa não encontrada para este produto');
  }
}
