import type {
    AddDefectCommentRequest,
    ChecklistResponse,
    ChecklistsResponse,
    ComplianceReportResponse,
    CreateChecklistRequest,
    CreateDefectRequest,
    CreateInspectionRequest,
    DefectResponse,
    DefectsResponse,
    GenerateComplianceReportRequest,
    GetChecklistsParams,
    GetDefectsParams,
    GetInspectionsParams,
    GetQualityMetricsParams,
    InspectionResponse,
    InspectionsResponse,
    QualityMetricsResponse,
    UpdateChecklistItemRequest,
    UpdateChecklistRequest,
    UpdateDefectRequest,
    UpdateInspectionRequest
} from '@/types/qc-qa';
import { apiFetch } from './api';

const QC_BASE = '/qc-qa';

// ============ Checklists ============

/**
 * Get all checklists for a project
 */
export async function getChecklists(
  params: GetChecklistsParams
): Promise<ChecklistsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', params.projectId);
  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  return apiFetch<ChecklistsResponse>(
    `${QC_BASE}/checklists?${queryParams.toString()}`
  );
}

/**
 * Get a single checklist by ID
 */
export async function getChecklistById(id: string): Promise<ChecklistResponse> {
  return apiFetch<ChecklistResponse>(`${QC_BASE}/checklists/${id}`);
}

/**
 * Create a new checklist
 */
export async function createChecklist(
  data: CreateChecklistRequest
): Promise<ChecklistResponse> {
  return apiFetch<ChecklistResponse>(`${QC_BASE}/checklists`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update a checklist
 */
export async function updateChecklist(
  id: string,
  data: UpdateChecklistRequest
): Promise<ChecklistResponse> {
  return apiFetch<ChecklistResponse>(`${QC_BASE}/checklists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a checklist
 */
export async function deleteChecklist(id: string): Promise<void> {
  return apiFetch<void>(`${QC_BASE}/checklists/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Update a checklist item
 */
export async function updateChecklistItem(
  checklistId: string,
  itemId: string,
  data: UpdateChecklistItemRequest
): Promise<ChecklistResponse> {
  return apiFetch<ChecklistResponse>(
    `${QC_BASE}/checklists/${checklistId}/items/${itemId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

/**
 * Submit checklist for approval
 */
export async function submitChecklistForApproval(
  id: string
): Promise<ChecklistResponse> {
  return apiFetch<ChecklistResponse>(`${QC_BASE}/checklists/${id}/submit`, {
    method: 'POST',
  });
}

/**
 * Approve a checklist
 */
export async function approveChecklist(id: string): Promise<ChecklistResponse> {
  return apiFetch<ChecklistResponse>(`${QC_BASE}/checklists/${id}/approve`, {
    method: 'POST',
  });
}

// ============ Inspections ============

/**
 * Get all inspections
 */
export async function getInspections(
  params: GetInspectionsParams
): Promise<InspectionsResponse> {
  const queryParams = new URLSearchParams();
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.checklistId) queryParams.append('checklistId', params.checklistId);
  if (params.inspectorId) queryParams.append('inspectorId', params.inspectorId);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  return apiFetch<InspectionsResponse>(
    `${QC_BASE}/inspections?${queryParams.toString()}`
  );
}

/**
 * Get a single inspection by ID
 */
export async function getInspectionById(
  id: string
): Promise<InspectionResponse> {
  return apiFetch<InspectionResponse>(`${QC_BASE}/inspections/${id}`);
}

/**
 * Create a new inspection
 */
export async function createInspection(
  data: CreateInspectionRequest
): Promise<InspectionResponse> {
  return apiFetch<InspectionResponse>(`${QC_BASE}/inspections`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an inspection
 */
export async function updateInspection(
  id: string,
  data: UpdateInspectionRequest
): Promise<InspectionResponse> {
  return apiFetch<InspectionResponse>(`${QC_BASE}/inspections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an inspection
 */
export async function deleteInspection(id: string): Promise<void> {
  return apiFetch<void>(`${QC_BASE}/inspections/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Complete an inspection
 */
export async function completeInspection(
  id: string
): Promise<InspectionResponse> {
  return apiFetch<InspectionResponse>(`${QC_BASE}/inspections/${id}/complete`, {
    method: 'POST',
  });
}

// ============ Defects ============

/**
 * Get all defects for a project
 */
export async function getDefects(
  params: GetDefectsParams
): Promise<DefectsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', params.projectId);
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.status) queryParams.append('status', params.status);
  if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  return apiFetch<DefectsResponse>(
    `${QC_BASE}/defects?${queryParams.toString()}`
  );
}

/**
 * Get a single defect by ID
 */
export async function getDefectById(id: string): Promise<DefectResponse> {
  return apiFetch<DefectResponse>(`${QC_BASE}/defects/${id}`);
}

/**
 * Create a new defect
 */
export async function createDefect(
  data: CreateDefectRequest
): Promise<DefectResponse> {
  return apiFetch<DefectResponse>(`${QC_BASE}/defects`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update a defect
 */
export async function updateDefect(
  id: string,
  data: UpdateDefectRequest
): Promise<DefectResponse> {
  return apiFetch<DefectResponse>(`${QC_BASE}/defects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a defect
 */
export async function deleteDefect(id: string): Promise<void> {
  return apiFetch<void>(`${QC_BASE}/defects/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Add a comment to a defect
 */
export async function addDefectComment(
  id: string,
  data: AddDefectCommentRequest
): Promise<DefectResponse> {
  return apiFetch<DefectResponse>(`${QC_BASE}/defects/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Resolve a defect
 */
export async function resolveDefect(
  id: string,
  resolution: string
): Promise<DefectResponse> {
  return apiFetch<DefectResponse>(`${QC_BASE}/defects/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });
}

/**
 * Verify a defect resolution
 */
export async function verifyDefect(id: string): Promise<DefectResponse> {
  return apiFetch<DefectResponse>(`${QC_BASE}/defects/${id}/verify`, {
    method: 'POST',
  });
}

/**
 * Close a defect
 */
export async function closeDefect(id: string): Promise<DefectResponse> {
  return apiFetch<DefectResponse>(`${QC_BASE}/defects/${id}/close`, {
    method: 'POST',
  });
}

// ============ Reports & Analytics ============

/**
 * Generate compliance report
 */
export async function generateComplianceReport(
  data: GenerateComplianceReportRequest
): Promise<ComplianceReportResponse> {
  return apiFetch<ComplianceReportResponse>(`${QC_BASE}/reports/compliance`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get compliance report by ID
 */
export async function getComplianceReportById(
  id: string
): Promise<ComplianceReportResponse> {
  return apiFetch<ComplianceReportResponse>(`${QC_BASE}/reports/compliance/${id}`);
}

/**
 * Get quality metrics for a project
 */
export async function getQualityMetrics(
  params: GetQualityMetricsParams
): Promise<QualityMetricsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', params.projectId);
  if (params.startDate) {
    queryParams.append('startDate', params.startDate.toISOString());
  }
  if (params.endDate) {
    queryParams.append('endDate', params.endDate.toISOString());
  }

  return apiFetch<QualityMetricsResponse>(
    `${QC_BASE}/metrics?${queryParams.toString()}`
  );
}

/**
 * Download compliance report PDF
 */
export async function downloadComplianceReportPDF(
  reportId: string
): Promise<Blob> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}${QC_BASE}/reports/compliance/${reportId}/pdf`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to download PDF');
  }

  return response.blob();
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // This should be imported from your auth context/storage
  // For now, placeholder
  return '';
}
