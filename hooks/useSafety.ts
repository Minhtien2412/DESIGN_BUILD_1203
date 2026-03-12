/**
 * Safety & Compliance Hooks
 * Custom hooks for safety management with optimistic updates
 */

import {
    createAudit,
    createIncident,
    createPPEItem,
    createTrainingProgram,
    createTrainingSession,
    deleteAudit,
    deleteIncident,
    deletePPEItem,
    distributePPE,
    getAudit,
    getAudits,
    getIncident,
    getIncidents,
    getIncidentTrends,
    getPPEDistributions,
    getPPEItems,
    getSafetyStats,
    getTrainingCompliance,
    getTrainingPrograms,
    getTrainingSessions,
    getWorkerCertifications,
    recordAttendance,
    returnPPE,
    updateAudit,
    updateIncident,
    updatePPEItem,
    updateTrainingSession
} from '@/services/safety';
import type {
    CreateAuditParams,
    CreateIncidentParams,
    CreatePPEParams,
    CreateTrainingProgramParams,
    CreateTrainingSessionParams,
    DistributePPEParams,
    GetAuditsParams,
    GetIncidentsParams,
    GetPPEParams,
    GetSafetyStatsParams,
    GetTrainingSessionsParams,
    PPEDistribution,
    PPEItem,
    RecordAttendanceParams,
    SafetyAudit,
    SafetyIncident,
    SafetyStats,
    TrainingProgram,
    TrainingSession,
    UpdateAuditParams,
    UpdateIncidentParams,
    WorkerCertification,
} from '@/types/safety';
import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// SAFETY INCIDENTS HOOKS
// ============================================================================

