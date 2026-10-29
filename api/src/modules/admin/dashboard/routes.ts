import { FastifyInstance } from 'fastify';
import { getAdminDashboard } from './admin-dashboard.controller';

export async function registerAdminDashboardRoutes(app: FastifyInstance) {
  app.get('/admin/dashboard', { preHandler: [app.authenticate, app.authorizeAdmin] }, getAdminDashboard);
}
