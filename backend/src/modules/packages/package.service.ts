import { CreatePackageInput, UpdatePackageInput, AdminPackageFilters, packageRepository } from './package.repository';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { normalizePackageType, normalizePackageCapacity } from '../../shared/package-type';

export class PackageService {
  async findAll() {
    return packageRepository.findAll();
  }

  async findById(id: string) {
    const pkg = await packageRepository.findById(id);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    return pkg;
  }

  async findByType(type: string) {
    const pkg = await packageRepository.findByType(type);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    return pkg;
  }

  async create(data: CreatePackageInput) {
    return packageRepository.create(data);
  }

  async update(id: string, data: UpdatePackageInput) {
    const existing = await packageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Package not found');
    }
    return packageRepository.update(id, data);
  }

  async delete(id: string) {
    const existing = await packageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Package not found');
    }
    return packageRepository.delete(id);
  }

  async listAdmin(filters: AdminPackageFilters) {
    return packageRepository.findManyAdmin(filters);
  }

  async createAdmin(data: { name: string; type: string; capacity: string; capacityLiters?: number | null; active?: boolean }) {
    const existing = await packageRepository.findByType(normalizePackageType(data.type));
    if (existing) {
      throw new ConflictError('Já existe uma embalagem com este tipo');
    }

    return packageRepository.create({
      name: data.name.trim(),
      type: normalizePackageType(data.type),
      capacity: normalizePackageCapacity(data.capacity),
      ...(data.capacityLiters !== undefined ? { capacityLiters: data.capacityLiters } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    });
  }

  async updateAdmin(id: string, data: { name?: string; type?: string; capacity?: string; capacityLiters?: number | null }) {
    const existing = await packageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Embalagem não encontrada');
    }

    if (data.type && normalizePackageType(data.type) !== existing.type) {
      const conflict = await packageRepository.findByType(normalizePackageType(data.type));
      if (conflict) {
        throw new ConflictError('Já existe uma embalagem com este tipo');
      }
    }

    return packageRepository.update(id, {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.type !== undefined ? { type: normalizePackageType(data.type) } : {}),
      ...(data.capacity !== undefined ? { capacity: normalizePackageCapacity(data.capacity) } : {}),
      ...(data.capacityLiters !== undefined ? { capacityLiters: data.capacityLiters } : {}),
    });
  }

  async setActiveAdmin(id: string, active: boolean) {
    const existing = await packageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Embalagem não encontrada');
    }
    return packageRepository.setActiveAdmin(id, active);
  }
}

export const packageService = new PackageService();
