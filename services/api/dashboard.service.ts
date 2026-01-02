/**
 * Dashboard Service
 * Handles role-based dashboard data endpoints
 * 
 * Endpoints:
 * - GET /dashboard/admin - Admin dashboard data
 * - GET /dashboard/engineer - Engineer dashboard data
 * - GET /dashboard/client - Client dashboard data
 */

import { apiClient } from './client';
import type {
    AdminDashboard,
    ClientDashboard,
    EngineerDashboard,
} from './types';

export const dashboardService = {
  /**
   * Get admin dashboard data
   * GET /dashboard/admin
   */
  admin: async (): Promise<AdminDashboard> => {
    console.log('[DashboardService] 📊 Fetching admin dashboard');
    
    const response = await apiClient.get<AdminDashboard>('/dashboard/admin');
    
    console.log('[DashboardService] ✅ Admin dashboard fetched');
    return response;
  },

  /**
   * Get engineer dashboard data
   * GET /dashboard/engineer
   */
  engineer: async (): Promise<EngineerDashboard> => {
    console.log('[DashboardService] 📊 Fetching engineer dashboard');
    
    const response = await apiClient.get<EngineerDashboard>('/dashboard/engineer');
    
    console.log('[DashboardService] ✅ Engineer dashboard fetched');
    return response;
  },

  /**
   * Get client dashboard data
   * GET /dashboard/client
   */
  client: async (): Promise<ClientDashboard> => {
    console.log('[DashboardService] 📊 Fetching client dashboard');
    
    const response = await apiClient.get<ClientDashboard>('/dashboard/client');
    
    console.log('[DashboardService] ✅ Client dashboard fetched');
    return response;
  },
};

export default dashboardService;
