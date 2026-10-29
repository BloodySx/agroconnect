import { FastifyInstance } from 'fastify';
import { registerAdminOrderRoutes } from './orders/routes';
import { registerAdminUserRoutes } from './users/routes';
import { registerAdminDashboardRoutes } from './dashboard/routes';

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get('/admin/health', { preHandler: [app.authenticate, app.authorizeAdmin] }, async (request) => {
    return {
      ok: true,
      message: 'Acesso administrativo concedido',
      user: {
        sub: request.user?.sub,
        email: request.user?.email,
        role: request.user?.role,
      },
    };
  });

  await registerAdminOrderRoutes(app);
  await registerAdminUserRoutes(app);
  await registerAdminDashboardRoutes(app);
}
