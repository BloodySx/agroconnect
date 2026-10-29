import {
  CreateProductPriceInput,
  UpdateProductPriceInput,
  AdminProductPriceFilters,
  ProductPriceDetails,
  productPriceRepository,
} from './product-price.repository';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { getPackageVolumeLiters } from '../orders/quotation-policy';

export function toPublicProductPrice(value: ProductPriceDetails) {
  const { product, ...price } = value;
  return {
    ...price,
    packageVolumeLiters: getPackageVolumeLiters(product, value.package),
  };
}

export class ProductPriceService {
  async findAll() {
    const prices = await productPriceRepository.findAll();
    return prices.map(toPublicProductPrice);
  }

  async findById(id: string) {
    const price = await productPriceRepository.findById(id);
    if (!price) {
      throw new NotFoundError('Product price not found');
    }
    return toPublicProductPrice(price);
  }

  async findByProductAndPackage(productId: string, packageId: string): Promise<ProductPriceDetails> {
    const price = await productPriceRepository.findByProductAndPackage(productId, packageId);
    if (!price) {
      throw new NotFoundError('Product price not found');
    }
    return price;
  }

  async findByProductId(productId: string) {
    const prices = await productPriceRepository.findByProductId(productId);
    return prices.map(toPublicProductPrice);
  }

  async create(data: CreateProductPriceInput) {
    const existing = await productPriceRepository.findByProductAndPackage(data.productId, data.packageId);
    if (existing) {
      throw new Error('Product price for this product and package already exists');
    }
    return productPriceRepository.create(data);
  }

  async update(id: string, data: UpdateProductPriceInput) {
    const existing = await productPriceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product price not found');
    }
    return productPriceRepository.update(id, data);
  }

  async delete(id: string) {
    const existing = await productPriceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product price not found');
    }
    return productPriceRepository.delete(id);
  }

  async listAdmin(filters: AdminProductPriceFilters) {
    return productPriceRepository.findManyAdmin(filters);
  }

  async createAdmin(data: {
    productId: string;
    packageId: string;
    price: number;
    unit?: string;
    active?: boolean;
  }) {
    if (!(await productPriceRepository.productExists(data.productId))) {
      throw new NotFoundError('Produto não encontrado');
    }
    if (!(await productPriceRepository.packageExists(data.packageId))) {
      throw new NotFoundError('Embalagem não encontrada');
    }

    const conflict = await productPriceRepository.findByProductAndPackage(data.productId, data.packageId);
    if (conflict) {
      throw new ConflictError('Já existe um preço para esta combinação de produto e embalagem');
    }

    return productPriceRepository.create({
      productId: data.productId,
      packageId: data.packageId,
      price: data.price,
      unit: data.unit ?? 'un',
      ...(data.active !== undefined ? { active: data.active } : {}),
    });
  }

  async updateAdmin(
    id: string,
    data: { productId?: string; packageId?: string; price?: number; unit?: string }
  ) {
    const existing = await productPriceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Preço não encontrado');
    }

    const productId = data.productId ?? existing.productId;
    const packageId = data.packageId ?? existing.packageId;

    if (data.productId && !(await productPriceRepository.productExists(data.productId))) {
      throw new NotFoundError('Produto não encontrado');
    }
    if (data.packageId && !(await productPriceRepository.packageExists(data.packageId))) {
      throw new NotFoundError('Embalagem não encontrada');
    }

    if (data.productId || data.packageId) {
      const conflict = await productPriceRepository.findByProductAndPackage(productId, packageId);
      if (conflict && conflict.id !== id) {
        throw new ConflictError('Já existe um preço para esta combinação de produto e embalagem');
      }
    }

    return productPriceRepository.update(id, {
      ...(data.productId !== undefined ? { productId: data.productId } : {}),
      ...(data.packageId !== undefined ? { packageId: data.packageId } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.unit !== undefined ? { unit: data.unit } : {}),
    });
  }

  async setActiveAdmin(id: string, active: boolean) {
    const existing = await productPriceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Preço não encontrado');
    }
    return productPriceRepository.setActiveAdmin(id, active);
  }
}

export const productPriceService = new ProductPriceService();
