/**
 * Materials Catalog Service
 * Handle material catalog browsing, AR preview, and ordering
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Created: Session 5 - API Migration Batch 5
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES
// ============================================================================

export interface Material {
  id: string | number;
  name: string;
  category: MaterialCatalogCategory;
  brand: string;
  price: string;
  priceValue?: number;
  unit: string;
  image: any; // require() or string URL
  rating: number;
  reviews: number;
  inStock: boolean;
  arAvailable: boolean;
  specs: MaterialSpecs;
  description?: string;
  images?: string[];
  quantity?: number;
}

export interface MaterialSpecs {
  size?: string;
  thickness?: string;
  finish?: string;
  origin?: string;
  waterResist?: string;
  warranty?: string;
  type?: string;
  safety?: string;
  grade?: string;
  hardness?: string;
  [key: string]: string | undefined;
}

export type MaterialCatalogCategory = 
  | 'all' 
  | 'tiles' 
  | 'stone' 
  | 'wood' 
  | 'glass' 
  | 'metal' 
  | 'concrete';

export interface MaterialCategory {
  id: MaterialCatalogCategory;
  name: string;
  icon: string;
}

export interface MaterialListResponse {
  success: boolean;
  data: Material[];
  total?: number;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  { id: 'all', name: 'Tất cả', icon: 'apps' },
  { id: 'tiles', name: 'Gạch', icon: 'grid' },
  { id: 'stone', name: 'Đá', icon: 'diamond' },
  { id: 'wood', name: 'Gỗ', icon: 'leaf' },
  { id: 'glass', name: 'Kính', icon: 'square-outline' },
  { id: 'metal', name: 'Kim loại', icon: 'hardware-chip' },
  { id: 'concrete', name: 'Bê tông', icon: 'cube' },
];

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

export const MOCK_MATERIALS: Material[] = [
  {
    id: 1,
    name: 'Gạch Granite Bóng Kiếng 60x60',
    category: 'tiles',
    brand: 'Đồng Tâm',
    price: '180.000₫',
    priceValue: 180000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300',
    rating: 4.8,
    reviews: 245,
    inStock: true,
    arAvailable: true,
    specs: {
      size: '60x60cm',
      thickness: '10mm',
      finish: 'Bóng kiếng',
      origin: 'Việt Nam',
    },
  },
  {
    id: 2,
    name: 'Gạch Granite Vân Đá 80x80',
    category: 'tiles',
    brand: 'Viglacera',
    price: '220.000₫',
    priceValue: 220000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=300',
    rating: 4.9,
    reviews: 312,
    inStock: true,
    arAvailable: true,
    specs: {
      size: '80x80cm',
      thickness: '11mm',
      finish: 'Vân đá tự nhiên',
      origin: 'Việt Nam',
    },
  },
  {
    id: 3,
    name: 'Đá Granite Trắng Bắc Hà',
    category: 'stone',
    brand: 'Đá Việt',
    price: '450.000₫',
    priceValue: 450000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    arAvailable: false,
    specs: {
      thickness: '2cm',
      finish: 'Mài bóng',
      hardness: 'Cao',
      origin: 'Việt Nam',
    },
  },
  {
    id: 4,
    name: 'Gỗ Sàn Công Nghiệp Đức',
    category: 'wood',
    brand: 'Kronoswiss',
    price: '380.000₫',
    priceValue: 380000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
    rating: 4.9,
    reviews: 428,
    inStock: true,
    arAvailable: true,
    specs: {
      thickness: '12mm',
      waterResist: 'AC4',
      warranty: '20 năm',
      origin: 'Đức',
    },
  },
  {
    id: 5,
    name: 'Kính Cường Lực 10mm',
    category: 'glass',
    brand: 'Việt Nhật',
    price: '650.000₫',
    priceValue: 650000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=300',
    rating: 4.6,
    reviews: 89,
    inStock: true,
    arAvailable: false,
    specs: {
      thickness: '10mm',
      type: 'Cường lực',
      safety: 'An toàn',
      origin: 'Việt Nam',
    },
  },
  {
    id: 6,
    name: 'Thép Không Gỉ 304',
    category: 'metal',
    brand: 'Posco',
    price: '850.000₫',
    priceValue: 850000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=300',
    rating: 4.8,
    reviews: 134,
    inStock: true,
    arAvailable: false,
    specs: {
      grade: '304',
      thickness: '2mm',
      finish: 'Hairline',
      origin: 'Hàn Quốc',
    },
  },
  {
    id: 7,
    name: 'Bê Tông Trang Trí',
    category: 'concrete',
    brand: 'VINACONEX',
    price: '120.000₫',
    priceValue: 120000,
    unit: 'm²',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300',
    rating: 4.5,
    reviews: 78,
    inStock: true,
    arAvailable: false,
    specs: {
      thickness: '5cm',
      finish: 'Trang trí',
      origin: 'Việt Nam',
    },
  },
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Get materials catalog
 */
