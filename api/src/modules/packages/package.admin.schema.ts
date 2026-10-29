import { z } from 'zod';

export const adminPackageCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  capacity: z.string().min(1, 'Capacidade é obrigatória'),
  capacityLiters: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
});

export const adminPackageUpdateSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    type: z.string().min(1, 'Tipo é obrigatório').optional(),
    capacity: z.string().min(1, 'Capacidade é obrigatória').optional(),
    capacityLiters: z.number().int().positive().nullable().optional(),
  })
  .refine((d) => d.name !== undefined || d.type !== undefined || d.capacity !== undefined || d.capacityLiters !== undefined, {
    message: 'Informe ao menos um campo para atualização',
  });

export const adminPackageActiveSchema = z.object({
  active: z.boolean(),
});

export const adminPackageListSchema = z.object({
  search: z.string().min(1).optional(),
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
});

export const uuidSchema = z.string().uuid('ID inválido');
