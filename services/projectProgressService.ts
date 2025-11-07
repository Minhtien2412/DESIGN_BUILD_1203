/**
 * Project Progress Management Service
 * Quản lý tiến độ dự án và thanh toán
 */

import {
    PaymentSchedule,
    ProgressDashboard,
    ProgressFilters,
    ProjectPayment,
    ProjectProgress,
    ProjectTask,
    TaskSubmission,
    UserRole
} from '../types/projectProgress';
import { ApiErrorContext, apiErrorHandler } from './apiErrorHandler';
import { storage } from './storage';

export interface ProgressApiResponse<T> {
  success: boolean;
  data?: T;
  items?: T[];
  total?: number;
  source: 'api' | 'cache' | 'fallback';
  error?: ApiErrorContext;
  recommendations?: string[];
}

class ProjectProgressService {
  private baseUrl: string;
  private cachePrefix = 'progress_';
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use unified API service baseURL
    const { API_BASE } = require('./api');
    this.baseUrl = API_BASE;
  }

  // Authentication helpers
  private async getAuthToken(): Promise<string | null> {
    try {
      return await storage.get('auth_token');
    } catch {
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ProgressApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return {
        success: true,
        data: data.data,
        items: data.items,
        total: data.total,
        source: 'api',
      };
    } catch (error) {
      const errorContext = await apiErrorHandler.analyzeApiError(
        error instanceof Error ? error.message : String(error),
        endpoint
      );

      // Try cache as fallback
      const cachedData = await this.getFromCache<T>(endpoint);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          source: 'cache',
          error: errorContext,
          recommendations: ['Using cached data due to network issues'],
        };
      }

      // Use fallback data as last resort
      const fallbackData = await this.getFallbackData<T>(endpoint);
      return {
        success: false,
        data: fallbackData || undefined,
        source: 'fallback',
        error: errorContext,
        recommendations: ['Using fallback data due to API unavailability'],
      };
    }
  }

  // Cache management
  private async saveToCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
      };
      await storage.set(
        `${this.cachePrefix}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await storage.get(`${this.cachePrefix}${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const isExpired = Date.now() - cacheItem.timestamp > this.cacheExpiry;
      
      return isExpired ? null : cacheItem.data;
    } catch {
      return null;
    }
  }

  // Fallback data
  private async getFallbackData<T>(endpoint: string): Promise<T | null> {
    // Return sample data for demo purposes
    if (endpoint.includes('/progress/dashboard/')) {
      return this.getSampleDashboard() as T;
    }
    if (endpoint.includes('/tasks')) {
      return this.getSampleTasks() as T;
    }
    if (endpoint.includes('/payments')) {
      return this.getSamplePayments() as T;
    }
    return null;
  }

  // =================
  // TASK MANAGEMENT
  // =================

  async getProjectTasks(
    projectId: string,
    filters?: ProgressFilters
  ): Promise<ProgressApiResponse<ProjectTask[]>> {
    const endpoint = `/projects/${projectId}/tasks`;
    const result = await this.makeRequest<ProjectTask[]>(endpoint);
    
    if (result.success && result.data) {
      await this.saveToCache(`tasks_${projectId}`, result.data);
    }
    
    return result;
  }

  async submitTaskProgress(
    taskId: string,
    submission: Omit<TaskSubmission, 'id' | 'submittedAt'>
  ): Promise<ProgressApiResponse<TaskSubmission>> {
    const endpoint = `/tasks/${taskId}/submit`;
    const result = await this.makeRequest<TaskSubmission>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        ...submission,
        submittedAt: new Date().toISOString(),
      }),
    });

    return result;
  }

  async reviewTaskSubmission(
    submissionId: string,
    review: {
      status: 'approved' | 'rejected' | 'revision-required';
      qualityScore?: number;
      reviewNotes?: string;
      reviewedBy: {
        id: string;
        name: string;
        role: UserRole;
      };
    }
  ): Promise<ProgressApiResponse<TaskSubmission>> {
    const endpoint = `/submissions/${submissionId}/review`;
    const result = await this.makeRequest<TaskSubmission>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        ...review,
        reviewedAt: new Date().toISOString(),
      }),
    });

    return result;
  }

  async updateTaskStatus(
    taskId: string,
    status: ProjectTask['status'],
    notes?: string
  ): Promise<ProgressApiResponse<ProjectTask>> {
    const endpoint = `/tasks/${taskId}/status`;
    const result = await this.makeRequest<ProjectTask>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        notes,
        updatedAt: new Date().toISOString(),
      }),
    });

    return result;
  }

  // =================
  // PAYMENT MANAGEMENT
  // =================

  async getPaymentSchedule(
    projectId: string
  ): Promise<ProgressApiResponse<PaymentSchedule>> {
    const endpoint = `/projects/${projectId}/payments/schedule`;
    const result = await this.makeRequest<PaymentSchedule>(endpoint);
    
    if (result.success && result.data) {
      await this.saveToCache(`payments_${projectId}`, result.data);
    }
    
    return result;
  }

  async createPayment(
    payment: Omit<ProjectPayment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProgressApiResponse<ProjectPayment>> {
    const endpoint = `/projects/${payment.projectId}/payments`;
    const result = await this.makeRequest<ProjectPayment>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        ...payment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    return result;
  }

  async approvePayment(
    paymentId: string,
    approver: {
      id: string;
      name: string;
      role: 'manager' | 'admin';
    }
  ): Promise<ProgressApiResponse<ProjectPayment>> {
    const endpoint = `/payments/${paymentId}/approve`;
    const result = await this.makeRequest<ProjectPayment>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        approver,
        approvedAt: new Date().toISOString(),
      }),
    });

    return result;
  }

  async rejectPayment(
    paymentId: string,
    reason: string,
    rejectedBy: {
      id: string;
      name: string;
      role: UserRole;
    }
  ): Promise<ProgressApiResponse<ProjectPayment>> {
    const endpoint = `/payments/${paymentId}/reject`;
    const result = await this.makeRequest<ProjectPayment>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        rejectionReason: reason,
        rejectedBy,
        rejectedAt: new Date().toISOString(),
      }),
    });

    return result;
  }

  async processPayment(
    paymentId: string,
    paymentDetails: {
      paymentMethod: ProjectPayment['paymentMethod'];
      paymentReference: string;
      processedBy: string;
    }
  ): Promise<ProgressApiResponse<ProjectPayment>> {
    const endpoint = `/payments/${paymentId}/process`;
    const result = await this.makeRequest<ProjectPayment>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        ...paymentDetails,
        status: 'completed',
        completedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    return result;
  }

  // =================
  // PROGRESS TRACKING
  // =================

  async getProjectProgress(
    projectId: string
  ): Promise<ProgressApiResponse<ProjectProgress>> {
    const endpoint = `/projects/${projectId}/progress`;
    const result = await this.makeRequest<ProjectProgress>(endpoint);
    
    if (result.success && result.data) {
      await this.saveToCache(`progress_${projectId}`, result.data);
    }
    
    return result;
  }

  async getProgressDashboard(
    projectId: string,
    userRole: UserRole
  ): Promise<ProgressApiResponse<ProgressDashboard>> {
    const endpoint = `/projects/${projectId}/dashboard?role=${userRole}`;
    const result = await this.makeRequest<ProgressDashboard>(endpoint);
    
    if (result.success && result.data) {
      await this.saveToCache(`dashboard_${projectId}_${userRole}`, result.data);
    }
    
    return result;
  }

  // =================
  // SAMPLE DATA FOR DEMO
  // =================

  private getSampleTasks(): ProjectTask[] {
    return [
      {
        id: 'task_001',
        projectId: 'project_001',
        name: 'Foundation Excavation',
        description: 'Excavate foundation according to architectural plans',
        category: 'foundation',
        estimatedDuration: 5,
        actualDuration: 6,
        startDate: '2025-09-15',
        endDate: '2025-09-21',
        estimatedCost: 50000000,
        actualCost: 55000000,
        status: 'completed',
        priority: 'high',
        dependencies: [],
        assignedTo: {
          type: 'contractor',
          id: 'contractor_001',
          name: 'Công ty TNHH Xây dựng ABC',
          contact: '0901234567'
        },
        submissions: [
          {
            id: 'sub_001',
            taskId: 'task_001',
            submittedBy: {
              type: 'contractor',
              id: 'contractor_001',
              name: 'Công ty TNHH Xây dựng ABC'
            },
            status: 'approved',
            completionPercentage: 100,
            description: 'Foundation excavation completed as per specifications',
            evidencePhotos: ['https://example.com/photo1.jpg'],
            evidenceDocuments: ['https://example.com/report1.pdf'],
            qualityScore: 9,
            reviewNotes: 'Excellent work quality, minor cleanup needed',
            reviewedBy: {
              id: 'supervisor_001',
              name: 'Nguyễn Văn A',
              role: 'supervisor'
            },
            submittedAt: '2025-09-21T10:00:00Z',
            reviewedAt: '2025-09-21T16:00:00Z'
          }
        ],
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-21T16:00:00Z'
      },
      {
        id: 'task_002',
        projectId: 'project_001',
        name: 'Concrete Foundation Pour',
        description: 'Pour concrete foundation with reinforcement',
        category: 'foundation',
        estimatedDuration: 3,
        startDate: '2025-09-22',
        estimatedCost: 80000000,
        status: 'in-progress',
        priority: 'critical',
        dependencies: ['task_001'],
        assignedTo: {
          type: 'company',
          id: 'company_001',
          name: 'Công ty Beton Chất lượng cao',
          contact: '0987654321'
        },
        submissions: [
          {
            id: 'sub_002',
            taskId: 'task_002',
            submittedBy: {
              type: 'company',
              id: 'company_001',
              name: 'Công ty Beton Chất lượng cao'
            },
            status: 'under-review',
            completionPercentage: 60,
            description: 'Foundation pour 60% complete, reinforcement installed',
            evidencePhotos: ['https://example.com/photo2.jpg'],
            evidenceDocuments: [],
            submittedAt: '2025-09-24T14:00:00Z'
          }
        ],
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-24T14:00:00Z'
      }
    ];
  }

  private getSamplePayments(): ProjectPayment[] {
    return [
      {
        id: 'payment_001',
        projectId: 'project_001',
        type: 'milestone',
        category: 'initial',
        amount: 200000000,
        scheduledAmount: 200000000,
        currency: 'VND',
        status: 'completed',
        dueDate: '2025-09-10',
        completedDate: '2025-09-10',
        triggerType: 'manual',
        triggerConditions: {
          requiredApproval: true
        },
        approvalStatus: 'admin-approved',
        approvedBy: {
          managerId: 'manager_001',
          managerName: 'Trần Văn B',
          managerApprovedAt: '2025-09-09T10:00:00Z',
          adminId: 'admin_001',
          adminName: 'Lê Thị C',
          adminApprovedAt: '2025-09-09T14:00:00Z'
        },
        paymentMethod: 'bank-transfer',
        paymentReference: 'TXF202509001',
        invoiceNumber: 'INV-2025-001',
        taxAmount: 20000000,
        netAmount: 180000000,
        relatedTasks: [],
        contractorId: 'contractor_001',
        contractorName: 'Công ty TNHH Xây dựng ABC',
        createdAt: '2025-09-05T00:00:00Z',
        updatedAt: '2025-09-10T10:00:00Z',
        createdBy: 'admin_001',
        updatedBy: 'admin_001'
      },
      {
        id: 'payment_002',
        projectId: 'project_001',
        type: 'milestone',
        category: 'foundation',
        amount: 150000000,
        scheduledAmount: 150000000,
        currency: 'VND',
        status: 'pending',
        dueDate: '2025-09-25',
        triggerType: 'task-completion',
        triggerConditions: {
          requiredTasks: ['task_001', 'task_002'],
          requiredApproval: true
        },
        approvalStatus: 'manager-approved',
        approvedBy: {
          managerId: 'manager_001',
          managerName: 'Trần Văn B',
          managerApprovedAt: '2025-09-21T16:30:00Z'
        },
        paymentMethod: 'bank-transfer',
        taxAmount: 15000000,
        netAmount: 135000000,
        relatedTasks: ['task_001', 'task_002'],
        contractorId: 'contractor_001',
        contractorName: 'Công ty TNHH Xây dựng ABC',
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-21T16:30:00Z',
        createdBy: 'manager_001',
        updatedBy: 'manager_001'
      }
    ];
  }

  private getSampleDashboard(): ProgressDashboard {
    return {
      project: {
        id: 'project_001',
        name: 'Villa Resort Phan Thiết',
        type: 'Villa',
        status: 'in-progress'
      },
      progress: {
        projectId: 'project_001',
        overallProgress: 25,
        totalTasks: 20,
        completedTasks: 3,
        inProgressTasks: 2,
        pendingTasks: 14,
        delayedTasks: 1,
        phases: {
          foundation: {
            name: 'Foundation Phase',
            progress: 80,
            status: 'in-progress',
            tasks: ['task_001', 'task_002'],
            startDate: '2025-09-15',
            estimatedCompletion: '2025-09-30'
          },
          structure: {
            name: 'Structure Phase',
            progress: 0,
            status: 'not-started',
            tasks: ['task_003', 'task_004', 'task_005'],
            estimatedCompletion: '2025-11-15'
          }
        },
        originalStartDate: '2025-09-15',
        originalEndDate: '2025-12-15',
        actualStartDate: '2025-09-15',
        estimatedEndDate: '2025-12-20',
        daysDelayed: 5,
        qualityMetrics: {
          averageQualityScore: 8.5,
          tasksRequiringRevision: 1,
          qualityIssues: [
            {
              taskId: 'task_002',
              taskName: 'Concrete Foundation Pour',
              issue: 'Minor surface finish imperfections',
              severity: 'low',
              status: 'open',
              reportedAt: '2025-09-24T14:00:00Z'
            }
          ]
        },
        budgetUtilization: 30,
        costEfficiency: 0.95,
        lastUpdated: '2025-10-03T12:00:00Z'
      },
      paymentSchedule: {
        id: 'schedule_001',
        projectId: 'project_001',
        totalBudget: 1000000000,
        currency: 'VND',
        breakdown: {
          initial: 20,
          foundation: 15,
          structure: 30,
          finishing: 25,
          final: 5,
          retention: 5
        },
        scheduledPayments: this.getSamplePayments(),
        totalPaid: 200000000,
        totalPending: 150000000,
        totalOverdue: 0,
        retentionAmount: 50000000,
        retentionReleaseDate: '2026-03-15',
        budgetVariance: -5000000,
        costOverruns: [],
        createdAt: '2025-09-01T00:00:00Z',
        updatedAt: '2025-09-24T16:00:00Z'
      },
      recentSubmissions: [
        {
          id: 'sub_002',
          taskId: 'task_002',
          submittedBy: {
            type: 'company',
            id: 'company_001',
            name: 'Công ty Beton Chất lượng cao'
          },
          status: 'under-review',
          completionPercentage: 60,
          description: 'Foundation pour 60% complete',
          evidencePhotos: ['https://example.com/photo2.jpg'],
          evidenceDocuments: [],
          submittedAt: '2025-09-24T14:00:00Z'
        }
      ],
      upcomingPayments: [
        {
          id: 'payment_002',
          projectId: 'project_001',
          type: 'milestone',
          category: 'foundation',
          amount: 150000000,
          scheduledAmount: 150000000,
          currency: 'VND',
          status: 'pending',
          dueDate: '2025-09-25',
          triggerType: 'task-completion',
          triggerConditions: {
            requiredTasks: ['task_001', 'task_002']
          },
          approvalStatus: 'manager-approved',
          paymentMethod: 'bank-transfer',
          netAmount: 135000000,
          relatedTasks: ['task_001', 'task_002'],
          contractorName: 'Công ty TNHH Xây dựng ABC',
          createdAt: '2025-09-10T00:00:00Z',
          updatedAt: '2025-09-21T16:30:00Z',
          createdBy: 'manager_001',
          updatedBy: 'manager_001'
        }
      ],
      alerts: [
        {
          type: 'delay',
          severity: 'warning',
          message: 'Foundation phase is 2 days behind schedule',
          taskId: 'task_002',
          createdAt: '2025-09-24T12:00:00Z'
        },
        {
          type: 'payment',
          severity: 'info',
          message: 'Foundation milestone payment pending admin approval',
          paymentId: 'payment_002',
          createdAt: '2025-09-24T16:30:00Z'
        }
      ],
      kpis: {
        schedulePerformance: 0.95,
        costPerformance: 1.05,
        qualityIndex: 8.5,
        stakeholderSatisfaction: 9.0
      }
    };
  }
}

export const projectProgressService = new ProjectProgressService();