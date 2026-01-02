/**
 * Utilities API Client
 * For app utilities/features management
 */
import { apiFetch } from '../api';

export interface Utility {
  id: number;
  name: string;
  description: string;
  type: 'CALCULATOR' | 'AI' | 'MEDIA' | 'DOCUMENT' | 'TOOL';
  icon: string;
  color: string;
  route: string;
  enabled: boolean;
  viewCount: number;
  useCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UtilityQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: Utility['type'];
  enabled?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUtilityDto {
  name: string;
  description: string;
  type: Utility['type'];
  icon: string;
  color: string;
  route: string;
  enabled?: boolean;
}

export type UpdateUtilityDto = Partial<CreateUtilityDto>;

export interface UtilitiesResponse {
  data: Utility[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class UtilitiesService {
  private readonly baseUrl = '/utilities';

  async getUtilities(query?: UtilityQuery): Promise<UtilitiesResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    return apiFetch<UtilitiesResponse>(url);
  }

  async getUtility(id: number): Promise<Utility> {
    return apiFetch<Utility>(`${this.baseUrl}/${id}`);
  }

  async createUtility(data: CreateUtilityDto): Promise<Utility> {
    return apiFetch<Utility>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUtility(id: number, data: UpdateUtilityDto): Promise<Utility> {
    return apiFetch<Utility>(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUtility(id: number): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleEnabled(id: number): Promise<Utility> {
    return apiFetch<Utility>(`${this.baseUrl}/${id}/toggle-enabled`, {
      method: 'PATCH',
    });
  }

  async incrementUseCount(id: number): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/${id}/use`, {
      method: 'POST',
    });
  }
}

export const utilitiesService = new UtilitiesService();
