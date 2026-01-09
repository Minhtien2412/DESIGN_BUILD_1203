/**
 * User Types và Role Management
 * Kiểm tra tính thực dụng của các loại user trong hệ thống
 */

export type UserRole = 'admin' | 'manager' | 'designer' | 'contractor' | 'client' | 'viewer';

export interface UserTypeDefinition {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
  limitations: string[];
  isActive: boolean;
  priority: number; // 1-10 (1 = highest priority)
  useCase: string;
  required: boolean; // Có cần thiết trong hệ thống không
}

export interface UserTypeAnalysis {
  role: UserRole;
  practicalityScore: number; // 0-100
  recommendation: 'keep' | 'modify' | 'remove';
  reasons: string[];
  alternatives?: UserRole[];
}

/**
 * Định nghĩa các loại user trong hệ thống
 */
export const USER_TYPES: Record<UserRole, UserTypeDefinition> = {
  admin: {
    role: 'admin',
    name: 'Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
    permissions: [
      'system_management',
      'user_management', 
      'project_management',
      'financial_management',
      'settings_management',
      'backup_restore',
      'security_management'
    ],
    limitations: [],
    isActive: true,
    priority: 1,
    useCase: 'Quản lý toàn bộ hệ thống, cấu hình, bảo mật',
    required: true
  },
  
  manager: {
    role: 'manager',
    name: 'Quản lý dự án',
    description: 'Quản lý dự án và nhóm làm việc',
    permissions: [
      'project_management',
      'team_management',
      'task_assignment',
      'progress_tracking',
      'budget_tracking',
      'client_communication'
    ],
    limitations: [
      'Không thể thay đổi cấu hình hệ thống',
      'Không thể xóa dự án đã hoàn thành'
    ],
    isActive: true,
    priority: 2,
    useCase: 'Điều phối dự án, quản lý timeline, ngân sách',
    required: true
  },

  designer: {
    role: 'designer',
    name: 'Nhà thiết kế',
    description: 'Tạo và chỉnh sửa thiết kế',
    permissions: [
      'design_creation',
      'design_modification',
      'file_upload',
      'version_control',
      'client_presentation',
      'design_review'
    ],
    limitations: [
      'Không thể xóa thiết kế đã approved',
      'Cần approval cho thay đổi lớn'
    ],
    isActive: true,
    priority: 3,
    useCase: 'Tạo bản vẽ, thiết kế 3D, thuyết trình khách hàng',
    required: true
  },

  contractor: {
    role: 'contractor',
    name: 'Nhà thầu',
    description: 'Thực hiện thi công dự án',
    permissions: [
      'project_view',
      'progress_update',
      'material_request',
      'quality_report',
      'photo_upload',
      'issue_report'
    ],
    limitations: [
      'Chỉ xem dự án được phân công',
      'Không thể chỉnh sửa thiết kế'
    ],
    isActive: true,
    priority: 4,
    useCase: 'Cập nhật tiến độ thi công, báo cáo vấn đề',
    required: true
  },

  client: {
    role: 'client',
    name: 'Khách hàng',
    description: 'Chủ sở hữu dự án',
    permissions: [
      'project_view',
      'design_approval',
      'payment_tracking',
      'communication',
      'feedback_submission',
      'progress_monitoring'
    ],
    limitations: [
      'Chỉ xem dự án của mình',
      'Không thể truy cập dữ liệu hệ thống'
    ],
    isActive: true,
    priority: 5,
    useCase: 'Theo dõi dự án, phê duyệt thiết kế, thanh toán',
    required: true
  },

  viewer: {
    role: 'viewer',
    name: 'Người xem',
    description: 'Chỉ xem, không chỉnh sửa',
    permissions: [
      'project_view',
      'design_view',
      'progress_view'
    ],
    limitations: [
      'Không thể chỉnh sửa gì',
      'Quyền truy cập hạn chế'
    ],
    isActive: false, // Ít sử dụng
    priority: 10,
    useCase: 'Stakeholder external, auditor',
    required: false
  }
};

/**
 * Phân tích tính thực dụng của từng user type
 */
