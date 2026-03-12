/**
 * Services API Client
 * For construction services management
 */
import { apiFetch } from '../api';

export interface Service {
  id: number;
  name: string;
  description: string;
  category: 'DESIGN' | 'CONSTRUCTION' | 'FINISHING' | 'CONSULTING' | 'INSPECTION' | 'MAINTENANCE';
  price: number;
  unit: string;
  duration?: string;
  features?: string[];
  images?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  viewCount: number;
  orderCount: number;
  rating?: number;
  reviewCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ServiceQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: Service['category'];
  status?: Service['status'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateServiceDto {
  name: string;
  description: string;
  category: Service['category'];
  price: number;
  unit: string;
  duration?: string;
  features?: string[];
  images?: string[];
  status?: Service['status'];
}

export type UpdateServiceDto = Partial<CreateServiceDto>;

export interface ServicesResponse {
  data: Service[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ServicesService {
  private readonly baseUrl = '/services';

  async getServices(query?: ServiceQuery): Promise<ServicesResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    return apiFetch<ServicesResponse>(url);
  }

  async getService(id: number): Promise<Service> {
    return apiFetch<Service>(`${this.baseUrl}/${id}`);
  }

  async createService(data: CreateServiceDto): Promise<Service> {
    return apiFetch<Service>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: number, data: UpdateServiceDto): Promise<Service> {
    return apiFetch<Service>(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: number): Promise<void> {
    return apiFetch<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleStatus(id: number): Promise<Service> {
    return apiFetch<Service>(`${this.baseUrl}/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }
}

export const servicesService = new ServicesService();
