import { FastifyRequest, FastifyReply } from 'fastify';
import { adminDashboardService } from './admin-dashboard.service';

export async function getAdminDashboard(request: FastifyRequest, reply: FastifyReply) {
  const data = await adminDashboardService.getDashboard();
  return reply.send(data);
}