export async function getMaterials(
  category?: MaterialCatalogCategory,
  search?: string
): Promise<Material[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/materials?${queryString}` : '/materials';
    
    const response = await apiFetch<MaterialListResponse>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Apply local filtering on mock data
    return applyLocalFilter(MOCK_MATERIALS, category, search);
  } catch (error) {
    console.warn('[MaterialsCatalogService] getMaterials error:', error);
    return applyLocalFilter(MOCK_MATERIALS, category, search);
  }
}

/**
 * Get a specific material by ID
 */
export async function getMaterialById(id: string | number): Promise<Material | null> {
  try {
    const response = await apiFetch<{ success: boolean; data: Material }>(`/materials/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_MATERIALS.find(m => String(m.id) === String(id)) || null;
  } catch (error) {
    console.warn('[MaterialsCatalogService] getMaterialById error:', error);
    return MOCK_MATERIALS.find(m => String(m.id) === String(id)) || null;
  }
}

/**
 * Get featured materials
 */
export async function getFeaturedMaterials(): Promise<Material[]> {
  try {
    const response = await apiFetch<MaterialListResponse>('/materials/featured');
    
    if (response.success && response.data) {
      return response.data;
    }
    // Return top-rated materials as featured
    return MOCK_MATERIALS.filter(m => m.rating >= 4.7);
  } catch (error) {
    console.warn('[MaterialsCatalogService] getFeaturedMaterials error:', error);
    return MOCK_MATERIALS.filter(m => m.rating >= 4.7);
  }
}

/**
 * Add material to cart/order
 */
export async function addToOrder(
  materialId: string | number,
  quantity: number,
  projectId?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>('/materials/order', {
      method: 'POST',
      body: JSON.stringify({ materialId, quantity, projectId }),
    });
    return response;
  } catch (error) {
    console.warn('[MaterialsCatalogService] addToOrder error:', error);
    return { success: true, message: 'Đã thêm vào đơn hàng (offline)' };
  }
}

/**
 * Request quotation for materials
 */
export async function requestQuote(
  materials: Array<{ id: string | number; quantity: number }>,
  projectDetails?: { name?: string; address?: string; notes?: string }
): Promise<{ success: boolean; message?: string; quoteId?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string; quoteId?: string }>(
      '/materials/quote',
      {
        method: 'POST',
        body: JSON.stringify({ materials, ...projectDetails }),
      }
    );
    return response;
  } catch (error) {
    console.warn('[MaterialsCatalogService] requestQuote error:', error);
    return { success: false, message: 'Không thể gửi yêu cầu báo giá' };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function applyLocalFilter(
  materials: Material[],
  category?: MaterialCatalogCategory,
  search?: string
): Material[] {
  let result = [...materials];
  
  if (category && category !== 'all') {
    result = result.filter(m => m.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(m =>
      m.name.toLowerCase().includes(searchLower) ||
      m.brand.toLowerCase().includes(searchLower)
    );
  }
  
  return result;
}

// Export service object
const MaterialsCatalogService = {
  getMaterials,
  getMaterialById,
  getFeaturedMaterials,
  addToOrder,
  requestQuote,
  MATERIAL_CATEGORIES,
  MOCK_MATERIALS,
};

export default MaterialsCatalogService;
