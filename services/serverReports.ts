import { ApiError } from '@/services/api';
import { deleteReq, getJson, postJson, putJson } from '@/services/backendClient';

/**
 * Example domain service: Reports
 * Demonstrates best practices for adding new backend methods:
 *  - Strong TypeScript types
 *  - Thin wrapper around serverFetch (inherits retry, API key logic, silent mode)
 *  - Local in‑memory cache with TTL
 *  - Graceful fallbacks when SILENT_NETWORK_ERRORS flag active
 */

export interface ReportSummary {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  createdAt: string; // ISO
  updatedAt?: string; // ISO
}

export interface ReportDetail extends ReportSummary {
  description?: string;
  fileUrl?: string;
  generatedAt?: string;
  errorMessage?: string;
}

export interface CreateReportInput {
  title: string;
  description?: string;
  template?: string;
}

interface ListReportsResponse { reports?: ReportSummary[]; data?: { reports?: ReportSummary[] }; }
interface GetReportResponse { report?: ReportDetail; data?: { report?: ReportDetail }; }

// --- Simple in-memory cache (per session) ---
let _cache: ReportSummary[] | null = null;
let _cacheAt = 0;
const CACHE_TTL_MS = 15_000; // 15s

function now() { return Date.now(); }
function validCache() { return _cache && (now() - _cacheAt) < CACHE_TTL_MS; }

// Normalize list response
function unpackList(raw: any): ReportSummary[] {
  if (!raw) return [];
  if (Array.isArray(raw.reports)) return raw.reports as ReportSummary[];
  if (raw.data?.reports) return raw.data.reports as ReportSummary[];
  return [];
}

function unpackDetail(raw: any): ReportDetail | null {
  if (!raw) return null;
  return (raw.report || raw.data?.report || null) as ReportDetail | null;
}

export async function listReports(opts?: { force?: boolean }): Promise<ReportSummary[]> {
  if (!opts?.force && validCache()) return _cache as ReportSummary[];
  try {
    const res = await getJson<ListReportsResponse>('/reports', { retry: 1 });
    if (!res.ok) {
      if (res.status === 404) { _cache = []; _cacheAt = now(); return []; }
      return _cache || [];
    }
    const list = unpackList(res.data);
    _cache = list; _cacheAt = now();
    return list;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) { _cache = []; _cacheAt = now(); return []; }
    if (__DEV__) console.warn('[listReports] error', (e as any)?.message || e);
    return _cache || [];
  }
}

export async function getReport(id: string): Promise<ReportDetail | null> {
  try {
    const res = await getJson<GetReportResponse>(`/reports/${id}`, { retry: 1 });
    if (!res.ok) {
      if (res.status === 404) return null;
      return null;
    }
    return unpackDetail(res.data);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    if (__DEV__) console.warn('[getReport] error', (e as any)?.message || e);
    return null;
  }
}

export async function createReport(payload: CreateReportInput): Promise<ReportDetail | null> {
  const res = await postJson<any>('/reports', payload, { retry: 1 });
  if (!res.ok) return null;
  const detail = unpackDetail(res.data);
  _cache = null; _cacheAt = 0; // invalidate cache
  return detail;
}

export async function deleteReport(id: string): Promise<boolean> {
  const res = await deleteReq(`/reports/${id}`, { retry: 1 });
  if (!res.ok) return false;
  if (_cache) _cache = _cache.filter(r => r.id !== id);
  return true;
}

export async function updateReportStatus(id: string, status: ReportSummary['status']): Promise<boolean> {
  const res = await putJson(`/reports/${id}/status`, { status }, { retry: 1 });
  if (!res.ok) return false;
  if (_cache) _cache = _cache.map(r => r.id === id ? { ...r, status } : r);
  return true;
}

// Helper to seed mock when backend not ready (call manually in dev if needed)
export function seedMockReports(): ReportSummary[] {
  const mock: ReportSummary[] = [
    { id: 'r1', title: 'Báo cáo vật tư', status: 'done', createdAt: new Date().toISOString() },
    { id: 'r2', title: 'Kiểm tra tiến độ', status: 'processing', createdAt: new Date().toISOString() },
  ];
  _cache = mock; _cacheAt = now();
  return mock;
}
