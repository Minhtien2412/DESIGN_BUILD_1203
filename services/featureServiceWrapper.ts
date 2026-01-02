/**
 * Feature Service Wrapper
 * Xử lý graceful degradation cho các features
 * Tự động fallback về mock data/offline khi BE không sẵn sàng
 */

import MockData, {
    MOCK_ANALYTICS_SUMMARY,
    MOCK_BUDGET_SUMMARY,
    MOCK_BUDGET_TRANSACTIONS,
    MOCK_CONTRACTS,
    MOCK_DOCUMENTS,
    formatCurrency,
    formatFileSize,
} from '../data/mockFeatureData';
import { ApiError, apiFetch } from './api';
import {
    canUseMockData,
    getAlternativeEndpoint,
    getFeatureFallbackMessage,
    getFeatureStatus
} from './featureAvailability';
import { FileCache, OfflineBudget, OfflineContracts, OfflineDocuments } from './offlineStorage';

// Types
export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  source: 'api' | 'mock' | 'offline' | 'cache';
  message?: string;
  isOffline?: boolean;
}

export interface FeatureUnavailableError extends Error {
  featureKey: string;
  fallbackMessage: string;
  expectedAvailability?: string;
}

/**
 * Generic wrapper để gọi API với fallback
 */
async function callWithFallback<T>(
  featureKey: string,
  apiCall: () => Promise<T>,
  mockData: T | null = null,
  offlineCall?: () => Promise<T | null>,
): Promise<ServiceResponse<T>> {
  const status = getFeatureStatus(featureKey);
  
  // Nếu feature đang coming_soon, dùng mock data
  if (status === 'coming_soon') {
    if (canUseMockData(featureKey) && mockData) {
      return {
        success: true,
        data: mockData,
        source: 'mock',
        message: getFeatureFallbackMessage(featureKey),
      };
    }
    
    // Thử offline data
    if (offlineCall) {
      try {
        const offlineData = await offlineCall();
        if (offlineData) {
          return {
            success: true,
            data: offlineData,
            source: 'offline',
            message: 'Đang sử dụng dữ liệu offline',
            isOffline: true,
          };
        }
      } catch {
        // Ignore offline errors
      }
    }
    
    return {
      success: false,
      data: null,
      source: 'mock',
      message: getFeatureFallbackMessage(featureKey),
    };
  }
  
  // Feature available hoặc degraded - thử gọi API
  try {
    const data = await apiCall();
    return {
      success: true,
      data,
      source: 'api',
    };
  } catch (error) {
    // Nếu API fail, thử fallback
    if (error instanceof ApiError && (error.status === 404 || error.status === 503)) {
      // API không tìm thấy hoặc service unavailable
      
      // Thử offline data trước
      if (offlineCall) {
        try {
          const offlineData = await offlineCall();
          if (offlineData) {
            return {
              success: true,
              data: offlineData,
              source: 'offline',
              message: 'Đang sử dụng dữ liệu offline (API không khả dụng)',
              isOffline: true,
            };
          }
        } catch {
          // Ignore
        }
      }
      
      // Fallback về mock data
      if (mockData) {
        return {
          success: true,
          data: mockData,
          source: 'mock',
          message: 'Đang sử dụng dữ liệu mẫu (API không khả dụng)',
        };
      }
    }
    
    // Re-throw nếu không có fallback
    throw error;
  }
}

// === DOCUMENTS SERVICE ===

