/**
 * Quality Control Service
 * Handles QC inspection, checklist, and bug tracking endpoints
 * 
 * Endpoints:
 * Categories:
 * - POST /qc/categories - Create QC category
 * - GET /qc/categories - List categories
 * - GET /qc/categories/{id} - Get category
 * - PATCH /qc/categories/{id} - Update category
 * - DELETE /qc/categories/{id} - Delete category
 * 
 * Checklists:
 * - POST /qc/checklists - Create checklist
 * - GET /qc/checklists - List checklists
 * - GET /qc/checklists/{id} - Get checklist
 * - PATCH /qc/checklists/{id} - Update checklist
 * - DELETE /qc/checklists/{id} - Delete checklist
 * 
 * Inspections:
 * - POST /qc/inspections - Create inspection
 * - GET /qc/inspections - List inspections
 * - GET /qc/inspections/{id} - Get inspection
 * - PATCH /qc/inspections/{id} - Update inspection
 * - DELETE /qc/inspections/{id} - Delete inspection
 * - PATCH /qc/inspections/{id}/complete - Complete inspection
 * - PATCH /qc/inspection-items/{id} - Update inspection item
 * 
 * Bugs:
 * - POST /qc/bugs - Report bug
 * - GET /qc/projects/{projectId}/bugs - List bugs
 * - GET /qc/bugs/{id} - Get bug
 * - PATCH /qc/bugs/{id} - Update bug
 * - DELETE /qc/bugs/{id} - Delete bug
 * 
 * Reports:
 * - GET /qc/projects/{projectId}/report - QC report
 * - GET /qc/phases/{phaseId}/qc-stats - Phase QC stats
 */

import { apiClient } from './client';
import type {
    Bug,
    CreateBugData,
    CreateQCInspectionData,
    QCCategory,
    QCChecklist,
    QCInspection,
    QCReport,
    UpdateBugData,
    UpdateQCInspectionData,
    UpdateQCInspectionItemData,
} from './types';

