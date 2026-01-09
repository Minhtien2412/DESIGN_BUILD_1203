/**
 * WorkOrder Service - Design Build Integration
 * Follows Prisma schema and OpenAPI spec
 * Uses BigInt IDs (as strings), WorkOrderStatus enum, meta field
 */

import type {
    ApiResponse,
    CreateWorkOrderRequest,
    ID,
    PaginatedResponse,
    UpdateWorkOrderRequest,
    WorkOrder,
    WorkOrderListParams,
    WorkOrderStatus
} from '../types/api';
import { ApiError, apiFetch } from './api';

export class WorkOrderService {
  private baseUrl = '/v1/workorders';

  /**
   * Create a new work order
   */
  async create(data: CreateWorkOrderRequest): Promise<WorkOrder> {
    try {
      console.log('🏗️ Creating work order:', data);
      
      const response = await apiFetch<ApiResponse<WorkOrder>>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.data) {
        console.log('✅ Work order created:', response.data.id);
        return response.data;
      }

      throw new Error('No work order data received');
    } catch (error) {
      console.error('❌ Failed to create work order:', error);
      
      if (error instanceof ApiError) {
        throw new Error(`Không thể tạo công việc: ${error.message}`);
      }
      
      throw new Error('Không thể tạo công việc. Vui lòng thử lại.');
    }
  }

  /**
   * Get all work orders with optional filtering and pagination
   */
  async getAll(params?: WorkOrderListParams): Promise<PaginatedResponse<WorkOrder>> {
    try {
      console.log('📋 Fetching work orders:', params);
      
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.append('projectId', params.projectId);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = searchParams.toString() ? `${this.baseUrl}?${searchParams}` : this.baseUrl;
      const response = await apiFetch<PaginatedResponse<WorkOrder>>(url);

      console.log(`✅ Fetched ${response.data.length} work orders`);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch work orders:', error);
      
      if (error instanceof ApiError) {
        throw new Error(`Không thể tải danh sách công việc: ${error.message}`);
      }
      
      throw new Error('Không thể tải danh sách công việc. Vui lòng thử lại.');
    }
  }

  /**
   * Get a specific work order by ID
   */
  async getById(id: ID): Promise<WorkOrder> {
    try {
      console.log('🔍 Fetching work order:', id);
      
      const response = await apiFetch<ApiResponse<WorkOrder>>(`${this.baseUrl}/${id}`);

      if (response.data) {
        console.log('✅ Work order loaded:', response.data.title);
        return response.data;
      }

      throw new Error('Work order not found');
    } catch (error) {
      console.error('❌ Failed to fetch work order:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Không tìm thấy công việc này');
        }
        throw new Error(`Không thể tải công việc: ${error.message}`);
      }
      
      throw new Error('Không thể tải công việc. Vui lòng thử lại.');
    }
  }

  /**
   * Update a work order
   */
  async update(id: ID, data: UpdateWorkOrderRequest): Promise<WorkOrder> {
    try {
      console.log('✏️ Updating work order:', id, data);
      
      const response = await apiFetch<ApiResponse<WorkOrder>>(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      if (response.data) {
        console.log('✅ Work order updated:', response.data.title);
        return response.data;
      }

      throw new Error('No updated work order data received');
    } catch (error) {
      console.error('❌ Failed to update work order:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Không tìm thấy công việc này');
        }
        throw new Error(`Không thể cập nhật công việc: ${error.message}`);
      }
      
      throw new Error('Không thể cập nhật công việc. Vui lòng thử lại.');
    }
  }

  /**
   * Delete a work order
   */
  async delete(id: ID): Promise<void> {
    try {
      console.log('🗑️ Deleting work order:', id);
      
      await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      console.log('✅ Work order deleted');
    } catch (error) {
      console.error('❌ Failed to delete work order:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Không tìm thấy công việc này');
        }
        throw new Error(`Không thể xóa công việc: ${error.message}`);
      }
      
      throw new Error('Không thể xóa công việc. Vui lòng thử lại.');
    }
  }

  /**
   * Update work order status
   */
  async updateStatus(id: ID, status: WorkOrderStatus): Promise<WorkOrder> {
    return this.update(id, { status });
  }

  /**
   * Get work orders by project
   */
  async getByProject(projectId: ID): Promise<WorkOrder[]> {
    const response = await this.getAll({ projectId });
    return response.data;
  }

  /**
   * Get work orders by status
   */
  async getByStatus(status: WorkOrderStatus): Promise<WorkOrder[]> {
    const response = await this.getAll({ status });
    return response.data;
  }

  /**
   * Search work orders by title
   */
  async search(query: string, projectId?: ID): Promise<WorkOrder[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      if (projectId) params.append('projectId', projectId);
      
      const url = `${this.baseUrl}/search?${params}`;
      const response = await apiFetch<PaginatedResponse<WorkOrder>>(url);
      
      return response.data;
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw new Error('Không thể tìm kiếm công việc');
    }
  }

  /**
   * Get work order statistics
   */
  async getStats(projectId?: ID): Promise<{
    total: number;
    byStatus: Record<WorkOrderStatus, number>;
  }> {
    try {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await apiFetch<{
        total: number;
        byStatus: Record<WorkOrderStatus, number>;
      }>(`${this.baseUrl}/stats${params}`);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      throw new Error('Không thể tải thống kê');
    }
  }
}

// Export singleton instance
export const workOrderService = new WorkOrderService();
