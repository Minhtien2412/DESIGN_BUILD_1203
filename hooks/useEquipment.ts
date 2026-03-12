/**
 * Equipment Management Hooks
 * React hooks for equipment state management
 */

import * as equipmentService from "@/services/equipment";
import type {
    CreateEquipmentParams,
    CreateInspectionParams,
    CreateMaintenanceRecordParams,
    CreateUsageLogParams,
    Equipment,
    EquipmentInspection,
    EquipmentStats,
    GetEquipmentParams,
    GetEquipmentStatsParams,
    GetMaintenanceRecordsParams,
    MaintenanceRecord,
    UpdateEquipmentParams,
    UpdateMaintenanceRecordParams,
    UpdateUsageLogParams,
    UsageLog,
} from "@/types/equipment";
import { useCallback, useEffect, useState } from "react";

// Equipment Hook
export function useEquipment(params: GetEquipmentParams) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getEquipment(params);
      setEquipment(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    params.projectId,
    params.status,
    params.type,
    params.condition,
    params.ownershipType,
    params.assignedTo,
    params.search,
  ]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const create = async (createParams: CreateEquipmentParams) => {
    const newEquipment = await equipmentService.createEquipment(createParams);
    setEquipment((prev) => [newEquipment, ...prev]);
    return newEquipment;
  };

  const update = async (updateParams: UpdateEquipmentParams) => {
    const updated = await equipmentService.updateEquipment(updateParams);
    setEquipment((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)),
    );
    return updated;
  };

  const remove = async (id: string) => {
    await equipmentService.deleteEquipment(id);
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  const assign = async (
    equipmentId: string,
    assignedTo: string,
    projectId: string,
    location?: string,
    expectedReturnDate?: string,
  ) => {
    const updated = await equipmentService.assignEquipment(
      equipmentId,
      assignedTo,
      projectId,
      location,
      expectedReturnDate,
    );
    setEquipment((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)),
    );
    return updated;
  };

  const returnEquipment = async (
    equipmentId: string,
    condition: string,
    meterReading?: number,
    notes?: string,
  ) => {
    const updated = await equipmentService.returnEquipment(
      equipmentId,
      condition,
      meterReading,
      notes,
    );
    setEquipment((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)),
    );
    return updated;
  };

  const transfer = async (
    equipmentId: string,
    newAssignee: string,
    newLocation?: string,
  ) => {
    const updated = await equipmentService.transferEquipment(
      equipmentId,
      newAssignee,
      newLocation,
    );
    setEquipment((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)),
    );
    return updated;
  };

  return {
    equipment,
    loading,
    error,
    refetch: fetchEquipment,
    create,
    update,
    remove,
    assign,
    returnEquipment,
    transfer,
  };
}

// Single Equipment Hook
export function useEquipmentById(id: string) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEquipment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getEquipmentById(id);
      setEquipment(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  return { equipment, loading, error, refetch: fetchEquipment };
}

// Maintenance Records Hook
export function useMaintenanceRecords(params: GetMaintenanceRecordsParams) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getMaintenanceRecords(params);
      setRecords(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    params.equipmentId,
    params.type,
    params.status,
    params.fromDate,
    params.toDate,
  ]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const create = async (createParams: CreateMaintenanceRecordParams) => {
    const newRecord =
      await equipmentService.createMaintenanceRecord(createParams);
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const update = async (updateParams: UpdateMaintenanceRecordParams) => {
    const updated =
      await equipmentService.updateMaintenanceRecord(updateParams);
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    return updated;
  };

  const remove = async (id: string) => {
    await equipmentService.deleteMaintenanceRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const complete = async (
    id: string,
    workPerformed: string,
    partsReplaced?: MaintenanceRecord["partsReplaced"],
    totalCost?: number,
    nextMaintenanceDate?: string,
  ) => {
    const updated = await equipmentService.completeMaintenanceRecord(
      id,
      workPerformed,
      partsReplaced,
      totalCost,
      nextMaintenanceDate,
    );
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    return updated;
  };

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    create,
    update,
    remove,
    complete,
  };
}

// Single Maintenance Record Hook
export function useMaintenanceRecord(id: string) {
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecord = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getMaintenanceRecord(id);
      setRecord(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return { record, loading, error, refetch: fetchRecord };
}

// Usage Logs Hook
export function useUsageLogs(equipmentId: string) {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!equipmentId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getUsageLogs(equipmentId);
      setLogs(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const create = async (params: CreateUsageLogParams) => {
    const newLog = await equipmentService.createUsageLog(params);
    setLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  const update = async (params: UpdateUsageLogParams) => {
    const updated = await equipmentService.updateUsageLog(params);
    setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    return updated;
  };

  const remove = async (id: string) => {
    await equipmentService.deleteUsageLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return { logs, loading, error, refetch: fetchLogs, create, update, remove };
}

// Inspections Hook
export function useInspections(equipmentId: string) {
  const [inspections, setInspections] = useState<EquipmentInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInspections = useCallback(async () => {
    if (!equipmentId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getInspections(equipmentId);
      setInspections(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const create = async (params: CreateInspectionParams) => {
    const newInspection = await equipmentService.createInspection(params);
    setInspections((prev) => [newInspection, ...prev]);
    return newInspection;
  };

  const update = async (id: string, data: Partial<EquipmentInspection>) => {
    const updated = await equipmentService.updateInspection(id, data);
    setInspections((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i)),
    );
    return updated;
  };

  const remove = async (id: string) => {
    await equipmentService.deleteInspection(id);
    setInspections((prev) => prev.filter((i) => i.id !== id));
  };

  return {
    inspections,
    loading,
    error,
    refetch: fetchInspections,
    create,
    update,
    remove,
  };
}

// Single Inspection Hook
export function useInspection(id: string) {
  const [inspection, setInspection] = useState<EquipmentInspection | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInspection = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getInspection(id);
      setInspection(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInspection();
  }, [fetchInspection]);

  return { inspection, loading, error, refetch: fetchInspection };
}

// Equipment Stats Hook
export function useEquipmentStats(params: GetEquipmentStatsParams) {
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getEquipmentStats(params);
      setStats(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.fromDate, params.toDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
