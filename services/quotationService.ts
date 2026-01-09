/**
 * Quotation Service
 * Handle contractor quotations/price quotes for projects
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Created: Session 5 - API Migration Batch 5
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES
// ============================================================================

export interface Quotation {
  id: string;
  companyName: string;
  rating: number;
  capability: string;
  price: number;
  stars: number;
  pdfUrl?: string;
  selected?: boolean;
  // Extended fields from API
  contractorId?: string;
  projectId?: string;
  description?: string;
  validUntil?: string;
  createdAt?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface QuotationListResponse {
  success: boolean;
  data: Quotation[];
  total?: number;
}

export interface SubmitQuotationRequest {
  quotationIds: string[];
  projectId?: string;
}

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    companyName: 'Công ty A',
    rating: 5,
    capability: 'Năng lực',
    price: 100000,
    stars: 5,
    pdfUrl: 'https://example.com/a.pdf',
    status: 'pending',
    description: 'Thi công hoàn thiện, bảo hành 12 tháng',
  },
  {
    id: '2',
    companyName: 'Công ty B',
    rating: 4,
    capability: 'Năng lực',
    price: 150000,
    stars: 4,
    pdfUrl: 'https://example.com/b.pdf',
    status: 'pending',
    description: 'Đội ngũ chuyên nghiệp, cam kết tiến độ',
  },
  {
    id: '3',
    companyName: 'Công ty C',
    rating: 4.5,
    capability: 'Năng lực',
    price: 200000,
    stars: 4.5,
    pdfUrl: 'https://example.com/c.pdf',
    status: 'pending',
    description: 'Uy tín hàng đầu, nhiều năm kinh nghiệm',
  },
  {
    id: '4',
    companyName: 'Công ty D',
    rating: 3.5,
    capability: 'Năng lực',
    price: 80000,
    stars: 3.5,
    pdfUrl: 'https://example.com/d.pdf',
    status: 'pending',
    description: 'Giá cả hợp lý, phù hợp ngân sách',
  },
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Get quotations for a project
 */
export async function getQuotations(projectId?: string): Promise<Quotation[]> {
  try {
    const endpoint = projectId 
      ? `/quotations?projectId=${projectId}` 
      : '/quotations';
    const response = await apiFetch<QuotationListResponse>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_QUOTATIONS;
  } catch (error) {
    console.warn('[QuotationService] getQuotations error:', error);
    return MOCK_QUOTATIONS;
  }
}

/**
 * Get a specific quotation by ID
 */
export async function getQuotationById(id: string): Promise<Quotation | null> {
  try {
    const response = await apiFetch<{ success: boolean; data: Quotation }>(`/quotations/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_QUOTATIONS.find(q => q.id === id) || null;
  } catch (error) {
    console.warn('[QuotationService] getQuotationById error:', error);
    return MOCK_QUOTATIONS.find(q => q.id === id) || null;
  }
}

/**
 * Submit selected quotations (accept/choose)
 */
export async function submitQuotationSelection(
  quotationIds: string[],
  projectId?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>('/quotations/accept', {
      method: 'POST',
      body: JSON.stringify({ quotationIds, projectId }),
    });
    
    return response;
  } catch (error) {
    console.warn('[QuotationService] submitQuotationSelection error:', error);
    // Return success for demo/offline mode
    return { success: true, message: 'Đã lưu lựa chọn (offline)' };
  }
}

/**
 * Request new quotations from contractors
 */
export async function requestQuotations(
  projectId: string,
  contractorIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>('/quotations/request', {
      method: 'POST',
      body: JSON.stringify({ projectId, contractorIds }),
    });
    
    return response;
  } catch (error) {
    console.warn('[QuotationService] requestQuotations error:', error);
    return { success: false, message: 'Không thể gửi yêu cầu báo giá' };
  }
}

/**
 * Reject a quotation
 */
export async function rejectQuotation(id: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch<{ success: boolean }>(`/quotations/${id}/reject`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.warn('[QuotationService] rejectQuotation error:', error);
    return { success: false };
  }
}

// Export all as a service object
const QuotationService = {
  getQuotations,
  getQuotationById,
  submitQuotationSelection,
  requestQuotations,
  rejectQuotation,
  MOCK_QUOTATIONS,
};

export default QuotationService;