export function analyzeUserTypePracticality(role: UserRole): UserTypeAnalysis {
  const userType = USER_TYPES[role];
  
  if (!userType) {
    return {
      role,
      practicalityScore: 0,
      recommendation: 'remove',
      reasons: ['User type không tồn tại trong định nghĩa']
    };
  }

  let score = 0;
  const reasons: string[] = [];
  let recommendation: 'keep' | 'modify' | 'remove' = 'keep';

  // Tính điểm dựa trên các tiêu chí
  
  // 1. Required và Active (30 điểm)
  if (userType.required) {
    score += 20;
    reasons.push('✅ Cần thiết cho hoạt động cốt lõi');
  }
  
  if (userType.isActive) {
    score += 10;
    reasons.push('✅ Đang được sử dụng tích cực');
  } else {
    reasons.push('⚠️ Ít được sử dụng trong thực tế');
  }

  // 2. Permissions hợp lý (25 điểm)
  if (userType.permissions.length >= 3 && userType.permissions.length <= 8) {
    score += 15;
    reasons.push('✅ Số lượng quyền hạn hợp lý');
  } else if (userType.permissions.length > 8) {
    score += 5;
    reasons.push('⚠️ Quá nhiều quyền hạn, có thể chia nhỏ');
  } else {
    score += 5;
    reasons.push('⚠️ Quá ít quyền hạn, có thể gộp với role khác');
  }

  // Kiểm tra permissions overlap
  const criticalPermissions = userType.permissions.filter(p => 
    p.includes('management') || p.includes('creation') || p.includes('approval')
  );
  if (criticalPermissions.length > 0) {
    score += 10;
    reasons.push('✅ Có quyền hạn quan trọng');
  }

  // 3. Priority hợp lý (20 điểm)
  if (userType.priority <= 5) {
    score += 20;
    reasons.push('✅ Ưu tiên cao trong hệ thống');
  } else if (userType.priority <= 7) {
    score += 10;
    reasons.push('✅ Ưu tiên trung bình');
  } else {
    score += 5;
    reasons.push('⚠️ Ưu tiên thấp');
  }

  // 4. Use case rõ ràng (25 điểm)
  if (userType.useCase.length > 20) {
    score += 15;
    reasons.push('✅ Use case rõ ràng và cụ thể');
  } else {
    score += 5;
    reasons.push('⚠️ Use case chưa đủ rõ ràng');
  }

  // Kiểm tra unique value
  const hasUniqueValue = checkUniqueValue(role);
  if (hasUniqueValue) {
    score += 10;
    reasons.push('✅ Có giá trị độc đáo không thể thay thế');
  }

  // Đưa ra recommendation
  if (score >= 75) {
    recommendation = 'keep';
    reasons.push('🎯 Nên giữ lại user type này');
  } else if (score >= 50) {
    recommendation = 'modify';
    reasons.push('🔧 Nên cải thiện user type này');
  } else {
    recommendation = 'remove';
    reasons.push('❌ Nên xem xét loại bỏ hoặc gộp với role khác');
  }

  return {
    role,
    practicalityScore: score,
    recommendation,
    reasons,
    alternatives: getAlternativeRoles(role)
  };
}

/**
 * Kiểm tra giá trị độc đáo của user type
 */
function checkUniqueValue(role: UserRole): boolean {
  const userType = USER_TYPES[role];
  const otherTypes = Object.values(USER_TYPES).filter(t => t.role !== role);
  
  // Kiểm tra permissions overlap
  const uniquePermissions = userType.permissions.filter(permission => {
    return !otherTypes.some(otherType => 
      otherType.permissions.includes(permission)
    );
  });

  return uniquePermissions.length > 0;
}

/**
 * Đề xuất alternative roles
 */
function getAlternativeRoles(role: UserRole): UserRole[] {
  const alternatives: Record<UserRole, UserRole[]> = {
    admin: [], // Admin không có alternative
    manager: ['admin'], // Manager có thể thay bằng admin trong team nhỏ
    designer: ['manager'], // Designer có thể gộp vào manager
    contractor: ['manager'], // Contractor có thể gộp vào manager  
    client: [], // Client cần thiết riêng biệt
    viewer: ['client'] // Viewer có thể thay bằng client với quyền hạn chế
  };

  return alternatives[role] || [];
}

/**
 * Đề xuất cải thiện user type system
 */
export function getSystemRecommendations(): {
  keepRoles: UserRole[];
  modifyRoles: UserRole[];
  removeRoles: UserRole[];
  suggestions: string[];
} {
  const analyses = Object.keys(USER_TYPES).map(role => 
    analyzeUserTypePracticality(role as UserRole)
  );

  const keepRoles = analyses.filter(a => a.recommendation === 'keep').map(a => a.role);
  const modifyRoles = analyses.filter(a => a.recommendation === 'modify').map(a => a.role);
  const removeRoles = analyses.filter(a => a.recommendation === 'remove').map(a => a.role);

  const suggestions = [
    `🎯 Giữ lại ${keepRoles.length} roles chính: ${keepRoles.join(', ')}`,
    `🔧 Cải thiện ${modifyRoles.length} roles: ${modifyRoles.join(', ')}`,
    `❌ Xem xét loại bỏ ${removeRoles.length} roles: ${removeRoles.join(', ')}`,
    '',
    '💡 Đề xuất cải thiện:',
    '• Tối ưu hóa permissions để tránh overlap',
    '• Tạo role hierarchy rõ ràng hơn',
    '• Implement role-based access control (RBAC)',
    '• Thêm dynamic permissions based on project context'
  ];

  return {
    keepRoles,
    modifyRoles, 
    removeRoles,
    suggestions
  };
}

/**
 * Get recommended roles for new registrations
 */
export function getRecommendedRolesForRegistration(): {
  role: UserRole;
  display: string;
  description: string;
  isDefault: boolean;
}[] {
  return [
    {
      role: 'client',
      display: 'Khách hàng',
      description: 'Tôi cần thiết kế/thi công công trình',
      isDefault: true
    },
    {
      role: 'contractor', 
      display: 'Nhà thầu',
      description: 'Tôi cung cấp dịch vụ thi công',
      isDefault: false
    },
    {
      role: 'designer',
      display: 'Thiết kế viên',
      description: 'Tôi cung cấp dịch vụ thiết kế',
      isDefault: false
    }
  ];
}
