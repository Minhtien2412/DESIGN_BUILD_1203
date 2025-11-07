/**
 * Contractors API Service
 * Handles contractor search, verification, and management
 */

import api from './api-client';

// Types
export interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  specialties: string[];
  location: {
    city: string;
    district: string;
  };
  workingRadius: number; // km
  verified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  businessLicense?: string;
  taxId?: string;
  experience: number; // years
  description: string;
  portfolio: {
    id: string;
    title: string;
    images: string[];
    category: 'design' | 'construction' | 'architecture';
  }[];
  pricing: {
    min: number;
    max: number;
    unit: 'project' | 'm2' | 'day';
  };
  availability: 'available' | 'busy' | 'unavailable';
  certificates: {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    fileUrl: string;
  }[];
  createdAt: string;
}

export interface ContractorReview {
  id: string;
  contractorId: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface ContractorSearchFilters {
  query?: string;
  category?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  availability?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'experience' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Contractors API
 */
export const contractorsApi = {
  // Search contractors
  search: async (filters: ContractorSearchFilters): Promise<{
    contractors: Contractor[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const queryParams = new URLSearchParams(filters as any).toString();
    return api.get(`/contractors/search?${queryParams}`);
  },

  // Get contractor by ID
  getById: async (id: string): Promise<Contractor> => {
    return api.get(`/contractors/${id}`);
  },

  // Get contractor reviews
  getReviews: async (contractorId: string, page = 1, limit = 10): Promise<{
    reviews: ContractorReview[];
    total: number;
  }> => {
    return api.get(`/contractors/${contractorId}/reviews?page=${page}&limit=${limit}`);
  },

  // Submit contractor verification
  submitVerification: async (data: {
    businessName: string;
    businessLicense: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    certificates: File[];
    portfolio: File[];
  }): Promise<{ message: string; verificationId: string }> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((file, index) => {
          formData.append(`${key}[${index}]`, file);
        });
      } else {
        formData.append(key, value);
      }
    });
    return api.upload('/contractors/verification', formData);
  },

  // Update contractor profile
  updateProfile: async (contractorId: string, data: Partial<Contractor>): Promise<Contractor> => {
    return api.put(`/contractors/${contractorId}`, data);
  },

  // Add portfolio item
  addPortfolio: async (contractorId: string, portfolio: {
    title: string;
    category: 'design' | 'construction' | 'architecture';
    images: FormData;
  }): Promise<{ id: string }> => {
    return api.upload(`/contractors/${contractorId}/portfolio`, portfolio.images);
  },

  // Request quotation
  requestQuotation: async (contractorId: string, projectData: {
    projectId: string;
    description: string;
    requirements: string[];
    deadline: string;
  }): Promise<{ quotationId: string }> => {
    return api.post(`/contractors/${contractorId}/quotations`, projectData);
  },

  // Get contractor availability
  getAvailability: async (contractorId: string, startDate: string, endDate: string): Promise<{
    available: boolean;
    busyDates: string[];
  }> => {
    return api.get(
      `/contractors/${contractorId}/availability?start=${startDate}&end=${endDate}`
    );
  },

  // Contact contractor
  contact: async (contractorId: string, message: {
    subject: string;
    content: string;
    projectId?: string;
  }): Promise<{ conversationId: string }> => {
    return api.post(`/contractors/${contractorId}/contact`, message);
  },
};

export default contractorsApi;
