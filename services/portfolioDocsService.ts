/**
 * Portfolio Documents Service
 * Handle BOQ, Specifications, and 3D Designs
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Created: Session 7 - API Migration Batch 7
 */

import { apiFetch } from './api';

// ============================================================================
// BOQ TYPES
// ============================================================================

export interface BOQItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'approved' | 'pending' | 'rejected';
  projectId?: string;
  category?: string;
  notes?: string;
}

export interface BOQSummary {
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  totalItems: number;
  approvalProgress: number;
}

export interface BOQResponse {
  success: boolean;
  data: BOQItem[];
  summary?: BOQSummary;
}

// ============================================================================
// SPECIFICATION TYPES
// ============================================================================

export interface SpecItem {
  category: string;
  item: string;
  specification: string;
  standard: string;
  note?: string;
}

export interface SpecificationGroup {
  [key: string]: SpecItem[];
}

export interface SpecResponse {
  success: boolean;
  data: SpecificationGroup;
}

// ============================================================================
// 3D DESIGN TYPES
// ============================================================================

export interface Design3D {
  id: string;
  title: string;
  room: string;
  imageUrl: string;
  views: number;
  likes: number;
  projectId?: string;
  description?: string;
  createdAt?: string;
}

export interface Design3DResponse {
  success: boolean;
  data: Design3D[];
}

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

export const MOCK_BOQ: BOQItem[] = [
  {
    id: '1',
    code: 'A.01',
    name: 'Đào đất móng',
    unit: 'm³',
    quantity: 45,
    unitPrice: 150000,
    total: 6750000,
    status: 'approved',
  },
  {
    id: '2',
    code: 'A.02',
    name: 'Đổ bê tông móng',
    unit: 'm³',
    quantity: 20,
    unitPrice: 2500000,
    total: 50000000,
    status: 'approved',
  },
  {
    id: '3',
    code: 'A.03',
    name: 'Xây tường gạch',
    unit: 'm²',
    quantity: 150,
    unitPrice: 180000,
    total: 27000000,
    status: 'pending',
  },
  {
    id: '4',
    code: 'A.04',
    name: 'Tô trát tường',
    unit: 'm²',
    quantity: 300,
    unitPrice: 80000,
    total: 24000000,
    status: 'pending',
  },
  {
    id: '5',
    code: 'A.05',
    name: 'Sơn tường nội thất',
    unit: 'm²',
    quantity: 300,
    unitPrice: 45000,
    total: 13500000,
    status: 'pending',
  },
];

export const MOCK_SPECS: SpecificationGroup = {
  'Kết cấu': [
    {
      category: 'Móng',
      item: 'Bê tông móng',
      specification: 'Bê tông M250',
      standard: 'TCVN 3118:2021',
      note: 'Sử dụng xi măng PCB40',
    },
    {
      category: 'Cột',
      item: 'Bê tông cột',
      specification: 'Bê tông M300',
      standard: 'TCVN 3118:2021',
    },
    {
      category: 'Dầm',
      item: 'Bê tông dầm',
      specification: 'Bê tông M300',
      standard: 'TCVN 3118:2021',
    },
  ],
  'Hoàn thiện': [
    {
      category: 'Sàn',
      item: 'Gạch lát sàn',
      specification: 'Gạch granite 60x60cm',
      standard: 'TCVN 6855:2016',
      note: 'Màu kem, chống trơn',
    },
    {
      category: 'Tường',
      item: 'Sơn tường',
      specification: 'Sơn Dulux nội thất cao cấp',
      standard: 'ISO 9001:2015',
      note: 'Màu trắng sữa',
    },
    {
      category: 'Trần',
      item: 'Trần thạch cao',
      specification: 'Tấm Gyproc 12mm',
      standard: 'TCVN 7398:2017',
    },
  ],
  'Điện nước': [
    {
      category: 'Điện',
      item: 'Dây dẫn điện',
      specification: 'Dây Cadivi 2x2.5mm²',
      standard: 'TCVN 6610:2013',
    },
    {
      category: 'Nước',
      item: 'Ống cấp nước',
      specification: 'Ống PPR Tiền Phong Φ21',
      standard: 'TCVN 6151:2009',
    },
    {
      category: 'Thiết bị vệ sinh',
      item: 'Bồn cầu',
      specification: 'TOTO CW818W',
      standard: 'ISO 9001',
      note: 'Xả nhấn, tiết kiệm nước',
    },
  ],
};

