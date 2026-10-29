import { z } from 'zod';

const toEndOfDay = (value: string): Date => {
  if (value.length <= 10) {
    return new Date(`${value}T23:59:59.999Z`);
  }
  return new Date(value);
};

export const adminOrderQuerySchema = z
  .object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
    startDate: z.string().min(1).optional(),
    endDate: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .transform((value) => ({
    status: value.status,
    startDate: value.startDate ? new Date(value.startDate) : undefined,
    endDate: value.endDate ? toEndOfDay(value.endDate) : undefined,
    page: value.page,
    limit: value.limit,
  }));

export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;

export const adminOrderIdSchema = z.string().uuid('ID do pedido inválido');

export const adminStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status inválido para transição' }),
  }),
});

export type AdminStatusInput = z.infer<typeof adminStatusSchema>;
