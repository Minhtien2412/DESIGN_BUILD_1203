/**
 * Labor/Provider API Client
 * For construction labor teams, contractors and service providers
 */
import { apiFetch } from "../api";

// Types for Labor Teams/Providers
export interface LaborProvider {
  id: string;
  name: string;
  type:
    | "coffa"
    | "xay"
    | "dien-nuoc"
    | "be-tong"
    | "dao-dat"
    | "vat-lieu"
    | "nhan-cong"
    | "ep-coc"
    | "design-team";
  avatar?: string;
  coverImage?: string;
  phone: string;
  email?: string;
  address: string;
  district?: string;
  city?: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  yearExperience: number;
  priceRange: {
    min: number;
    max: number;
    unit: string;
  };
  description: string;
  services: string[];
  certifications?: string[];
  gallery?: string[];
  availability: "available" | "busy" | "unavailable";
  verified: boolean;
  featured: boolean;
  reviews?: LaborReview[];
  createdAt: string;
  updatedAt: string;
}

export interface LaborReview {
  id: string;
  providerId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  projectName?: string;
  createdAt: string;
}

export interface LaborQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: LaborProvider["type"];
  district?: string;
  city?: string;
  minRating?: number;
  maxPrice?: number;
  availability?: LaborProvider["availability"];
  verified?: boolean;
  featured?: boolean;
  sortBy?: "rating" | "price" | "reviewCount" | "projectCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateLaborProviderDto {
  name: string;
  type: LaborProvider["type"];
  phone: string;
  email?: string;
  address: string;
  district?: string;
  city?: string;
  description: string;
  services: string[];
  priceRange: {
    min: number;
    max: number;
    unit: string;
  };
  certifications?: string[];
  gallery?: string[];
}

export type UpdateLaborProviderDto = Partial<CreateLaborProviderDto>;

export interface LaborProvidersResponse {
  data: LaborProvider[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LaborReviewsResponse {
  data: LaborReview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateReviewDto {
  providerId: string;
  rating: number;
  comment: string;
  images?: string[];
  projectName?: string;
}

export interface BookingRequest {
  providerId: string;
  projectName: string;
  projectAddress: string;
  startDate: string;
  endDate?: string;
  description: string;
  services: string[];
  contactPhone: string;
  contactName: string;
}

export interface BookingResponse {
  id: string;
  providerId: string;
  status: "pending" | "confirmed" | "rejected" | "completed";
  createdAt: string;
}

class LaborService {
  // Backend route: /api/v1/labor (NOT /labor-providers)
  private readonly baseUrl = "/labor";

  /**
   * Get all labor providers with optional filtering
   */
  async getProviders(query?: LaborQuery): Promise<LaborProvidersResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    return apiFetch<LaborProvidersResponse>(url);
  }

  /**
   * Get providers by type (coffa, xay, dien-nuoc, etc.)
   */
  async getProvidersByType(
    type: LaborProvider["type"],
    query?: Omit<LaborQuery, "type">,
  ): Promise<LaborProvidersResponse> {
    return this.getProviders({ ...query, type });
  }

  /**
   * Get a single provider by ID
   */
  async getProvider(id: string): Promise<LaborProvider> {
    return apiFetch<LaborProvider>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get reviews for a provider
   */
  async getProviderReviews(
    providerId: string,
    page = 1,
    limit = 10,
  ): Promise<LaborReviewsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiFetch<LaborReviewsResponse>(
      `${this.baseUrl}/${providerId}/reviews?${params.toString()}`,
    );
  }

  /**
   * Get featured/recommended providers
   */
  async getFeaturedProviders(
    type?: LaborProvider["type"],
  ): Promise<LaborProvidersResponse> {
    const query: LaborQuery = { featured: true, limit: 10 };
    if (type) query.type = type;
    return this.getProviders(query);
  }

  /**
   * Search providers by keyword
   */
  async searchProviders(
    keyword: string,
    type?: LaborProvider["type"],
  ): Promise<LaborProvidersResponse> {
    const query: LaborQuery = { search: keyword };
    if (type) query.type = type;
    return this.getProviders(query);
  }

  /**
   * Create a new provider profile (for contractors)
   */
  async createProvider(data: CreateLaborProviderDto): Promise<LaborProvider> {
    return apiFetch<LaborProvider>(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update provider profile
   */
  async updateProvider(
    id: string,
    data: UpdateLaborProviderDto,
  ): Promise<LaborProvider> {
    return apiFetch<LaborProvider>(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete provider profile
   */
  async deleteProvider(id: string): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Add a review for a provider
   */
  async addReview(data: CreateReviewDto): Promise<LaborReview> {
    return apiFetch<LaborReview>(`${this.baseUrl}/${data.providerId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Book/request a provider
   */
  async requestBooking(data: BookingRequest): Promise<BookingResponse> {
    return apiFetch<BookingResponse>(
      `${this.baseUrl}/${data.providerId}/bookings`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  /**
   * Get nearby providers based on location
   * Backend: GET /labor/nearby?latitude=...&longitude=...&radius=...&skills=...
   */
  async getNearbyProviders(
    latitude: number,
    longitude: number,
    options?: { radius?: number; skills?: string[]; limit?: number },
  ): Promise<LaborProvidersResponse> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
    });
    if (options?.radius) params.append("radius", String(options.radius));
    if (options?.skills) params.append("skills", options.skills.join(","));
    if (options?.limit) params.append("limit", String(options.limit));
    return apiFetch<LaborProvidersResponse>(
      `${this.baseUrl}/nearby?${params.toString()}`,
    );
  }
}

export const laborService = new LaborService();
export default laborService;
