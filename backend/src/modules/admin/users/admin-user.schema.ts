import { z } from 'zod';

export const uuidSchema = z.string().uuid('ID inválido');

export const adminUserListSchema = z.object({
  search: z.string().min(1).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
});

export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100),
  email: z.string().trim().email('E-mail inválido').toLowerCase().optional(),
  username: z
    .string({ required_error: 'Usuário é obrigatório' })
    .trim()
    .min(1, 'Usuário é obrigatório')
    .min(3, 'Usuário deve ter no mínimo 3 caracteres')
    .max(50)
    .toLowerCase(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role inválida. Use USER ou ADMIN.' }),
  }),
  active: z.boolean().default(true),
});

export const adminUserActiveSchema = z.object({
  active: z.boolean(),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role inválida. Use USER ou ADMIN.' }),
  }),
});
