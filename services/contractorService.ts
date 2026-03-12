/**
 * Contractor Service
 * Handle contractor search, listing, and selection
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Created: Session 5 - API Migration Batch 5
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES
// ============================================================================

export interface Contractor {
  id: string;
  name: string;
  type: string;
  image: string;
  price: number;
  unit: string;
  rating: number;
  experience: number;
  projects: number;
  status: 'available' | 'busy';
  // Extended fields
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  skills?: string[];
  portfolio?: string[];
  certifications?: string[];
  verified?: boolean;
}

export interface ContractorFilter {
  category?: string;
  location?: string;
  minRating?: number;
  minExperience?: number;
  maxPrice?: number;
  status?: 'available' | 'busy' | 'all';
  search?: string;
}

export interface ContractorListResponse {
  success: boolean;
  data: Contractor[];
  total?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// CATEGORIES & FILTERS
// ============================================================================

export const CONTRACTOR_CATEGORIES = [
  'Ép cọc',
  'Đào đất', 
  'Nhân công',
  'Vật liệu',
  'Điện nước',
  'Tô trát',
  'Xây dựng',
  'Nội thất',
];

export const CONTRACTOR_FILTERS = [
  'Khớp yêu cầu',
  'Được chọn nhiều',
  'Giá +',
  '4 sao trở lên',
  'Nhiều dự án',
  'Trên 10 Năm kinh nghiệm',
  '1-5 Năm Kinh Nghiệm',
];

export const LOCATIONS = ['Tất cả', 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

export const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: '1',
    name: 'Thợ tô trát tường - Đội A',
    type: 'Tô trát',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300',
    price: 150000,
    unit: 'd/m2',
    rating: 4.7,
    experience: 15,
    projects: 500,
    status: 'available',
    phone: '0901234567',
    description: 'Đội thợ lành nghề, chuyên tô trát tường hoàn thiện',
    skills: ['Tô trát', 'Sơn nước', 'Ốp lát'],
    verified: true,
  },
  {
    id: '2',
    name: 'Thợ ép cọc - Đội B',
    type: 'Ép cọc',
    image: 'https://images.unsplash.com/photo-1590642916589-592bca10dfbf?w=300',
    price: 100000,
    unit: 'd/m2',
    rating: 4.5,
    experience: 10,
    projects: 254,
    status: 'available',
    phone: '0912345678',
    description: 'Chuyên ép cọc bê tông, nền móng công trình',
    skills: ['Ép cọc', 'Đào móng', 'Bê tông'],
    verified: true,
  },
  {
    id: '3',
    name: 'Thợ xây tường - Đội C',
    type: 'Xây dựng',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300',
    price: 120000,
    unit: 'd/m2',
    rating: 4.2,
    experience: 5,
    projects: 200,
    status: 'busy',
    phone: '0923456789',
    description: 'Xây tường, xây nhà trọn gói',
    skills: ['Xây tường', 'Đổ bê tông', 'Cốt thép'],
  },
  {
    id: '4',
    name: 'Thợ cofa - Đội D',
    type: 'Nội thất',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300',
    price: 70000,
    unit: 'd/m2',
    rating: 4.4,
    experience: 7,
    projects: 300,
    status: 'available',
    phone: '0934567890',
    description: 'Làm cofa, ván khuôn chuyên nghiệp',
    skills: ['Cofa', 'Ván khuôn', 'Cốp pha'],
    verified: true,
  },
  {
    id: '5',
    name: 'Đội điện nước - E',
    type: 'Điện nước',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300',
    price: 180000,
    unit: 'd/m2',
    rating: 4.8,
    experience: 12,
    projects: 450,
    status: 'available',
    phone: '0945678901',
    description: 'Lắp đặt điện nước dân dụng, công nghiệp',
    skills: ['Điện', 'Nước', 'PCCC'],
    verified: true,
  },
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Search/filter contractors
 */
export async function searchContractors(
  filter?: ContractorFilter
): Promise<Contractor[]> {
  try {
    const params = new URLSearchParams();
    
    if (filter?.category) params.append('category', filter.category);
    if (filter?.location && filter.location !== 'Tất cả') {
      params.append('location', filter.location);
    }
    if (filter?.minRating) params.append('minRating', String(filter.minRating));
    if (filter?.minExperience) params.append('minExperience', String(filter.minExperience));
    if (filter?.maxPrice) params.append('maxPrice', String(filter.maxPrice));
    if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
    if (filter?.search) params.append('search', filter.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/contractors?${queryString}` : '/contractors';
    
    const response = await apiFetch<ContractorListResponse>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Apply local filtering on mock data
    return applyLocalFilter(MOCK_CONTRACTORS, filter);
  } catch (error) {
    console.warn('[ContractorService] searchContractors error:', error);
    return applyLocalFilter(MOCK_CONTRACTORS, filter);
  }
}

/**
 * Get a specific contractor by ID
 */
export async function getContractorById(id: string): Promise<Contractor | null> {
  try {
    const response = await apiFetch<{ success: boolean; data: Contractor }>(`/contractors/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_CONTRACTORS.find(c => c.id === id) || null;
  } catch (error) {
    console.warn('[ContractorService] getContractorById error:', error);
    return MOCK_CONTRACTORS.find(c => c.id === id) || null;
  }
}

/**
 * Get featured/top contractors
 */
export async function getFeaturedContractors(): Promise<Contractor[]> {
  try {
    const response = await apiFetch<ContractorListResponse>('/contractors/featured');
    
    if (response.success && response.data) {
      return response.data;
    }
    // Return top-rated contractors as featured
    return MOCK_CONTRACTORS.filter(c => c.rating >= 4.5);
  } catch (error) {
    console.warn('[ContractorService] getFeaturedContractors error:', error);
    return MOCK_CONTRACTORS.filter(c => c.rating >= 4.5);
  }
}

/**
 * Hire/select a contractor for a project
 */
export async function hireContractor(
  contractorId: string,
  projectId: string,
  details?: { startDate?: string; budget?: number; notes?: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>('/contractors/hire', {
      method: 'POST',
      body: JSON.stringify({ contractorId, projectId, ...details }),
    });
    return response;
  } catch (error) {
    console.warn('[ContractorService] hireContractor error:', error);
    return { success: true, message: 'Đã chọn nhà thầu (offline)' };
  }
}

/**
 * Get contractors by category
 */
export async function getContractorsByCategory(category: string): Promise<Contractor[]> {
  return searchContractors({ category });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function applyLocalFilter(
  contractors: Contractor[],
  filter?: ContractorFilter
): Contractor[] {
  if (!filter) return contractors;
  
  let result = [...contractors];
  
  if (filter.category) {
    result = result.filter(c => 
      c.type.toLowerCase().includes(filter.category!.toLowerCase())
    );
  }
  
  if (filter.minRating) {
    result = result.filter(c => c.rating >= filter.minRating!);
  }
  
  if (filter.minExperience) {
    result = result.filter(c => c.experience >= filter.minExperience!);
  }
  
  if (filter.maxPrice) {
    result = result.filter(c => c.price <= filter.maxPrice!);
  }
  
  if (filter.status && filter.status !== 'all') {
    result = result.filter(c => c.status === filter.status);
  }
  
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.type.toLowerCase().includes(searchLower)
    );
  }
  
  return result;
}

// Export service object
const ContractorService = {
  searchContractors,
  getContractorById,
  getFeaturedContractors,
  hireContractor,
  getContractorsByCategory,
  CONTRACTOR_CATEGORIES,
  CONTRACTOR_FILTERS,
  LOCATIONS,
  MOCK_CONTRACTORS,
};

export default ContractorService;
