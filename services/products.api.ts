/**
 * Products/Equipment API Service
 * Connects to BE /products endpoints
 */

import { del, get, patch, post } from "./api";

// Types
export enum ProductCategory {
  // Thiết bị xây dựng
  CONSTRUCTION_EQUIPMENT = "CONSTRUCTION_EQUIPMENT",
  POWER_TOOLS = "POWER_TOOLS",
  HAND_TOOLS = "HAND_TOOLS",
  SAFETY_EQUIPMENT = "SAFETY_EQUIPMENT",
  MEASURING_TOOLS = "MEASURING_TOOLS",

  // Vật liệu xây dựng
  CEMENT_CONCRETE = "CEMENT_CONCRETE",
  STEEL_IRON = "STEEL_IRON",
  BRICKS_TILES = "BRICKS_TILES",
  WOOD_TIMBER = "WOOD_TIMBER",
  SAND_GRAVEL = "SAND_GRAVEL",
  PAINT_COATING = "PAINT_COATING",

  // Điện nước
  ELECTRICAL = "ELECTRICAL",
  PLUMBING = "PLUMBING",
  LIGHTING = "LIGHTING",

  // Hoàn thiện
  FURNITURE = "FURNITURE",
  FLOORING = "FLOORING",
  DOORS_WINDOWS = "DOORS_WINDOWS",
  KITCHEN_BATHROOM = "KITCHEN_BATHROOM",
  DECORATION = "DECORATION",

  // Khác
  RENTAL_EQUIPMENT = "RENTAL_EQUIPMENT",
  USED_EQUIPMENT = "USED_EQUIPMENT",
  OTHER = "OTHER",
}