export const DocumentsService = {
  async getAll(): Promise<ServiceResponse<typeof MOCK_DOCUMENTS>> {
    return callWithFallback(
      'DOCUMENTS',
      async () => {
        const response = await apiFetch('/documents');
        return response.data;
      },
      MOCK_DOCUMENTS,
      async () => OfflineDocuments.getAll(),
    );
  },

  async getById(id: string): Promise<ServiceResponse<typeof MOCK_DOCUMENTS[0] | null>> {
    return callWithFallback(
      'DOCUMENTS',
      async () => {
        const response = await apiFetch(`/documents/${id}`);
        return response.data;
      },
      MOCK_DOCUMENTS.find(d => d.id === id) || null,
      async () => OfflineDocuments.getById(id),
    );
  },

  async getByProject(projectId: string): Promise<ServiceResponse<typeof MOCK_DOCUMENTS>> {
    return callWithFallback(
      'DOCUMENTS',
      async () => {
        const response = await apiFetch(`/projects/${projectId}/documents`);
        return response.data;
      },
      MOCK_DOCUMENTS.filter(d => d.projectId === projectId),
      async () => OfflineDocuments.getByProject(projectId),
    );
  },

  async upload(file: any, projectId?: string, folder?: string): Promise<ServiceResponse<any>> {
    // Upload thật qua /upload/single endpoint
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const queryParams = new URLSearchParams();
      if (folder) queryParams.append('folder', folder);
      if (projectId) queryParams.append('folder', `projects/${projectId}`);
      
      const url = `/upload/single${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await apiFetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary
        },
      });
      
      return {
        success: true,
        data: response.data || response,
        source: 'api',
      };
    } catch (error) {
      // Fallback to offline
      const pendingUpload = await FileCache.addPendingUpload({
        type: 'document',
        localUri: file.uri,
        targetEndpoint: '/upload/single',
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
      });
      
      // Lưu document metadata offline
      const offlineDoc = await OfflineDocuments.add({
        name: file.name,
        type: file.type?.split('/')[1] || 'other',
        size: file.size || 0,
        localUri: file.uri,
        projectId,
      });
      
      return {
        success: true,
        data: { document: offlineDoc, upload: pendingUpload },
        source: 'offline',
        message: 'Không thể upload. Đã lưu offline để upload sau.',
        isOffline: true,
      };
    }
  },

  async uploadMultiple(files: any[], projectId?: string, folder?: string): Promise<ServiceResponse<any>> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const queryParams = new URLSearchParams();
      if (folder) queryParams.append('folder', folder);
      if (projectId) queryParams.append('folder', `projects/${projectId}`);
      
      const url = `/upload/multiple${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await apiFetch(url, {
        method: 'POST',
        body: formData,
      });
      
      return {
        success: true,
        data: response.data || response,
        source: 'api',
      };
    } catch (error) {
      // Save all files offline
      const results = await Promise.all(files.map(async file => {
        const pendingUpload = await FileCache.addPendingUpload({
          type: 'document',
          localUri: file.uri,
          targetEndpoint: '/upload/multiple',
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
        });
        return pendingUpload;
      }));
      
      return {
        success: true,
        data: results,
        source: 'offline',
        message: `${files.length} files đã lưu offline để upload sau.`,
        isOffline: true,
      };
    }
  },
};

// === BUDGET SERVICE ===

export const BudgetService = {
  async getSummary(): Promise<ServiceResponse<typeof MOCK_BUDGET_SUMMARY>> {
    return callWithFallback(
      'BUDGET',
      async () => {
        const response = await apiFetch('/budget/summary');
        return response.data;
      },
      MOCK_BUDGET_SUMMARY,
      async () => OfflineBudget.getSummary(),
    );
  },

  async getTransactions(): Promise<ServiceResponse<typeof MOCK_BUDGET_TRANSACTIONS>> {
    return callWithFallback(
      'BUDGET',
      async () => {
        const response = await apiFetch('/budget/transactions');
        return response.data;
      },
      MOCK_BUDGET_TRANSACTIONS,
      async () => OfflineBudget.getAll(),
    );
  },

  async addTransaction(transaction: any): Promise<ServiceResponse<any>> {
    const status = getFeatureStatus('BUDGET');
    
    if (status === 'coming_soon') {
      const offlineItem = await OfflineBudget.add(transaction);
      return {
        success: true,
        data: offlineItem,
        source: 'offline',
        message: 'Giao dịch đã được lưu offline',
        isOffline: true,
      };
    }
    
    try {
      const response = await apiFetch('/budget/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      return {
        success: true,
        data: response.data,
        source: 'api',
      };
    } catch (error) {
      const offlineItem = await OfflineBudget.add(transaction);
      return {
        success: true,
        data: offlineItem,
        source: 'offline',
        message: 'Không thể lưu lên server. Đã lưu offline.',
        isOffline: true,
      };
    }
  },
};

