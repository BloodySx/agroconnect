import { z } from 'zod';

export const priceVersionSchema = z.object({
  source: z.enum(['client', 'default']),
  priceId: z.string().uuid(),
  updatedAt: z.string().datetime(),
});

export const orderItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  packageId: z.string().uuid('ID da embalagem inválido'),
  quantity: z
    .number()
    .int()
    .positive('Quantidade deve ser um número inteiro positivo')
    .max(999999, 'Quantidade deve ser menor ou igual a 999999 L'),
  priceVersion: priceVersionSchema,
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  paymentTerm: z.string().min(1, 'Condição de pagamento é obrigatória'),
  deliveryTerm: z.string().min(1, 'Prazo de entrega é obrigatório'),
});

export type CreateOrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const cancelOrderSchema = z.object({});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
