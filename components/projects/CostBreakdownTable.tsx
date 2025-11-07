import { useThemeColor } from '@/hooks/use-theme-color';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface CostItem {
  category: string;
  area: number;
  coefficient?: number;
  adjustedArea?: number;
  unitPrice?: number;
  total?: number;
}

interface CostBreakdownProps {
  projectInfo?: {
    houseNumber?: string;
    street?: string;
    ward?: string;
    city?: string;
    projectArea?: string;
    plotArea?: string;
    density?: string;
    floors?: number;
    frontSetback?: string;
    rearSetback?: string;
    style?: string;
    type?: string;
  };
}

const MOCK_CONSTRUCTION_COSTS: CostItem[] = [
  { category: 'Đài móng', area: 104.4, coefficient: 1, adjustedArea: 104.4 },
  { category: 'Sàn', area: 34.8, coefficient: 1, adjustedArea: 34.8 },
  { category: 'Nâng code', area: 0, coefficient: 1.75, adjustedArea: 0 },
  { category: 'Hầm', area: 0, coefficient: 1.75, adjustedArea: 0 },
  { category: 'Tầng 1', area: 69.6 },
  { category: 'Tầng 2', area: 69.6, coefficient: 2, adjustedArea: 229.68 },
  { category: 'Tầng 3', area: 69.6 },
  { category: 'Tầng 4 - 50%', area: 34.8, adjustedArea: 52.2 },
  { category: 'Mái bằng', area: 69.6, coefficient: 0.75, adjustedArea: 52.2 },
];

const DESIGN_COST = {
  area: 459.36,
  unitPrice: 300000,
  total: 137808000,
};

const TOTAL_CONSTRUCTION_AREA = 459.36;
const TOTAL_CONSTRUCTION_COST = 1837440000;