// === CONTRACTS SERVICE ===

export const ContractsService = {
  async getAll(): Promise<ServiceResponse<typeof MOCK_CONTRACTS>> {
    return callWithFallback(
      'CONTRACTS',
      async () => {
        // Dùng endpoint đúng: /contract/quotations
        const response = await apiFetch('/contract/quotations');
        return response.data || response;
      },
      MOCK_CONTRACTS,
      async () => OfflineContracts.getAll(),
    );
  },

  async getMaterials(): Promise<ServiceResponse<any>> {
    return callWithFallback(
      'CONTRACTS',
      async () => {
        const response = await apiFetch('/contract/materials');
        return response.data || response;
      },
      [],
    );
  },

  async getById(id: string): Promise<ServiceResponse<typeof MOCK_CONTRACTS[0] | null>> {
    return callWithFallback(
      'CONTRACTS',
      async () => {
        const response = await apiFetch(`/contract/quotations/${id}`);
        return response.data || response;
      },
      MOCK_CONTRACTS.find(c => c.id === id) || null,
    );
  },

  async create(contract: any): Promise<ServiceResponse<any>> {
    try {
      const response = await apiFetch('/contract/quotations', {
        method: 'POST',
        body: JSON.stringify(contract),
      });
      return {
        success: true,
        data: response.data || response,
        source: 'api',
      };
    } catch (error) {
      const offlineContract = await OfflineContracts.add(contract);
      return {
        success: true,
        data: offlineContract,
        source: 'offline',
        message: 'Không thể lưu lên server. Đã lưu offline.',
        isOffline: true,
      };
    }
  },
};

// === ANALYTICS SERVICE ===

export const AnalyticsService = {
  async getDashboard(role: 'admin' | 'client' | 'engineer' | 'master' = 'client'): Promise<ServiceResponse<typeof MOCK_ANALYTICS_SUMMARY>> {
    return callWithFallback(
      'ANALYTICS',
      async () => {
        // Dùng endpoint đúng: /dashboard/{role}
        const response = await apiFetch(`/dashboard/${role}`);
        return response.data || response;
      },
      MOCK_ANALYTICS_SUMMARY,
    );
  },

  async getAdminDashboard(): Promise<ServiceResponse<any>> {
    return callWithFallback(
      'ANALYTICS',
      async () => {
        const response = await apiFetch('/dashboard/admin');
        return response.data || response;
      },
      MOCK_ANALYTICS_SUMMARY,
    );
  },

  async getClientDashboard(): Promise<ServiceResponse<any>> {
    return callWithFallback(
      'ANALYTICS',
      async () => {
        const response = await apiFetch('/dashboard/client');
        return response.data || response;
      },
      MOCK_ANALYTICS_SUMMARY,
    );
  },

  async getMasterDashboard(): Promise<ServiceResponse<any>> {
    return callWithFallback(
      'ANALYTICS',
      async () => {
        const response = await apiFetch('/dashboard/master');
        return response.data || response;
      },
      MOCK_ANALYTICS_SUMMARY,
    );
  },

  async getRevenueByMonth(): Promise<ServiceResponse<any>> {
    return callWithFallback(
      'ANALYTICS',
      async () => {
        const response = await apiFetch('/dashboard/admin');
        // Extract revenue data from admin dashboard
        return (response.data || response)?.revenue || MockData.analyticsRevenueByMonth;
      },
      MockData.analyticsRevenueByMonth,
    );
  },

  async getProjectStatus(): Promise<ServiceResponse<any>> {
    return callWithFallback(
      'ANALYTICS',
      async () => {
        const response = await apiFetch('/dashboard/admin');
        return (response.data || response)?.projects || MockData.analyticsProjectStatus;
      },
      MockData.analyticsProjectStatus,
    );
  },

  async getExpenseByCategory(): Promise<ServiceResponse<any>> {
    return callWithFallback(
      'ANALYTICS',
      async () => {
        const response = await apiFetch('/dashboard/admin');
        return (response.data || response)?.expenses || MockData.analyticsExpenseByCategory;
      },
      MockData.analyticsExpenseByCategory,
    );
  },
};

