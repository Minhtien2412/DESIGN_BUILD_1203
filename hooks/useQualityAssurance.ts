/**
 * Quality Assurance & Testing Hooks
 * State management for QA/QC operations
 */

import * as qaService from '@/services/quality-assurance';
import type {
    NonConformanceReport,
    QAAnalytics,
    QARegister,
    QASummary,
    QualityDefect,
    QualityInspection,
    QualityTest
} from '@/types/quality-assurance';
import { useEffect, useState } from 'react';

// ============================================================================
// Quality Tests Hook
// ============================================================================

export const useQualityTests = (params?: qaService.GetQualityTestsParams) => {
  const [tests, setTests] = useState<QualityTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQualityTests(params);
      setTests(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [JSON.stringify(params)]);

  const createTest = async (data: Partial<QualityTest>) => {
    try {
      const newTest = await qaService.createQualityTest(data);
      setTests(prev => [newTest, ...prev]);
      return newTest;
    } catch (err) {
      throw err;
    }
  };

  const updateTest = async (id: string, data: Partial<QualityTest>) => {
    try {
      const updated = await qaService.updateQualityTest(id, data);
      setTests(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteTest = async (id: string) => {
    try {
      await qaService.deleteQualityTest(id);
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const startTest = async (
    testId: string,
    data: {
      actualStartDate: string;
      testPerformedBy: {
        id: string;
        name: string;
        company?: string;
        certification?: string;
      };
    }
  ) => {
    try {
      const updated = await qaService.startTest(testId, data);
      setTests(prev => prev.map(t => t.id === testId ? updated : t));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const completeTest = async (
    testId: string,
    data: {
      result: 'PASS' | 'FAIL' | 'CONDITIONAL';
      actualResults: string;
      actualEndDate?: string;
      measurements?: any[];
    }
  ) => {
    try {
      const updated = await qaService.completeTest(testId, data);
      setTests(prev => prev.map(t => t.id === testId ? updated : t));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const approveTest = async (
    testId: string,
    data: {
      approvedBy: { id: string; name: string; signature?: string };
      comments?: string;
    }
  ) => {
    try {
      const updated = await qaService.approveTest(testId, data);
      setTests(prev => prev.map(t => t.id === testId ? updated : t));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    tests,
    loading,
    error,
    createTest,
    updateTest,
    deleteTest,
    startTest,
    completeTest,
    approveTest,
    refresh: fetchTests,
  };
};

// ============================================================================
// Single Quality Test Hook
// ============================================================================

export const useQualityTest = (testId?: string) => {
  const [test, setTest] = useState<QualityTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTest = async () => {
    if (!testId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQualityTest(testId);
      setTest(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTest();
  }, [testId]);

  return { test, loading, error, refresh: fetchTest };
};

// ============================================================================
// Quality Inspections Hook
// ============================================================================

export const useQualityInspections = (params?: qaService.GetQualityInspectionsParams) => {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQualityInspections(params);
      setInspections(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [JSON.stringify(params)]);

  const createInspection = async (data: Partial<QualityInspection>) => {
    try {
      const newInspection = await qaService.createQualityInspection(data);
      setInspections(prev => [newInspection, ...prev]);
      return newInspection;
    } catch (err) {
      throw err;
    }
  };

  const updateInspection = async (id: string, data: Partial<QualityInspection>) => {
    try {
      const updated = await qaService.updateQualityInspection(id, data);
      setInspections(prev => prev.map(i => i.id === id ? updated : i));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteInspection = async (id: string) => {
    try {
      await qaService.deleteQualityInspection(id);
      setInspections(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const startInspection = async (
    inspectionId: string,
    data: {
      actualDate: string;
      attendees?: any[];
    }
  ) => {
    try {
      const updated = await qaService.startInspection(inspectionId, data);
      setInspections(prev => prev.map(i => i.id === inspectionId ? updated : i));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const completeInspection = async (
    inspectionId: string,
    data: {
      overallResult: 'PASS' | 'FAIL' | 'CONDITIONAL';
      findings?: any[];
      inspectorSignature?: any;
    }
  ) => {
    try {
      const updated = await qaService.completeInspection(inspectionId, data);
      setInspections(prev => prev.map(i => i.id === inspectionId ? updated : i));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const uploadPhoto = async (
    inspectionId: string,
    file: File,
    metadata?: {
      caption?: string;
      location?: string;
      checklistItemId?: string;
    }
  ) => {
    try {
      const result = await qaService.uploadInspectionPhoto(inspectionId, file, metadata);
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    inspections,
    loading,
    error,
    createInspection,
    updateInspection,
    deleteInspection,
    startInspection,
    completeInspection,
    uploadPhoto,
    refresh: fetchInspections,
  };
};

// ============================================================================
// Single Quality Inspection Hook
// ============================================================================

export const useQualityInspection = (inspectionId?: string) => {
  const [inspection, setInspection] = useState<QualityInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInspection = async () => {
    if (!inspectionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQualityInspection(inspectionId);
      setInspection(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [inspectionId]);

  return { inspection, loading, error, refresh: fetchInspection };
};

// ============================================================================
// Quality Defects Hook
// ============================================================================

export const useQualityDefects = (params?: qaService.GetQualityDefectsParams) => {
  const [defects, setDefects] = useState<QualityDefect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDefects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQualityDefects(params);
      setDefects(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefects();
  }, [JSON.stringify(params)]);

  const createDefect = async (data: Partial<QualityDefect>) => {
    try {
      const newDefect = await qaService.createQualityDefect(data);
      setDefects(prev => [newDefect, ...prev]);
      return newDefect;
    } catch (err) {
      throw err;
    }
  };

  const updateDefect = async (id: string, data: Partial<QualityDefect>) => {
    try {
      const updated = await qaService.updateQualityDefect(id, data);
      setDefects(prev => prev.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteDefect = async (id: string) => {
    try {
      await qaService.deleteQualityDefect(id);
      setDefects(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const assignDefect = async (
    defectId: string,
    data: {
      assignedTo: { id: string; name: string; company?: string };
      targetDate?: string;
      comments?: string;
    }
  ) => {
    try {
      const updated = await qaService.assignDefect(defectId, data);
      setDefects(prev => prev.map(d => d.id === defectId ? updated : d));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const resolveDefect = async (
    defectId: string,
    data: {
      correctiveAction: string;
      resolvedBy: { id: string; name: string };
      resolvedDate?: string;
    }
  ) => {
    try {
      const updated = await qaService.resolveDefect(defectId, data);
      setDefects(prev => prev.map(d => d.id === defectId ? updated : d));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const verifyDefect = async (
    defectId: string,
    data: {
      verifiedBy: { id: string; name: string };
      verificationMethod?: string;
      comments?: string;
    }
  ) => {
    try {
      const updated = await qaService.verifyDefect(defectId, data);
      setDefects(prev => prev.map(d => d.id === defectId ? updated : d));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const closeDefect = async (defectId: string, comments?: string) => {
    try {
      const updated = await qaService.closeDefect(defectId, comments);
      setDefects(prev => prev.map(d => d.id === defectId ? updated : d));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    defects,
    loading,
    error,
    createDefect,
    updateDefect,
    deleteDefect,
    assignDefect,
    resolveDefect,
    verifyDefect,
    closeDefect,
    refresh: fetchDefects,
  };
};

// ============================================================================
// Single Quality Defect Hook
// ============================================================================

export const useQualityDefect = (defectId?: string) => {
  const [defect, setDefect] = useState<QualityDefect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDefect = async () => {
    if (!defectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQualityDefect(defectId);
      setDefect(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefect();
  }, [defectId]);

  return { defect, loading, error, refresh: fetchDefect };
};

// ============================================================================
// Non-Conformance Reports Hook
// ============================================================================

export const useNonConformanceReports = (params?: qaService.GetNCRsParams) => {
  const [ncrs, setNCRs] = useState<NonConformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNCRs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getNonConformanceReports(params);
      setNCRs(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNCRs();
  }, [JSON.stringify(params)]);

  const createNCR = async (data: Partial<NonConformanceReport>) => {
    try {
      const newNCR = await qaService.createNonConformanceReport(data);
      setNCRs(prev => [newNCR, ...prev]);
      return newNCR;
    } catch (err) {
      throw err;
    }
  };

  const updateNCR = async (id: string, data: Partial<NonConformanceReport>) => {
    try {
      const updated = await qaService.updateNonConformanceReport(id, data);
      setNCRs(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteNCR = async (id: string) => {
    try {
      await qaService.deleteNonConformanceReport(id);
      setNCRs(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const submitNCR = async (ncrId: string, comments?: string) => {
    try {
      const updated = await qaService.submitNCR(ncrId, { comments });
      setNCRs(prev => prev.map(n => n.id === ncrId ? updated : n));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const reviewNCR = async (
    ncrId: string,
    data: {
      reviewedBy: { id: string; name: string; role?: string };
      comments?: string;
    }
  ) => {
    try {
      const updated = await qaService.reviewNCR(ncrId, data);
      setNCRs(prev => prev.map(n => n.id === ncrId ? updated : n));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const approveNCR = async (
    ncrId: string,
    data: {
      approvedBy: { id: string; name: string; role?: string };
      disposition?: string;
      comments?: string;
    }
  ) => {
    try {
      const updated = await qaService.approveNCR(ncrId, data);
      setNCRs(prev => prev.map(n => n.id === ncrId ? updated : n));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const implementCorrectiveAction = async (
    ncrId: string,
    data: {
      correctiveAction: string;
      correctiveActionBy: { id: string; name: string; company?: string };
      correctiveActionDate?: string;
    }
  ) => {
    try {
      const updated = await qaService.implementCorrectiveAction(ncrId, data);
      setNCRs(prev => prev.map(n => n.id === ncrId ? updated : n));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const verifyNCR = async (
    ncrId: string,
    data: {
      verifiedBy: { id: string; name: string };
      verificationComments?: string;
    }
  ) => {
    try {
      const updated = await qaService.verifyNCR(ncrId, data);
      setNCRs(prev => prev.map(n => n.id === ncrId ? updated : n));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const closeNCR = async (
    ncrId: string,
    data: {
      closedBy: { id: string; name: string };
      closureComments?: string;
    }
  ) => {
    try {
      const updated = await qaService.closeNCR(ncrId, data);
      setNCRs(prev => prev.map(n => n.id === ncrId ? updated : n));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    ncrs,
    loading,
    error,
    createNCR,
    updateNCR,
    deleteNCR,
    submitNCR,
    reviewNCR,
    approveNCR,
    implementCorrectiveAction,
    verifyNCR,
    closeNCR,
    refresh: fetchNCRs,
  };
};

// ============================================================================
// Single NCR Hook
// ============================================================================

export const useNonConformanceReport = (ncrId?: string) => {
  const [ncr, setNCR] = useState<NonConformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNCR = async () => {
    if (!ncrId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getNonConformanceReport(ncrId);
      setNCR(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNCR();
  }, [ncrId]);

  return { ncr, loading, error, refresh: fetchNCR };
};

// ============================================================================
// QA Register Hook
// ============================================================================

export const useQARegister = (projectId?: string) => {
  const [register, setRegister] = useState<QARegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRegister = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQARegister(projectId);
      setRegister(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, [projectId]);

  return { register, loading, error, refresh: fetchRegister };
};

// ============================================================================
// QA Summary Hook
// ============================================================================

export const useQASummary = (
  projectId?: string,
  dateRange?: { startDate: string; endDate: string }
) => {
  const [summary, setSummary] = useState<QASummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQASummary(projectId, dateRange);
      setSummary(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [projectId, JSON.stringify(dateRange)]);

  return { summary, loading, error, refresh: fetchSummary };
};

// ============================================================================
// QA Analytics Hook
// ============================================================================

export const useQAAnalytics = (projectId?: string, period: string = 'month') => {
  const [analytics, setAnalytics] = useState<QAAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await qaService.getQAAnalytics(projectId, period);
      setAnalytics(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [projectId, period]);

  return { analytics, loading, error, refresh: fetchAnalytics };
};
