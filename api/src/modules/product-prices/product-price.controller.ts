import { FastifyRequest, FastifyReply } from 'fastify';
import { productPriceService } from './product-price.service';

export async function getProductPrices(request: FastifyRequest, reply: FastifyReply) {
  const prices = await productPriceService.findAll();
  return reply.send(prices);
}

export async function getProductPriceById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const price = await productPriceService.findById(request.params.id);
  return reply.send(price);
}

export async function getProductPricesByProductId(request: FastifyRequest<{ Params: { productId: string } }>, reply: FastifyReply) {
  const prices = await productPriceService.findByProductId(request.params.productId);
  return reply.send(prices);
}
