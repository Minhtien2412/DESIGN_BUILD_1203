/**
 * Review Service
 * Handle product/service review related API calls
 */

import { BackendResult, deleteReq, getJson, patchJson, postJson } from './backendClient';

// Types
export interface ReviewImage {
  id: string;
  url: string;
  thumbnail?: string;
}

export interface ReviewResponse {
  id: string;
  content: string;
  createdAt: string;
  staffName?: string;
}

export interface Review {
  id: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: ReviewImage[];
  response?: ReviewResponse;
  createdAt: string;
  updatedAt?: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  userName?: string;
  userAvatar?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  stats?: ReviewStats;
}

export interface CreateReviewInput {
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[]; // Base64 or URLs
}

// API Endpoints
const ENDPOINTS = {
  myReviews: '/api/reviews/my',
  productReviews: (productId: string) => `/api/products/${productId}/reviews`,
  create: '/api/reviews',
  update: (id: string) => `/api/reviews/${id}`,
  delete: (id: string) => `/api/reviews/${id}`,
  helpful: (id: string) => `/api/reviews/${id}/helpful`,
};

/**
 * Get current user's reviews
 */
export async function getMyReviews(
  page = 1,
  limit = 20
): Promise<BackendResult<ReviewListResponse>> {
  return getJson<ReviewListResponse>(ENDPOINTS.myReviews, {
    query: { page, limit },
    retry: 2,
  });
}

/**
 * Get reviews for a specific product
 */
export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<BackendResult<ReviewListResponse>> {
  return getJson<ReviewListResponse>(ENDPOINTS.productReviews(productId), {
    query: { page, limit },
    retry: 2,
  });
}

/**
 * Create a new review
 */
export async function createReview(
  input: CreateReviewInput
): Promise<BackendResult<Review>> {
  return postJson<Review>(ENDPOINTS.create, input);
}

/**
 * Update an existing review
 */
export async function updateReview(
  id: string,
  input: Partial<CreateReviewInput>
): Promise<BackendResult<Review>> {
  return patchJson<Review>(ENDPOINTS.update(id), input);
}

/**
 * Delete a review
 */
export async function deleteReview(
  id: string
): Promise<BackendResult<{ success: boolean }>> {
  return deleteReq(ENDPOINTS.delete(id));
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(
  id: string
): Promise<BackendResult<{ helpfulCount: number }>> {
  return postJson(ENDPOINTS.helpful(id), {});
}

// Mock data fallback
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev1',
    productId: 'prod1',
    productName: 'Villa Đà Lạt Dream',
    productImage: 'https://placehold.co/100x100/0066CC/white?text=Villa1',
    rating: 5,
    comment: 'Thiết kế rất đẹp, đúng như mong đợi. Đội ngũ hỗ trợ nhiệt tình.',
    images: [
      { id: 'img1', url: 'https://placehold.co/400x300/0066CC/white?text=Review1' },
      { id: 'img2', url: 'https://placehold.co/400x300/0066CC/white?text=Review2' },
    ],
    response: {
      id: 'resp1',
      content: 'Cảm ơn anh/chị đã tin tưởng và ủng hộ. Chúc gia đình nhiều sức khỏe!',
      createdAt: '2025-01-12T10:00:00Z',
      staffName: 'CSKH Bảo Tiến',
    },
    createdAt: '2025-01-10T15:30:00Z',
    isVerifiedPurchase: true,
    helpfulCount: 12,
  },
  {
    id: 'rev2',
    productId: 'prod2',
    productName: 'Tư vấn thiết kế nội thất',
    productImage: 'https://placehold.co/100x100/28a745/white?text=Interior',
    rating: 4,
    comment: 'Dịch vụ tốt, tuy nhiên thời gian hoàn thành hơi lâu.',
    createdAt: '2025-01-05T09:20:00Z',
    isVerifiedPurchase: true,
    helpfulCount: 5,
  },
  {
    id: 'rev3',
    productId: 'prod3',
    productName: 'Gói vật liệu xây dựng',
    productImage: 'https://placehold.co/100x100/ffc107/black?text=Material',
    rating: 5,
    comment: 'Vật liệu chất lượng, giao hàng nhanh. Sẽ tiếp tục ủng hộ!',
    images: [
      { id: 'img3', url: 'https://placehold.co/400x300/ffc107/black?text=Material' },
    ],
    createdAt: '2024-12-28T14:00:00Z',
    isVerifiedPurchase: true,
    helpfulCount: 8,
  },
];

export const MOCK_STATS: ReviewStats = {
  averageRating: 4.7,
  totalReviews: 156,
  ratingDistribution: {
    1: 2,
    2: 5,
    3: 12,
    4: 45,
    5: 92,
  },
};

export default {
  getMyReviews,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  MOCK_REVIEWS,
  MOCK_STATS,
};