export function useIncidents(params: GetIncidentsParams) {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIncidents(params);
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.status, params.severity, params.type]);

  const create = useCallback(async (incidentParams: CreateIncidentParams) => {
    try {
      const newIncident = await createIncident(incidentParams);
      setIncidents((prev) => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      throw err;
    }
  }, []);

  const update = useCallback(
    async (incidentId: string, updateParams: UpdateIncidentParams) => {
      try {
        const updated = await updateIncident(incidentId, updateParams);
        setIncidents((prev) =>
          prev.map((incident) => (incident.id === incidentId ? updated : incident))
        );
        return updated;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const remove = useCallback(async (incidentId: string) => {
    try {
      await deleteIncident(incidentId);
      setIncidents((prev) => prev.filter((incident) => incident.id !== incidentId));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchIncidents,
  };
}

export function useIncident(incidentId: string | null) {
  const [incident, setIncident] = useState<SafetyIncident | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) {
      setIncident(null);
      return;
    }

    const fetchIncident = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIncident(incidentId);
        setIncident(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch incident');
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [incidentId]);

  return { incident, loading, error };
}

// ============================================================================
// PPE MANAGEMENT HOOKS
// ============================================================================

export function usePPEItems(params: GetPPEParams) {
  const [items, setItems] = useState<PPEItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPPEItems(params);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PPE items');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.type, params.condition]);

  const create = useCallback(async (itemParams: CreatePPEParams) => {
    try {
      const newItem = await createPPEItem(itemParams);
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      throw err;
    }
  }, []);

  const update = useCallback(async (itemId: string, updateParams: Partial<CreatePPEParams>) => {
    try {
      const updated = await updatePPEItem(itemId, updateParams);
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const remove = useCallback(async (itemId: string) => {
    try {
      await deletePPEItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchItems,
  };
}

export function usePPEDistributions(params: { projectId: string }) {
  const { projectId } = params;
  const [distributions, setDistributions] = useState<PPEDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPPEDistributions(projectId);
      setDistributions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch distributions');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const distribute = useCallback(async (params: DistributePPEParams) => {
    try {
      const newDistribution = await distributePPE(params);
      setDistributions((prev) => [newDistribution, ...prev]);
      return newDistribution;
    } catch (err) {
      throw err;
    }
  }, []);

  const returnItem = useCallback(
    async (distributionId: string, returnedQuantity: number, condition: string, notes?: string) => {
      try {
        const updated = await returnPPE(distributionId, returnedQuantity, condition, notes);
        setDistributions((prev) =>
          prev.map((dist) => (dist.id === distributionId ? updated : dist))
        );
        return updated;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  return {
    distributions,
    loading,
    error,
    distribute,
    returnItem,
    refetch: fetchDistributions,
  };
}

// ============================================================================
// TRAINING HOOKS
// ============================================================================

export function useTrainingPrograms(params: { projectId: string }) {
  const { projectId } = params;
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrainingPrograms(projectId);
      setPrograms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch training programs');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const create = useCallback(
    async (programParams: CreateTrainingProgramParams) => {
      try {
        const newProgram = await createTrainingProgram(programParams);
        setPrograms((prev) => [newProgram, ...prev]);
        return newProgram;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    loading,
    error,
    create,
    refetch: fetchPrograms,
  };
}

export function useTrainingSessions(params: GetTrainingSessionsParams) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrainingSessions(params);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch training sessions');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.status, params.programId]);

  const create = useCallback(async (sessionParams: CreateTrainingSessionParams) => {
    try {
      const newSession = await createTrainingSession(sessionParams);
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      throw err;
    }
  }, []);

  const update = useCallback(async (sessionId: string, updateParams: Partial<TrainingSession>) => {
    try {
      const updated = await updateTrainingSession(sessionId, updateParams);
      setSessions((prev) => prev.map((session) => (session.id === sessionId ? updated : session)));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const recordAttendanceForSession = useCallback(async (params: RecordAttendanceParams) => {
    try {
      const updated = await recordAttendance(params);
      setSessions((prev) =>
        prev.map((session) => (session.id === params.sessionId ? updated : session))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    create,
    update,
    recordAttendance: recordAttendanceForSession,
    refetch: fetchSessions,
  };
}

export function useWorkerCertifications(workerId: string | null) {
  const [certifications, setCertifications] = useState<WorkerCertification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workerId) {
      setCertifications([]);
      return;
    }

    const fetchCertifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkerCertifications(workerId);
        setCertifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch certifications');
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, [workerId]);

  return { certifications, loading, error };
}

// ============================================================================
// SAFETY AUDITS HOOKS
// ============================================================================

export function useAudits(params: GetAuditsParams) {
  const [audits, setAudits] = useState<SafetyAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAudits(params);
      setAudits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.type, params.status]);

  const create = useCallback(async (auditParams: CreateAuditParams) => {
    try {
      const newAudit = await createAudit(auditParams);
      setAudits((prev) => [newAudit, ...prev]);
      return newAudit;
    } catch (err) {
      throw err;
    }
  }, []);

  const update = useCallback(async (auditId: string, updateParams: UpdateAuditParams) => {
    try {
      const updated = await updateAudit(auditId, updateParams);
      setAudits((prev) => prev.map((audit) => (audit.id === auditId ? updated : audit)));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const remove = useCallback(async (auditId: string) => {
    try {
      await deleteAudit(auditId);
      setAudits((prev) => prev.filter((audit) => audit.id !== auditId));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  return {
    audits,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchAudits,
  };
}

export function useAudit(auditId: string | null) {
  const [audit, setAudit] = useState<SafetyAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) {
      setAudit(null);
      return;
    }

    const fetchAudit = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAudit(auditId);
        setAudit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch audit');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [auditId]);

  return { audit, loading, error };
}

// ============================================================================
// STATISTICS HOOKS
// ============================================================================

export function useSafetyStats(params: GetSafetyStatsParams) {
  const [stats, setStats] = useState<SafetyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSafetyStats(params);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch safety statistics');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.startDate, params.endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useIncidentTrends(projectId: string, months: number = 6) {
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIncidentTrends(projectId, months);
        setTrends(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch incident trends');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [projectId, months]);

  return { trends, loading, error };
}

export function useTrainingCompliance(projectId: string) {
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTrainingCompliance(projectId);
        setCompliance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch training compliance');
      } finally {
        setLoading(false);
      }
    };

    fetchCompliance();
  }, [projectId]);

  return { compliance, loading, error };
}

// Aliases for backward compatibility
export const useSafetyIncidents = useIncidents;
export const useSafetyIncident = useIncident;
export const useSafetySummary = useSafetyStats;
