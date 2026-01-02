/**
 * O&M Manuals Hooks
 * State management for Operations & Maintenance documentation
 */

import * as omService from '@/services/om-manuals';
import type {
    EquipmentCategory,
    EquipmentItem,
    MaintenanceSchedule,
    ManualReview,
    ManualStatus,
    OMAnalytics,
    OMManualPackage,
    OMManualSummary,
    TrainingSession,
    TrainingStatus,
} from '@/types/om-manuals';
import { useEffect, useState } from 'react';

// Use O&M Manual Packages
export const useOMManualPackages = (params?: {
  projectId?: string;
  status?: ManualStatus;
  contractorId?: string;
  search?: string;
}) => {
  const [packages, setPackages] = useState<OMManualPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await omService.getOMManualPackages(params);
      setPackages(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [params?.projectId, params?.status, params?.contractorId, params?.search]);

  const createPackage = async (data: Partial<OMManualPackage>) => {
    const newPackage = await omService.createOMManualPackage(data);
    setPackages(prev => [newPackage, ...prev]);
    return newPackage;
  };

  const updatePackage = async (id: string, data: Partial<OMManualPackage>) => {
    const updated = await omService.updateOMManualPackage(id, data);
    setPackages(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  };

  const deletePackage = async (id: string) => {
    await omService.deleteOMManualPackage(id);
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const submitPackage = async (id: string) => {
    const submitted = await omService.submitOMManualPackage(id);
    setPackages(prev => prev.map(p => (p.id === id ? submitted : p)));
    return submitted;
  };

  const approvePackage = async (id: string, comments?: string) => {
    const approved = await omService.approveOMManualPackage(id, comments);
    setPackages(prev => prev.map(p => (p.id === id ? approved : p)));
    return approved;
  };

  const rejectPackage = async (id: string, reason: string) => {
    const rejected = await omService.rejectOMManualPackage(id, reason);
    setPackages(prev => prev.map(p => (p.id === id ? rejected : p)));
    return rejected;
  };

  const refresh = fetchPackages;

  return {
    packages,
    loading,
    error,
    refresh,
    createPackage,
    updatePackage,
    deletePackage,
    submitPackage,
    approvePackage,
    rejectPackage,
  };
};

// Use Single O&M Manual Package
export const useOMManualPackage = (id: string) => {
  const [package_, setPackage] = useState<OMManualPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const data = await omService.getOMManualPackage(id);
        setPackage(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackage();
    }
  }, [id]);

  return { package: package_, loading, error };
};

// Use Equipment Items
export const useEquipmentItems = (packageId: string, params?: {
  category?: EquipmentCategory;
  status?: string;
  search?: string;
}) => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await omService.getEquipmentItems(packageId, params);
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (packageId) {
      fetchEquipment();
    }
  }, [packageId, params?.category, params?.status, params?.search]);

  const addEquipment = async (data: Partial<EquipmentItem>) => {
    const newItem = await omService.addEquipmentItem(packageId, data);
    setEquipment(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateEquipment = async (equipmentId: string, data: Partial<EquipmentItem>) => {
    const updated = await omService.updateEquipmentItem(packageId, equipmentId, data);
    setEquipment(prev => prev.map(e => (e.id === equipmentId ? updated : e)));
    return updated;
  };

  const deleteEquipment = async (equipmentId: string) => {
    await omService.deleteEquipmentItem(packageId, equipmentId);
    setEquipment(prev => prev.filter(e => e.id !== equipmentId));
  };

  const refresh = fetchEquipment;

  return {
    equipment,
    loading,
    error,
    refresh,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  };
};

// Use Single Equipment Item
export const useEquipmentItem = (packageId: string, equipmentId: string) => {
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const data = await omService.getEquipmentItem(packageId, equipmentId);
        setEquipment(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (packageId && equipmentId) {
      fetchEquipment();
    }
  }, [packageId, equipmentId]);

  return { equipment, loading, error };
};

// Use Maintenance Schedules
export const useMaintenanceSchedules = (packageId: string, equipmentId: string) => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const data = await omService.getMaintenanceSchedules(packageId, equipmentId);
        setSchedules(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (packageId && equipmentId) {
      fetchSchedules();
    }
  }, [packageId, equipmentId]);

  return { schedules, loading, error };
};

// Use Manual Reviews
export const useManualReviews = (packageId: string) => {
  const [reviews, setReviews] = useState<ManualReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await omService.getManualReviews(packageId);
        setReviews(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchReviews();
    }
  }, [packageId]);

  return { reviews, loading, error };
};

// Use Training Sessions
export const useTrainingSessions = (params?: {
  packageId?: string;
  status?: TrainingStatus;
  startDate?: string;
  endDate?: string;
}) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await omService.getTrainingSessions(params);
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [params?.packageId, params?.status, params?.startDate, params?.endDate]);

  const createSession = async (data: Partial<TrainingSession>) => {
    const newSession = await omService.createTrainingSession(data);
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  };

  const updateSession = async (id: string, data: Partial<TrainingSession>) => {
    const updated = await omService.updateTrainingSession(id, data);
    setSessions(prev => prev.map(s => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteSession = async (id: string) => {
    await omService.deleteTrainingSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const refresh = fetchSessions;

  return {
    sessions,
    loading,
    error,
    refresh,
    createSession,
    updateSession,
    deleteSession,
  };
};

// Use O&M Summary
export const useOMManualSummary = (
  projectId: string,
  startDate?: string,
  endDate?: string
) => {
  const [summary, setSummary] = useState<OMManualSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await omService.getOMManualSummary(projectId, startDate, endDate);
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

// Use O&M Analytics
export const useOMAnalytics = (projectId: string, period: string) => {
  const [analytics, setAnalytics] = useState<OMAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await omService.getOMAnalytics(projectId, period);
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
