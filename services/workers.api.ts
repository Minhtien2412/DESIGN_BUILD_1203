/**
 * Workers API Service
 * Connects to BE /workers endpoints
 */

import { get, patch, post } from "./api";

// Types
export enum WorkerType {
  EP_COC = "EP_COC",
  DAO_DAT = "DAO_DAT",
  VAT_LIEU = "VAT_LIEU",
  NHAN_CONG = "NHAN_CONG",
  THO_XAY = "THO_XAY",
  THO_COFFA = "THO_COFFA",
  THO_SAT = "THO_SAT",
  THO_DIEN = "THO_DIEN",
  THO_NUOC = "THO_NUOC",
  THO_SON = "THO_SON",
  THO_GACH = "THO_GACH",
  THO_THACH_CAO = "THO_THACH_CAO",
  THO_MOC = "THO_MOC",
  THO_HAN = "THO_HAN",
  THO_CAMERA = "THO_CAMERA",
  THO_NHOM_KINH = "THO_NHOM_KINH",
  KY_SU = "KY_SU",
  GIAM_SAT = "GIAM_SAT",
}

export enum WorkerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export type WorkerAvailability =
  | "available"
  | "busy"
  | "almost-done"
  | "offline";

export interface Worker {
  id: string;
  name: string;
  phone: string;
  workerType: WorkerType;
  location: string;
  district?: string;
  experience: number;
  skills: string[];
  hasEquipment: boolean;
  dailyRate: number;
  avatar?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  status: WorkerStatus;
  verified: boolean;
  featured: boolean;
  availability: WorkerAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerReview {
  id: string;
  workerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

export interface WorkerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  workerType?: WorkerType;
  location?: string;
  available?: boolean;
  verified?: boolean;
  minRating?: number;
  maxPrice?: number;
  status?: WorkerStatus;
  sortBy?: "rating" | "price" | "experience" | "completedJobs";
  sortOrder?: "asc" | "desc";
}

export interface RegisterWorkerDto {
  name: string;
  phone: string;
  workerType: WorkerType;
  location: string;
  district?: string;
  experience?: number;
  skills?: string[];
  hasEquipment?: boolean;
  dailyRate?: number;
  avatar?: string;
  idCard?: string;
  idCardImages?: string[];
  portfolio?: string[];
  bio?: string;
}

export interface CreateWorkerReviewDto {
  rating: number;
  comment?: string;
  projectId?: string;
  images?: string[];
  /** Quick-review badge tags (e.g. "on-time", "clean", "professional") */
  tags?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// API Functions
const BASE_PATH = "/workers";

/**
 * Get all workers with filters
 */
export const getWorkers = async (
  params?: WorkerQueryParams,
): Promise<PaginatedResponse<Worker>> => {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

  return get<PaginatedResponse<Worker>>(url);
};

/**
 * Get single worker by ID
 */
export const getWorkerById = async (id: string): Promise<Worker> => {
  return get<Worker>(`${BASE_PATH}/${id}`);
};

/**
 * Get worker reviews
 */
export const getWorkerReviews = async (
  workerId: string,
): Promise<PaginatedResponse<WorkerReview>> => {
  return get<PaginatedResponse<WorkerReview>>(
    `${BASE_PATH}/${workerId}/reviews`,
  );
};

/**
 * Add review for worker
 */
export const addWorkerReview = async (
  workerId: string,
  data: CreateWorkerReviewDto,
): Promise<WorkerReview> => {
  return post<WorkerReview>(`${BASE_PATH}/${workerId}/reviews`, data);
};

/**
 * Contact worker
 */
export const contactWorker = async (workerId: string, message?: string) => {
  return post(`${BASE_PATH}/${workerId}/contact`, { message });
};

/**
 * Get all specialties/worker types
 */
export const getSpecialties = async () => {
  return get<
    Array<{
      id: string;
      value: string;
      label: string;
      icon: string;
      count: number;
    }>
  >(`${BASE_PATH}/specialties`);
};

/**
 * Get featured workers
 */
export const getFeaturedWorkers = async (): Promise<
  PaginatedResponse<Worker>
> => {
  return get<PaginatedResponse<Worker>>(`${BASE_PATH}/featured`);
};

/**
 * Get worker stats
 */
export const getWorkerStats = async (params?: {
  workerType?: WorkerType;
  location?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.workerType) queryParams.append("workerType", params.workerType);
  if (params?.location) queryParams.append("location", params.location);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${BASE_PATH}/stats?${queryString}`
    : `${BASE_PATH}/stats`;

  return get(url);
};

/**
 * Get available locations
 */
export const getLocations = async () => {
  return get<Array<{ id: string; name: string; region: string }>>(
    `${BASE_PATH}/locations`,
  );
};

/**
 * Register as worker (requires auth)
 */
export const registerWorker = async (
  data: RegisterWorkerDto,
): Promise<Worker> => {
  return post<Worker>(`${BASE_PATH}/register`, data);
};

// Admin functions
/**
 * Get pending workers for approval (admin only)
 */
export const getPendingWorkers = async (): Promise<
  PaginatedResponse<Worker>
> => {
  return get<PaginatedResponse<Worker>>(`${BASE_PATH}/admin/pending`);
};

/**
 * Approve/reject worker (admin only)
 */
export const approveWorker = async (
  id: string,
  status: WorkerStatus,
  reason?: string,
) => {
  return patch(`${BASE_PATH}/${id}/approve`, { status, reason });
};

/**
 * Verify worker (admin only)
 */
export const verifyWorker = async (id: string) => {
  return patch(`${BASE_PATH}/${id}/verify`, {});
};

/**
 * Toggle featured status (admin only)
 */
export const toggleFeaturedWorker = async (id: string) => {
  return patch(`${BASE_PATH}/${id}/feature`, {});
};

// Helper: Get label for worker type
export const getWorkerTypeLabel = (type: WorkerType): string => {
  const labels: Record<WorkerType, string> = {
    [WorkerType.EP_COC]: "Ép cọc",
    [WorkerType.DAO_DAT]: "Đào đất",
    [WorkerType.VAT_LIEU]: "Vật liệu xây dựng",
    [WorkerType.NHAN_CONG]: "Nhân công",
    [WorkerType.THO_XAY]: "Thợ xây",
    [WorkerType.THO_COFFA]: "Thợ coffa",
    [WorkerType.THO_SAT]: "Thợ sắt",
    [WorkerType.THO_DIEN]: "Thợ điện",
    [WorkerType.THO_NUOC]: "Thợ nước",
    [WorkerType.THO_SON]: "Thợ sơn",
    [WorkerType.THO_GACH]: "Thợ gạch",
    [WorkerType.THO_THACH_CAO]: "Thợ thạch cao",
    [WorkerType.THO_MOC]: "Thợ mộc",
    [WorkerType.THO_HAN]: "Thợ hàn",
    [WorkerType.THO_CAMERA]: "Thợ camera",
    [WorkerType.THO_NHOM_KINH]: "Thợ nhôm kính",
    [WorkerType.KY_SU]: "Kỹ sư",
    [WorkerType.GIAM_SAT]: "Giám sát",
  };
  return labels[type] || type;
};

// Helper: Get icon for worker type
export const getWorkerTypeIcon = (type: WorkerType): string => {
  const icons: Record<WorkerType, string> = {
    [WorkerType.EP_COC]: "hammer",
    [WorkerType.DAO_DAT]: "construct",
    [WorkerType.VAT_LIEU]: "cube",
    [WorkerType.NHAN_CONG]: "people",
    [WorkerType.THO_XAY]: "home",
    [WorkerType.THO_COFFA]: "grid",
    [WorkerType.THO_SAT]: "link",
    [WorkerType.THO_DIEN]: "flash",
    [WorkerType.THO_NUOC]: "water",
    [WorkerType.THO_SON]: "color-palette",
    [WorkerType.THO_GACH]: "layers",
    [WorkerType.THO_THACH_CAO]: "square",
    [WorkerType.THO_MOC]: "build",
    [WorkerType.THO_HAN]: "flame",
    [WorkerType.THO_CAMERA]: "camera",
    [WorkerType.THO_NHOM_KINH]: "expand",
    [WorkerType.KY_SU]: "school",
    [WorkerType.GIAM_SAT]: "eye",
  };
  return icons[type] || "person";
};

// Helper: Format daily rate
export const formatDailyRate = (rate: number): string => {
  return rate.toLocaleString("vi-VN") + "đ/ngày";
};

// Helper: Get availability label
export const getAvailabilityLabel = (
  availability: WorkerAvailability,
): string => {
  const labels: Record<WorkerAvailability, string> = {
    available: "Sẵn sàng",
    busy: "Đang bận",
    "almost-done": "Sắp rảnh",
    offline: "Offline",
  };
  return labels[availability] || availability;
};

// Helper: Get availability color
export const getAvailabilityColor = (
  availability: WorkerAvailability,
): string => {
  const colors: Record<WorkerAvailability, string> = {
    available: "#4CAF50",
    busy: "#F44336",
    "almost-done": "#FF9800",
    offline: "#9E9E9E",
  };
  return colors[availability] || "#9E9E9E";
};
