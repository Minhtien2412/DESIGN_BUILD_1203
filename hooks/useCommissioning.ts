/**
 * Commissioning Hooks
 * State management for construction commissioning
 */

import * as commissioningService from '@/services/commissioning';
import type {
    CommissioningAnalytics,
    CommissioningDeficiency,
    CommissioningPlan,
    CommissioningReport,
    CommissioningStatus,
    CommissioningSummary,
    CommissioningSystem,
    CommissioningTest,
    DeficiencyStatus,
    SystemCategory,
    TestStatus,
} from '@/types/commissioning';
import { useEffect, useState } from 'react';

// Use Commissioning Plans
export const useCommissioningPlans = (params?: {
  projectId?: string;
  status?: string;
  search?: string;
}) => {
  const [plans, setPlans] = useState<CommissioningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await commissioningService.getCommissioningPlans(params);
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [params?.projectId, params?.status, params?.search]);

  const createPlan = async (data: Partial<CommissioningPlan>) => {
    const newPlan = await commissioningService.createCommissioningPlan(data);
    setPlans(prev => [newPlan, ...prev]);
    return newPlan;
  };

  const updatePlan = async (id: string, data: Partial<CommissioningPlan>) => {
    const updated = await commissioningService.updateCommissioningPlan(id, data);
    setPlans(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  };

  const deletePlan = async (id: string) => {
    await commissioningService.deleteCommissioningPlan(id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const refresh = fetchPlans;

  return {
    plans,
    loading,
    error,
    refresh,
    createPlan,
    updatePlan,
    deletePlan,
  };
};

// Use Single Commissioning Plan
export const useCommissioningPlan = (id: string) => {
  const [plan, setPlan] = useState<CommissioningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningPlan(id);
        setPlan(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id]);

  return { plan, loading, error };
};

// Use Commissioning Systems
export const useCommissioningSystems = (planId: string, params?: {
  category?: SystemCategory;
  status?: CommissioningStatus;
  search?: string;
}) => {
  const [systems, setSystems] = useState<CommissioningSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningSystems(planId, params);
        setSystems(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchSystems();
    }
  }, [planId, params?.category, params?.status, params?.search]);

  return { systems, loading, error };
};

// Use Single Commissioning System
export const useCommissioningSystem = (planId: string, systemId: string) => {
  const [system, setSystem] = useState<CommissioningSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSystem = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningSystem(planId, systemId);
        setSystem(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (planId && systemId) {
      fetchSystem();
    }
  }, [planId, systemId]);

  return { system, loading, error };
};

// Use Commissioning Tests
export const useCommissioningTests = (systemId: string, params?: {
  testType?: string;
  status?: TestStatus;
}) => {
  const [tests, setTests] = useState<CommissioningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await commissioningService.getCommissioningTests(systemId, params);
      setTests(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (systemId) {
      fetchTests();
    }
  }, [systemId, params?.testType, params?.status]);

  const createTest = async (data: Partial<CommissioningTest>) => {
    const newTest = await commissioningService.createCommissioningTest(systemId, data);
    setTests(prev => [newTest, ...prev]);
    return newTest;
  };

  const updateTest = async (testId: string, data: Partial<CommissioningTest>) => {
    const updated = await commissioningService.updateCommissioningTest(systemId, testId, data);
    setTests(prev => prev.map(t => (t.id === testId ? updated : t)));
    return updated;
  };

  const deleteTest = async (testId: string) => {
    await commissioningService.deleteCommissioningTest(systemId, testId);
    setTests(prev => prev.filter(t => t.id !== testId));
  };

  const startTest = async (testId: string) => {
    const started = await commissioningService.startTest(systemId, testId);
    setTests(prev => prev.map(t => (t.id === testId ? started : t)));
    return started;
  };

  const completeTestStep = async (testId: string, stepId: string, data: any) => {
    const updated = await commissioningService.completeTestStep(systemId, testId, stepId, data);
    setTests(prev => prev.map(t => (t.id === testId ? updated : t)));
    return updated;
  };

  const completeTest = async (testId: string, data: any) => {
    const completed = await commissioningService.completeTest(systemId, testId, data);
    setTests(prev => prev.map(t => (t.id === testId ? completed : t)));
    return completed;
  };

  const refresh = fetchTests;

  return {
    tests,
    loading,
    error,
    refresh,
    createTest,
    updateTest,
    deleteTest,
    startTest,
    completeTestStep,
    completeTest,
  };
};

// Use Single Commissioning Test
export const useCommissioningTest = (systemId: string, testId: string) => {
  const [test, setTest] = useState<CommissioningTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningTest(systemId, testId);
        setTest(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (systemId && testId) {
      fetchTest();
    }
  }, [systemId, testId]);

  return { test, loading, error };
};

// Use Commissioning Deficiencies
export const useCommissioningDeficiencies = (params?: {
  projectId?: string;
  systemId?: string;
  testId?: string;
  status?: DeficiencyStatus;
  severity?: string;
}) => {
  const [deficiencies, setDeficiencies] = useState<CommissioningDeficiency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDeficiencies = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningDeficiencies(params);
        setDeficiencies(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeficiencies();
  }, [params?.projectId, params?.systemId, params?.testId, params?.status, params?.severity]);

  return { deficiencies, loading, error };
};

// Use Commissioning Reports
export const useCommissioningReports = (planId: string, params?: {
  reportType?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [reports, setReports] = useState<CommissioningReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningReports(planId, params);
        setReports(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchReports();
    }
  }, [planId, params?.reportType, params?.startDate, params?.endDate]);

  return { reports, loading, error };
};

// Use Commissioning Summary
export const useCommissioningSummary = (projectId: string, startDate?: string, endDate?: string) => {
  const [summary, setSummary] = useState<CommissioningSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningSummary(projectId, startDate, endDate);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchSummary();
    }
  }, [projectId, startDate, endDate]);

  return { summary, loading, error };
};

// Use Commissioning Analytics
export const useCommissioningAnalytics = (projectId: string, period: string) => {
  const [analytics, setAnalytics] = useState<CommissioningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await commissioningService.getCommissioningAnalytics(projectId, period);
        setAnalytics(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && period) {
      fetchAnalytics();
    }
  }, [projectId, period]);

  return { analytics, loading, error };
};
