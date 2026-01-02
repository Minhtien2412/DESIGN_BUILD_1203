/**
 * Inspection & Testing Hooks
 */

import * as inspectionService from '@/services/inspection';
import type {
    CreateInspectionParams,
    CreateNCRParams,
    CreateTestParams,
    GetInspectionsParams,
    GetNCRsParams,
    GetTestsParams,
    Inspection,
    InspectionAnalytics,
    InspectionChecklist,
    NonConformanceReport,
    SubmitInspectionResultParams,
    SubmitTestResultParams,
    Test,
    UpdateInspectionParams,
} from '@/types/inspection';
import { useEffect, useState } from 'react';

// Inspections Hook
export const useInspections = (params?: GetInspectionsParams) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inspectionService.getInspections(params);
      setInspections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inspections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [JSON.stringify(params)]);

  const createInspection = async (data: CreateInspectionParams) => {
    try {
      const newInspection = await inspectionService.createInspection(data);
      setInspections(prev => [newInspection, ...prev]);
      return newInspection;
    } catch (err) {
      throw err;
    }
  };

  const updateInspection = async (data: UpdateInspectionParams) => {
    try {
      const updated = await inspectionService.updateInspection(data);
      setInspections(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteInspection = async (id: string) => {
    try {
      await inspectionService.deleteInspection(id);
      setInspections(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const startInspection = async (id: string) => {
    try {
      const updated = await inspectionService.startInspection(id);
      setInspections(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const submitResult = async (data: SubmitInspectionResultParams) => {
    try {
      const updated = await inspectionService.submitInspectionResult(data);
      setInspections(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const approveInspection = async (id: string) => {
    try {
      const updated = await inspectionService.approveInspection(id);
      setInspections(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rescheduleInspection = async (id: string, newDate: string, reason: string) => {
    try {
      const updated = await inspectionService.rescheduleInspection(id, newDate, reason);
      setInspections(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const cancelInspection = async (id: string, reason: string) => {
    try {
      const updated = await inspectionService.cancelInspection(id, reason);
      setInspections(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    inspections,
    loading,
    error,
    refresh: fetchInspections,
    createInspection,
    updateInspection,
    deleteInspection,
    startInspection,
    submitResult,
    approveInspection,
    rescheduleInspection,
    cancelInspection,
  };
};

// Single Inspection Hook
export const useInspection = (id: string) => {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await inspectionService.getInspection(id);
        setInspection(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inspection');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInspection();
    }
  }, [id]);

  return { inspection, loading, error };
};

// Inspection Checklists Hook
export const useInspectionChecklists = (type?: string) => {
  const [checklists, setChecklists] = useState<InspectionChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await inspectionService.getInspectionChecklists(type);
        setChecklists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch checklists');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, [type]);

  return { checklists, loading, error };
};

// Tests Hook
export const useTests = (params?: GetTestsParams) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inspectionService.getTests(params);
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [JSON.stringify(params)]);

  const createTest = async (data: CreateTestParams) => {
    try {
      const newTest = await inspectionService.createTest(data);
      setTests(prev => [newTest, ...prev]);
      return newTest;
    } catch (err) {
      throw err;
    }
  };

  const updateTest = async (id: string, data: Partial<CreateTestParams>) => {
    try {
      const updated = await inspectionService.updateTest(id, data);
      setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteTest = async (id: string) => {
    try {
      await inspectionService.deleteTest(id);
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const startTest = async (id: string) => {
    try {
      const updated = await inspectionService.startTest(id);
      setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const submitResult = async (data: SubmitTestResultParams) => {
    try {
      const updated = await inspectionService.submitTestResult(data);
      setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const approveTest = async (id: string) => {
    try {
      const updated = await inspectionService.approveTest(id);
      setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const requestRetest = async (id: string, reason: string, parameters?: string[]) => {
    try {
      const updated = await inspectionService.requestRetest(id, reason, parameters);
      setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    tests,
    loading,
    error,
    refresh: fetchTests,
    createTest,
    updateTest,
    deleteTest,
    startTest,
    submitResult,
    approveTest,
    requestRetest,
  };
};

// Single Test Hook
export const useTest = (id: string) => {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await inspectionService.getTest(id);
        setTest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch test');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTest();
    }
  }, [id]);

  return { test, loading, error };
};

// NCRs Hook
export const useNCRs = (params?: GetNCRsParams) => {
  const [ncrs, setNCRs] = useState<NonConformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNCRs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inspectionService.getNCRs(params);
      setNCRs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch NCRs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNCRs();
  }, [JSON.stringify(params)]);

  const createNCR = async (data: CreateNCRParams) => {
    try {
      const newNCR = await inspectionService.createNCR(data);
      setNCRs(prev => [newNCR, ...prev]);
      return newNCR;
    } catch (err) {
      throw err;
    }
  };

  const updateNCR = async (id: string, data: Partial<CreateNCRParams>) => {
    try {
      const updated = await inspectionService.updateNCR(id, data);
      setNCRs(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteNCR = async (id: string) => {
    try {
      await inspectionService.deleteNCR(id);
      setNCRs(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const resolveNCR = async (
    id: string,
    data: {
      implementedDate: string;
      implementedBy: string;
      comments?: string;
    }
  ) => {
    try {
      const updated = await inspectionService.resolveNCR(id, data);
      setNCRs(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const verifyNCR = async (
    id: string,
    data: {
      effectiveness: 'EFFECTIVE' | 'INEFFECTIVE';
      comments?: string;
    }
  ) => {
    try {
      const updated = await inspectionService.verifyNCR(id, data);
      setNCRs(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const closeNCR = async (id: string, comments?: string) => {
    try {
      const updated = await inspectionService.closeNCR(id, comments);
      setNCRs(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rejectNCR = async (id: string, reason: string) => {
    try {
      const updated = await inspectionService.rejectNCR(id, reason);
      setNCRs(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    ncrs,
    loading,
    error,
    refresh: fetchNCRs,
    createNCR,
    updateNCR,
    deleteNCR,
    resolveNCR,
    verifyNCR,
    closeNCR,
    rejectNCR,
  };
};

// Inspection Analytics Hook
export const useInspectionAnalytics = (projectId?: string, fromDate?: string, toDate?: string) => {
  const [analytics, setAnalytics] = useState<InspectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await inspectionService.getInspectionAnalytics(projectId, fromDate, toDate);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId, fromDate, toDate]);

  return { analytics, loading, error };
};
