/**
 * Marketplace Roles Configuration
 * Định nghĩa đầy đủ các vai trò trong marketplace xây dựng/nội thất
 */

import { MarketplaceRole, UserType } from '@/types/auth';

/**
 * MARKETPLACE_ROLES - Chi tiết về từng vai trò trong hệ thống
 */
export const MARKETPLACE_ROLES: Record<UserType, MarketplaceRole> = {
  buyer: {
    type: 'buyer',
    name: 'Buyer',
    nameVi: 'Khách Hàng',
    description: 'Người mua sản phẩm, dịch vụ thiết kế và xây dựng',
    capabilities: [
      'Tìm kiếm sản phẩm/dịch vụ',
      'Liên hệ với người bán',
      'Đặt hàng và thanh toán',
      'Đánh giá và review',
      'Quản lý đơn hàng',
      'Chat với seller',
      'Lưu sản phẩm yêu thích',
      'So sánh giá',
    ],
    icon: 'person-outline',
    color: '#3B82F6',
    verificationRequired: false,
  },

  seller: {
    type: 'seller',
    name: 'Individual Seller',
    nameVi: 'Người Bán Cá Nhân',
    description: 'Thợ, freelancer cung cấp dịch vụ thi công, sửa chữa',
    capabilities: [
      'Đăng sản phẩm/dịch vụ',
      'Quản lý đơn hàng',
      'Chat với khách hàng',
      'Cập nhật trạng thái thi công',
      'Upload portfolio',
      'Nhận thanh toán',
      'Quản lý lịch làm việc',
      'Xem thống kê bán hàng',
    ],
    icon: 'hammer-outline',
    color: '#10B981',
    verificationRequired: true,
  },

  company: {
    type: 'company',
    name: 'Design/Construction Company',
    nameVi: 'Công Ty Thiết Kế/Thi Công',
    description: 'Công ty chuyên về thiết kế và thi công nội thất, kiến trúc',
    capabilities: [
      'Đăng dự án showcase',
      'Quản lý nhiều sản phẩm/gói dịch vụ',
      'Quản lý team nhân viên',
      'Tạo báo giá chi tiết',
      'Quản lý nhiều dự án đồng thời',
      'Marketing và quảng cáo',
      'Phân tích dữ liệu kinh doanh',
      'API integration',
    ],
    icon: 'business-outline',
    color: '#8B5CF6',
    verificationRequired: true,
  },

  contractor: {
    type: 'contractor',
    name: 'General Contractor',
    nameVi: 'Nhà Thầu Xây Dựng',
    description: 'Nhà thầu chính chịu trách nhiệm tổng thể dự án xây dựng',
    capabilities: [
      'Nhận thầu dự án lớn',
      'Quản lý thầu phụ',
      'Lập kế hoạch thi công',
      'Quản lý nguyên vật liệu',
      'Báo cáo tiến độ',
      'Quản lý chi phí',
      'Giám sát chất lượng',
      'Compliance và giấy phép',
    ],
    icon: 'construct-outline',
    color: '#F59E0B',
    verificationRequired: true,
  },

  architect: {
    type: 'architect',
    name: 'Architect',
    nameVi: 'Kiến Trúc Sư',
    description: 'Kiến trúc sư thiết kế công trình, có chứng chỉ hành nghề',
    capabilities: [
      'Thiết kế kiến trúc 2D/3D',
      'Tư vấn giải pháp kiến trúc',
      'Lập hồ sơ thiết kế',
      'Xin phép xây dựng',
      'Giám sát thi công',
      'Kiểm tra nghiệm thu',
      'Tư vấn chuyên sâu',
      'Showcase portfolio',
    ],
    icon: 'shapes-outline',
    color: '#EC4899',
    verificationRequired: true,
  },

  designer: {
    type: 'designer',
    name: 'Interior Designer',
    nameVi: 'Nhà Thiết Kế Nội Thất',
    description: 'Chuyên gia thiết kế nội thất, bố trí không gian',
    capabilities: [
      'Thiết kế nội thất 3D',
      'Tư vấn phong cách',
      'Chọn lựa vật liệu, màu sắc',
      'Bố trí không gian',
      'Render hình ảnh 3D',
      'Shopping list nội thất',
      'Mood board',
      'Theo dõi thi công nội thất',
    ],
    icon: 'color-palette-outline',
    color: '#EF4444',
    verificationRequired: true,
  },

  supplier: {
    type: 'supplier',
    name: 'Material Supplier',
    nameVi: 'Nhà Cung Cấp Vật Liệu',
    description: 'Cung cấp vật liệu xây dựng, nội thất số lượng lớn',
    capabilities: [
      'Đăng catalog sản phẩm',
      'Quản lý tồn kho',
      'Báo giá theo số lượng',
      'Giao hàng và lắp đặt',
      'Bảo hành sản phẩm',
      'Chương trình đại lý',
      'Bulk orders',
      'Hóa đơn VAT',
    ],
    icon: 'cube-outline',
    color: '#06B6D4',
    verificationRequired: true,
  },

  admin: {
    type: 'admin',
    name: 'Platform Admin',
    nameVi: 'Quản Trị Viên',
    description: 'Quản trị viên nền tảng, toàn quyền quản lý hệ thống',
    capabilities: [
      'Quản lý tất cả users',
      'Duyệt seller verification',
      'Xử lý tranh chấp',
      'Quản lý nội dung',
      'Phân tích toàn hệ thống',
      'Cấu hình platform',
      'Marketing campaigns',
      'System maintenance',
    ],
    icon: 'shield-checkmark-outline',
    color: '#DC2626',
    verificationRequired: false,
  },
};