export const qcService = {
  // ==================== CATEGORIES ====================
  
  categories: {
    list: async (): Promise<QCCategory[]> => {
      console.log('[QCService] 📋 Fetching QC categories');
      const response = await apiClient.get<QCCategory[]>('/qc/categories');
      console.log('[QCService] ✅ Categories fetched:', response.length);
      return response;
    },

    getById: async (id: number): Promise<QCCategory> => {
      console.log('[QCService] 📋 Fetching category:', id);
      const response = await apiClient.get<QCCategory>(`/qc/categories/${id}`);
      console.log('[QCService] ✅ Category fetched:', response.name);
      return response;
    },

    create: async (data: Partial<QCCategory>): Promise<QCCategory> => {
      console.log('[QCService] ➕ Creating category:', data.name);
      const response = await apiClient.post<QCCategory>('/qc/categories', data);
      console.log('[QCService] ✅ Category created:', response.id);
      return response;
    },

    update: async (id: number, data: Partial<QCCategory>): Promise<QCCategory> => {
      console.log('[QCService] ✏️ Updating category:', id);
      const response = await apiClient.patch<QCCategory>(`/qc/categories/${id}`, data);
      console.log('[QCService] ✅ Category updated');
      return response;
    },

    delete: async (id: number): Promise<void> => {
      console.log('[QCService] 🗑️ Deleting category:', id);
      await apiClient.delete(`/qc/categories/${id}`);
      console.log('[QCService] ✅ Category deleted');
    },
  },

  // ==================== CHECKLISTS ====================

  checklists: {
    list: async (categoryId?: number): Promise<QCChecklist[]> => {
      console.log('[QCService] 📋 Fetching checklists');
      const params = categoryId ? { categoryId: String(categoryId) } : undefined;
      const response = await apiClient.get<QCChecklist[]>('/qc/checklists', params);
      console.log('[QCService] ✅ Checklists fetched:', response.length);
      return response;
    },

    getById: async (id: number): Promise<QCChecklist> => {
      console.log('[QCService] 📋 Fetching checklist:', id);
      const response = await apiClient.get<QCChecklist>(`/qc/checklists/${id}`);
      console.log('[QCService] ✅ Checklist fetched:', response.name);
      return response;
    },

    create: async (data: Partial<QCChecklist>): Promise<QCChecklist> => {
      console.log('[QCService] ➕ Creating checklist:', data.name);
      const response = await apiClient.post<QCChecklist>('/qc/checklists', data);
      console.log('[QCService] ✅ Checklist created:', response.id);
      return response;
    },

    update: async (id: number, data: Partial<QCChecklist>): Promise<QCChecklist> => {
      console.log('[QCService] ✏️ Updating checklist:', id);
      const response = await apiClient.patch<QCChecklist>(`/qc/checklists/${id}`, data);
      console.log('[QCService] ✅ Checklist updated');
      return response;
    },

    delete: async (id: number): Promise<void> => {
      console.log('[QCService] 🗑️ Deleting checklist:', id);
      await apiClient.delete(`/qc/checklists/${id}`);
      console.log('[QCService] ✅ Checklist deleted');
    },
  },

  // ==================== INSPECTIONS ====================

  inspections: {
    list: async (projectId?: number): Promise<QCInspection[]> => {
      console.log('[QCService] 🔍 Fetching inspections');
      const params = projectId ? { projectId: String(projectId) } : undefined;
      const response = await apiClient.get<QCInspection[]>('/qc/inspections', params);
      console.log('[QCService] ✅ Inspections fetched:', response.length);
      return response;
    },

    getById: async (id: number): Promise<QCInspection> => {
      console.log('[QCService] 🔍 Fetching inspection:', id);
      const response = await apiClient.get<QCInspection>(`/qc/inspections/${id}`);
      console.log('[QCService] ✅ Inspection fetched');
      return response;
    },

    create: async (data: CreateQCInspectionData): Promise<QCInspection> => {
      console.log('[QCService] ➕ Creating inspection for project:', data.projectId);
      const response = await apiClient.post<QCInspection>('/qc/inspections', data);
      console.log('[QCService] ✅ Inspection created:', response.id);
      return response;
    },

    update: async (id: number, data: UpdateQCInspectionData): Promise<QCInspection> => {
      console.log('[QCService] ✏️ Updating inspection:', id);
      const response = await apiClient.patch<QCInspection>(`/qc/inspections/${id}`, data);
      console.log('[QCService] ✅ Inspection updated');
      return response;
    },

    delete: async (id: number): Promise<void> => {
      console.log('[QCService] 🗑️ Deleting inspection:', id);
      await apiClient.delete(`/qc/inspections/${id}`);
      console.log('[QCService] ✅ Inspection deleted');
    },

    complete: async (id: number, notes?: string): Promise<QCInspection> => {
      console.log('[QCService] ✅ Completing inspection:', id);
      const response = await apiClient.patch<QCInspection>(`/qc/inspections/${id}/complete`, { notes });
      console.log('[QCService] ✅ Inspection completed');
      return response;
    },

    updateItem: async (itemId: number, data: UpdateQCInspectionItemData): Promise<any> => {
      console.log('[QCService] ✏️ Updating inspection item:', itemId);
      const response = await apiClient.patch(`/qc/inspection-items/${itemId}`, data);
      console.log('[QCService] ✅ Inspection item updated');
      return response;
    },
  },

  // ==================== BUGS ====================

  bugs: {
    listByProject: async (projectId: number): Promise<Bug[]> => {
      console.log('[QCService] 🐛 Fetching bugs for project:', projectId);
      const response = await apiClient.get<Bug[]>(`/qc/projects/${projectId}/bugs`);
      console.log('[QCService] ✅ Bugs fetched:', response.length);
      return response;
    },

    getById: async (id: number): Promise<Bug> => {
      console.log('[QCService] 🐛 Fetching bug:', id);
      const response = await apiClient.get<Bug>(`/qc/bugs/${id}`);
      console.log('[QCService] ✅ Bug fetched:', response.title);
      return response;
    },

    create: async (data: CreateBugData): Promise<Bug> => {
      console.log('[QCService] ➕ Creating bug:', data.title);
      const response = await apiClient.post<Bug>('/qc/bugs', data);
      console.log('[QCService] ✅ Bug created:', response.id);
      return response;
    },

    update: async (id: number, data: UpdateBugData): Promise<Bug> => {
      console.log('[QCService] ✏️ Updating bug:', id);
      const response = await apiClient.patch<Bug>(`/qc/bugs/${id}`, data);
      console.log('[QCService] ✅ Bug updated');
      return response;
    },

    delete: async (id: number): Promise<void> => {
      console.log('[QCService] 🗑️ Deleting bug:', id);
      await apiClient.delete(`/qc/bugs/${id}`);
      console.log('[QCService] ✅ Bug deleted');
    },
  },

  // ==================== REPORTS ====================

  reports: {
    getProjectReport: async (projectId: number): Promise<QCReport> => {
      console.log('[QCService] 📊 Fetching QC report for project:', projectId);
      const response = await apiClient.get<QCReport>(`/qc/projects/${projectId}/report`);
      console.log('[QCService] ✅ QC report fetched');
      return response;
    },

    getPhaseStats: async (phaseId: number): Promise<any> => {
      console.log('[QCService] 📊 Fetching QC stats for phase:', phaseId);
      const response = await apiClient.get(`/qc/phases/${phaseId}/qc-stats`);
      console.log('[QCService] ✅ Phase QC stats fetched');
      return response;
    },
  },
};

export default qcService;
