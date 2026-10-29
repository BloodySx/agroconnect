import { FastifyRequest, FastifyReply } from 'fastify';
import { productService } from './product.service';

export async function getProducts(request: FastifyRequest, reply: FastifyReply) {
  const products = await productService.findAll();
  return reply.send(products);
}

export async function getProductById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const product = await productService.findById(request.params.id);
  return reply.send(product);
}
