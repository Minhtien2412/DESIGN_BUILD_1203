import { serverFetch } from './enhancedServerClient';

// Basic project & bid typing (can be replaced by generated OpenAPI types later)
export interface ProjectSummary {
  id: string;
  name?: string;
  status?: string;
  [k: string]: any; // allow additional fields until spec codegen introduced
}

export interface BidSummary {
  id: string;
  project_id?: string;
  firm_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  [k: string]: any;
}

interface ApiListResponse<TItem, Extra = Record<string, unknown>> {
  success?: boolean; // our unified style (if backend adopts) or may omit
  data?: any; // some endpoints may return root objects; we normalize below
  items?: TItem[]; // fallback naming possibility
  results?: TItem[]; // another possible naming in APIs
  list?: TItem[]; // just in case
  extra?: Extra;
  [k: string]: any;
}

function extractList<T>(raw: ApiListResponse<T>): T[] {
  if (!raw) return [];
  if (Array.isArray((raw as any).data)) return (raw as any).data as T[]; // data: []
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.results)) return raw.results;
  if (raw.data && Array.isArray(raw.data.items)) return raw.data.items;
  if (Array.isArray(raw.list)) return raw.list;
  return [];
}

// GET /projects  (public list demo)
export async function fetchProjects(token?: string): Promise<ProjectSummary[]> {
  const res = await serverFetch<ApiListResponse<ProjectSummary>>('/projects', { method: 'GET', token });
  return extractList<ProjectSummary>(res);
}

// GET /projects/{id}/bids  (list bids of a project; may require auth depending on backend rules)
export async function fetchProjectBids(projectId: string, token: string): Promise<BidSummary[]> {
  const res = await serverFetch<ApiListResponse<BidSummary>>(`/projects/${projectId}/bids`, { method: 'GET', token });
  return extractList<BidSummary>(res);
}

// POST /bids  (create a bid - guessing body shape until spec codegen; adjust later)
export async function createBid(params: { project_id: string; amount: number; currency?: string; note?: string }, token: string) {
  const body = JSON.stringify(params);
  const res = await serverFetch<any>('/bids', { method: 'POST', token, body });
  return res;
}
