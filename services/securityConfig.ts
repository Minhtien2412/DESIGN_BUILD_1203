/**
 * Security Configuration Service
 * Quản lý thông tin nhạy cảm và cấu hình bảo mật
 */

export interface SecurityConfig {
  allowLocalStorage: boolean;
  requireServerAuth: boolean;
  sensitiveDataKeys: string[];
  publicDataKeys: string[];
  cachePublicDataOnly: boolean;
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  allowLocal: boolean;
  requireAuth: boolean;
  description: string;
}

class SecurityConfigService {
  private readonly config: SecurityConfig = {
    allowLocalStorage: true, // Chỉ cho dữ liệu public
    requireServerAuth: true, // Bắt buộc auth cho dữ liệu nhạy cảm
    sensitiveDataKeys: [
      'budget',
      'owner_name', 
      'owner_contact',
      'location.coordinates',
      'land_documents',
      'contracts',
      'payment_info',
      'private_notes',
      'internal_comments',
      'cost_breakdown',
      'profit_margin',
      'vendor_contracts',
      'bank_info',
      'tax_info'
    ],
    publicDataKeys: [
      'id',
      'project_name',
      'project_type', 
      'description',
      'public_images',
      'status',
      'created_at',
      'public_location' // Chỉ tên quận/huyện, không có địa chỉ cụ thể
    ],
    cachePublicDataOnly: true
  };

  private readonly dataClassification: Record<string, DataClassification> = {
    // PUBLIC - Có thể lưu local và hiển thị
    'project_name': {
      level: 'public',
      allowLocal: true,
      requireAuth: false,
      description: 'Tên dự án - thông tin công khai'
    },
    'project_type': {
      level: 'public', 
      allowLocal: true,
      requireAuth: false,
      description: 'Loại dự án - thông tin công khai'
    },
    'public_images': {
      level: 'public',
      allowLocal: true,
      requireAuth: false,
      description: 'Hình ảnh công khai'
    },
    'status': {
      level: 'public',
      allowLocal: true,
      requireAuth: false,
      description: 'Trạng thái dự án'
    },

    // INTERNAL - Cần auth nhưng không quá nhạy cảm
    'description': {
      level: 'internal',
      allowLocal: false,
      requireAuth: true,
      description: 'Mô tả chi tiết dự án'
    },
    'timeline': {
      level: 'internal',
      allowLocal: false,
      requireAuth: true,
      description: 'Lịch trình thực hiện'
    },
    'design_files': {
      level: 'internal',
      allowLocal: false,
      requireAuth: true,
      description: 'File thiết kế'
    },

    // CONFIDENTIAL - Thông tin nhạy cảm
    'budget': {
      level: 'confidential',
      allowLocal: false,
      requireAuth: true,
      description: 'Thông tin ngân sách - rất nhạy cảm'
    },
    'owner_name': {
      level: 'confidential',
      allowLocal: false,
      requireAuth: true,
      description: 'Thông tin chủ đầu tư - nhạy cảm'
    },
    'owner_contact': {
      level: 'confidential',
      allowLocal: false,
      requireAuth: true,
      description: 'Liên hệ chủ đầu tư - rất nhạy cảm'
    },
    'location.address': {
      level: 'confidential',
      allowLocal: false,
      requireAuth: true,
      description: 'Địa chỉ cụ thể - nhạy cảm'
    },
    'location.coordinates': {
      level: 'restricted',
      allowLocal: false,
      requireAuth: true,
      description: 'Tọa độ GPS - cực kỳ nhạy cảm'
    },

    // RESTRICTED - Thông tin cực kỳ nhạy cảm
    'land_documents': {
      level: 'restricted',
      allowLocal: false,
      requireAuth: true,
      description: 'Giấy tờ pháp lý - cực kỳ nhạy cảm'
    },
    'contracts': {
      level: 'restricted',
      allowLocal: false,
      requireAuth: true,
      description: 'Hợp đồng - cực kỳ nhạy cảm'
    },
    'payment_info': {
      level: 'restricted',
      allowLocal: false,
      requireAuth: true,
      description: 'Thông tin thanh toán - cực kỳ nhạy cảm'
    },
    'bank_info': {
      level: 'restricted',
      allowLocal: false,
      requireAuth: true,
      description: 'Thông tin ngân hàng - cực kỳ nhạy cảm'
    }
  };