export default function CostBreakdownTable({ projectInfo }: CostBreakdownProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');

  return (
    <ScrollView style={styles.container}>
      {/* Project Information */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: primaryColor }]}>
          THÔNG TIN THIẾT KẾ XÂY DỰNG
        </Text>

        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textColor }]}>1. Thông tin khách hàng</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Số nhà:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.houseNumber || 'Ví dụ: 77'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Đường:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.street || 'Ví dụ: Lam Sơn'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Phường:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.ward || 'Ví dụ: phường tân sơn nhì'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Thành phố:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.city || 'Ví dụ: HCM'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Khu dự án:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.projectArea || 'Ví dụ: thủ cư - KDC ...'}
            </Text>
          </View>
        </View>

        {/* Technical Specs */}
        <View style={[styles.infoTable, { marginTop: 16 }]}>
          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Diện tích số:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.plotArea || 'Ví dụ: 12m * 15m'} /Hình ânh/
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Mật độ xây dựng:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.density || 'Ví dụ: 80%'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Số tầng:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.floors || 'Ví dụ: 4 tầng'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Lùi trước:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.frontSetback || 'Ví dụ: 2m'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Lùi sau:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.rearSetback || 'Ví dụ: 1.5m'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Diện tích xây dựng dự trú:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              Ví dụ: 135m
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Nhà phố Biệt thự:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.type || 'Hình trên internet'}
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>Mã số hình</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoKey, { color: '#666' }]}>Phong cách:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {projectInfo?.style || 'Hiện đại / Cổ điển'}
            </Text>
          </View>
        </View>
      </View>

      {/* Construction Cost Table */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: primaryColor }]}>
          BẢNG CHI PHÍ THIẾT KẾ XÂY DỰNG
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeaderCell, styles.col1, { color: textColor }]}>
                Hạng Mục
              </Text>
              <Text style={[styles.tableHeaderCell, styles.col2, { color: textColor }]}>
                Diện tích thiết kế
              </Text>
              <Text style={[styles.tableHeaderCell, styles.col3, { color: textColor }]}>
                Hệ Số k=1.1
              </Text>
              <Text style={[styles.tableHeaderCell, styles.col4, { color: textColor }]}>
                Hệ Số k=1
              </Text>
              <Text style={[styles.tableHeaderCell, styles.col5, { color: textColor }]}>
                Diện tích quy đổi
              </Text>
            </View>

            {/* Table Rows */}
            {MOCK_CONSTRUCTION_COSTS.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  { backgroundColor: index % 2 === 0 ? '#FFF' : '#F9F9F9' },
                ]}
              >
                <Text style={[styles.tableCell, styles.col1, { color: textColor }]}>
                  {item.category}
                </Text>
                <Text style={[styles.tableCell, styles.col2, { color: textColor }]}>
                  {item.area}
                </Text>
                <Text style={[styles.tableCell, styles.col3, { color: textColor }]}>
                  {item.coefficient || '-'}
                </Text>
                <Text style={[styles.tableCell, styles.col4, { color: textColor }]}>
                  {item.coefficient ? '' : item.coefficient === 2 ? 'K2' : '-'}
                </Text>
                <Text style={[styles.tableCell, styles.col5, { color: textColor }]}>
                  {item.adjustedArea || '-'}
                </Text>
              </View>
            ))}

            {/* Total Row */}
            <View style={[styles.tableRow, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.tableCell, styles.col1, styles.boldText, { color: textColor }]}>
                Diện Tích Thiết Kế Xây Dựng
              </Text>
              <Text style={[styles.tableCell, styles.col2, styles.boldText, { color: textColor }]}>
                {TOTAL_CONSTRUCTION_AREA}
              </Text>
              <Text style={[styles.tableCell, styles.col3, { color: textColor }]} />
              <Text style={[styles.tableCell, styles.col4, { color: textColor }]} />
              <Text style={[styles.tableCell, styles.col5, styles.boldText, { color: textColor }]}>
                {TOTAL_CONSTRUCTION_AREA}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Design Cost Table */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: primaryColor }]}>
          CHI PHÍ THIẾT KẾ KIẾN TRÚC NỘI THẤT
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableHeaderCell, styles.colDesign1, { color: textColor }]}>
              Diện tích
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDesign2, { color: textColor }]}>
              Đơn Giá
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDesign3, { color: textColor }]}>
              Thành Tiền
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDesign1, { color: textColor }]}>
              {DESIGN_COST.area}
            </Text>
            <Text style={[styles.tableCell, styles.colDesign2, { color: textColor }]}>
              {DESIGN_COST.unitPrice.toLocaleString('vi-VN')}
            </Text>
            <Text style={[styles.tableCell, styles.colDesign3, { color: textColor }]}>
              {DESIGN_COST.total.toLocaleString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Total Summary */}
      <View style={[styles.section, styles.totalSection]}>
        <Text style={[styles.sectionTitle, { color: primaryColor }]}>
          DIỆN TÍCH THIẾT KẾ XÂY DỰNG
        </Text>

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: textColor }]}>Tổng diện tích:</Text>
          <Text style={[styles.totalValue, { color: primaryColor }]}>
            {TOTAL_CONSTRUCTION_AREA} m²
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: textColor }]}>Tổng chi phí:</Text>
          <Text style={[styles.totalValue, { color: primaryColor }]}>
            {TOTAL_CONSTRUCTION_COST.toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoTable: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoKey: {
    fontSize: 13,
    width: '40%',
  },
  infoValue: {
    fontSize: 13,
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
  },
  tableHeaderCell: {
    padding: 10,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    padding: 10,
    fontSize: 12,
    textAlign: 'center',
  },
  col1: { width: 140 },
  col2: { width: 100 },
  col3: { width: 80 },
  col4: { width: 80 },
  col5: { width: 100 },
  colDesign1: { flex: 1 },
  colDesign2: { flex: 1 },
  colDesign3: { flex: 1 },
  boldText: {
    fontWeight: '600',
  },
  totalSection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
