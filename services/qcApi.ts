/**
 * Quality Control (QC) API Service
 * 
 * Manages quality inspections, checklists, defects, and approvals.
 * 
 * Features:
 * - Inspection CRUD operations
 * - Checklist templates
 * - Defect tracking
 * - Photo annotations
 * - Approval workflows
 */

import { apiFetch } from './api';

// Types
export interface Inspection {
  id: string;
  inspectionNumber: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  type: 'initial' | 'progress' | 'final' | 'safety' | 'quality';
  status: 'scheduled' | 'in-progress' | 'completed' | 'approved' | 'rejected';
  scheduledDate: string;
  completedDate?: string;
  inspectorId: string;
  inspectorName?: string;
  checklistId?: string;
  checklist?: InspectionChecklist;
  defects?: Defect[];
  photos?: InspectionPhoto[];
  score?: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionChecklist {
  id: string;
  name: string;
  description?: string;
  category: string;
  items: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  required: boolean;
  passed?: boolean;
  notes?: string;
  photoRequired: boolean;
  photos?: string[];
}

export interface Defect {
  id: string;
  inspectionId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  location: string;
  photos?: string[];
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  annotations?: Annotation[];
  uploadedAt: string;
  uploadedBy: string;
}

export interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

export interface InspectionReport {
  inspectionId: string;
  projectName: string;
  inspectionType: string;
  inspectionDate: string;
  inspector: string;
  score: number;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  defectsFound: number;
  criticalDefects: number;
  photos: number;
  status: string;
  pdfUrl?: string;
}

// QC API Service
class QcApiService {
  /**
   * Get all inspections with filters
   */
  async getInspections(filters?: {
    projectId?: string;
    type?: string;
    status?: string;
    inspectorId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ inspections: Inspection[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.inspectorId) params.append('inspectorId', filters.inspectorId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const query = params.toString();
      const response = await apiFetch(`/qc/inspections${query ? `?${query}` : ''}`);
      return response as { inspections: Inspection[]; total: number };
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
      throw error;
    }
  }

  /**
   * Get single inspection by ID
   */
  async getInspection(id: string): Promise<Inspection> {
    try {
      const response = await apiFetch(`/qc/inspections/${id}`);
      return response as Inspection;
    } catch (error) {
      console.error('Failed to fetch inspection:', error);
      throw error;
    }
  }

  /**
   * Create new inspection
   */
  async createInspection(data: Partial<Inspection>): Promise<Inspection> {
    try {
      const response = await apiFetch('/qc/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Inspection;
    } catch (error) {
      console.error('Failed to create inspection:', error);
      throw error;
    }
  }

  /**
   * Update inspection
   */
  async updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection> {
    try {
      const response = await apiFetch(`/qc/inspections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Inspection;
    } catch (error) {
      console.error('Failed to update inspection:', error);
      throw error;
    }
  }

  /**
   * Delete inspection
   */
  async deleteInspection(id: string): Promise<void> {
    try {
      await apiFetch(`/qc/inspections/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete inspection:', error);
      throw error;
    }
  }

  /**
   * Get checklist templates
   */
  async getChecklists(category?: string): Promise<InspectionChecklist[]> {
    try {
      const params = category ? `?category=${category}` : '';
      const response = await apiFetch(`/qc/checklists${params}`);
      return response as InspectionChecklist[];
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
      throw error;
    }
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(
    inspectionId: string,
    itemId: string,
    data: Partial<ChecklistItem>
  ): Promise<ChecklistItem> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as ChecklistItem;
    } catch (error) {
      console.error('Failed to update checklist item:', error);
      throw error;
    }
  }

  /**
   * Get defects
   */
  async getDefects(filters?: {
    inspectionId?: string;
    projectId?: string;
    severity?: string;
    status?: string;
    assignedTo?: string;
  }): Promise<Defect[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.inspectionId) params.append('inspectionId', filters.inspectionId);
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

      const query = params.toString();
      const response = await apiFetch(`/qc/defects${query ? `?${query}` : ''}`);
      return response as Defect[];
    } catch (error) {
      console.error('Failed to fetch defects:', error);
      throw error;
    }
  }

  /**
   * Create defect
   */
  async createDefect(data: Partial<Defect>): Promise<Defect> {
    try {
      const response = await apiFetch('/qc/defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Defect;
    } catch (error) {
      console.error('Failed to create defect:', error);
      throw error;
    }
  }

  /**
   * Update defect
   */
  async updateDefect(id: string, data: Partial<Defect>): Promise<Defect> {
    try {
      const response = await apiFetch(`/qc/defects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Defect;
    } catch (error) {
      console.error('Failed to update defect:', error);
      throw error;
    }
  }

  /**
   * Upload inspection photo
   */
  async uploadPhoto(inspectionId: string, photo: FormData): Promise<InspectionPhoto> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/photos`, {
        method: 'POST',
        body: photo,
      });
      return response as InspectionPhoto;
    } catch (error) {
      console.error('Failed to upload photo:', error);
      throw error;
    }
  }

  /**
   * Add annotation to photo
   */
  async addAnnotation(
    inspectionId: string,
    photoId: string,
    annotation: Omit<Annotation, 'id'>
  ): Promise<Annotation> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/photos/${photoId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation),
      });
      return response as Annotation;
    } catch (error) {
      console.error('Failed to add annotation:', error);
      throw error;
    }
  }

  /**
   * Submit inspection for approval
   */
  async submitForApproval(inspectionId: string): Promise<Inspection> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/submit`, {
        method: 'POST',
      });
      return response as Inspection;
    } catch (error) {
      console.error('Failed to submit inspection:', error);
      throw error;
    }
  }

  /**
   * Approve inspection
   */
  async approveInspection(inspectionId: string, notes?: string): Promise<Inspection> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      return response as Inspection;
    } catch (error) {
      console.error('Failed to approve inspection:', error);
      throw error;
    }
  }

  /**
   * Reject inspection
   */
  async rejectInspection(inspectionId: string, reason: string): Promise<Inspection> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      return response as Inspection;
    } catch (error) {
      console.error('Failed to reject inspection:', error);
      throw error;
    }
  }

  /**
   * Generate inspection report
   */
  async generateReport(inspectionId: string): Promise<InspectionReport> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/report`);
      return response as InspectionReport;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Download inspection report PDF
   */
  async downloadReportPDF(inspectionId: string): Promise<{ url: string }> {
    try {
      const response = await apiFetch(`/qc/inspections/${inspectionId}/report/pdf`);
      return response as { url: string };
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const qcApi = new QcApiService();
