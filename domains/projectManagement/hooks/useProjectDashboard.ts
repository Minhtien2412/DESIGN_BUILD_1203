/**
 * Project Dashboard Hook
 * Domain-specific hook cho dashboard functionality
 */

import { useProjectDashboard as useOptimizedDashboard } from '../../../shared/hooks/optimizedHooks';
import { UserRole } from '../../../types/projectProgress';

export const useProjectDashboard = (projectId: string, userRole: UserRole) => {
  return useOptimizedDashboard(projectId, userRole);
};