/**
 * Reward Service
 * Handle loyalty/reward points related API calls
 */

import { BackendResult, getJson, postJson } from './backendClient';

// Types
export interface RewardHistoryItem {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  createdAt: string;
  orderId?: string;
  rewardId?: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description?: string;
  pointsRequired: number;
  image?: string;
  category?: string;
  stock?: number;
  isAvailable: boolean;
}

export interface RewardSummary {
  totalPoints: number;
  pendingPoints: number;
  usedPoints: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierProgress?: number;
}

export interface RewardHistoryResponse {
  history: RewardHistoryItem[];
  total: number;
  summary: RewardSummary;
}

export interface RewardListResponse {
  rewards: RewardItem[];
  total: number;
}

// API Endpoints
const ENDPOINTS = {
  summary: '/api/rewards/summary',
  history: '/api/rewards/history',
  available: '/api/rewards/available',
  redeem: (id: string) => `/api/rewards/${id}/redeem`,
};

/**
 * Get user's reward summary (points, tier, etc)
 */
export async function getRewardSummary(): Promise<BackendResult<RewardSummary>> {
  return getJson<RewardSummary>(ENDPOINTS.summary, { retry: 2 });
}

/**
 * Get user's reward/points history
 */
export async function getRewardHistory(
  page = 1,
  limit = 20
): Promise<BackendResult<RewardHistoryResponse>> {
  return getJson<RewardHistoryResponse>(ENDPOINTS.history, {
    query: { page, limit },
    retry: 2,
  });
}

/**
 * Get available rewards to redeem
 */
export async function getAvailableRewards(
  category?: string
): Promise<BackendResult<RewardListResponse>> {
  return getJson<RewardListResponse>(ENDPOINTS.available, {
    query: category ? { category } : undefined,
    retry: 2,
  });
}

/**
 * Redeem a reward using points
 */
export async function redeemReward(
  rewardId: string,
  quantity = 1
): Promise<BackendResult<{ success: boolean; remainingPoints?: number }>> {
  return postJson(ENDPOINTS.redeem(rewardId), { quantity });
}

// Mock data fallback
export const MOCK_SUMMARY: RewardSummary = {
  totalPoints: 2500,
  pendingPoints: 150,
  usedPoints: 1000,
  tier: 'silver',
  tierProgress: 65,
};

export const MOCK_HISTORY: RewardHistoryItem[] = [
  {
    id: '1',
    type: 'earn',
    points: 500,
    description: 'Mua đơn hàng #12345',
    createdAt: '2025-01-10T10:30:00Z',
    orderId: '12345',
  },
  {
    id: '2',
    type: 'redeem',
    points: 200,
    description: 'Đổi voucher giảm 50.000đ',
    createdAt: '2025-01-08T14:20:00Z',
    rewardId: 'r1',
  },
  {
    id: '3',
    type: 'earn',
    points: 300,
    description: 'Hoàn thành đánh giá sản phẩm',
    createdAt: '2025-01-05T09:00:00Z',
  },
  {
    id: '4',
    type: 'earn',
    points: 150,
    description: 'Điểm thưởng sinh nhật',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

export const MOCK_REWARDS: RewardItem[] = [
  {
    id: 'r1',
    name: 'Voucher 50.000đ',
    description: 'Voucher giảm giá 50.000đ cho đơn tiếp theo',
    pointsRequired: 200,
    image: 'https://placehold.co/200x200/0066CC/white?text=50K',
    category: 'voucher',
    isAvailable: true,
  },
  {
    id: 'r2',
    name: 'Voucher 100.000đ',
    description: 'Voucher giảm giá 100.000đ cho đơn tiếp theo',
    pointsRequired: 400,
    image: 'https://placehold.co/200x200/0066CC/white?text=100K',
    category: 'voucher',
    isAvailable: true,
  },
  {
    id: 'r3',
    name: 'Miễn phí vận chuyển',
    description: 'Miễn phí ship cho 3 đơn hàng',
    pointsRequired: 300,
    image: 'https://placehold.co/200x200/28a745/white?text=FreeShip',
    category: 'shipping',
    isAvailable: true,
  },
  {
    id: 'r4',
    name: 'Nâng hạng VIP',
    description: 'Nâng lên hạng Gold ngay lập tức',
    pointsRequired: 5000,
    image: 'https://placehold.co/200x200/ffc107/black?text=VIP',
    category: 'tier',
    stock: 10,
    isAvailable: true,
  },
];

export default {
  getRewardSummary,
  getRewardHistory,
  getAvailableRewards,
  redeemReward,
  MOCK_SUMMARY,
  MOCK_HISTORY,
  MOCK_REWARDS,
};
