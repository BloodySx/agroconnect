import { adminDashboardRepository, DashboardData } from './admin-dashboard.repository';

export class AdminDashboardService {
  async getDashboard(): Promise<DashboardData> {
    return adminDashboardRepository.getDashboard();
  }
}

export const adminDashboardService = new AdminDashboardService();
