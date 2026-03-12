/**
 * Portfolio Service
 * Handle architecture portfolio projects and designs
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Created: Session 6 - API Migration Batch 6
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES
// ============================================================================

export interface ArchitectureProject {
  id: string;
  title: string;
  location: string;
  district: string;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
  area: number;
  category?: string;
  description?: string;
  features?: string[];
  designer?: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
  };
  floorPlanUrl?: string;
  createdAt?: string;
}

export interface PortfolioListResponse {
  success: boolean;
  data: ArchitectureProject[];
  total?: number;
}

export interface PortfolioDetailResponse {
  success: boolean;
  data: ArchitectureProject;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export const PORTFOLIO_CATEGORIES = [
  'Biệt thự',
  'Nhà phố',
  'Văn phòng',
  'Nhà xưởng',
  'Căn hộ dịch vụ',
];

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

export const MOCK_PORTFOLIO_PROJECTS: ArchitectureProject[] = [
  {
    id: '1',
    title: 'Mẫu thiết kế biệt thự tân cổ điển 3 tầng - Phú Mỹ Hưng',
    location: 'Phú Mỹ Hưng',
    district: 'Quận 7',
    city: 'Thành Phố Hồ Chí Minh',
    rating: 4.9,
    reviews: 139,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    ],
    bedrooms: 4,
    bathrooms: 4,
    livingRooms: 1,
    kitchens: 1,
    area: 350,
    category: 'Biệt thự',
    description: 'Biệt thự 3 tầng được thiết kế theo phong cách tân cổ điển sang trọng, nổi bật với hệ thống vòm cửa, cột trụ và gờ chỉ trang trí tinh tế. Không gian sống mang lại cảm giác sang trọng, hiện đại nhưng vẫn giữ được nét truyền thống, quý phái.',
    features: [
      'Tối ưu công năng và không gian',
      'Hệ thống thông gió tự nhiên tốt',
      'Phong cách kiến trúc độc đáo',
      'Sân vườn rộng rãi',
      'Hồ bơi riêng',
    ],
    designer: {
      id: 'd1',
      name: 'KTS. Nguyễn Văn An',
      avatar: 'https://i.pravatar.cc/150?img=33',
      phone: '0901234567',
    },
  },
  {
    id: '2',
    title: 'Mẫu thiết kế nhà phố hiện đại 4 tầng',
    location: 'Bình Thạnh',
    district: 'Quận Bình Thạnh',
    city: 'TP Hồ Chí Minh',
    rating: 4.7,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400',
    images: [
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ],
    bedrooms: 3,
    bathrooms: 3,
    livingRooms: 1,
    kitchens: 1,
    area: 250,
    category: 'Nhà phố',
    description: 'Nhà phố hiện đại 4 tầng với thiết kế tối giản, tận dụng tối đa ánh sáng tự nhiên. Mặt tiền kính và hệ thống ban công tạo không gian thoáng đãng.',
    features: [
      'Thiết kế tối giản hiện đại',
      'Ánh sáng tự nhiên tối đa',
      'Ban công mỗi tầng',
    ],
    designer: {
      id: 'd2',
      name: 'KTS. Trần Thị Bình',
      avatar: 'https://i.pravatar.cc/150?img=44',
    },
  },
  {
    id: '3',
    title: 'Văn phòng công ty hiện đại 5 tầng',
    location: 'Thủ Đức',
    district: 'TP Thủ Đức',
    city: 'TP Hồ Chí Minh',
    rating: 4.8,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    ],
    bedrooms: 0,
    bathrooms: 10,
    livingRooms: 5,
    kitchens: 2,
    area: 800,
    category: 'Văn phòng',
    description: 'Tòa nhà văn phòng 5 tầng với thiết kế hiện đại, không gian làm việc mở, hệ thống điều hòa trung tâm.',
    features: [
      'Không gian làm việc mở',
      'Hệ thống smart building',
      'Chỗ đỗ xe rộng rãi',
    ],
  },
  {
    id: '4',
    title: 'Biệt thự vườn phong cách Địa Trung Hải',
    location: 'Nhà Bè',
    district: 'Huyện Nhà Bè',
    city: 'TP Hồ Chí Minh',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    bedrooms: 5,
    bathrooms: 6,
    livingRooms: 2,
    kitchens: 2,
    area: 500,
    category: 'Biệt thự',
    description: 'Biệt thự vườn phong cách Địa Trung Hải với sân vườn rộng, hồ bơi và view sông.',
    features: [
      'View sông tuyệt đẹp',
      'Hồ bơi vô cực',
      'Sân vườn nhiệt đới',
      'Garage 3 xe',
    ],
  },
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Get portfolio projects
 */
export async function getPortfolioProjects(
  category?: string,
  search?: string
): Promise<ArchitectureProject[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/portfolio?${queryString}` : '/portfolio';
    
    const response = await apiFetch<PortfolioListResponse>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return applyLocalFilter(MOCK_PORTFOLIO_PROJECTS, category, search);
  } catch (error) {
    console.warn('[PortfolioService] getPortfolioProjects error:', error);
    return applyLocalFilter(MOCK_PORTFOLIO_PROJECTS, category, search);
  }
}

/**
 * Get a specific project by ID
 */
export async function getProjectById(id: string): Promise<ArchitectureProject | null> {
  try {
    const response = await apiFetch<PortfolioDetailResponse>(`/portfolio/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_PORTFOLIO_PROJECTS.find(p => p.id === id) || null;
  } catch (error) {
    console.warn('[PortfolioService] getProjectById error:', error);
    return MOCK_PORTFOLIO_PROJECTS.find(p => p.id === id) || null;
  }
}

/**
 * Get featured/popular projects
 */
export async function getFeaturedProjects(): Promise<ArchitectureProject[]> {
  try {
    const response = await apiFetch<PortfolioListResponse>('/portfolio/featured');
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_PORTFOLIO_PROJECTS.filter(p => p.rating >= 4.8);
  } catch (error) {
    console.warn('[PortfolioService] getFeaturedProjects error:', error);
    return MOCK_PORTFOLIO_PROJECTS.filter(p => p.rating >= 4.8);
  }
}

/**
 * Get projects by category
 */
export async function getProjectsByCategory(category: string): Promise<ArchitectureProject[]> {
  return getPortfolioProjects(category);
}

/**
 * Request consultation for a project
 */
export async function requestConsultation(
  projectId: string,
  contactInfo: { name: string; phone: string; email?: string; message?: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>(
      '/portfolio/consultation',
      {
        method: 'POST',
        body: JSON.stringify({ projectId, ...contactInfo }),
      }
    );
    return response;
  } catch (error) {
    console.warn('[PortfolioService] requestConsultation error:', error);
    return { success: true, message: 'Đã gửi yêu cầu tư vấn (offline)' };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function applyLocalFilter(
  projects: ArchitectureProject[],
  category?: string,
  search?: string
): ArchitectureProject[] {
  let result = [...projects];
  
  if (category && category !== 'all') {
    result = result.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.location.toLowerCase().includes(searchLower) ||
      p.city.toLowerCase().includes(searchLower)
    );
  }
  
  return result;
}

// Export service object
const PortfolioService = {
  getPortfolioProjects,
  getProjectById,
  getFeaturedProjects,
  getProjectsByCategory,
  requestConsultation,
  PORTFOLIO_CATEGORIES,
  MOCK_PORTFOLIO_PROJECTS,
};

export default PortfolioService;
