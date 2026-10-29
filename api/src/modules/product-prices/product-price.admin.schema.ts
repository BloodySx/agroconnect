import { z } from 'zod';

export const uuidSchema = z.string().uuid('ID inválido');

export const adminPriceCreateSchema = z.object({
  productId: z.string().uuid('Produto inválido'),
  packageId: z.string().uuid('Embalagem inválida'),
  price: z.number({ invalid_type_error: 'Preço deve ser um número' }).positive('Preço deve ser maior que zero'),
  unit: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export const adminPriceUpdateSchema = z
  .object({
    productId: z.string().uuid('Produto inválido').optional(),
    packageId: z.string().uuid('Embalagem inválida').optional(),
    price: z
      .number({ invalid_type_error: 'Preço deve ser um número' })
      .positive('Preço deve ser maior que zero')
      .optional(),
    unit: z.string().min(1).optional(),
  })
  .refine((d) => d.productId !== undefined || d.packageId !== undefined || d.price !== undefined || d.unit !== undefined, {
    message: 'Informe ao menos um campo para atualização',
  });

export const adminPriceActiveSchema = z.object({
  active: z.boolean(),
});

export const adminPriceListSchema = z.object({
  search: z.string().min(1).optional(),
  productId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional(),
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
