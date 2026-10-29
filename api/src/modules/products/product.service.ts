import { CreateProductInput, UpdateProductInput, AdminProductFilters, productRepository } from './product.repository';
import { NotFoundError, ConflictError } from '../../shared/errors';

export class ProductService {
  async findAll() {
    return productRepository.findAll();
  }

  async findById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async findByCode(code: string) {
    const product = await productRepository.findByCode(code);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async create(data: CreateProductInput) {
    const existing = await productRepository.findByCode(data.code);
    if (existing) {
      throw new Error('Product with this code already exists');
    }
    return productRepository.create(data);
  }

  async update(id: string, data: UpdateProductInput) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }
    return productRepository.update(id, data);
  }

  async delete(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }
    return productRepository.delete(id);
  }

  async listAdmin(filters: AdminProductFilters) {
    return productRepository.findManyAdmin(filters);
  }

  async createAdmin(data: { name: string; code: string; sachetBoxVolumeLiters?: number; active?: boolean }) {
    const existing = await productRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError('Já existe um produto com este código');
    }

    return productRepository.create({
      name: data.name,
      code: data.code,
      ...(data.sachetBoxVolumeLiters !== undefined ? { sachetBoxVolumeLiters: data.sachetBoxVolumeLiters } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    });
  }

  async updateAdmin(id: string, data: { name?: string; code?: string; sachetBoxVolumeLiters?: number }) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Produto não encontrado');
    }

    if (data.code && data.code !== existing.code) {
      const conflict = await productRepository.findByCode(data.code);
      if (conflict) {
        throw new ConflictError('Já existe um produto com este código');
      }
    }

    return productRepository.update(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.sachetBoxVolumeLiters !== undefined ? { sachetBoxVolumeLiters: data.sachetBoxVolumeLiters } : {}),
    });
  }

  async setActiveAdmin(id: string, active: boolean) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Produto não encontrado');
    }
    return productRepository.setActiveAdmin(id, active);
  }
}

export const productService = new ProductService();