// === PROFILE SERVICE (SỬA ENDPOINT) ===

export const ProfileService = {
  /**
   * Lấy profile user - SỬA DÙNG /users/{userId} thay vì /auth/profile
   */
  async getProfile(userId: string): Promise<ServiceResponse<any>> {
    const alternativeEndpoint = getAlternativeEndpoint('PROFILE');
    const endpoint = alternativeEndpoint 
      ? alternativeEndpoint.replace('{userId}', userId)
      : `/users/${userId}`;
    
    try {
      const response = await apiFetch(endpoint);
      return {
        success: true,
        data: response.data || response,
        source: 'api',
      };
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(userId: string, data: any): Promise<ServiceResponse<any>> {
    try {
      const response = await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return {
        success: true,
        data: response.data || response,
        source: 'api',
      };
    } catch (error) {
      throw error;
    }
  },
};

// === CONSTRUCTION PROGRESS SERVICE (SỬA ENDPOINT) ===

export const ConstructionProgressService = {
  /**
   * Lấy tiến độ theo project - SỬA DÙNG /projects/{id}/progress
   */
  async getByProject(projectId: string): Promise<ServiceResponse<any>> {
    const alternativeEndpoint = getAlternativeEndpoint('CONSTRUCTION_PROGRESS');
    const endpoint = alternativeEndpoint 
      ? alternativeEndpoint.replace('{projectId}', projectId)
      : `/projects/${projectId}/progress`;
    
    try {
      const response = await apiFetch(endpoint);
      return {
        success: true,
        data: response.data || response,
        source: 'api',
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy timeline theo project - SỬA DÙNG /projects/{id}/timeline
   */
  async getTimeline(projectId: string): Promise<ServiceResponse<any>> {
    const alternativeEndpoint = getAlternativeEndpoint('TIMELINE');
    const endpoint = alternativeEndpoint 
      ? alternativeEndpoint.replace('{projectId}', projectId)
      : `/projects/${projectId}/timeline`;
    
    try {
      const response = await apiFetch(endpoint);
      return {
        success: true,
        data: response.data || response,
        source: 'api',
      };
    } catch (error) {
      throw error;
    }
  },
};

// === SEARCH SERVICE ===

export const SearchService = {
  async search(query: string): Promise<ServiceResponse<any[]>> {
    const status = getFeatureStatus('SEARCH');
    
    if (status === 'coming_soon') {
      // Local search trong mock data
      const results: any[] = [];
      
      // Search documents
      MOCK_DOCUMENTS.forEach(doc => {
        if (doc.name.toLowerCase().includes(query.toLowerCase()) ||
            doc.description?.toLowerCase().includes(query.toLowerCase())) {
          results.push({ searchType: 'document', ...doc });
        }
      });
      
      // Search contracts
      MOCK_CONTRACTS.forEach(contract => {
        if (contract.title.toLowerCase().includes(query.toLowerCase()) ||
            contract.description?.toLowerCase().includes(query.toLowerCase())) {
          results.push({ searchType: 'contract', ...contract });
        }
      });
      
      return {
        success: true,
        data: results,
        source: 'mock',
        message: 'Kết quả tìm kiếm trong dữ liệu mẫu',
      };
    }
    
    try {
      const response = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.data,
        source: 'api',
      };
    } catch (error) {
      // Fallback to local search
      return SearchService.search(query);
    }
  },
};

// === EXPORT UTILITIES ===

export const formatters = {
  currency: formatCurrency,
  fileSize: formatFileSize,
};

export default {
  Documents: DocumentsService,
  Budget: BudgetService,
  Contracts: ContractsService,
  Analytics: AnalyticsService,
  Profile: ProfileService,
  ConstructionProgress: ConstructionProgressService,
  Search: SearchService,
  formatters,
};
