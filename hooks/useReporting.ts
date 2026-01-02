/**
 * Reporting & Analytics Hooks
 * State management for reports, dashboards, and analytics
 */

import {
    createDashboard,
    createReport,
    createReportSchedule,
    deleteDashboard,
    deleteReport,
    deleteReportSchedule,
    generateReport,
    getDashboard,
    getDashboards,
    getKPIs,
    getProjectAnalytics,
    getReport,
    getReports,
    getReportSchedules,
    getReportTemplates,
    refreshKPI,
    runAnalytics,
    updateDashboard,
    updateReport,
    updateReportSchedule
} from '@/services/reporting';
import type {
    AnalyticsResult,
    CreateDashboardParams,
    CreateReportParams,
    CreateScheduleParams,
    Dashboard,
    GetDashboardsParams,
    GetReportsParams,
    KPI,
    Report,
    ReportSchedule,
    ReportTemplate,
    RunAnalyticsParams,
    UpdateDashboardParams,
    UpdateReportParams,
    UpdateScheduleParams,
} from '@/types/reporting';
import { useEffect, useState } from 'react';

// Hook: Manage reports with filters
export function useReports(initialParams: GetReportsParams) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports(params);
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [params]);

  const create = async (createParams: CreateReportParams) => {
    try {
      const newReport = await createReport(createParams);
      setReports((prev) => [newReport, ...prev]);
      return newReport;
    } catch (err: any) {
      setError(err.message || 'Failed to create report');
      throw err;
    }
  };

  const update = async (updateParams: UpdateReportParams) => {
    const optimisticReports = reports.map((r) =>
      r.id === updateParams.id ? { ...r, ...updateParams } : r
    );
    setReports(optimisticReports);

    try {
      const updatedReport = await updateReport(updateParams);
      setReports((prev) => prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)));
      return updatedReport;
    } catch (err: any) {
      setError(err.message || 'Failed to update report');
      fetchReports();
      throw err;
    }
  };

  const remove = async (id: string) => {
    const optimisticReports = reports.filter((r) => r.id !== id);
    setReports(optimisticReports);

    try {
      await deleteReport(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
      fetchReports();
      throw err;
    }
  };

  const generate = async (id: string) => {
    try {
      const generatedReport = await generateReport(id);
      setReports((prev) => prev.map((r) => (r.id === generatedReport.id ? generatedReport : r)));
      return generatedReport;
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
      throw err;
    }
  };

  return {
    reports,
    loading,
    error,
    params,
    setParams,
    refresh: fetchReports,
    create,
    update,
    remove,
    generate,
  };
}

// Hook: Single report
export function useReport(id: string | null) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setReport(null);
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getReport(id);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  return { report, loading, error };
}

// Hook: Report templates
export function useReportTemplates(projectId?: string) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReportTemplates(projectId);
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [projectId]);

  return { templates, loading, error, refresh: fetchTemplates };
}

// Hook: Dashboards
export function useDashboards(initialParams: GetDashboardsParams) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboards(params);
      setDashboards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, [params]);

  const create = async (createParams: CreateDashboardParams) => {
    try {
      const newDashboard = await createDashboard(createParams);
      setDashboards((prev) => [newDashboard, ...prev]);
      return newDashboard;
    } catch (err: any) {
      setError(err.message || 'Failed to create dashboard');
      throw err;
    }
  };

  const update = async (updateParams: UpdateDashboardParams) => {
    const optimisticDashboards = dashboards.map((d) =>
      d.id === updateParams.id ? { ...d, ...updateParams } : d
    );
    setDashboards(optimisticDashboards);

    try {
      const updatedDashboard = await updateDashboard(updateParams);
      setDashboards((prev) => prev.map((d) => (d.id === updatedDashboard.id ? updatedDashboard : d)));
      return updatedDashboard;
    } catch (err: any) {
      setError(err.message || 'Failed to update dashboard');
      fetchDashboards();
      throw err;
    }
  };

  const remove = async (id: string) => {
    const optimisticDashboards = dashboards.filter((d) => d.id !== id);
    setDashboards(optimisticDashboards);

    try {
      await deleteDashboard(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete dashboard');
      fetchDashboards();
      throw err;
    }
  };

  return {
    dashboards,
    loading,
    error,
    params,
    setParams,
    refresh: fetchDashboards,
    create,
    update,
    remove,
  };
}

// Hook: Single dashboard
export function useDashboard(id: string | null) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setDashboard(null);
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboard(id);
        setDashboard(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  return { dashboard, loading, error };
}

// Hook: KPIs
export function useKPIs(projectId?: string) {
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIs(projectId);
      setKPIs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [projectId]);

  const refresh = async (id: string) => {
    try {
      const refreshedKPI = await refreshKPI(id);
      setKPIs((prev) => prev.map((k) => (k.id === refreshedKPI.id ? refreshedKPI : k)));
      return refreshedKPI;
    } catch (err: any) {
      setError(err.message || 'Failed to refresh KPI');
      throw err;
    }
  };

  return { kpis, loading, error, refresh: fetchKPIs, refreshKPI: refresh };
}

// Hook: Project analytics
export function useProjectAnalytics(projectId: string, period: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectAnalytics(projectId, period);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [projectId, period]);

  return { analytics, loading, error, refresh: fetchAnalytics };
}

// Hook: Analytics query
export function useAnalyticsQuery(queryParams: RunAnalyticsParams | null) {
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async (params: RunAnalyticsParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await runAnalytics(params);
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParams) {
      executeQuery(queryParams);
    }
  }, [queryParams]);

  return { result, loading, error, execute: executeQuery };
}

// Hook: Report schedules
export function useReportSchedules(projectId?: string) {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReportSchedules(projectId);
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [projectId]);

  const create = async (createParams: CreateScheduleParams) => {
    try {
      const newSchedule = await createReportSchedule(createParams);
      setSchedules((prev) => [newSchedule, ...prev]);
      return newSchedule;
    } catch (err: any) {
      setError(err.message || 'Failed to create schedule');
      throw err;
    }
  };

  const update = async (updateParams: UpdateScheduleParams) => {
    const optimisticSchedules = schedules.map((s) =>
      s.id === updateParams.id ? { ...s, ...updateParams } : s
    );
    setSchedules(optimisticSchedules);

    try {
      const updatedSchedule = await updateReportSchedule(updateParams);
      setSchedules((prev) => prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)));
      return updatedSchedule;
    } catch (err: any) {
      setError(err.message || 'Failed to update schedule');
      fetchSchedules();
      throw err;
    }
  };

  const remove = async (id: string) => {
    const optimisticSchedules = schedules.filter((s) => s.id !== id);
    setSchedules(optimisticSchedules);

    try {
      await deleteReportSchedule(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete schedule');
      fetchSchedules();
      throw err;
    }
  };

  return {
    schedules,
    loading,
    error,
    refresh: fetchSchedules,
    create,
    update,
    remove,
  };
}