/**
 * Role Permissions Mapping
 * Map vai trò với các quyền cụ thể trong hệ thống
 */
export const ROLE_PERMISSIONS: Record<UserType, string[]> = {
  buyer: [
    'product.view',
    'product.search',
    'cart.manage',
    'order.create',
    'order.view_own',
    'review.create',
    'chat.send',
    'wishlist.manage',
  ],

  seller: [
    'product.create',
    'product.edit_own',
    'product.delete_own',
    'order.view_own',
    'order.update_status',
    'chat.respond',
    'portfolio.manage',
    'calendar.manage',
    'analytics.view_own',
  ],

  company: [
    'product.create',
    'product.edit_own',
    'product.delete_own',
    'project.create',
    'project.manage',
    'team.manage',
    'quote.create',
    'order.view_own',
    'order.manage',
    'analytics.advanced',
    'marketing.manage',
    'api.access',
  ],

  contractor: [
    'project.bid',
    'project.manage_awarded',
    'subcontractor.manage',
    'material.order',
    'schedule.manage',
    'budget.manage',
    'progress.report',
    'quality.inspect',
    'compliance.manage',
  ],

  architect: [
    'design.create',
    'design.2d_3d',
    'design.export',
    'consultation.provide',
    'permit.file',
    'supervision.conduct',
    'inspection.perform',
    'portfolio.showcase',
    'certification.display',
  ],

  designer: [
    'interior.design',
    'render.3d',
    'moodboard.create',
    'material.recommend',
    'color.consult',
    'space.plan',
    'shopping.list',
    'supervision.interior',
    'portfolio.manage',
  ],

  supplier: [
    'catalog.manage',
    'inventory.manage',
    'quote.bulk',
    'delivery.manage',
    'warranty.manage',
    'dealer.program',
    'invoice.vat',
    'stock.alert',
  ],

  admin: [
    'system.full_access',
    'user.manage_all',
    'verification.approve',
    'dispute.resolve',
    'content.moderate',
    'analytics.platform',
    'config.system',
    'marketing.campaigns',
  ],
};

/**
 * Verification Requirements
 * Yêu cầu xác minh cho từng vai trò
 */
