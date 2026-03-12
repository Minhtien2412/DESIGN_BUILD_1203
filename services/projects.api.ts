/**
 * Projects API Service
 * Handles all project-related API calls
 */

import api from './api-client';

// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  progress: number;
  location: {
    address: string;
    ward: string;
    district: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  area: number;
  contractor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  owner: {
    id: string;
    name: string;
    phone: string;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineNode {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  startDate: string;
  endDate?: string;
  completionDate?: string;
  progress: number;
  checklist: {
    id: string;
    task: string;
    completed: boolean;
  }[];
}

export interface PaymentPhase {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
  videoUrl?: string;
  images: string[];
  checklist: {
    id: string;
    item: string;
    verified: boolean;
  }[];
}

export interface ProcessStep {
  id: string;
  code: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
  startDate: string;
  endDate?: string;
  progress: number;
  dependencies: string[];
  assignedTo?: {
    id: string;
    name: string;
  };
}

export interface Quotation {
  id: string;
  contractorId: string;
  contractorName: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  totalAmount: number;
  completionTime: number; // days
  warranty: number; // months
  breakdown: {
    category: string;
    amount: number;
    items: {
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
    }[];
  }[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

/**
 * Projects API
 */
export const projectsApi = {
  // Get all projects
  getAll: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ projects: Project[]; total: number }> => {
    const queryParams = new URLSearchParams(filters as any).toString();
    return api.get(`/projects?${queryParams}`);
  },

  // Get single project
  getById: async (id: string): Promise<Project> => {
    return api.get(`/projects/${id}`);
  },

  // Create project
  create: async (data: Partial<Project>): Promise<Project> => {
    return api.post('/projects', data);
  },

  // Update project
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    return api.put(`/projects/${id}`, data);
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    return api.delete(`/projects/${id}`);
  },

  // Get project timeline
  getTimeline: async (projectId: string): Promise<TimelineNode[]> => {
    return api.get(`/projects/${projectId}/timeline`);
  },

  // Update timeline node
  updateTimelineNode: async (
    projectId: string,
    nodeId: string,
    data: Partial<TimelineNode>
  ): Promise<TimelineNode> => {
    return api.patch(`/projects/${projectId}/timeline/${nodeId}`, data);
  },

  // Get payment phases
  getPaymentPhases: async (projectId: string): Promise<PaymentPhase[]> => {
    return api.get(`/projects/${projectId}/payments`);
  },

  // Update payment phase
  updatePaymentPhase: async (
    projectId: string,
    phaseId: string,
    data: Partial<PaymentPhase>
  ): Promise<PaymentPhase> => {
    return api.patch(`/projects/${projectId}/payments/${phaseId}`, data);
  },

  // Get process flow
  getProcessFlow: async (projectId: string, processId: string): Promise<ProcessStep[]> => {
    return api.get(`/projects/${projectId}/process/${processId}`);
  },

  // Get quotations for project
  getQuotations: async (projectId: string): Promise<Quotation[]> => {
    return api.get(`/projects/${projectId}/quotations`);
  },

  // Accept quotation
  acceptQuotation: async (projectId: string, quotationId: string): Promise<void> => {
    return api.post(`/projects/${projectId}/quotations/${quotationId}/accept`);
  },

  // Reject quotation
  rejectQuotation: async (projectId: string, quotationId: string, reason?: string): Promise<void> => {
    return api.post(`/projects/${projectId}/quotations/${quotationId}/reject`, { reason });
  },

  // Upload project images
  uploadImages: async (projectId: string, images: FormData): Promise<{ urls: string[] }> => {
    return api.upload(`/projects/${projectId}/images`, images);
  },

  // Get cost breakdown
  getCostBreakdown: async (projectId: string): Promise<any> => {
    return api.get(`/projects/${projectId}/cost-breakdown`);
  },
};

export default projectsApi;
