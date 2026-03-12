/**
 * Content Moderation Service
 * Handles AI and admin approval workflows
 */

import type {
  AIModerationRule,
  ContentSubmission,
  User,
} from '@/types/permissions';
import { ApprovalStatus, ContentType } from '@/types/permissions';
import { apiFetch } from './api';

// ============================================================================
// AI MODERATION
// ============================================================================

/**
 * Submit content for AI review
 */
export async function submitForAIReview(
  content: Omit<ContentSubmission, 'id' | 'status' | 'submittedAt'>
): Promise<ContentSubmission> {
  try {
    const response = await apiFetch('/moderation/ai-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    
    return response as ContentSubmission;
  } catch (error) {
    console.error('[Moderation] AI review failed:', error);
    // Fallback: mark as needs manual review
    return {
      ...content,
      id: `temp-${Date.now()}`,
      status: ApprovalStatus.NEEDS_ADMIN_REVIEW,
      submittedAt: new Date().toISOString(),
      aiRecommendation: 'review',
      aiReasons: ['AI service unavailable'],
    };
  }
}

/**
 * Mock AI review (for development without backend)
 */
export function mockAIReview(
  content: Omit<ContentSubmission, 'id' | 'status' | 'submittedAt'>
): ContentSubmission {
  // Simple quality scoring
  const titleLength = content.title.length;
  const contentLength = content.content.length;
  const hasImages = (content.images?.length || 0) > 0;
  
  let score = 50; // Base score
  
  // Title quality
  if (titleLength >= 10 && titleLength <= 100) score += 15;
  else if (titleLength < 5) score -= 20;
  
  // Content quality
  if (contentLength >= 100) score += 20;
  else if (contentLength < 20) score -= 20;
  
  // Images
  if (hasImages) score += 15;
  
  // Profanity check (simple)
  const badWords = ['spam', 'fake', 'scam'];
  const hasBadWords = badWords.some(word => 
    content.title.toLowerCase().includes(word) || 
    content.content.toLowerCase().includes(word)
  );
  if (hasBadWords) score -= 40;
  
  // Determine status
  let status: ApprovalStatus;
  let recommendation: 'approve' | 'reject' | 'review';
  const reasons: string[] = [];
  
  if (score >= 80) {
    status = ApprovalStatus.AI_APPROVED;
    recommendation = 'approve';
    reasons.push('Nội dung chất lượng cao');
    reasons.push('Không phát hiện vấn đề');
  } else if (score <= 30) {
    status = ApprovalStatus.REJECTED;
    recommendation = 'reject';
    reasons.push('Nội dung không đạt tiêu chuẩn');
    if (titleLength < 5) reasons.push('Tiêu đề quá ngắn');
    if (contentLength < 20) reasons.push('Nội dung quá ngắn');
    if (hasBadWords) reasons.push('Phát hiện từ ngữ không phù hợp');
  } else {
    status = ApprovalStatus.NEEDS_ADMIN_REVIEW;
    recommendation = 'review';
    reasons.push('Cần quản trị viên xem xét');
    if (!hasImages) reasons.push('Nên thêm hình ảnh');
  }
  
  return {
    ...content,
    id: `ai-${Date.now()}`,
    status,
    submittedAt: new Date().toISOString(),
    aiScore: score,
    aiRecommendation: recommendation,
    aiReasons: reasons,
  };
}

// ============================================================================
// ADMIN APPROVAL
// ============================================================================

/**
 * Approve content (admin/manager only)
 */
export async function approveContent(
  submissionId: string,
  reviewedBy: User,
  notes?: string
): Promise<ContentSubmission> {
  try {
    const response = await apiFetch(`/moderation/approve/${submissionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewedBy: reviewedBy.id,
        notes,
      }),
    });
    
    return response as ContentSubmission;
  } catch (error) {
    console.error('[Moderation] Approve failed:', error);
    throw error;
  }
}

/**
 * Reject content (admin/manager only)
 */
export async function rejectContent(
  submissionId: string,
  reviewedBy: User,
  reason: string
): Promise<ContentSubmission> {
  try {
    const response = await apiFetch(`/moderation/reject/${submissionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewedBy: reviewedBy.id,
        reason,
      }),
    });
    
    return response as ContentSubmission;
  } catch (error) {
    console.error('[Moderation] Reject failed:', error);
    throw error;
  }
}

/**
 * Publish approved content
 */
export async function publishContent(
  submissionId: string
): Promise<{ success: boolean; publishedId: string }> {
  try {
    const response = await apiFetch(`/moderation/publish/${submissionId}`, {
      method: 'POST',
    });
    
    return response as { success: boolean; publishedId: string };
  } catch (error) {
    console.error('[Moderation] Publish failed:', error);
    throw error;
  }
}

// ============================================================================
// PENDING QUEUE
// ============================================================================

/**
 * Get pending submissions for review
 */
export async function getPendingSubmissions(
  filters?: {
    type?: ContentType;
    status?: ApprovalStatus[];
    createdBy?: number;
  }
): Promise<ContentSubmission[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status.join(','));
    if (filters?.createdBy) params.append('createdBy', filters.createdBy.toString());
    
    const response = await apiFetch(`/moderation/pending?${params.toString()}`);
    
    return response as ContentSubmission[];
  } catch (error) {
    console.error('[Moderation] Get pending failed:', error);
    // Return mock data for development
    return getMockPendingSubmissions(filters);
  }
}

