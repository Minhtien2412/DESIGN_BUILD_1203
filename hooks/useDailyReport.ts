/**
 * Daily Report Hooks
 * State management for construction daily reports
 */

import * as dailyReportService from '@/services/daily-report';
import type {
    DailyReport,
    DailyReportAnalytics,
    DailyReportStatus,
    DailyReportSummary,
    DailyReportTemplate,
    WeatherCondition,
} from '@/types/daily-report';
import { useEffect, useState } from 'react';

// Use Daily Reports
export const useDailyReports = (params?: {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status?: DailyReportStatus;
  submittedById?: string;
  weatherCondition?: WeatherCondition;
  search?: string;
}) => {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDailyReports = async () => {
    try {
      setLoading(true);
      const data = await dailyReportService.getDailyReports(params);
      setDailyReports(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReports();
  }, [
    params?.projectId,
    params?.startDate,
    params?.endDate,
    params?.status,
    params?.submittedById,
    params?.weatherCondition,
    params?.search,
  ]);

  const createDailyReport = async (data: Partial<DailyReport>) => {
    const newReport = await dailyReportService.createDailyReport(data);
    setDailyReports(prev => [newReport, ...prev]);
    return newReport;
  };

  const updateDailyReport = async (id: string, data: Partial<DailyReport>) => {
    const updated = await dailyReportService.updateDailyReport(id, data);
    setDailyReports(prev => prev.map(r => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteDailyReport = async (id: string) => {
    await dailyReportService.deleteDailyReport(id);
    setDailyReports(prev => prev.filter(r => r.id !== id));
  };

  const submitDailyReport = async (id: string, notes?: string) => {
    const submitted = await dailyReportService.submitDailyReport(id, notes);
    setDailyReports(prev => prev.map(r => (r.id === id ? submitted : r)));
    return submitted;
  };

  const reviewDailyReport = async (
    id: string,
    data: {
      approved: boolean;
      comments?: string;
      requestRevision?: boolean;
      revisionNotes?: string;
    }
  ) => {
    const reviewed = await dailyReportService.reviewDailyReport(id, data);
    setDailyReports(prev => prev.map(r => (r.id === id ? reviewed : r)));
    return reviewed;
  };

  const approveDailyReport = async (id: string, comments?: string) => {
    const approved = await dailyReportService.approveDailyReport(id, comments);
    setDailyReports(prev => prev.map(r => (r.id === id ? approved : r)));
    return approved;
  };

  const rejectDailyReport = async (id: string, reason: string) => {
    const rejected = await dailyReportService.rejectDailyReport(id, reason);
    setDailyReports(prev => prev.map(r => (r.id === id ? rejected : r)));
    return rejected;
  };

  const addWorkActivity = async (reportId: string, activity: any) => {
    const updated = await dailyReportService.addWorkActivity(reportId, activity);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const addManpowerRecord = async (reportId: string, manpower: any) => {
    const updated = await dailyReportService.addManpowerRecord(reportId, manpower);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const addEquipmentRecord = async (reportId: string, equipment: any) => {
    const updated = await dailyReportService.addEquipmentRecord(reportId, equipment);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const addMaterialDelivery = async (reportId: string, material: any) => {
    const updated = await dailyReportService.addMaterialDelivery(reportId, material);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const addProgressUpdate = async (reportId: string, progress: any) => {
    const updated = await dailyReportService.addProgressUpdate(reportId, progress);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const addSafetyIncident = async (reportId: string, incident: any) => {
    const updated = await dailyReportService.addSafetyIncident(reportId, incident);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const addIssue = async (reportId: string, issue: any) => {
    const updated = await dailyReportService.addIssue(reportId, issue);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const addDelay = async (reportId: string, delay: any) => {
    const updated = await dailyReportService.addDelay(reportId, delay);
    setDailyReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
    return updated;
  };

  const refresh = fetchDailyReports;

  return {
    dailyReports,
    loading,
    error,
    refresh,
    createDailyReport,
    updateDailyReport,
    deleteDailyReport,
    submitDailyReport,
    reviewDailyReport,
    approveDailyReport,
    rejectDailyReport,
    addWorkActivity,
    addManpowerRecord,
    addEquipmentRecord,
    addMaterialDelivery,
    addProgressUpdate,
    addSafetyIncident,
    addIssue,
    addDelay,
  };
};

// Use Single Daily Report
export const useDailyReport = (id: string) => {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDailyReport = async () => {
      try {
        setLoading(true);
        const data = await dailyReportService.getDailyReport(id);
        setDailyReport(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDailyReport();
    }
  }, [id]);

  return { dailyReport, loading, error };
};

// Use Daily Report by Date
export const useDailyReportByDate = (projectId: string, date: string) => {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDailyReport = async () => {
      try {
        setLoading(true);
        const data = await dailyReportService.getDailyReportByDate(projectId, date);
        setDailyReport(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && date) {
      fetchDailyReport();
    }
  }, [projectId, date]);

  return { dailyReport, loading, error };
};

// Use Daily Report Templates
export const useDailyReportTemplates = (projectId?: string) => {
  const [templates, setTemplates] = useState<DailyReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await dailyReportService.getDailyReportTemplates(projectId);
        setTemplates(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [projectId]);

  return { templates, loading, error };
};

// Use Daily Report Summary
export const useDailyReportSummary = (
  projectId: string,
  startDate?: string,
  endDate?: string
) => {
  const [summary, setSummary] = useState<DailyReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await dailyReportService.getDailyReportSummary(
          projectId,
          startDate,
          endDate
        );
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

// Use Daily Report Analytics
export const useDailyReportAnalytics = (projectId: string, period: string) => {
  const [analytics, setAnalytics] = useState<DailyReportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await dailyReportService.getDailyReportAnalytics(projectId, period);
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
