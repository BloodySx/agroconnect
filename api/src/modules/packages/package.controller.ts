import { FastifyRequest, FastifyReply } from 'fastify';
import { packageService } from './package.service';

export async function getPackages(request: FastifyRequest, reply: FastifyReply) {
  const packages = await packageService.findAll();
  return reply.send(packages);
}

export async function getPackageById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const pkg = await packageService.findById(request.params.id);
  return reply.send(pkg);
}
