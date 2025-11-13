import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/list-item';
import { Stack } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type BOQItem = {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'approved' | 'pending' | 'rejected';
};

const MOCK_BOQ: BOQItem[] = [
  {
    id: '1',
    code: 'A.01',
    name: 'Đào đất móng',
    unit: 'm³',
    quantity: 45,
    unitPrice: 150000,
    total: 6750000,
    status: 'approved',
  },
  {
    id: '2',
    code: 'A.02',
    name: 'Đổ bê tông móng',
    unit: 'm³',
    quantity: 20,
    unitPrice: 2500000,
    total: 50000000,
    status: 'approved',
  },
  {
    id: '3',
    code: 'A.03',
    name: 'Xây tường gạch',
    unit: 'm²',
    quantity: 150,
    unitPrice: 180000,
    total: 27000000,
    status: 'pending',
  },
  {
    id: '4',
    code: 'A.04',
    name: 'Tô trát tường',
    unit: 'm²',
    quantity: 300,
    unitPrice: 80000,
    total: 24000000,
    status: 'pending',
  },
  {
    id: '5',
    code: 'A.05',
    name: 'Sơn tường nội thất',
    unit: 'm²',
    quantity: 300,
    unitPrice: 45000,
    total: 13500000,
    status: 'pending',
  },
];

export default function BOQScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalAmount = MOCK_BOQ.reduce((sum, item) => sum + item.total, 0);
  const approvedAmount = MOCK_BOQ.filter(item => item.status === 'approved').reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'BOQ / Dự toán tóm tắt',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <ScrollView style={styles.container}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng quan dự toán</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng giá trị:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Đã duyệt:</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {formatCurrency(approvedAmount)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số hạng mục:</Text>
            <Text style={styles.summaryValue}>{MOCK_BOQ.length}</Text>
          </View>
        </Card>

        {/* BOQ Items */}
        <SectionHeader title="Danh sách hạng mục" />
        
        {MOCK_BOQ.map((item) => (
          <TouchableOpacity key={item.id} style={styles.boqItem}>
            <View style={styles.boqHeader}>
              <View style={styles.boqTitleRow}>
                <Text style={styles.boqCode}>{item.code}</Text>
                <Badge
                  variant="primary"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{getStatusText(item.status)}</Text>
                </Badge>
              </View>
              <Text style={styles.boqName}>{item.name}</Text>
            </View>
            
            <View style={styles.boqDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Đơn vị:</Text>
                <Text style={styles.detailValue}>{item.unit}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Khối lượng:</Text>
                <Text style={styles.detailValue}>{item.quantity}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Đơn giá:</Text>
                <Text style={styles.detailValue}>{formatCurrency(item.unitPrice)}</Text>
              </View>
              
              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Thành tiền:</Text>
                <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Total Footer */}
        <View style={styles.totalFooter}>
          <Text style={styles.footerLabel}>TỔNG CỘNG</Text>
          <Text style={styles.footerValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  summaryCard: {
    margin: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  boqItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  boqHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  boqTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boqCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  boqName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  boqDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  totalFooter: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
