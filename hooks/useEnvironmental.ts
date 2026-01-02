/**
 * Environmental Management Hooks
 * State management for environmental operations
 */

import * as envService from '@/services/environmental';
import type {
    EmissionRecord,
    EnvironmentalAnalytics,
    EnvironmentalIncident,
    EnvironmentalMonitoring,
    EnvironmentalPermit,
    EnvironmentalRegister,
    EnvironmentalSummary,
    WasteRecord,
} from '@/types/environmental';
import { useEffect, useState } from 'react';

// ============================================================================
// Environmental Monitoring Hooks
// ============================================================================

export const useEnvironmentalMonitoring = (
  params?: envService.GetMonitoringParams
) => {
  const [monitoring, setMonitoring] = useState<EnvironmentalMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMonitoring = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await envService.getEnvironmentalMonitoring(params);
      setMonitoring(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, [JSON.stringify(params)]);

  const createMonitoring = async (data: Partial<EnvironmentalMonitoring>) => {
    try {
      const newMonitoring = await envService.createMonitoring(data);
      setMonitoring(prev => [newMonitoring, ...prev]);
      return newMonitoring;
    } catch (err) {
      throw err;
    }
  };

  const updateMonitoring = async (
    id: string,
    data: Partial<EnvironmentalMonitoring>
  ) => {
    try {
      const updated = await envService.updateMonitoring(id, data);
      setMonitoring(prev => prev.map(m => (m.id === id ? updated : m)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteMonitoring = async (id: string) => {
    try {
      await envService.deleteMonitoring(id);
      setMonitoring(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const recordMeasurement = async (
    monitoringId: string,
    data: {
      measuredValue: number;
      result: 'PASS' | 'FAIL' | 'WARNING';
      measurements?: any[];
    }
  ) => {
    try {
      const updated = await envService.recordMeasurement(monitoringId, data);
      setMonitoring(prev => prev.map(m => (m.id === monitoringId ? updated : m)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    monitoring,
    loading,
    error,
    createMonitoring,
    updateMonitoring,
    deleteMonitoring,
    recordMeasurement,
    refresh: fetchMonitoring,
  };
};

export const useMonitoring = (monitoringId?: string) => {
  const [monitoring, setMonitoring] = useState<EnvironmentalMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMonitoring = async () => {
    if (!monitoringId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await envService.getMonitoring(monitoringId);
      setMonitoring(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, [monitoringId]);

  return { monitoring, loading, error, refresh: fetchMonitoring };
};

// ============================================================================
// Waste Management Hooks
// ============================================================================

export const useWasteRecords = (params?: envService.GetWasteParams) => {
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWasteRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await envService.getWasteRecords(params);
      setWasteRecords(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteRecords();
  }, [JSON.stringify(params)]);

  const createWasteRecord = async (data: Partial<WasteRecord>) => {
    try {
      const newRecord = await envService.createWasteRecord(data);
      setWasteRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      throw err;
    }
  };

  const updateWasteRecord = async (id: string, data: Partial<WasteRecord>) => {
    try {
      const updated = await envService.updateWasteRecord(id, data);
      setWasteRecords(prev => prev.map(w => (w.id === id ? updated : w)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteWasteRecord = async (id: string) => {
    try {
      await envService.deleteWasteRecord(id);
      setWasteRecords(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const markCollected = async (
    wasteId: string,
    data: {
      collectedDate: string;
      transporter?: any;
      manifestNumber?: string;
    }
  ) => {
    try {
      const updated = await envService.markWasteCollected(wasteId, data);
      setWasteRecords(prev => prev.map(w => (w.id === wasteId ? updated : w)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const markDisposed = async (
    wasteId: string,
    data: {
      disposedDate: string;
      actualQuantity?: number;
      disposalCost?: number;
    }
  ) => {
    try {
      const updated = await envService.markWasteDisposed(wasteId, data);
      setWasteRecords(prev => prev.map(w => (w.id === wasteId ? updated : w)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    wasteRecords,
    loading,
    error,
    createWasteRecord,
    updateWasteRecord,
    deleteWasteRecord,
    markCollected,
    markDisposed,
    refresh: fetchWasteRecords,
  };
};

export const useWasteRecord = (wasteId?: string) => {
  const [wasteRecord, setWasteRecord] = useState<WasteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWasteRecord = async () => {
    if (!wasteId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await envService.getWasteRecord(wasteId);
      setWasteRecord(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteRecord();
  }, [wasteId]);

  return { wasteRecord, loading, error, refresh: fetchWasteRecord };
};

// ============================================================================
// Emissions Tracking Hooks
// ============================================================================

export const useEmissionRecords = (params?: envService.GetEmissionsParams) => {
  const [emissions, setEmissions] = useState<EmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await envService.getEmissionRecords(params);
      setEmissions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmissions();
  }, [JSON.stringify(params)]);

  const createEmissionRecord = async (data: Partial<EmissionRecord>) => {
    try {
      const newRecord = await envService.createEmissionRecord(data);
      setEmissions(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      throw err;
    }
  };

  const updateEmissionRecord = async (id: string, data: Partial<EmissionRecord>) => {
    try {
      const updated = await envService.updateEmissionRecord(id, data);
      setEmissions(prev => prev.map(e => (e.id === id ? updated : e)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteEmissionRecord = async (id: string) => {
    try {
      await envService.deleteEmissionRecord(id);
      setEmissions(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    emissions,
    loading,
    error,
    createEmissionRecord,
    updateEmissionRecord,
    deleteEmissionRecord,
    refresh: fetchEmissions,
  };
};

export const useEmissionRecord = (emissionId?: string) => {
  const [emission, setEmission] = useState<EmissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmission = async () => {
    if (!emissionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await envService.getEmissionRecord(emissionId);
      setEmission(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmission();
  }, [emissionId]);

  return { emission, loading, error, refresh: fetchEmission };
};

// ============================================================================
// Environmental Incidents Hooks
// ============================================================================

export const useEnvironmentalIncidents = (params?: envService.GetIncidentsParams) => {
  const [incidents, setIncidents] = useState<EnvironmentalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await envService.getEnvironmentalIncidents(params);
      setIncidents(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [JSON.stringify(params)]);

  const createIncident = async (data: Partial<EnvironmentalIncident>) => {
    try {
      const newIncident = await envService.createEnvironmentalIncident(data);
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      throw err;
    }
  };

  const updateIncident = async (id: string, data: Partial<EnvironmentalIncident>) => {
    try {
      const updated = await envService.updateEnvironmentalIncident(id, data);
      setIncidents(prev => prev.map(i => (i.id === id ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      await envService.deleteEnvironmentalIncident(id);
      setIncidents(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const markCleanupCompleted = async (
    incidentId: string,
    data: {
      cleanupDate: string;
      cleanupCost?: number;
      cleanupDetails?: string;
    }
  ) => {
    try {
      const updated = await envService.markCleanupCompleted(incidentId, data);
      setIncidents(prev => prev.map(i => (i.id === incidentId ? updated : i)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    incidents,
    loading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
    markCleanupCompleted,
    refresh: fetchIncidents,
  };
};

export const useEnvironmentalIncident = (incidentId?: string) => {
  const [incident, setIncident] = useState<EnvironmentalIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncident = async () => {
    if (!incidentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await envService.getEnvironmentalIncident(incidentId);
      setIncident(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [incidentId]);

  return { incident, loading, error, refresh: fetchIncident };
};

// ============================================================================
// Environmental Permits Hooks
// ============================================================================

export const useEnvironmentalPermits = (params?: envService.GetPermitsParams) => {
  const [permits, setPermits] = useState<EnvironmentalPermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await envService.getEnvironmentalPermits(params);
      setPermits(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, [JSON.stringify(params)]);

  const createPermit = async (data: Partial<EnvironmentalPermit>) => {
    try {
      const newPermit = await envService.createEnvironmentalPermit(data);
      setPermits(prev => [newPermit, ...prev]);
      return newPermit;
    } catch (err) {
      throw err;
    }
  };

  const updatePermit = async (id: string, data: Partial<EnvironmentalPermit>) => {
    try {
      const updated = await envService.updateEnvironmentalPermit(id, data);
      setPermits(prev => prev.map(p => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deletePermit = async (id: string) => {
    try {
      await envService.deleteEnvironmentalPermit(id);
      setPermits(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const renewPermit = async (
    permitId: string,
    data: {
      renewalApplicationDate: string;
      renewalDate?: string;
    }
  ) => {
    try {
      const updated = await envService.renewPermit(permitId, data);
      setPermits(prev => prev.map(p => (p.id === permitId ? updated : p)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    permits,
    loading,
    error,
    createPermit,
    updatePermit,
    deletePermit,
    renewPermit,
    refresh: fetchPermits,
  };
};

export const useEnvironmentalPermit = (permitId?: string) => {
  const [permit, setPermit] = useState<EnvironmentalPermit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermit = async () => {
    if (!permitId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await envService.getEnvironmentalPermit(permitId);
      setPermit(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [permitId]);

  return { permit, loading, error, refresh: fetchPermit };
};

// ============================================================================
// Analytics Hooks
// ============================================================================

export const useEnvironmentalRegister = (projectId?: string) => {
  const [register, setRegister] = useState<EnvironmentalRegister | null>(null);
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
      const data = await envService.getEnvironmentalRegister(projectId);
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

export const useEnvironmentalSummary = (
  projectId?: string,
  dateRange?: { startDate: string; endDate: string }
) => {
  const [summary, setSummary] = useState<EnvironmentalSummary | null>(null);
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
      const data = await envService.getEnvironmentalSummary(projectId, dateRange);
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

export const useEnvironmentalAnalytics = (
  projectId?: string,
  period: string = 'month'
) => {
  const [analytics, setAnalytics] = useState<EnvironmentalAnalytics | null>(null);
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
      const data = await envService.getEnvironmentalAnalytics(projectId, period);
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
