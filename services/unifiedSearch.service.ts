/**
 * Unified Search Service
 * Search across products, workers, companies, partners and users
 * @created 2025-01-29
 */

import { Product, PRODUCTS } from "@/data/products";
import { get } from "./api";
import { CompanyListItem, getConstructionCompanies } from "./company.service";
import { Worker, WorkerQueryParams } from "./workers.api";

// ============================================================================
// TYPES
// ============================================================================

export type SearchEntityType =
  | "product"
  | "worker"
  | "company"
  | "partner"
  | "user";

export interface SearchFilters {
  entityType: SearchEntityType | "all";
  query: string;
  location?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "rating" | "price" | "name" | "newest";
  sortOrder?: "asc" | "desc";
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "seller" | "contractor" | "worker" | "admin";
  location?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  joinedAt?: string;
}

export interface PartnerProfile {
  id: string;
  name: string;
  logo?: string;
  type: "supplier" | "contractor" | "investor" | "architect" | "designer";
  location: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  projectCount?: number;
  verified: boolean;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnifiedSearchResult {
  products: SearchResult<Product>;
  workers: SearchResult<Worker>;
  companies: SearchResult<CompanyListItem>;
  partners: SearchResult<PartnerProfile>;
  users: SearchResult<UserProfile>;
  totalCount: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_USERS: UserProfile[] = [
  {
    id: "u1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
    avatar: "https://ui-avatars.com/api/?name=NVA&background=FF6B35&color=fff",
    role: "customer",
    location: "Quận 1, TP.HCM",
    verified: true,
    joinedAt: "2024-01-15",
  },
  {
    id: "u2",
    name: "Trần Thị B",
    email: "tranthib@gmail.com",
    phone: "0912345678",
    avatar: "https://ui-avatars.com/api/?name=TTB&background=4CAF50&color=fff",
    role: "seller",
    location: "Quận 7, TP.HCM",
    verified: true,
    rating: 4.8,
    reviewCount: 156,
    joinedAt: "2023-06-20",
  },
  {
    id: "u3",
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    avatar: "https://ui-avatars.com/api/?name=LVC&background=2196F3&color=fff",
    role: "contractor",
    location: "Thủ Đức, TP.HCM",
    verified: false,
    rating: 4.5,
    reviewCount: 89,
    joinedAt: "2024-03-10",
  },
];

const MOCK_PARTNERS: PartnerProfile[] = [
  {
    id: "p1",
    name: "Công ty TNHH Xây dựng Thành Công",
    logo: "https://ui-avatars.com/api/?name=TC&background=FF6B35&color=fff",
    type: "contractor",
    location: "Quận 7, TP.HCM",
    specialties: ["Xây dựng dân dụng", "Biệt thự", "Nhà phố"],
    rating: 4.9,
    reviewCount: 234,
    projectCount: 156,
    verified: true,
    contact: {
      phone: "028 1234 5678",
      email: "thanhcong@xd.vn",
      website: "www.thanhcongxd.vn",
    },
  },
  {
    id: "p2",
    name: "Vật liệu xây dựng Phú Thành",
    logo: "https://ui-avatars.com/api/?name=PT&background=4CAF50&color=fff",
    type: "supplier",
    location: "Quận 12, TP.HCM",
    specialties: ["Xi măng", "Gạch", "Sắt thép", "Cát đá"],
    rating: 4.7,
    reviewCount: 189,
    verified: true,
    contact: {
      phone: "028 9876 5432",
      email: "phuthanh@vlxd.vn",
    },
  },
  {
    id: "p3",
    name: "Kiến trúc sư Nguyễn Hoàng",
    logo: "https://ui-avatars.com/api/?name=NH&background=9C27B0&color=fff",
    type: "architect",
    location: "Quận 3, TP.HCM",
    specialties: ["Thiết kế biệt thự", "Nội thất hiện đại", "Kiến trúc xanh"],
    rating: 4.8,
    reviewCount: 145,
    projectCount: 78,
    verified: true,
    contact: {
      phone: "0909 123 456",
      email: "hoang.kts@gmail.com",
    },
  },
  {
    id: "p4",
    name: "Đầu tư BĐS Minh Phát",
    logo: "https://ui-avatars.com/api/?name=MP&background=FF9800&color=fff",
    type: "investor",
    location: "Quận 1, TP.HCM",
    specialties: ["Căn hộ cao cấp", "Biệt thự", "Đất nền"],
    rating: 4.6,
    reviewCount: 98,
    verified: true,
    contact: {
      phone: "028 3456 7890",
      website: "www.minhphat.vn",
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize Vietnamese text for search
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
}

/**
 * Check if text matches search query (supports Vietnamese)
 */
export function matchesQuery(text: string, query: string): boolean {
  if (!query || !text) return true;
  const normalizedText = normalizeVietnamese(text);
  const normalizedQuery = normalizeVietnamese(query);
  return (
    text.toLowerCase().includes(query.toLowerCase()) ||
    normalizedText.includes(normalizedQuery)
  );
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search products
 */
export async function searchProducts(
  filters: SearchFilters,
): Promise<SearchResult<Product>> {
  const { query, category, minPrice, maxPrice, page = 1, limit = 20 } = filters;

  try {
    // Try API first
    const response = await get<{ data: Product[]; meta: any }>("/products", {
      search: query,
      category,
      minPrice,
      maxPrice,
      page,
      limit,
    });

    if (response?.data) {
      return {
        data: response.data,
        total: response.meta?.total || response.data.length,
        page: response.meta?.page || page,
        limit: response.meta?.limit || limit,
        totalPages: response.meta?.totalPages || 1,
      };
    }
  } catch (error) {
    console.log("Products API error, using local data:", error);
  }

  // Fallback to local data
  let results = PRODUCTS;

  if (query) {
    results = results.filter(
      (p) =>
        matchesQuery(p.name, query) ||
        matchesQuery(p.description || "", query) ||
        matchesQuery(p.category || "", query) ||
        matchesQuery(p.brand || "", query),
    );
  }

  if (category && category !== "all") {
    results = results.filter((p) => p.category === category);
  }

  if (minPrice !== undefined) {
    results = results.filter((p) => p.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    results = results.filter((p) => p.price <= maxPrice);
  }

  const total = results.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    data: paginatedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Search workers
 */
export async function searchWorkers(
  filters: SearchFilters,
): Promise<SearchResult<Worker>> {
  const {
    query,
    location,
    minRating,
    verified,
    page = 1,
    limit = 20,
  } = filters;

  try {
    const params: WorkerQueryParams = {
      search: query,
      location,
      minRating,
      verified,
      page,
      limit,
    };

    const response = await get<{ data: Worker[]; meta: any }>(
      "/workers",
      params,
    );

    if (response?.data) {
      return {
        data: response.data,
        total: response.meta?.total || response.data.length,
        page: response.meta?.page || page,
        limit: response.meta?.limit || limit,
        totalPages: response.meta?.totalPages || 1,
      };
    }
  } catch (error) {
    console.log("Workers API error:", error);
  }

  // Return empty for workers (no local mock)
  return {
    data: [],
    total: 0,
    page,
    limit,
    totalPages: 0,
  };
}

/**
 * Search companies
 */
export async function searchCompanies(
  filters: SearchFilters,
): Promise<SearchResult<CompanyListItem>> {
  const { query, location, verified, page = 1, limit = 20 } = filters;

  try {
    const response = await getConstructionCompanies({
      page,
      limit,
      location,
      search: query,
    });

    let results = response.data || [];

    if (query) {
      results = results.filter(
        (c: CompanyListItem) =>
          matchesQuery(c.name, query) ||
          c.specialties.some((s: string) => matchesQuery(s, query)),
      );
    }

    if (location && location !== "Tất cả") {
      results = results.filter((c: CompanyListItem) =>
        c.location.includes(location),
      );
    }

    if (verified !== undefined) {
      results = results.filter((c: CompanyListItem) => c.verified === verified);
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      data: paginatedResults,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.log("Companies search error:", error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}

/**
 * Search partners
 */
export async function searchPartners(
  filters: SearchFilters,
): Promise<SearchResult<PartnerProfile>> {
  const { query, location, category, verified, page = 1, limit = 20 } = filters;

  try {
    // Try API first
    const response = await get<{ data: PartnerProfile[]; meta: any }>(
      "/partners",
      { search: query, location, type: category, verified, page, limit },
    );

    if (response?.data) {
      return {
        data: response.data,
        total: response.meta?.total || response.data.length,
        page: response.meta?.page || page,
        limit: response.meta?.limit || limit,
        totalPages: response.meta?.totalPages || 1,
      };
    }
  } catch (error) {
    console.log("Partners API error, using mock data:", error);
  }

  // Fallback to mock data
  let results = MOCK_PARTNERS;

  if (query) {
    results = results.filter(
      (p) =>
        matchesQuery(p.name, query) ||
        p.specialties.some((s) => matchesQuery(s, query)),
    );
  }

  if (location && location !== "Tất cả") {
    results = results.filter((p) => p.location.includes(location));
  }

  if (category && category !== "all") {
    results = results.filter((p) => p.type === category);
  }

  if (verified !== undefined) {
    results = results.filter((p) => p.verified === verified);
  }

  const total = results.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    data: paginatedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Search users
 */
export async function searchUsers(
  filters: SearchFilters,
): Promise<SearchResult<UserProfile>> {
  const { query, location, category, verified, page = 1, limit = 20 } = filters;

  try {
    // Try API first
    const response = await get<{ data: UserProfile[]; meta: any }>("/users", {
      search: query,
      location,
      role: category,
      verified,
      page,
      limit,
    });

    if (response?.data) {
      return {
        data: response.data,
        total: response.meta?.total || response.data.length,
        page: response.meta?.page || page,
        limit: response.meta?.limit || limit,
        totalPages: response.meta?.totalPages || 1,
      };
    }
  } catch (error) {
    console.log("Users API error, using mock data:", error);
  }

  // Fallback to mock data
  let results = MOCK_USERS;

  if (query) {
    results = results.filter(
      (u) =>
        matchesQuery(u.name, query) ||
        matchesQuery(u.email || "", query) ||
        matchesQuery(u.location || "", query),
    );
  }

  if (location && location !== "Tất cả") {
    results = results.filter((u) => (u.location || "").includes(location));
  }

  if (category && category !== "all") {
    results = results.filter((u) => u.role === category);
  }

  if (verified !== undefined) {
    results = results.filter((u) => u.verified === verified);
  }

  const total = results.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    data: paginatedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Unified search across all entity types
 */
export async function unifiedSearch(
  filters: SearchFilters,
): Promise<UnifiedSearchResult> {
  const { entityType } = filters;

  // Search all types in parallel
  const [products, workers, companies, partners, users] = await Promise.all([
    entityType === "all" || entityType === "product"
      ? searchProducts(filters)
      : Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
    entityType === "all" || entityType === "worker"
      ? searchWorkers(filters)
      : Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
    entityType === "all" || entityType === "company"
      ? searchCompanies(filters)
      : Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
    entityType === "all" || entityType === "partner"
      ? searchPartners(filters)
      : Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
    entityType === "all" || entityType === "user"
      ? searchUsers(filters)
      : Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
  ]);

  return {
    products,
    workers,
    companies,
    partners,
    users,
    totalCount:
      products.total +
      workers.total +
      companies.total +
      partners.total +
      users.total,
  };
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export const LOCATIONS = [
  "Tất cả",
  "TP.HCM",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
];

export const PRODUCT_CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "villa", label: "Biệt thự" },
  { id: "interior", label: "Nội thất" },
  { id: "materials", label: "Vật liệu" },
  { id: "architecture", label: "Kiến trúc" },
  { id: "construction", label: "Thi công" },
];

export const WORKER_SPECIALTIES = [
  { id: "all", label: "Tất cả" },
  { id: "tho-xay", label: "Thợ xây" },
  { id: "tho-dien", label: "Thợ điện" },
  { id: "tho-nuoc", label: "Thợ nước" },
  { id: "tho-son", label: "Thợ sơn" },
  { id: "tho-moc", label: "Thợ mộc" },
  { id: "tho-gach", label: "Thợ lát gạch" },
  { id: "tho-thach-cao", label: "Thợ thạch cao" },
];

export const PARTNER_TYPES = [
  { id: "all", label: "Tất cả" },
  { id: "contractor", label: "Nhà thầu" },
  { id: "supplier", label: "Nhà cung cấp" },
  { id: "architect", label: "Kiến trúc sư" },
  { id: "designer", label: "Nhà thiết kế" },
  { id: "investor", label: "Đầu tư" },
];

export const USER_ROLES = [
  { id: "all", label: "Tất cả" },
  { id: "customer", label: "Khách hàng" },
  { id: "seller", label: "Người bán" },
  { id: "contractor", label: "Nhà thầu" },
  { id: "worker", label: "Thợ" },
];