export const MOCK_DESIGNS: Design3D[] = [
  {
    id: '1',
    title: 'Phòng khách hiện đại',
    room: 'Phòng khách',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    views: 245,
    likes: 38,
  },
  {
    id: '2',
    title: 'Phòng ngủ master',
    room: 'Phòng ngủ',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    views: 189,
    likes: 29,
  },
  {
    id: '3',
    title: 'Bếp & phòng ăn',
    room: 'Bếp',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    views: 312,
    likes: 52,
  },
  {
    id: '4',
    title: 'Phòng làm việc',
    room: 'Phòng làm việc',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    views: 167,
    likes: 24,
  },
  {
    id: '5',
    title: 'Phòng tắm cao cấp',
    room: 'Phòng tắm',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    views: 198,
    likes: 31,
  },
  {
    id: '6',
    title: 'Ban công xanh',
    room: 'Ban công',
    imageUrl: 'https://picsum.photos/400/300?random=6',
    views: 221,
    likes: 43,
  },
];

// ============================================================================
// BOQ SERVICE FUNCTIONS
// ============================================================================

/**
 * Get BOQ items for a project
 */
export async function getBOQItems(projectId?: string): Promise<BOQItem[]> {
  try {
    const endpoint = projectId ? `/projects/${projectId}/boq` : '/boq';
    const response = await apiFetch<BOQResponse>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_BOQ;
  } catch (error) {
    console.warn('[PortfolioDocsService] getBOQItems error:', error);
    return MOCK_BOQ;
  }
}

/**
 * Get BOQ summary statistics
 */
export function calculateBOQSummary(items: BOQItem[]): BOQSummary {
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const approvedAmount = items.filter(item => item.status === 'approved').reduce((sum, item) => sum + item.total, 0);
  const pendingAmount = items.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.total, 0);
  const rejectedAmount = items.filter(item => item.status === 'rejected').reduce((sum, item) => sum + item.total, 0);
  
  return {
    totalAmount,
    approvedAmount,
    pendingAmount,
    rejectedAmount,
    totalItems: items.length,
    approvalProgress: totalAmount > 0 ? (approvedAmount / totalAmount) * 100 : 0,
  };
}

/**
 * Approve a BOQ item
 */
export async function approveBOQItem(itemId: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch<{ success: boolean }>(`/boq/${itemId}/approve`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.warn('[PortfolioDocsService] approveBOQItem error:', error);
    return { success: true }; // Optimistic for offline
  }
}

/**
 * Reject a BOQ item
 */
export async function rejectBOQItem(itemId: string, reason?: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch<{ success: boolean }>(`/boq/${itemId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response;
  } catch (error) {
    console.warn('[PortfolioDocsService] rejectBOQItem error:', error);
    return { success: true };
  }
}

/**
 * Export BOQ to PDF
 */
export async function exportBOQToPDF(projectId: string): Promise<{ success: boolean; url?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; url?: string }>(`/projects/${projectId}/boq/export`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.warn('[PortfolioDocsService] exportBOQToPDF error:', error);
    return { success: true, url: undefined };
  }
}

// ============================================================================
// SPECIFICATION SERVICE FUNCTIONS
// ============================================================================

/**
 * Get specifications for a project
 */
export async function getSpecifications(projectId?: string): Promise<SpecificationGroup> {
  try {
    const endpoint = projectId ? `/projects/${projectId}/specs` : '/specs';
    const response = await apiFetch<SpecResponse>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_SPECS;
  } catch (error) {
    console.warn('[PortfolioDocsService] getSpecifications error:', error);
    return MOCK_SPECS;
  }
}

// ============================================================================
// 3D DESIGN SERVICE FUNCTIONS
// ============================================================================

/**
 * Get 3D designs for a project
 */
export async function get3DDesigns(projectId?: string): Promise<Design3D[]> {
  try {
    const endpoint = projectId ? `/projects/${projectId}/designs` : '/designs';
    const response = await apiFetch<Design3DResponse>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_DESIGNS;
  } catch (error) {
    console.warn('[PortfolioDocsService] get3DDesigns error:', error);
    return MOCK_DESIGNS;
  }
}

/**
 * Like a 3D design
 */
export async function likeDesign(designId: string): Promise<{ success: boolean; likes?: number }> {
  try {
    const response = await apiFetch<{ success: boolean; likes?: number }>(`/designs/${designId}/like`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.warn('[PortfolioDocsService] likeDesign error:', error);
    return { success: true };
  }
}

/**
 * View a 3D design (increment view count)
 */
export async function viewDesign(designId: string): Promise<void> {
  try {
    await apiFetch(`/designs/${designId}/view`, { method: 'POST' });
  } catch (error) {
    // Silent fail for view tracking
  }
}

// ============================================================================
// EXPORT SERVICE OBJECT
// ============================================================================

const PortfolioDocsService = {
  // BOQ
  getBOQItems,
  calculateBOQSummary,
  approveBOQItem,
  rejectBOQItem,
  exportBOQToPDF,
  // Specifications
  getSpecifications,
  // 3D Designs
  get3DDesigns,
  likeDesign,
  viewDesign,
  // Mock data
  MOCK_BOQ,
  MOCK_SPECS,
  MOCK_DESIGNS,
};

export default PortfolioDocsService;