  // Kiểm tra xem dữ liệu có được phép lưu local không
  canStoreLocally(dataKey: string): boolean {
    const classification = this.dataClassification[dataKey];
    if (!classification) {
      // Mặc định: không cho phép nếu không được phân loại
      return false;
    }
    return classification.allowLocal && this.config.allowLocalStorage;
  }

  // Kiểm tra xem dữ liệu có cần auth không
  requiresAuthentication(dataKey: string): boolean {
    const classification = this.dataClassification[dataKey];
    if (!classification) {
      // Mặc định: yêu cầu auth nếu không được phân loại
      return true;
    }
    return classification.requireAuth || this.config.requireServerAuth;
  }

  // Lọc dữ liệu để chỉ giữ lại phần public cho local storage
  sanitizeDataForLocal(data: any): any {
    const sanitized: any = {};
    
    for (const key of this.config.publicDataKeys) {
      if (data[key] !== undefined && this.canStoreLocally(key)) {
        sanitized[key] = data[key];
      }
    }

    return sanitized;
  }

  // Kiểm tra mức độ bảo mật của dữ liệu
  getDataSecurityLevel(dataKey: string): DataClassification['level'] {
    return this.dataClassification[dataKey]?.level || 'restricted';
  }

  // Lấy danh sách các trường được phép cache local
  getAllowedLocalFields(): string[] {
    return Object.keys(this.dataClassification).filter(key => 
      this.canStoreLocally(key)
    );
  }

  // Lấy danh sách các trường yêu cầu server auth
  getAuthRequiredFields(): string[] {
    return Object.keys(this.dataClassification).filter(key =>
      this.requiresAuthentication(key)
    );
  }

  // Validate API response để đảm bảo không leak dữ liệu nhạy cảm
  validateApiResponse(response: any, endpoint: string): any {
    console.log(`[Security] Validating response from ${endpoint}`);
    
    if (endpoint.includes('/public')) {
      // Endpoint public - chỉ trả về dữ liệu public
      return this.sanitizeDataForLocal(response);
    }
    
    if (endpoint.includes('/details') || endpoint.includes('/full')) {
      // Endpoint chi tiết - cần auth và không cache local
      console.log('[Security] Full data endpoint - requires server auth');
      return response; // Trả về đầy đủ nhưng không cache
    }

    // Mặc định: sanitize cho an toàn
    return this.sanitizeDataForLocal(response);
  }

  // Log security audit
  logSecurityEvent(event: string, dataKeys: string[], action: 'allow' | 'deny') {
    console.log(`[SecurityAudit] ${event}: ${action.toUpperCase()}`);
    console.log(`[SecurityAudit] Data keys: ${dataKeys.join(', ')}`);
    
    if (action === 'deny') {
      console.warn('[SecurityAudit] ⚠️ Sensitive data access denied');
    }
  }

  // Kiểm tra environment security
  isProductionEnvironment(): boolean {
    return process.env.EXPO_PUBLIC_ENV === 'production';
  }

  // Lấy security recommendations
  getSecurityRecommendations(): string[] {
    const recommendations = [
      '✅ Chỉ cache dữ liệu public trên local storage',
      '✅ Yêu cầu server authentication cho dữ liệu nhạy cảm',
      '✅ Không hardcode API keys hoặc tokens',
      '✅ Sử dụng HTTPS cho tất cả API calls',
      '✅ Validate và sanitize tất cả user inputs',
      '⚠️ Không log dữ liệu nhạy cảm trong console',
      '⚠️ Sử dụng secure storage cho tokens',
      '⚠️ Implement proper session management'
    ];

    if (!this.isProductionEnvironment()) {
      recommendations.push('🔧 Đang ở development mode - cẩn thận với dữ liệu thật');
    }

    return recommendations;
  }
}

// Export singleton
export const securityConfigService = new SecurityConfigService();
export default securityConfigService;
