import { FastifyRequest, FastifyReply } from 'fastify';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from './auth.schema';
import { authService } from './auth.service';
import { ValidationError } from '../../shared/errors';

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const parseResult = registerSchema.safeParse(request.body);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }
  const data = parseResult.data as RegisterInput;
  const result = await authService.register(data);
  return reply.status(201).send(result);
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const parseResult = loginSchema.safeParse(request.body);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }
  const data = parseResult.data as LoginInput;
  const result = await authService.login(data);
  return reply.send(result);
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user?.sub;
  if (!userId) {
    return reply.status(401).send({ message: 'Não autenticado' });
  }
  const user = await authService.getMe(userId);
  return reply.send(user);
}