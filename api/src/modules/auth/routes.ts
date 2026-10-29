import { FastifyInstance } from 'fastify';
import { login, me } from './auth.controller';

export async function registerAuthRoutes(app: FastifyInstance) {
  // Contas de clientes são criadas somente por administradores em POST /admin/users.
  // Não expor cadastro público em /auth/register.
  app.post(
    '/auth/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    login
  );
  app.get('/auth/me', { preHandler: [app.authenticate] }, me);
}