export enum ProductStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ProductCondition {
  NEW = "NEW",
  USED = "USED",
  REFURBISHED = "REFURBISHED",
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  status: ProductStatus;
  viewCount: number;
  soldCount: number;
  isBestseller: boolean;
  isNew: boolean;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
  images?: Array<{
    id: number;
    url: string;
    alt?: string;
  }>;
  condition?: ProductCondition;
  location?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  location?: string;
  featured?: boolean;
  inStock?: boolean;
  condition?: string;
  sortBy?: "createdAt" | "price" | "name" | "rating" | "sales";
  sortOrder?: "asc" | "desc";
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock?: number;
  condition?: ProductCondition;
  location?: string;
  images?: string[];
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
const BASE_PATH = "/products";

/**
 * Get all products with filters
 */
export const getProducts = async (
  params?: ProductQueryParams,
): Promise<PaginatedResponse<Product>> => {
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

  return get<PaginatedResponse<Product>>(url);
};

/**
 * Get single product by ID
 */
export const getProductById = async (id: number): Promise<Product> => {
  return get<Product>(`${BASE_PATH}/${id}`);
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  return get<Array<{ id: string; value: string; label: string; icon: string }>>(
    `${BASE_PATH}/categories`,
  );
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (): Promise<
  PaginatedResponse<Product>
> => {
  return get<PaginatedResponse<Product>>(`${BASE_PATH}/featured`);
};

/**
 * Get best selling products
 */
export const getBestSellers = async (
  limit: number = 10,
): Promise<PaginatedResponse<Product>> => {
  return get<PaginatedResponse<Product>>(
    `${BASE_PATH}/best-sellers?limit=${limit}`,
  );
};

/**
 * Get new arrival products
 */
export const getNewArrivals = async (
  limit: number = 10,
): Promise<PaginatedResponse<Product>> => {
  return get<PaginatedResponse<Product>>(
    `${BASE_PATH}/new-arrivals?limit=${limit}`,
  );
};

/**
 * Search products by query
 */
export const searchProducts = async (
  query: string,
  limit: number = 20,
): Promise<PaginatedResponse<Product>> => {
  return get<PaginatedResponse<Product>>(
    `${BASE_PATH}?search=${encodeURIComponent(query)}&limit=${limit}`,
  );
};

/**
 * Get related products
 */
export const getRelatedProducts = async (
  productId: number,
  limit: number = 8,
): Promise<PaginatedResponse<Product>> => {
  return get<PaginatedResponse<Product>>(
    `${BASE_PATH}/${productId}/related?limit=${limit}`,
  );
};

/**
 * Create new product (requires auth)
 */
export const createProduct = async (
  data: CreateProductDto,
): Promise<Product> => {
  return post<Product>(BASE_PATH, data);
};

/**
 * Update product (requires auth)
 */
export const updateProduct = async (
  id: number,
  data: Partial<CreateProductDto>,
): Promise<Product> => {
  return patch<Product>(`${BASE_PATH}/${id}`, data);
};

/**
 * Delete product (requires auth)
 */
export const deleteProduct = async (id: number): Promise<void> => {
  return del(`${BASE_PATH}/${id}`);
};

// Admin functions
/**
 * Get pending products for approval (admin only)
 */
export const getPendingProducts = async (): Promise<
  PaginatedResponse<Product>
> => {
  return get<PaginatedResponse<Product>>(`${BASE_PATH}/admin/pending`);
};

/**
 * Update product status (admin only)
 */
export const updateProductStatus = async (
  id: number,
  status: ProductStatus,
  reason?: string,
) => {
  return patch(`${BASE_PATH}/${id}/status`, { status, reason });
};

/**
 * Toggle featured status (admin only)
 */
export const toggleFeaturedProduct = async (id: number) => {
  return patch(`${BASE_PATH}/${id}/feature`, {});
};

// Helper: Get category label
export const getCategoryLabel = (
  category: ProductCategory | string,
): string => {
  const labels: Record<string, string> = {
    [ProductCategory.CONSTRUCTION_EQUIPMENT]: "Thiết bị xây dựng",
    [ProductCategory.POWER_TOOLS]: "Dụng cụ điện",
    [ProductCategory.HAND_TOOLS]: "Dụng cụ cầm tay",
    [ProductCategory.SAFETY_EQUIPMENT]: "Thiết bị an toàn",
    [ProductCategory.MEASURING_TOOLS]: "Dụng cụ đo lường",
    [ProductCategory.CEMENT_CONCRETE]: "Xi măng & Bê tông",
    [ProductCategory.STEEL_IRON]: "Thép & Sắt",
    [ProductCategory.BRICKS_TILES]: "Gạch & Ngói",
    [ProductCategory.WOOD_TIMBER]: "Gỗ & Ván",
    [ProductCategory.SAND_GRAVEL]: "Cát & Đá",
    [ProductCategory.PAINT_COATING]: "Sơn & Phủ",
    [ProductCategory.ELECTRICAL]: "Thiết bị điện",
    [ProductCategory.PLUMBING]: "Thiết bị nước",
    [ProductCategory.LIGHTING]: "Đèn chiếu sáng",
    [ProductCategory.FURNITURE]: "Nội thất",
    [ProductCategory.FLOORING]: "Sàn & Lát",
    [ProductCategory.DOORS_WINDOWS]: "Cửa & Cửa sổ",
    [ProductCategory.KITCHEN_BATHROOM]: "Bếp & Phòng tắm",
    [ProductCategory.DECORATION]: "Trang trí",
    [ProductCategory.RENTAL_EQUIPMENT]: "Cho thuê thiết bị",
    [ProductCategory.USED_EQUIPMENT]: "Thiết bị đã qua sử dụng",
    [ProductCategory.OTHER]: "Khác",
  };
  return labels[category] || category;
};

// Helper: Get category icon
export const getCategoryIcon = (category: ProductCategory | string): string => {
  const icons: Record<string, string> = {
    [ProductCategory.CONSTRUCTION_EQUIPMENT]: "construct",
    [ProductCategory.POWER_TOOLS]: "flash",
    [ProductCategory.HAND_TOOLS]: "hammer",
    [ProductCategory.SAFETY_EQUIPMENT]: "shield-checkmark",
    [ProductCategory.MEASURING_TOOLS]: "analytics",
    [ProductCategory.CEMENT_CONCRETE]: "cube",
    [ProductCategory.STEEL_IRON]: "link",
    [ProductCategory.BRICKS_TILES]: "grid",
    [ProductCategory.WOOD_TIMBER]: "layers",
    [ProductCategory.SAND_GRAVEL]: "planet",
    [ProductCategory.PAINT_COATING]: "color-palette",
    [ProductCategory.ELECTRICAL]: "flash-outline",
    [ProductCategory.PLUMBING]: "water",
    [ProductCategory.LIGHTING]: "sunny",
    [ProductCategory.FURNITURE]: "bed",
    [ProductCategory.FLOORING]: "apps",
    [ProductCategory.DOORS_WINDOWS]: "stop-outline",
    [ProductCategory.KITCHEN_BATHROOM]: "restaurant",
    [ProductCategory.DECORATION]: "flower",
    [ProductCategory.RENTAL_EQUIPMENT]: "time",
    [ProductCategory.USED_EQUIPMENT]: "refresh",
    [ProductCategory.OTHER]: "ellipsis-horizontal",
  };
  return icons[category] || "cube-outline";
};

// Helper: Format price
export const formatPrice = (price: number): string => {
  return price.toLocaleString("vi-VN") + "đ";
};

// Helper: Get condition label
export const getConditionLabel = (condition: ProductCondition): string => {
  const labels: Record<ProductCondition, string> = {
    [ProductCondition.NEW]: "Mới 100%",
    [ProductCondition.USED]: "Đã qua sử dụng",
    [ProductCondition.REFURBISHED]: "Đã tân trang",
  };
  return labels[condition] || condition;
};

// Helper: Get stock status
export const getStockStatus = (
  stock: number,
): { label: string; color: string } => {
  if (stock === 0) {
    return { label: "Hết hàng", color: "#F44336" };
  }
  if (stock <= 5) {
    return { label: "Còn ít", color: "#FF9800" };
  }
  return { label: "Còn hàng", color: "#4CAF50" };
};

// Category groups for UI
export const CATEGORY_GROUPS = [
  {
    title: "Thiết bị & Dụng cụ",
    categories: [
      ProductCategory.CONSTRUCTION_EQUIPMENT,
      ProductCategory.POWER_TOOLS,
      ProductCategory.HAND_TOOLS,
      ProductCategory.SAFETY_EQUIPMENT,
      ProductCategory.MEASURING_TOOLS,
    ],
  },
  {
    title: "Vật liệu xây dựng",
    categories: [
      ProductCategory.CEMENT_CONCRETE,
      ProductCategory.STEEL_IRON,
      ProductCategory.BRICKS_TILES,
      ProductCategory.WOOD_TIMBER,
      ProductCategory.SAND_GRAVEL,
      ProductCategory.PAINT_COATING,
    ],
  },
  {
    title: "Điện & Nước",
    categories: [
      ProductCategory.ELECTRICAL,
      ProductCategory.PLUMBING,
      ProductCategory.LIGHTING,
    ],
  },
  {
    title: "Hoàn thiện & Nội thất",
    categories: [
      ProductCategory.FURNITURE,
      ProductCategory.FLOORING,
      ProductCategory.DOORS_WINDOWS,
      ProductCategory.KITCHEN_BATHROOM,
      ProductCategory.DECORATION,
    ],
  },
  {
    title: "Dịch vụ & Khác",
    categories: [
      ProductCategory.RENTAL_EQUIPMENT,
      ProductCategory.USED_EQUIPMENT,
      ProductCategory.OTHER,
    ],
  },
];
