/**
 * Task Management Hook
 * Domain-specific hook cho task management
 */

import { useProjectTasks, useTaskMutations } from '../../../shared/hooks/optimizedHooks';

export const useTaskManagement = (projectId: string, filters?: any) => {
  const tasks = useProjectTasks(projectId, filters);
  const mutations = useTaskMutations();

  return {
    ...tasks,
    ...mutations,
  };
};
