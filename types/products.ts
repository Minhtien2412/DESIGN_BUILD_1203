/**
 * Products Types - Based on backend API
 * Backend: baotienweb-api/PRODUCTS_MODULE_GUIDE.md
 */

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ProductCategory {
  MATERIAL = 'MATERIAL',     // Vật liệu
  TOOL = 'TOOL',             // Công cụ
  EQUIPMENT = 'EQUIPMENT',   // Thiết bị
  SERVICE = 'SERVICE',       // Dịch vụ
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock?: number;
  sku?: string;
  images?: string[];
  specifications?: Record<string, any>;
  tags?: string[];
  isAvailable: boolean;
  status: ProductStatus;
  vendorId: number;
  vendor?: {
    id: number;
    email: string;
    name?: string;
  };
  moderatedBy?: number;
  moderatedAt?: string;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock?: number;
  sku?: string;
  images?: string[];
  specifications?: Record<string, any>;
  tags?: string[];
  isAvailable?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: number;
  unit?: string;
  stock?: number;
  sku?: string;
  images?: string[];
  specifications?: Record<string, any>;
  tags?: string[];
  isAvailable?: boolean;
}

export interface FilterProductsDto {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isAvailable?: boolean;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ModerateProductDto {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
