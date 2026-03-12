/**
 * Domain Entity: Product
 * =====================
 * Pure TypeScript interface — matches BE Prisma schema exactly.
 * No framework dependencies. Single source of truth for Product shape.
 *
 * BE model: prisma/schema.prisma → model Product
 * BE enums: ProductCategory, ProductStatus
 */

// ─────────────────────────────────────────────
// Enums — exact mirror of BE prisma enums
// ─────────────────────────────────────────────

export enum ProductCategory {
  ELECTRONICS = "ELECTRONICS",
  FASHION = "FASHION",
  HOME = "HOME",
  BEAUTY = "BEAUTY",
  SPORTS = "SPORTS",
  BOOKS = "BOOKS",
  TOYS = "TOYS",
  FOOD = "FOOD",
  OTHER = "OTHER",
}

export enum ProductStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// ─────────────────────────────────────────────
// Entities
// ─────────────────────────────────────────────

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface ProductSeller {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number; // Decimal(12,2) from BE → number on FE
  category: ProductCategory;
  stock: number;
  status: ProductStatus;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  soldCount: number;
  isBestseller: boolean;
  isNew: boolean;
  images: ProductImage[];
  seller?: ProductSeller;
}

// ─────────────────────────────────────────────
// DTOs — for create/update operations
// ─────────────────────────────────────────────

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock?: number;
  images?: string[]; // URLs to attach
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  stock?: number;
}

export interface ModerateProductDto {
  action: "approve" | "reject";
  reason?: string;
}

// ─────────────────────────────────────────────
// Query / Filter
// ─────────────────────────────────────────────

export interface ProductFilter {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  search?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "price" | "name" | "rating" | "sales";
  sortOrder?: "asc" | "desc";
  sellerId?: string;
  featured?: boolean;
  inStock?: boolean;
}

// ─────────────────────────────────────────────
// Paginated response shape (matches BE meta)
// ─────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────
// Product category UI metadata
// ─────────────────────────────────────────────

export interface ProductCategoryInfo {
  id: string;
  value: string;
  label: string;
  icon: string;
}
