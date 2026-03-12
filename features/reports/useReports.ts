import type { CreateReportInput, ReportDetail, ReportSummary } from '@/services/serverReports';
import { createReport, deleteReport, getReport, listReports, updateReportStatus } from '@/services/serverReports';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseReportsState {
  reports: ReportSummary[];
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  selected?: ReportDetail | null;
  creating: boolean;
}

export interface UseReportsApi {
  reload(force?: boolean): Promise<void>;
  select(id: string): Promise<void>;
  create(input: CreateReportInput): Promise<ReportDetail | null>;
  remove(id: string): Promise<boolean>;
  updateStatus(id: string, status: ReportSummary['status']): Promise<boolean>;
}

export function useReports(): UseReportsState & UseReportsApi {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReportDetail | null>(null);
  const [creating, setCreating] = useState(false);
  const mounted = useRef(true);

  const safe = <T,>(fn: () => Promise<T>) => fn().catch(e => { if (__DEV__) console.warn('[useReports]', e); throw e; });

  const reload = useCallback(async (force = false) => {
    setRefreshing(true);
    try {
      const data = await listReports({ force });
      if (mounted.current) setReports(data);
    } catch (e: any) {
      if (mounted.current) setError(e?.message || 'Load thất bại');
    } finally {
      if (mounted.current) setRefreshing(false);
      if (mounted.current) setLoading(false);
    }
  }, []);

  const select = useCallback(async (id: string) => {
    try {
      const detail = await getReport(id);
      if (mounted.current) setSelected(detail);
    } catch {}
  }, []);

  const create = useCallback(async (input: CreateReportInput) => {
    setCreating(true);
    try {
      const detail = await createReport(input);
      await reload(true);
      return detail;
    } catch (e: any) {
      if (mounted.current) setError(e?.message || 'Tạo thất bại');
      return null;
    } finally {
      if (mounted.current) setCreating(false);
    }
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    try {
      const ok = await deleteReport(id);
      if (ok) await reload(true);
      return ok;
    } catch { return false; }
  }, [reload]);

  const updateStatus = useCallback(async (id: string, status: ReportSummary['status']) => {
    try {
      const ok = await updateReportStatus(id, status);
      if (ok) await reload(true);
      return ok;
    } catch { return false; }
  }, [reload]);

  useEffect(() => { mounted.current = true; reload(); return () => { mounted.current = false; }; }, [reload]);

  return { reports, loading, error, refreshing, selected, creating, reload, select, create, remove, updateStatus };
}
