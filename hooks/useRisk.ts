/**
 * Risk Management Hooks
 * State management for risk operations
 */

import {
    addMitigationAction,
    assessRisk,
    calculateRiskExposure,
    closeRisk,
    createRisk,
    deleteMitigationAction,
    deleteRisk,
    escalateRisk,
    getOverdueActions,
    getRisk,
    getRiskEvents,
    getRiskRegister,
    getRiskReport,
    getRisks,
    getRiskTrends,
    getTopRisks,
    reassessRisk,
    recordRiskOccurrence,
    resolveRisk,
    updateMitigationAction,
    updateRisk,
} from '@/services/risk';
import type {
    AddMitigationActionParams,
    AssessRiskParams,
    CreateRiskParams,
    GetRiskReportParams,
    GetRisksParams,
    RecordRiskOccurrenceParams,
    Risk,
    RiskEvent,
    RiskRegister,
    RiskReport,
    UpdateMitigationActionParams,
    UpdateRiskParams
} from '@/types/risk';
import { useEffect, useState } from 'react';

// Hook: Manage risks with filters
export function useRisks(initialParams: GetRisksParams) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRisks(params);
      setRisks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [params]);

  const create = async (createParams: CreateRiskParams) => {
    try {
      const newRisk = await createRisk(createParams);
      setRisks((prev) => [newRisk, ...prev]);
      return newRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to create risk');
      throw err;
    }
  };

  const update = async (updateParams: UpdateRiskParams) => {
    const optimisticRisks = risks.map((r) =>
      r.id === updateParams.id ? { ...r, ...updateParams } : r
    );
    setRisks(optimisticRisks);

    try {
      const updatedRisk = await updateRisk(updateParams);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to update risk');
      fetchRisks();
      throw err;
    }
  };

  const remove = async (id: string) => {
    const optimisticRisks = risks.filter((r) => r.id !== id);
    setRisks(optimisticRisks);

    try {
      await deleteRisk(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete risk');
      fetchRisks();
      throw err;
    }
  };

  const assess = async (assessParams: AssessRiskParams) => {
    try {
      const updatedRisk = await assessRisk(assessParams);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to assess risk');
      throw err;
    }
  };

  const reassess = async (id: string) => {
    try {
      const updatedRisk = await reassessRisk(id);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to reassess risk');
      throw err;
    }
  };

  const addAction = async (actionParams: AddMitigationActionParams) => {
    try {
      const updatedRisk = await addMitigationAction(actionParams);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to add mitigation action');
      throw err;
    }
  };

  const updateAction = async (actionParams: UpdateMitigationActionParams) => {
    try {
      const updatedRisk = await updateMitigationAction(actionParams);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to update mitigation action');
      throw err;
    }
  };

  const removeAction = async (riskId: string, actionId: string) => {
    try {
      const updatedRisk = await deleteMitigationAction(riskId, actionId);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to remove mitigation action');
      throw err;
    }
  };

  const recordOccurrence = async (occurrenceParams: RecordRiskOccurrenceParams) => {
    try {
      const updatedRisk = await recordRiskOccurrence(occurrenceParams);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to record risk occurrence');
      throw err;
    }
  };

  const resolve = async (id: string, resolution: string, lessonsLearned?: string) => {
    try {
      const updatedRisk = await resolveRisk(id, resolution, lessonsLearned);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to resolve risk');
      throw err;
    }
  };

  const close = async (id: string, closureNotes?: string) => {
    try {
      const updatedRisk = await closeRisk(id, closureNotes);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to close risk');
      throw err;
    }
  };

  const escalate = async (id: string, escalatedTo: string, reason: string) => {
    try {
      const updatedRisk = await escalateRisk(id, escalatedTo, reason);
      setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r)));
      return updatedRisk;
    } catch (err: any) {
      setError(err.message || 'Failed to escalate risk');
      throw err;
    }
  };

  return {
    risks,
    loading,
    error,
    params,
    setParams,
    refresh: fetchRisks,
    create,
    update,
    remove,
    assess,
    reassess,
    addAction,
    updateAction,
    removeAction,
    recordOccurrence,
    resolve,
    close,
    escalate,
  };
}

// Hook: Single risk details
export function useRiskById(id: string | null) {
  const [risk, setRisk] = useState<Risk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setRisk(null);
      setLoading(false);
      return;
    }

    const fetchRisk = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRisk(id);
        setRisk(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch risk');
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
  }, [id]);

  return { risk, loading, error };
}

// Hook: Risk register
export function useRiskRegister(projectId: string) {
  const [register, setRegister] = useState<RiskRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRiskRegister(projectId);
      setRegister(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risk register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, [projectId]);

  return { register, loading, error, refresh: fetchRegister };
}

// Hook: Risk events
export function useRiskEvents(riskId: string | null) {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!riskId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRiskEvents(riskId);
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch risk events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [riskId]);

  return { events, loading, error };
}

// Hook: Risk report
export function useRiskReport(params: GetRiskReportParams) {
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRiskReport(params);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risk report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [params]);

  return { report, loading, error, refresh: fetchReport };
}

// Hook: Risk trends
export function useRiskTrends(projectId: string, days: number = 30) {
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRiskTrends(projectId, days);
      setTrends(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risk trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [projectId, days]);

  return { trends, loading, error, refresh: fetchTrends };
}

// Hook: Top risks
export function useTopRisks(projectId: string, limit: number = 10) {
  const [topRisks, setTopRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopRisks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopRisks(projectId, limit);
      setTopRisks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch top risks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopRisks();
  }, [projectId, limit]);

  return { topRisks, loading, error, refresh: fetchTopRisks };
}

// Hook: Overdue actions
export function useOverdueActions(projectId: string) {
  const [overdueActions, setOverdueActions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverdueActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOverdueActions(projectId);
      setOverdueActions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overdue actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueActions();
  }, [projectId]);

  return { overdueActions, loading, error, refresh: fetchOverdueActions };
}

// Hook: Risk exposure
export function useRiskExposure(projectId: string) {
  const [exposure, setExposure] = useState<{
    totalExposure: number;
    byCategory: Record<string, number>;
    contingencyRecommendation: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExposure = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calculateRiskExposure(projectId);
      setExposure(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate risk exposure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExposure();
  }, [projectId]);

  return { exposure, loading, error, refresh: fetchExposure };
}
