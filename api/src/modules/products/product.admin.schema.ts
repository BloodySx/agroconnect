import { z } from 'zod';

export const adminProductCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  sachetBoxVolumeLiters: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export const adminProductUpdateSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    code: z.string().min(1, 'Código é obrigatório').optional(),
    sachetBoxVolumeLiters: z.number().int().positive().optional(),
  })
  .refine((d) => d.name !== undefined || d.code !== undefined || d.sachetBoxVolumeLiters !== undefined, {
    message: 'Informe ao menos um campo para atualização',
  });

export const adminProductActiveSchema = z.object({
  active: z.boolean(),
});

export const adminProductListSchema = z.object({
  search: z.string().min(1).optional(),
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
});

export const uuidSchema = z.string().uuid('ID inválido');
