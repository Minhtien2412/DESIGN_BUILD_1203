import { apiFetch } from './api';

// Interfaces for database storage
export interface ConstructionDesignData {
  id?: string;
  customerInfo: {
    houseNumber: string;
    street: string;
    ward: string;
    city: string;
    projectArea: string;
  };
  landInfo: {
    landArea: string;
    buildingDensity: string;
    floors: string;
    frontSetback: string;
    backSetback: string;
    plannedBuildingArea: string;
    buildingType: 'nha-pho' | 'biet-thu';
    style: 'hien-dai' | 'co-dien';
  };
  costCalculation: {
    foundation: number;
    yard: number;
    elevatedCode: number;
    basement: number;
    floor1: number;
    floor2: number;
    floor3: number;
    floor4: number;
    flatRoof: number;
    totalDesignArea: number;
    designCost: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

class ConstructionDesignService {
  private baseUrl = '/construction-designs';

  /**
   * Save construction design data to database via API only
   */
  async saveDesign(data: ConstructionDesignData): Promise<ConstructionDesignData> {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      return response as ConstructionDesignData;
    } catch (error) {
      console.error('Error saving construction design to API:', error);
      throw new Error('Không thể lưu thiết kế xây dựng. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
  }

  /**
   * Get all construction designs for a user via API only
   */
  async getDesigns(userId?: string): Promise<ConstructionDesignData[]> {
    try {
      const url = userId ? `${this.baseUrl}?userId=${userId}` : this.baseUrl;
      const response = await apiFetch(url);
      
      return response as ConstructionDesignData[];
    } catch (error) {
      console.error('Error fetching construction designs from API:', error);
      throw new Error('Không thể tải danh sách thiết kế. Vui lòng kiểm tra kết nối mạng.');
    }
  }

  /**
   * Get a specific construction design by ID via API only
   */
  async getDesignById(id: string): Promise<ConstructionDesignData | null> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`);
      return response as ConstructionDesignData;
    } catch (error) {
      console.error('Error fetching construction design from API:', error);
      throw new Error('Không thể tải thông tin thiết kế. Vui lòng thử lại.');
    }
  }

  /**
   * Update existing construction design via API only
   */
  async updateDesign(id: string, data: Partial<ConstructionDesignData>): Promise<ConstructionDesignData> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString(),
        }),
      });

      return response as ConstructionDesignData;
    } catch (error) {
      console.error('Error updating construction design via API:', error);
      throw new Error('Không thể cập nhật thiết kế. Vui lòng thử lại.');
    }
  }

  /**
   * Delete construction design via API only
   */
  async deleteDesign(id: string): Promise<boolean> {
    try {
      await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting construction design via API:', error);
      throw new Error('Không thể xóa thiết kế. Vui lòng thử lại.');
    }
  }

  /**
   * Calculate cost estimate based on land info
   */
  calculateCostEstimate(landInfo: ConstructionDesignData['landInfo']): ConstructionDesignData['costCalculation'] {
    const area = parseFloat(landInfo.plannedBuildingArea) || 0;
    const floors = parseInt(landInfo.floors) || 0;
    
    const foundation = area * 1.0; // Hệ số K=1
    const yard = area * 0.33; // 1/3 diện tích
    const elevatedCode = 0; // Usually 0 unless specified
    const basement = 0; // Usually 0 unless specified
    const floor1 = floors >= 1 ? area : 0;
    const floor2 = floors >= 2 ? area : 0;
    const floor3 = floors >= 3 ? area : 0;
    const floor4 = floors >= 4 ? area * 0.5 : 0; // 50% for 4th floor
    const flatRoof = area * 0.75; // Hệ số 0.75 cho mái bằng
    
    const totalDesignArea = foundation + yard + elevatedCode + basement + 
                           floor1 + floor2 + floor3 + floor4 + flatRoof;
    
    const designCost = totalDesignArea * 300000; // 300,000 VND per m²
    
    return {
      foundation,
      yard,
      elevatedCode,
      basement,
      floor1,
      floor2,
      floor3,
      floor4,
      flatRoof,
      totalDesignArea,
      designCost,
    };
  }

  /**
   * Generate cost report for export
   */
  generateCostReport(
    customerInfo: ConstructionDesignData['customerInfo'],
    landInfo: ConstructionDesignData['landInfo'],
    costCalculation: ConstructionDesignData['costCalculation']
  ): string {
    return `
📋 BÁO CÁO CHI PHÍ THIẾT KẾ XÂY DỰNG
================================================

🏠 THÔNG TIN KHÁCH HÀNG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Địa chỉ: ${customerInfo.houseNumber} ${customerInfo.street}
• Phường/Xã: ${customerInfo.ward}
• Thành phố: ${customerInfo.city}
• Khu dự án: ${customerInfo.projectArea}

📐 THÔNG TIN SỔ ĐẤT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Diện tích sổ: ${landInfo.landArea}
• Mật độ xây dựng: ${landInfo.buildingDensity}
• Số tầng: ${landInfo.floors}
• Lùi trước: ${landInfo.frontSetback}
• Lùi sau: ${landInfo.backSetback}
• Diện tích xây dựng dự trù: ${landInfo.plannedBuildingArea}m²
• Loại nhà: ${landInfo.buildingType === 'nha-pho' ? 'Nhà phố' : 'Biệt thự'}
• Phong cách: ${landInfo.style === 'hien-dai' ? 'Hiện đại' : 'Cổ điển'}

💰 CHI TIẾT CHI PHÍ THIẾT KẾ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────────┐
│ HẠNG MUC           │ DT(m²) │ HỆ SỐ │ QUY ĐỔI │
├────────────────────────────────────────────────┤
│ Đài móng           │ ${costCalculation.foundation.toFixed(1).padStart(6)} │ 1.0   │ ${costCalculation.foundation.toFixed(1).padStart(7)} │
│ Sân                │ ${costCalculation.yard.toFixed(1).padStart(6)} │ 1.0   │ ${costCalculation.yard.toFixed(1).padStart(7)} │
│ Nâng code          │ ${costCalculation.elevatedCode.toFixed(1).padStart(6)} │ 1.75  │ ${(costCalculation.elevatedCode * 1.75).toFixed(1).padStart(7)} │
│ Hầm                │ ${costCalculation.basement.toFixed(1).padStart(6)} │ 1.75  │ ${(costCalculation.basement * 1.75).toFixed(1).padStart(7)} │
│ Tầng 1             │ ${costCalculation.floor1.toFixed(1).padStart(6)} │ 1.0   │ ${costCalculation.floor1.toFixed(1).padStart(7)} │
│ Tầng 2             │ ${costCalculation.floor2.toFixed(1).padStart(6)} │ 1.0   │ ${costCalculation.floor2.toFixed(1).padStart(7)} │
│ Tầng 3             │ ${costCalculation.floor3.toFixed(1).padStart(6)} │ 1.0   │ ${costCalculation.floor3.toFixed(1).padStart(7)} │
│ Tầng 4 (50%)       │ ${costCalculation.floor4.toFixed(1).padStart(6)} │ 1.0   │ ${costCalculation.floor4.toFixed(1).padStart(7)} │
│ Mái bằng           │ ${costCalculation.flatRoof.toFixed(1).padStart(6)} │ 0.75  │ ${(costCalculation.flatRoof * 0.75).toFixed(1).padStart(7)} │
├────────────────────────────────────────────────┤
│ TỔNG DIỆN TÍCH THIẾT KẾ: ${costCalculation.totalDesignArea.toFixed(2)}m²     │
└────────────────────────────────────────────────┘

💵 TỔNG CHI PHÍ THIẾT KẾ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Diện tích thiết kế: ${costCalculation.totalDesignArea.toFixed(2)}m²
• Đơn giá: 300.000 VND/m²
• THÀNH TIỀN: ${costCalculation.designCost.toLocaleString('vi-VN')} VND

📅 Báo cáo được tạo: ${new Date().toLocaleString('vi-VN')}
🏢 APP DESIGN BUILD - Thiết kế & Thi công chuyên nghiệp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lưu ý: 
- Chi phí trên chỉ bao gồm thiết kế kiến trúc
- Chưa bao gồm thiết kế kết cấu, M&E
- Báo giá có thể thay đổi tùy theo yêu cầu cụ thể
- Liên hệ để được tư vấn chi tiết nhất

Dữ liệu được lưu trữ tại: https://api.thietkeresort.com.vn

TỔNG CHI PHÍ THIẾT KẾ: ${costCalculation.designCost.toLocaleString('vi-VN')} VND
`;
  }

  /**
   * Export designs data for backup via API
   */
  async exportDesigns(): Promise<string> {
    try {
      const designs = await this.getDesigns();
      return JSON.stringify(designs, null, 2);
    } catch (error) {
      console.error('Error exporting designs:', error);
      throw new Error('Không thể xuất dữ liệu thiết kế. Vui lòng thử lại.');
    }
  }

  /**
   * Import designs data via API
   */
  async importDesigns(jsonData: string): Promise<void> {
    try {
      const designs: ConstructionDesignData[] = JSON.parse(jsonData);
      
      // Validate data structure
      if (!Array.isArray(designs)) {
        throw new Error('Invalid data format');
      }

      // Import each design via API
      for (const design of designs) {
        await this.saveDesign(design);
      }
    } catch (error) {
      console.error('Error importing designs:', error);
      throw new Error('Không thể nhập dữ liệu thiết kế. Vui lòng kiểm tra định dạng file.');
    }
  }
}

// Export singleton instance
export const constructionDesignService = new ConstructionDesignService();
