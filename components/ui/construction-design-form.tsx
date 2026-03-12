import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Form data interfaces
interface CustomerInfo {
  houseNumber: string;
  street: string;
  ward: string;
  city: string;
  projectArea: string;
}

interface LandInfo {
  landArea: string;
  buildingDensity: string;
  floors: string;
  frontSetback: string;
  backSetback: string;
  plannedBuildingArea: string;
  buildingType: 'nha-pho' | 'biet-thu';
  style: 'hien-dai' | 'co-dien';
}

interface CostCalculation {
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
}

interface ConstructionDesignFormProps {
  onSubmit?: (data: {
    customerInfo: CustomerInfo;
    landInfo: LandInfo;
    costCalculation: CostCalculation;
  }) => void;
  onClose?: () => void;
}

const ConstructionDesignForm: React.FC<ConstructionDesignFormProps> = ({
  onSubmit,
  onClose,
}) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    houseNumber: '',
    street: '',
    ward: '',
    city: '',
    projectArea: '',
  });

  const [landInfo, setLandInfo] = useState<LandInfo>({
    landArea: '',
    buildingDensity: '',
    floors: '',
    frontSetback: '',
    backSetback: '',
    plannedBuildingArea: '',
    buildingType: 'nha-pho',
    style: 'hien-dai',
  });

  // Auto-calculate cost based on input
  const calculateCost = (): CostCalculation => {
    const area = parseFloat(landInfo.plannedBuildingArea) || 0;
    const floors = parseInt(landInfo.floors) || 0;
    
    const foundation = area * 1.0; // Hệ số K=1
    const yard = area * 0.33; // 1/3 diện tích
    const floor1 = area;
    const floor2 = area;
    const floor3 = area;
    const floor4 = area * 0.5; // 50% tầng 4
    const flatRoof = area * 0.75; // Hệ số 0.75
    
    const totalDesignArea = foundation + yard + 
      (floors >= 1 ? floor1 : 0) +
      (floors >= 2 ? floor2 : 0) +
      (floors >= 3 ? floor3 : 0) +
      (floors >= 4 ? floor4 : 0) +
      flatRoof;
    
    const designCost = totalDesignArea * 300000; // 300k/m2
    
    return {
      foundation,
      yard,
      elevatedCode: 0,
      basement: 0,
      floor1: floors >= 1 ? floor1 : 0,
      floor2: floors >= 2 ? floor2 : 0,
      floor3: floors >= 3 ? floor3 : 0,
      floor4: floors >= 4 ? floor4 : 0,
      flatRoof,
      totalDesignArea,
      designCost,
    };
  };

  const costCalculation = calculateCost();

  const generateCostReport = () => {
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
`.trim();
  };

  const handleExportReport = async () => {
    try {
      const report = generateCostReport();
      
      if (Platform.OS === 'web') {
        // For web: create downloadable file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bao-cao-thiet-ke-${customerInfo.houseNumber || 'unknown'}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Thành công', 'Báo cáo đã được tải xuống!');
      } else {
        // For mobile: use Share API
        await Share.share({
          message: report,
          title: 'Báo cáo chi phí thiết kế xây dựng',
        });
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Lỗi', 'Không thể xuất báo cáo. Vui lòng thử lại.');
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!customerInfo.houseNumber || !customerInfo.street || !landInfo.landArea) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    const formData = {
      customerInfo,
      landInfo,
      costCalculation,
    };

    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Save to local storage or send to API
      Alert.alert('Thành công', 'Thông tin đã được lưu!');
    }
  };

  const renderCustomerInfoSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
      <View style={styles.tableContainer}>
        {/* House Number */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Số nhà:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={customerInfo.houseNumber}
              onChangeText={(text) => setCustomerInfo(prev => ({...prev, houseNumber: text}))}
              placeholder="Ví dụ: 77"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* Street */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Đường:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={customerInfo.street}
              onChangeText={(text) => setCustomerInfo(prev => ({...prev, street: text}))}
              placeholder="Ví dụ: Lam Sơn"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* Ward */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Phường:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={customerInfo.ward}
              onChangeText={(text) => setCustomerInfo(prev => ({...prev, ward: text}))}
              placeholder="Ví dụ: phường tân sơn nhì"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* City */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Thành phố:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={customerInfo.city}
              onChangeText={(text) => setCustomerInfo(prev => ({...prev, city: text}))}
              placeholder="Ví dụ: HCM"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* Project Area */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Khu dự án:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={customerInfo.projectArea}
              onChangeText={(text) => setCustomerInfo(prev => ({...prev, projectArea: text}))}
              placeholder="Ví dụ: thổ cư - KDC ..."
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderLandInfoSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>THÔNG TIN SỔ ĐẤT</Text>
      <View style={styles.tableContainer}>
        {/* Land Area */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Diện tích sổ</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={landInfo.landArea}
              onChangeText={(text) => setLandInfo(prev => ({...prev, landArea: text}))}
              placeholder="Ví dụ: 12m * 15m"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* Building Density */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Mật độ xây dựng:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={landInfo.buildingDensity}
              onChangeText={(text) => setLandInfo(prev => ({...prev, buildingDensity: text}))}
              placeholder="Ví dụ: 80%"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* Floors */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Số tầng:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={landInfo.floors}
              onChangeText={(text) => setLandInfo(prev => ({...prev, floors: text}))}
              placeholder="Ví dụ: 4 tầng"
              placeholderTextColor="#6B6B6B"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Front Setback */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Lùi trước:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={landInfo.frontSetback}
              onChangeText={(text) => setLandInfo(prev => ({...prev, frontSetback: text}))}
              placeholder="Ví dụ: 2m"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* Back Setback */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Lùi sau:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={landInfo.backSetback}
              onChangeText={(text) => setLandInfo(prev => ({...prev, backSetback: text}))}
              placeholder="Ví dụ: 1.5m"
              placeholderTextColor="#6B6B6B"
            />
          </View>
        </View>

        {/* Planned Building Area */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Diện tích xây dựng dự trù:</Text>
          </View>
          <View style={styles.inputCell}>
            <TextInput
              style={styles.input}
              value={landInfo.plannedBuildingArea}
              onChangeText={(text) => setLandInfo(prev => ({...prev, plannedBuildingArea: text}))}
              placeholder="Ví dụ: 135"
              placeholderTextColor="#6B6B6B"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Building Type */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Nhà phố{'\n'}Biệt thự</Text>
          </View>
          <View style={styles.inputCell}>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[styles.optionButton, landInfo.buildingType === 'nha-pho' && styles.optionSelected]}
                onPress={() => setLandInfo(prev => ({...prev, buildingType: 'nha-pho'}))}
              >
                <Text style={styles.optionText}>Nhà phố</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, landInfo.buildingType === 'biet-thu' && styles.optionSelected]}
                onPress={() => setLandInfo(prev => ({...prev, buildingType: 'biet-thu'}))}
              >
                <Text style={styles.optionText}>Biệt thự</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Style */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Phong cách</Text>
          </View>
          <View style={styles.inputCell}>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[styles.optionButton, landInfo.style === 'hien-dai' && styles.optionSelected]}
                onPress={() => setLandInfo(prev => ({...prev, style: 'hien-dai'}))}
              >
                <Text style={styles.optionText}>Hiện đại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, landInfo.style === 'co-dien' && styles.optionSelected]}
                onPress={() => setLandInfo(prev => ({...prev, style: 'co-dien'}))}
              >
                <Text style={styles.optionText}>Cổ điển</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCostCalculationSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.costTableTitle}>BẢNG CHI PHÍ THIẾT KẾ XÂY DỰNG</Text>
      <View style={styles.costTableContainer}>
        {/* Header */}
        <View style={styles.costHeaderRow}>
          <View style={styles.costHeaderCell1}>
            <Text style={styles.costHeaderText}>Hạng Mục</Text>
          </View>
          <View style={styles.costHeaderCell2}>
            <Text style={styles.costHeaderText}>Diện tích thiết kế</Text>
          </View>
          <View style={styles.costHeaderCell3}>
            <Text style={styles.costHeaderText}>Hệ Số k=1,1</Text>
          </View>
          <View style={styles.costHeaderCell4}>
            <Text style={styles.costHeaderText}>Diện tích quy đổi</Text>
          </View>
        </View>

        {/* Cost rows */}
        {[
          { label: 'Đài móng', area: costCalculation.foundation, factor: 1 },
          { label: 'Sân', area: costCalculation.yard, factor: 1 },
          { label: 'Nâng code', area: costCalculation.elevatedCode, factor: 1.75 },
          { label: 'Hầm', area: costCalculation.basement, factor: 1.75 },
          { label: 'Tầng 1', area: costCalculation.floor1, factor: 1 },
          { label: 'Tầng 2', area: costCalculation.floor2, factor: 1 },
          { label: 'Tầng 3', area: costCalculation.floor3, factor: 1 },
          { label: 'Tầng 4 - 50%', area: costCalculation.floor4, factor: 1 },
          { label: 'Mái bằng', area: costCalculation.flatRoof, factor: 0.75 },
        ].map((item, index) => (
          <View key={index} style={styles.costDataRow}>
            <View style={styles.costDataCell1}>
              <Text style={styles.costDataText}>{item.label}</Text>
            </View>
            <View style={styles.costDataCell2}>
              <Text style={styles.costDataText}>{item.area.toFixed(1)}</Text>
            </View>
            <View style={styles.costDataCell3}>
              <Text style={styles.costDataText}>{item.factor}</Text>
            </View>
            <View style={styles.costDataCell4}>
              <Text style={styles.costDataText}>{(item.area * item.factor).toFixed(1)}</Text>
            </View>
          </View>
        ))}

        {/* Total row */}
        <View style={styles.costTotalRow}>
          <View style={styles.costDataCell1}>
            <Text style={styles.costTotalText}>Diện Tích Thiết Kế Xây Dựng</Text>
          </View>
          <View style={styles.costDataCell2}>
            <Text style={styles.costDataText}>{costCalculation.totalDesignArea.toFixed(2)}</Text>
          </View>
          <View style={styles.costDataCell3}>
            <Text style={styles.costDataText}></Text>
          </View>
          <View style={styles.costDataCell4}>
            <Text style={styles.costDataText}>{costCalculation.totalDesignArea.toFixed(2)}</Text>
          </View>
        </View>

        {/* Design cost row */}
        <View style={styles.costFinalRow}>
          <View style={styles.costDataCell1}>
            <Text style={styles.costTotalText}>Chi Phí Thiết Kế Kiến Trúc Nội Thất</Text>
          </View>
          <View style={styles.costDataCell2}>
            <Text style={styles.costDataText}>{costCalculation.totalDesignArea.toFixed(2)}</Text>
          </View>
          <View style={styles.costDataCell3}>
            <Text style={styles.costDataText}>300.000</Text>
          </View>
          <View style={styles.costDataCell4}>
            <Text style={styles.costFinalText}>{costCalculation.designCost.toLocaleString('vi-VN')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>APP DESIGN BUILD</Text>
          </View>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.mainTitle}>THÔNG TIN THIẾT KẾ XÂY DỰNG</Text>

        {/* Form sections */}
        {renderCustomerInfoSection()}
        {renderLandInfoSection()}
        {renderCostCalculationSection()}

        {/* Submit and Export buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Lưu Thông Tin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
            <Text style={styles.exportButtonText}>📄 Xuất Báo Cáo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 26,
    marginBottom: 20,
  },
  brandBadge: {
    backgroundColor: '#116E0A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  brandText: {
    color: 'white',
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
  },
  mainTitle: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: '500',
    color: '#161616',
    textAlign: 'center',
    marginBottom: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Montserrat',
    fontWeight: '500',
    color: '#161616',
    marginBottom: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#3C3C3C',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3C',
  },
  labelCell: {
    width: 90.5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRightWidth: 1,
    borderRightColor: '#3C3C3C',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputCell: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.05)',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  labelText: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: 'black',
    lineHeight: 10.4,
  },
  input: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: 'black',
    lineHeight: 10.4,
    padding: 0,
    margin: 0,
  },
  optionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  optionSelected: {
    backgroundColor: '#116E0A',
    borderColor: '#116E0A',
  },
  optionText: {
    fontSize: 7,
    color: '#161616',
  },
  costTableTitle: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  costTableContainer: {
    borderWidth: 1,
    borderColor: '#646464',
    borderRadius: 3,
    overflow: 'hidden',
  },
  costHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: '#646464',
    height: 30,
  },
  costHeaderCell1: {
    width: 104,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#646464',
  },
  costHeaderCell2: {
    width: 68,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#646464',
  },
  costHeaderCell3: {
    width: 52,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#646464',
  },
  costHeaderCell4: {
    width: 62,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  costHeaderText: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#161616',
    lineHeight: 10.4,
    textAlign: 'center',
  },
  costDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#646464',
    minHeight: 20,
  },
  costDataCell1: {
    width: 104,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#646464',
  },
  costDataCell2: {
    width: 68,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#646464',
  },
  costDataCell3: {
    width: 52,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#646464',
  },
  costDataCell4: {
    width: 62,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  costDataText: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#161616',
    lineHeight: 10.4,
  },
  costTotalRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: '#646464',
    minHeight: 25,
  },
  costTotalText: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#373737',
    lineHeight: 10.4,
  },
  costFinalRow: {
    flexDirection: 'row',
    minHeight: 24,
  },
  costFinalText: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#161616',
    lineHeight: 11.7,
  },
  submitButton: {
    backgroundColor: '#116E0A',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 10,
    gap: 15,
  },
  exportButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default ConstructionDesignForm;