/**
 * Mock pending submissions (for development)
 */
function getMockPendingSubmissions(
  filters?: {
    type?: ContentType;
    status?: ApprovalStatus[];
  }
): ContentSubmission[] {
  const mockData: ContentSubmission[] = [
    {
      id: 'pending-1',
      type: ContentType.POST,
      title: 'Thiết kế nội thất phòng khách hiện đại',
      content: 'Mẫu thiết kế phòng khách với phong cách tối giản, sử dụng tông màu trung tính...',
      images: ['https://example.com/image1.jpg'],
      createdBy: {
        id: 2,
        name: 'Nguyễn Văn A',
        role: 'staff' as any,
      },
      status: ApprovalStatus.NEEDS_ADMIN_REVIEW,
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      aiScore: 75,
      aiRecommendation: 'review',
      aiReasons: ['Nội dung tốt nhưng cần xác nhận hình ảnh'],
    },
    {
      id: 'pending-2',
      type: ContentType.PRODUCT,
      title: 'Gạch granite 60x60 cao cấp',
      content: 'Gạch granite nhập khẩu Italia, chống trầy xước, độ bền cao...',
      images: ['https://example.com/product1.jpg', 'https://example.com/product2.jpg'],
      createdBy: {
        id: 3,
        name: 'Trần Thị B',
        role: 'staff' as any,
      },
      status: ApprovalStatus.AI_APPROVED,
      submittedAt: new Date(Date.now() - 7200000).toISOString(),
      aiScore: 92,
      aiRecommendation: 'approve',
      aiReasons: ['Nội dung đầy đủ', 'Hình ảnh chất lượng cao', 'Không phát hiện vấn đề'],
    },
    {
      id: 'pending-3',
      type: ContentType.NEWS,
      title: 'Xu hướng thiết kế năm 2025',
      content: 'Các xu hướng thiết kế nội thất được dự đoán sẽ thịnh hành trong năm 2025...',
      createdBy: {
        id: 4,
        name: 'Lê Văn C',
        role: 'staff' as any,
      },
      status: ApprovalStatus.PENDING,
      submittedAt: new Date(Date.now() - 1800000).toISOString(),
      aiScore: 65,
      aiRecommendation: 'review',
      aiReasons: ['Nên thêm hình ảnh minh họa'],
    },
  ];
  
  // Apply filters
  let filtered = mockData;
  
  if (filters?.type) {
    filtered = filtered.filter(item => item.type === filters.type);
  }
  
  if (filters?.status && filters.status.length > 0) {
    filtered = filtered.filter(item => filters.status!.includes(item.status));
  }
  
  return filtered;
}

// ============================================================================
// SUBMISSION STATISTICS
// ============================================================================

export interface ModerationStats {
  total: number;
  pending: number;
  aiApproved: number;
  needsReview: number;
  approved: number;
  rejected: number;
  published: number;
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(): Promise<ModerationStats> {
  try {
    const response = await apiFetch('/moderation/stats');
    return response as ModerationStats;
  } catch (error) {
    console.error('[Moderation] Get stats failed:', error);
    return {
      total: 15,
      pending: 3,
      aiApproved: 5,
      needsReview: 2,
      approved: 3,
      rejected: 1,
      published: 1,
    };
  }
}

// ============================================================================
// MODERATION RULES
// ============================================================================

/**
 * Get AI moderation rules
 */
export async function getModerationRules(): Promise<AIModerationRule[]> {
  try {
    const response = await apiFetch('/moderation/rules');
    return response as AIModerationRule[];
  } catch (error) {
    console.error('[Moderation] Get rules failed:', error);
    return getDefaultModerationRules();
  }
}

/**
 * Default moderation rules
 */
function getDefaultModerationRules(): AIModerationRule[] {
  return [
    {
      id: 'rule-1',
      name: 'Sản phẩm chất lượng cao',
      description: 'Auto-approve sản phẩm có đầy đủ thông tin và hình ảnh chất lượng',
      enabled: true,
      contentType: [ContentType.PRODUCT],
      minConfidenceScore: 85,
      checks: {
        profanityFilter: true,
        duplicateDetection: true,
        qualityScore: true,
        completenessCheck: true,
        imageValidation: true,
      },
      autoApproveThreshold: 90,
      autoRejectThreshold: 30,
    },
    {
      id: 'rule-2',
      name: 'Bài đăng tiêu chuẩn',
      description: 'Kiểm tra bài đăng có nội dung phù hợp',
      enabled: true,
      contentType: [ContentType.POST, ContentType.NEWS],
      minConfidenceScore: 70,
      checks: {
        profanityFilter: true,
        duplicateDetection: true,
        qualityScore: true,
        completenessCheck: false,
        imageValidation: false,
      },
      autoApproveThreshold: 85,
      autoRejectThreshold: 40,
    },
    {
      id: 'rule-3',
      name: 'Template kiểm tra nghiêm ngặt',
      description: 'Template cần quản lý duyệt thủ công',
      enabled: true,
      contentType: [ContentType.TEMPLATE],
      minConfidenceScore: 80,
      checks: {
        profanityFilter: true,
        duplicateDetection: true,
        qualityScore: true,
        completenessCheck: true,
        imageValidation: true,
      },
      autoApproveThreshold: 95, // Very high threshold
      autoRejectThreshold: 20,
    },
  ];
}
