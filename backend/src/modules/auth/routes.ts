import { FastifyInstance } from 'fastify';
import { register, login, me } from './auth.controller';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post(
    '/auth/register',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    register
  );
  app.post(
    '/auth/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    login
  );
  app.get('/auth/me', { preHandler: [app.authenticate] }, me);
}