export const VERIFICATION_REQUIREMENTS: Record<UserType, {
  required: boolean;
  documents: string[];
  checkItems: string[];
}> = {
  buyer: {
    required: false,
    documents: [],
    checkItems: ['Email verification', 'Phone verification'],
  },

  seller: {
    required: true,
    documents: [
      'CMND/CCCD (mặt trước + sau)',
      'Chứng chỉ nghề (nếu có)',
      'Portfolio (tối thiểu 3 dự án)',
    ],
    checkItems: [
      'Email verification',
      'Phone verification',
      'ID card verification',
      'Portfolio review',
      'Background check',
    ],
  },

  company: {
    required: true,
    documents: [
      'Giấy phép kinh doanh',
      'Mã số thuế',
      'Chứng chỉ ISO (nếu có)',
      'Portfolio công ty',
      'Giấy phép hoạt động xây dựng',
    ],
    checkItems: [
      'Business license verification',
      'Tax code verification',
      'Office address verification',
      'Portfolio review',
      'Legal status check',
    ],
  },

  contractor: {
    required: true,
    documents: [
      'Giấy phép kinh doanh',
      'Chứng chỉ năng lực nhà thầu',
      'Bảo hiểm trách nhiệm nghề nghiệp',
      'Danh sách dự án đã thi công',
    ],
    checkItems: [
      'Contractor license verification',
      'Insurance verification',
      'Past project verification',
      'Financial status check',
      'Legal compliance check',
    ],
  },

  architect: {
    required: true,
    documents: [
      'Chứng chỉ hành nghề kiến trúc',
      'Bằng cấp kiến trúc sư',
      'CMND/CCCD',
      'Portfolio thiết kế',
    ],
    checkItems: [
      'Professional license verification',
      'Degree verification',
      'Portfolio review',
      'Association membership check',
    ],
  },

  designer: {
    required: true,
    documents: [
      'Chứng chỉ thiết kế nội thất (nếu có)',
      'Portfolio thiết kế',
      'CMND/CCCD',
    ],
    checkItems: [
      'ID verification',
      'Portfolio review (minimum 5 projects)',
      'Design skill assessment',
      'Software proficiency check',
    ],
  },

  supplier: {
    required: true,
    documents: [
      'Giấy phép kinh doanh',
      'Mã số thuế',
      'Catalog sản phẩm',
      'Giấy chứng nhận chất lượng sản phẩm',
    ],
    checkItems: [
      'Business license verification',
      'Tax registration verification',
      'Product quality certification',
      'Warehouse/showroom verification',
    ],
  },

  admin: {
    required: false,
    documents: [],
    checkItems: ['Internal appointment only'],
  },
};

/**
 * Role Badge Configuration
 * Cấu hình huy hiệu cho từng vai trò
 */
export const ROLE_BADGES: Record<UserType, {
  text: string;
  bgColor: string;
  textColor: string;
  icon: string;
}> = {
  buyer: {
    text: 'Khách hàng',
    bgColor: '#EFF6FF',
    textColor: '#3B82F6',
    icon: 'person-outline',
  },
  seller: {
    text: 'Thợ',
    bgColor: '#F0FDF4',
    textColor: '#10B981',
    icon: 'hammer-outline',
  },
  company: {
    text: 'Công ty',
    bgColor: '#F5F3FF',
    textColor: '#8B5CF6',
    icon: 'business-outline',
  },
  contractor: {
    text: 'Nhà thầu',
    bgColor: '#FFFBEB',
    textColor: '#F59E0B',
    icon: 'construct-outline',
  },
  architect: {
    text: 'KTS',
    bgColor: '#FCE7F3',
    textColor: '#EC4899',
    icon: 'shapes-outline',
  },
  designer: {
    text: 'Thiết kế',
    bgColor: '#FEE2E2',
    textColor: '#EF4444',
    icon: 'color-palette-outline',
  },
  supplier: {
    text: 'NCC',
    bgColor: '#ECFEFF',
    textColor: '#06B6D4',
    icon: 'cube-outline',
  },
  admin: {
    text: 'Admin',
    bgColor: '#FEE2E2',
    textColor: '#DC2626',
    icon: 'shield-checkmark-outline',
  },
};

/**
 * Helper: Check if user has permission
 */
export function hasPermission(userType: UserType, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userType] || [];
  return permissions.includes(permission) || permissions.includes('system.full_access');
}

/**
 * Helper: Get role details
 */
export function getRoleDetails(userType: UserType): MarketplaceRole {
  return MARKETPLACE_ROLES[userType];
}

/**
 * Helper: Get role badge config
 */
export function getRoleBadge(userType: UserType) {
  return ROLE_BADGES[userType];
}

/**
 * Helper: Check if role requires verification
 */
export function requiresVerification(userType: UserType): boolean {
  return MARKETPLACE_ROLES[userType].verificationRequired;
}

/**
 * Helper: Get verification requirements
 */
export function getVerificationRequirements(userType: UserType) {
  return VERIFICATION_REQUIREMENTS[userType];
}
