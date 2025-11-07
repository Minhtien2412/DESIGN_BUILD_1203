// Reward Points & Exchange Rate System
export const EXCHANGE_RATE = {
  POINTS_TO_VND: 1000, // 1 điểm = 1,000 VND
  DEFAULT_REWARD_POINTS: 100, // Mặc định 100 điểm cho khách hàng, nhà thầu, công ty
};

// Roles that get default 100 reward points
export const ROLES_WITH_DEFAULT_CREDITS = [
  'khach-hang',    // Khách hàng
  'nha-thau',      // Nhà thầu
  'cong-ty',       // Công ty
  'thau-phu',      // Thầu phụ
  'sale-admin',    // Sale Admin
  'manager',       // Manager
  'admin',         // Admin
  // New specific worker roles
  'THO_SON',       // Thợ sơn
  'THO_CONG',      // Thợ công
  'THO_DA',        // Thợ đá
  'THO_LAT_GACH',  // Thợ lát gạch
  'THO_THACH_CAO', // Thợ thạch cao
  'THO_DIEN',      // Thợ điện
  'THO_NUOC',      // Thợ nước
  'THO_LAM_CUA',   // Thợ làm cửa
  'THO_BAN_AN',    // Thợ bàn ăn
  'THO_BAN_CO_DIEN', // Thợ bàn cơ điện
  'THO_BAN_HOC',   // Thợ bàn học
  'THO_BANG_MAU',  // Thợ bảng màu
  'THO_PCCC',      // Thợ PCCC
  'THO_TB_BEP',    // Thợ thiết bị bếp
  'THO_TB_VS',     // Thợ thiết bị vệ sinh
  'THO_SOFA',      // Thợ sofa
  'THO_CHDV',      // Thợ chăm sóc nhà cửa
  'THO_DICH_VU',   // Thợ dịch vụ
  'THO_DICH_VU_THEM', // Thợ dịch vụ thêm
  // System roles
  'SYSTEM_ADMIN',      // Quản trị hệ thống
  'COMPANY_ADMIN',     // Admin công ty
  'PROJECT_MANAGER',   // Quản lý dự án
  'TENDER_MANAGER',    // Quản lý gói thầu
  'CUSTOMER_BIDDER',   // Khách đấu thầu
  'WORKER',            // Công nhân
  'COMPANY_MEMBER',    // Thành viên công ty
];

export const REWARD_TIERS = {
  BRONZE: { min: 0, max: 99, multiplier: 1 },
  SILVER: { min: 100, max: 499, multiplier: 1.2 },
  GOLD: { min: 500, max: 999, multiplier: 1.5 },
  PLATINUM: { min: 1000, max: Infinity, multiplier: 2 },
};

export interface RewardTransaction {
  id: string;
  user_id: string;
  type: 'earn' | 'spend' | 'bonus' | 'refund';
  points: number;
  description: string;
  reference_id?: string; // order_id, project_id, etc.
  created_at: string;
}

/**
 * Convert points to VND
 */
export function pointsToVND(points: number): number {
  return points * EXCHANGE_RATE.POINTS_TO_VND;
}

/**
 * Convert VND to points
 */
export function vndToPoints(vnd: number): number {
  return Math.floor(vnd / EXCHANGE_RATE.POINTS_TO_VND);
}

/**
 * Get reward tier for points
 */
export function getRewardTier(points: number): keyof typeof REWARD_TIERS {
  if (points >= REWARD_TIERS.PLATINUM.min) return 'PLATINUM';
  if (points >= REWARD_TIERS.GOLD.min) return 'GOLD';
  if (points >= REWARD_TIERS.SILVER.min) return 'SILVER';
  return 'BRONZE';
}

/**
 * Get multiplier for current tier
 */
export function getTierMultiplier(points: number): number {
  const tier = getRewardTier(points);
  return REWARD_TIERS[tier].multiplier;
}

/**
 * Format points display
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('vi-VN');
}

/**
 * Format VND display
 */
export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

/**
 * Calculate points value in VND
 */
export function formatPointsValue(points: number): string {
  const vnd = pointsToVND(points);
  return `${formatPoints(points)} điểm (${formatVND(vnd)})`;
}