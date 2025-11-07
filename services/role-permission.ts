import {
    CONSTRUCTION_PERMISSIONS,
    CONSTRUCTION_ROLES,
    CONSTRUCTION_ROLE_PERMISSIONS,
    ConstructionRole,
    ConstructionUser,
    getRolePermissions
} from '../types/construction-auth';
import { apiFetch } from './api';

export class RolePermissionService {
  
  // ================== ROLE MANAGEMENT ==================
  
  /**
   * Lấy danh sách tất cả roles
   */
  static async getAllRoles(): Promise<ConstructionRole[]> {
    try {
      const response = await apiFetch('/roles') as { data: ConstructionRole[] };
      return response.data || [];
    } catch (error) {
      console.error('Error fetching roles from API:', error);
      throw new Error('Không thể tải danh sách vai trò từ server. Vui lòng kiểm tra kết nối mạng.');
    }
  }

  /**
   * Tạo role mới
   */
  static async createRole(roleData: {
    name: string;
    permissions: string[];
  }): Promise<ConstructionRole> {
    try {
      const response = await apiFetch('/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      }) as { data: ConstructionRole };
      return response.data;
    } catch (error) {
      console.error('Error creating role via API:', error);
      throw new Error('Không thể tạo vai trò mới. Vui lòng thử lại sau.');
    }
  }

  /**
   * Cập nhật role
   */
  static async updateRole(
    roleId: string, 
    updates: {
      name?: string;
      permissions?: string[];
    }
  ): Promise<ConstructionRole> {
    try {
      const response = await apiFetch(`/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }) as { data: ConstructionRole };
      return response.data;
    } catch (error) {
      console.error('Error updating role via API:', error);
      throw new Error('Không thể cập nhật vai trò. Vui lòng thử lại sau.');
    }
  }

  /**
   * Xóa role
   */
  static async deleteRole(roleId: string): Promise<void> {
    try {
      await apiFetch(`/roles/${roleId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting role via API:', error);
      throw new Error('Không thể xóa vai trò. Vui lòng thử lại sau.');
    }
  }

  // ================== USER ROLE ASSIGNMENT ==================
  
  /**
   * Gán role cho user
   */
  static async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });
    } catch (error) {
      console.error('Error assigning role to user via API:', error);
      throw new Error('Không thể phân quyền cho người dùng. Vui lòng thử lại sau.');
    }
  }

  /**
   * Lấy danh sách users theo role
   */
  static async getUsersByRole(roleName: string): Promise<ConstructionUser[]> {
    try {
      const response = await apiFetch(`/users?role=${roleName}`) as { data: ConstructionUser[] };
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users by role from API:', error);
      throw new Error('Không thể tải danh sách người dùng từ server. Vui lòng kiểm tra kết nối mạng.');
    }
  }

  // ================== PERMISSION CHECKING ==================
  
  /**
   * Kiểm tra user có permission không
   */
  static hasPermission(
    userPermissions: string[], 
    requiredPermission: string
  ): boolean {
    // Admin có tất cả quyền
    if (userPermissions.includes(CONSTRUCTION_PERMISSIONS.SYSTEM_ADMIN)) {
      return true;
    }
    return userPermissions.includes(requiredPermission);
  }

  /**
   * Kiểm tra user có ít nhất một trong các permissions
   */
  static hasAnyPermission(
    userPermissions: string[], 
    requiredPermissions: string[]
  ): boolean {
    return requiredPermissions.some(permission => 
      this.hasPermission(userPermissions, permission)
    );
  }

  /**
   * Lấy tất cả permissions của user từ role
   */
  static getUserPermissions(userRole: string): string[] {
    return getRolePermissions(userRole);
  }

  // ================== DEFAULT ROLES ==================
  
  /**
   * Lấy default roles khi API không khả dụng
   */
  static getDefaultRoles(): ConstructionRole[] {
    return Object.entries(CONSTRUCTION_ROLES).map(([key, value]) => ({
      roleid: value,
      name: this.getRoleDisplayName(value),
      permissions: CONSTRUCTION_ROLE_PERMISSIONS[value] || [],
    }));
  }

  /**
   * Lấy tên hiển thị của role
   */
  static getRoleDisplayName(roleKey: string): string {
    const roleNames: Record<string, string> = {
      [CONSTRUCTION_ROLES.ADMIN]: 'Quản trị viên',
      [CONSTRUCTION_ROLES.MANAGER]: 'Quản lý',
      [CONSTRUCTION_ROLES.CUSTOMER_SERVICE]: 'Chăm sóc khách hàng',
      [CONSTRUCTION_ROLES.QUALITY_CONSULTANT]: 'Tư vấn chất lượng',
      [CONSTRUCTION_ROLES.ARCHITECT]: 'Kiến trúc sư',
      [CONSTRUCTION_ROLES.CONSTRUCTION_COMPANY]: 'Công ty xây dựng',
      [CONSTRUCTION_ROLES.CONTRACTOR]: 'Nhà thầu',
      [CONSTRUCTION_ROLES.WORKER]: 'Thợ xây',
      [CONSTRUCTION_ROLES.CUSTOMER]: 'Khách hàng',
    };
    return roleNames[roleKey] || roleKey;
  }

  /**
   * Lấy mô tả permission
   */
  static getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      // System
      [CONSTRUCTION_PERMISSIONS.SYSTEM_ADMIN]: 'Quản trị hệ thống',
      [CONSTRUCTION_PERMISSIONS.SYSTEM_CONFIG]: 'Cấu hình hệ thống',
      [CONSTRUCTION_PERMISSIONS.SYSTEM_BACKUP]: 'Sao lưu dữ liệu',
      
      // User Management
      [CONSTRUCTION_PERMISSIONS.USER_VIEW]: 'Xem danh sách người dùng',
      [CONSTRUCTION_PERMISSIONS.USER_CREATE]: 'Tạo người dùng mới',
      [CONSTRUCTION_PERMISSIONS.USER_EDIT]: 'Chỉnh sửa thông tin người dùng',
      [CONSTRUCTION_PERMISSIONS.USER_DELETE]: 'Xóa người dùng',
      [CONSTRUCTION_PERMISSIONS.USER_ASSIGN_ROLE]: 'Phân quyền người dùng',
      
      // Role Management
      [CONSTRUCTION_PERMISSIONS.ROLE_VIEW]: 'Xem danh sách vai trò',
      [CONSTRUCTION_PERMISSIONS.ROLE_CREATE]: 'Tạo vai trò mới',
      [CONSTRUCTION_PERMISSIONS.ROLE_EDIT]: 'Chỉnh sửa vai trò',
      [CONSTRUCTION_PERMISSIONS.ROLE_DELETE]: 'Xóa vai trò',
      [CONSTRUCTION_PERMISSIONS.PERMISSION_ASSIGN]: 'Phân quyền cho vai trò',
      
      // Project
      [CONSTRUCTION_PERMISSIONS.PROJECT_VIEW]: 'Xem dự án',
      [CONSTRUCTION_PERMISSIONS.PROJECT_CREATE]: 'Tạo dự án mới',
      [CONSTRUCTION_PERMISSIONS.PROJECT_EDIT]: 'Chỉnh sửa dự án',
      [CONSTRUCTION_PERMISSIONS.PROJECT_DELETE]: 'Xóa dự án',
      [CONSTRUCTION_PERMISSIONS.PROJECT_ASSIGN]: 'Phân công dự án',
      
      // Design
      [CONSTRUCTION_PERMISSIONS.DESIGN_VIEW]: 'Xem thiết kế',
      [CONSTRUCTION_PERMISSIONS.DESIGN_CREATE]: 'Tạo thiết kế mới',
      [CONSTRUCTION_PERMISSIONS.DESIGN_EDIT]: 'Chỉnh sửa thiết kế',
      [CONSTRUCTION_PERMISSIONS.DESIGN_DELETE]: 'Xóa thiết kế',
      [CONSTRUCTION_PERMISSIONS.DESIGN_APPROVE]: 'Duyệt thiết kế',
      [CONSTRUCTION_PERMISSIONS.DESIGN_EXPORT]: 'Xuất báo cáo thiết kế',
      
      // Construction
      [CONSTRUCTION_PERMISSIONS.CONSTRUCTION_VIEW]: 'Xem tiến độ thi công',
      [CONSTRUCTION_PERMISSIONS.CONSTRUCTION_CREATE]: 'Tạo kế hoạch thi công',
      [CONSTRUCTION_PERMISSIONS.CONSTRUCTION_EDIT]: 'Chỉnh sửa thi công',
      [CONSTRUCTION_PERMISSIONS.CONSTRUCTION_SCHEDULE]: 'Lập lịch thi công',
      [CONSTRUCTION_PERMISSIONS.CONSTRUCTION_ASSIGN_WORKER]: 'Phân công thợ',
      
      // Quality
      [CONSTRUCTION_PERMISSIONS.QUALITY_VIEW]: 'Xem kiểm tra chất lượng',
      [CONSTRUCTION_PERMISSIONS.QUALITY_INSPECT]: 'Thực hiện kiểm tra',
      [CONSTRUCTION_PERMISSIONS.QUALITY_APPROVE]: 'Duyệt chất lượng',
      [CONSTRUCTION_PERMISSIONS.QUALITY_REPORT]: 'Báo cáo chất lượng',
      
      // Finance
      [CONSTRUCTION_PERMISSIONS.FINANCE_VIEW]: 'Xem thông tin tài chính',
      [CONSTRUCTION_PERMISSIONS.FINANCE_CREATE_QUOTE]: 'Tạo báo giá',
      [CONSTRUCTION_PERMISSIONS.FINANCE_APPROVE_PAYMENT]: 'Duyệt thanh toán',
      [CONSTRUCTION_PERMISSIONS.FINANCE_VIEW_REPORT]: 'Xem báo cáo tài chính',
      
      // Customer
      [CONSTRUCTION_PERMISSIONS.CUSTOMER_VIEW]: 'Xem thông tin khách hàng',
      [CONSTRUCTION_PERMISSIONS.CUSTOMER_CREATE]: 'Tạo khách hàng mới',
      [CONSTRUCTION_PERMISSIONS.CUSTOMER_EDIT]: 'Chỉnh sửa thông tin khách hàng',
      [CONSTRUCTION_PERMISSIONS.CUSTOMER_COMMUNICATE]: 'Giao tiếp với khách hàng',
      
      // Report
      [CONSTRUCTION_PERMISSIONS.REPORT_VIEW_ALL]: 'Xem tất cả báo cáo',
      [CONSTRUCTION_PERMISSIONS.REPORT_EXPORT]: 'Xuất báo cáo',
      [CONSTRUCTION_PERMISSIONS.REPORT_ANALYTICS]: 'Xem phân tích dữ liệu',
    };
    
    return descriptions[permission] || permission;
  }

  // ================== UTILITY FUNCTIONS ==================
  
  /**
   * Nhóm permissions theo category
   */
  static groupPermissionsByCategory(): Record<string, { permission: string; description: string }[]> {
    const groups: Record<string, { permission: string; description: string }[]> = {
      'Hệ thống': [],
      'Người dùng': [],
      'Vai trò': [],
      'Dự án': [],
      'Thiết kế': [],
      'Thi công': [],
      'Chất lượng': [],
      'Tài chính': [],
      'Khách hàng': [],
      'Báo cáo': [],
    };

    Object.values(CONSTRUCTION_PERMISSIONS).forEach(permission => {
      const description = this.getPermissionDescription(permission);
      
      if (permission.startsWith('system.')) {
        groups['Hệ thống'].push({ permission, description });
      } else if (permission.startsWith('user.')) {
        groups['Người dùng'].push({ permission, description });
      } else if (permission.startsWith('role.') || permission.startsWith('permission.')) {
        groups['Vai trò'].push({ permission, description });
      } else if (permission.startsWith('project.')) {
        groups['Dự án'].push({ permission, description });
      } else if (permission.startsWith('design.')) {
        groups['Thiết kế'].push({ permission, description });
      } else if (permission.startsWith('construction.')) {
        groups['Thi công'].push({ permission, description });
      } else if (permission.startsWith('quality.')) {
        groups['Chất lượng'].push({ permission, description });
      } else if (permission.startsWith('finance.')) {
        groups['Tài chính'].push({ permission, description });
      } else if (permission.startsWith('customer.')) {
        groups['Khách hàng'].push({ permission, description });
      } else if (permission.startsWith('report.')) {
        groups['Báo cáo'].push({ permission, description });
      }
    });

    return groups;
  }
}

export default RolePermissionService;