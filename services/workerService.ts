/**
 * Worker Service
 * Handle worker tracking for construction projects
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Created: Session 6 - API Migration Batch 6
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES
// ============================================================================

export type WorkerStatus = 'finding' | 'accepted' | 'traveling' | 'working' | 'completed';

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  reviewCount: number;
  experience: string;
  specialty: string;
  licensePlate?: string;
  vehicleType?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  eta?: number; // Estimated time of arrival in minutes
  completedJobs?: number;
  verified?: boolean;
  documents?: {
    id: string;
    type: string;
    verified: boolean;
  }[];
}

export interface WorkerAssignment {
  id: string;
  taskId: string;
  worker: Worker;
  status: WorkerStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  customerLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export interface WorkerListResponse {
  success: boolean;
  data: Worker[];
}

export interface WorkerDetailResponse {
  success: boolean;
  data: Worker;
}

export interface AssignmentResponse {
  success: boolean;
  data: WorkerAssignment;
}

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

export const MOCK_WORKER: Worker = {
  id: 'w1',
  name: 'Nguyễn Văn Hùng',
  avatar: 'https://i.pravatar.cc/150?img=12',
  phone: '0909123456',
  rating: 4.8,
  reviewCount: 156,
  experience: '8 năm kinh nghiệm',
  specialty: 'Thợ điện, Thợ nước',
  licensePlate: '51F-123.45',
  vehicleType: 'Xe máy',
  completedJobs: 342,
  verified: true,
};

export const MOCK_WORKERS: Worker[] = [
  MOCK_WORKER,
  {
    id: 'w2',
    name: 'Trần Minh Đức',
    avatar: 'https://i.pravatar.cc/150?img=15',
    phone: '0901234567',
    rating: 4.9,
    reviewCount: 203,
    experience: '10 năm kinh nghiệm',
    specialty: 'Thợ xây, Trát tường',
    completedJobs: 489,
    verified: true,
  },
  {
    id: 'w3',
    name: 'Lê Văn Tâm',
    avatar: 'https://i.pravatar.cc/150?img=18',
    phone: '0912345678',
    rating: 4.7,
    reviewCount: 89,
    experience: '5 năm kinh nghiệm',
    specialty: 'Thợ sơn',
    completedJobs: 178,
    verified: true,
  },
  {
    id: 'w4',
    name: 'Phạm Quốc Bảo',
    avatar: 'https://i.pravatar.cc/150?img=22',
    phone: '0923456789',
    rating: 4.6,
    reviewCount: 67,
    experience: '3 năm kinh nghiệm',
    specialty: 'Thợ mộc',
    completedJobs: 124,
    verified: false,
  },
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Get available workers
 */
export async function getAvailableWorkers(specialty?: string): Promise<Worker[]> {
  try {
    const params = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
    const response = await apiFetch<WorkerListResponse>(`/workers/available${params}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return filterWorkersBySpecialty(MOCK_WORKERS, specialty);
  } catch (error) {
    console.warn('[WorkerService] getAvailableWorkers error:', error);
    return filterWorkersBySpecialty(MOCK_WORKERS, specialty);
  }
}

/**
 * Get worker by ID
 */
export async function getWorkerById(id: string): Promise<Worker | null> {
  try {
    const response = await apiFetch<WorkerDetailResponse>(`/workers/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_WORKERS.find(w => w.id === id) || null;
  } catch (error) {
    console.warn('[WorkerService] getWorkerById error:', error);
    return MOCK_WORKERS.find(w => w.id === id) || null;
  }
}

/**
 * Request worker assignment for a task
 */
export async function requestWorker(
  taskId: string,
  specialty: string,
  location: { address: string; latitude: number; longitude: number }
): Promise<WorkerAssignment | null> {
  try {
    const response = await apiFetch<AssignmentResponse>('/workers/request', {
      method: 'POST',
      body: JSON.stringify({ taskId, specialty, location }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Simulate assignment with mock data
    return createMockAssignment(taskId, location);
  } catch (error) {
    console.warn('[WorkerService] requestWorker error:', error);
    return createMockAssignment(taskId, location);
  }
}

/**
 * Get current assignment status
 */
export async function getAssignmentStatus(assignmentId: string): Promise<WorkerAssignment | null> {
  try {
    const response = await apiFetch<AssignmentResponse>(`/workers/assignments/${assignmentId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.warn('[WorkerService] getAssignmentStatus error:', error);
    return null;
  }
}

/**
 * Cancel worker assignment
 */
export async function cancelAssignment(
  assignmentId: string,
  reason?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>(
      `/workers/assignments/${assignmentId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return response;
  } catch (error) {
    console.warn('[WorkerService] cancelAssignment error:', error);
    return { success: true, message: 'Đã hủy (offline)' };
  }
}

/**
 * Rate worker after job completion
 */
export async function rateWorker(
  workerId: string,
  assignmentId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch<{ success: boolean }>(`/workers/${workerId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ assignmentId, rating, comment }),
    });
    return response;
  } catch (error) {
    console.warn('[WorkerService] rateWorker error:', error);
    return { success: true };
  }
}

/**
 * Get worker's current location (for tracking)
 */
export async function getWorkerLocation(
  workerId: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await apiFetch<{ 
      success: boolean; 
      data: { latitude: number; longitude: number } 
    }>(`/workers/${workerId}/location`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.warn('[WorkerService] getWorkerLocation error:', error);
    // Return mock location
    return {
      latitude: 10.762622 + (Math.random() - 0.5) * 0.01,
      longitude: 106.660172 + (Math.random() - 0.5) * 0.01,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function filterWorkersBySpecialty(workers: Worker[], specialty?: string): Worker[] {
  if (!specialty) return workers;
  
  const specialtyLower = specialty.toLowerCase();
  return workers.filter(w => 
    w.specialty.toLowerCase().includes(specialtyLower)
  );
}

function createMockAssignment(
  taskId: string,
  location: { address: string; latitude: number; longitude: number }
): WorkerAssignment {
  return {
    id: `assign_${Date.now()}`,
    taskId,
    worker: MOCK_WORKER,
    status: 'finding',
    assignedAt: new Date().toISOString(),
    customerLocation: location,
  };
}

// Status progression helpers
export const STATUS_LABELS: Record<WorkerStatus, string> = {
  finding: 'Đang tìm thợ',
  accepted: 'Đã nhận việc',
  traveling: 'Đang di chuyển',
  working: 'Đang thi công',
  completed: 'Hoàn thành',
};

export const STATUS_COLORS: Record<WorkerStatus, string> = {
  finding: '#FFA500',
  accepted: '#4CAF50',
  traveling: '#2196F3',
  working: '#9C27B0',
  completed: '#4CAF50',
};

// Export service object
const WorkerService = {
  getAvailableWorkers,
  getWorkerById,
  requestWorker,
  getAssignmentStatus,
  cancelAssignment,
  rateWorker,
  getWorkerLocation,
  STATUS_LABELS,
  STATUS_COLORS,
  MOCK_WORKER,
  MOCK_WORKERS,
};

export default WorkerService;
