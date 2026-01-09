/**
 * Payment Management Hook
 * Domain-specific hook cho payment management
 */

import { usePaymentMutations, useProjectPayments } from '../../../shared/hooks/optimizedHooks';

export const usePaymentManagement = (projectId: string) => {
  const payments = useProjectPayments(projectId);
  const mutations = usePaymentMutations();

  return {
    ...payments,
    ...mutations,
  };
};
