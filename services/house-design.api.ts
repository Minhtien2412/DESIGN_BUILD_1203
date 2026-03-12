/**
 * House Design API Service
 * Connects to BE /services/house-designs endpoints
 */

import { del, get, patch, post } from "./api";

// Types
export enum DesignType {
  NHA_PHO = "NHA_PHO",
  BIET_THU = "BIET_THU",
  NHA_CAP_4 = "NHA_CAP_4",
  NHA_VUON = "NHA_VUON",
  NHA_2_TANG = "NHA_2_TANG",
  NHA_3_TANG = "NHA_3_TANG",
  NHA_4_TANG = "NHA_4_TANG",
  CAN_HO = "CAN_HO",
  CHUNG_CU = "CHUNG_CU",
  SHOP_HOUSE = "SHOP_HOUSE",
  RESORT = "RESORT",
  VAN_PHONG = "VAN_PHONG",
  NHA_HANG = "NHA_HANG",
  CAFE = "CAFE",
  KHAC = "KHAC",
}

export enum DesignStyle {
  HIEN_DAI = "HIEN_DAI",
  TAN_CO_DIEN = "TAN_CO_DIEN",
  MINIMALIST = "MINIMALIST",
  INDOCHINE = "INDOCHINE",
  NHAT_BAN = "NHAT_BAN",
  DIA_TRUNG_HAI = "DIA_TRUNG_HAI",
  INDUSTRIAL = "INDUSTRIAL",
  SCANDINAVIAN = "SCANDINAVIAN",
}

export enum DesignStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FEATURED = "FEATURED",
}

export interface HouseDesign {
  id: string;
  title: string;
  description?: string;
  designType: DesignType;
  style: DesignStyle;
  area: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  estimatedCost: number;
  images: string[];
  floorPlans?: string[];
  designer: {
    id: string;
    name: string;
    avatar?: string;
    company?: string;
  };
  rating: number;
  reviewCount: number;
  viewCount: number;
  featured: boolean;
  status: DesignStatus;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseDesignQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  designType?: DesignType;
  style?: DesignStyle;
  minArea?: number;
  maxArea?: number;
  minCost?: number;
  maxCost?: number;
  minFloors?: number;
  maxFloors?: number;
  location?: string;
  featured?: boolean;
  status?: DesignStatus;
  sortBy?: "createdAt" | "rating" | "viewCount" | "estimatedCost";
  sortOrder?: "asc" | "desc";
}

export interface CreateHouseDesignDto {
  title: string;
  description?: string;
  designType: DesignType;
  style: DesignStyle;
  area: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  estimatedCost: number;
  images: string[];
  floorPlans?: string[];
  location?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Functions
const BASE_PATH = "/services/house-designs";

/**
 * Get all house designs with filters
 */
export const getHouseDesigns = async (
  params?: HouseDesignQueryParams,
): Promise<PaginatedResponse<HouseDesign>> => {
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

  return get<PaginatedResponse<HouseDesign>>(url);
};

/**
 * Get single house design by ID
 */
export const getHouseDesignById = async (id: string): Promise<HouseDesign> => {
  return get<HouseDesign>(`${BASE_PATH}/${id}`);
};

/**
 * Get design types with labels
 */
export const getDesignTypes = async () => {
  return get<Array<{ id: string; value: string; label: string; icon: string }>>(
    `${BASE_PATH}/types`,
  );
};

/**
 * Get design styles with labels
 */
export const getDesignStyles = async () => {
  return get<Array<{ id: string; value: string; label: string }>>(
    `${BASE_PATH}/styles`,
  );
};

/**
 * Get featured designs
 */
export const getFeaturedDesigns = async () => {
  return get<PaginatedResponse<HouseDesign>>(`${BASE_PATH}/featured`);
};

/**
 * Create new house design (requires auth)
 */
export const createHouseDesign = async (
  data: CreateHouseDesignDto,
): Promise<HouseDesign> => {
  return post<HouseDesign>(BASE_PATH, data);
};

/**
 * Update house design (requires auth)
 */
export const updateHouseDesign = async (
  id: string,
  data: Partial<CreateHouseDesignDto>,
): Promise<HouseDesign> => {
  return patch<HouseDesign>(`${BASE_PATH}/${id}`, data);
};

/**
 * Delete house design (requires auth)
 */
export const deleteHouseDesign = async (id: string): Promise<void> => {
  return del(`${BASE_PATH}/${id}`);
};

// Admin functions
/**
 * Get pending designs for approval (admin only)
 */
export const getPendingDesigns = async () => {
  return get<PaginatedResponse<HouseDesign>>(`${BASE_PATH}/admin/pending`);
};

/**
 * Approve/reject design (admin only)
 */
export const approveDesign = async (
  id: string,
  status: DesignStatus,
  reason?: string,
) => {
  return patch(`${BASE_PATH}/${id}/approve`, { status, reason });
};

/**
 * Toggle featured status (admin only)
 */
export const toggleFeaturedDesign = async (id: string) => {
  return patch(`${BASE_PATH}/${id}/feature`, {});
};

// Helper: Get label for design type
export const getDesignTypeLabel = (type: DesignType): string => {
  const labels: Record<DesignType, string> = {
    [DesignType.NHA_PHO]: "Nhà phố",
    [DesignType.BIET_THU]: "Biệt thự",
    [DesignType.NHA_CAP_4]: "Nhà cấp 4",
    [DesignType.NHA_VUON]: "Nhà vườn",
    [DesignType.NHA_2_TANG]: "Nhà 2 tầng",
    [DesignType.NHA_3_TANG]: "Nhà 3 tầng",
    [DesignType.NHA_4_TANG]: "Nhà 4 tầng",
    [DesignType.CAN_HO]: "Căn hộ",
    [DesignType.CHUNG_CU]: "Chung cư",
    [DesignType.SHOP_HOUSE]: "Shop house",
    [DesignType.RESORT]: "Resort",
    [DesignType.VAN_PHONG]: "Văn phòng",
    [DesignType.NHA_HANG]: "Nhà hàng",
    [DesignType.CAFE]: "Cafe",
    [DesignType.KHAC]: "Khác",
  };
  return labels[type] || type;
};

// Helper: Get label for design style
export const getDesignStyleLabel = (style: DesignStyle): string => {
  const labels: Record<DesignStyle, string> = {
    [DesignStyle.HIEN_DAI]: "Hiện đại",
    [DesignStyle.TAN_CO_DIEN]: "Tân cổ điển",
    [DesignStyle.MINIMALIST]: "Minimalist",
    [DesignStyle.INDOCHINE]: "Indochine",
    [DesignStyle.NHAT_BAN]: "Phong cách Nhật",
    [DesignStyle.DIA_TRUNG_HAI]: "Địa Trung Hải",
    [DesignStyle.INDUSTRIAL]: "Industrial",
    [DesignStyle.SCANDINAVIAN]: "Scandinavian",
  };
  return labels[style] || style;
};

// Helper: Format cost
export const formatCost = (cost: number): string => {
  if (cost >= 1000000000) {
    return `${(cost / 1000000000).toFixed(1)} tỷ`;
  }
  if (cost >= 1000000) {
    return `${(cost / 1000000).toFixed(0)} triệu`;
  }
  return cost.toLocaleString("vi-VN") + "đ";
};
