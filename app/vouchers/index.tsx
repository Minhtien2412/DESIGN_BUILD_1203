import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const myVouchers = [
  {
    id: '1',
    code: 'DULUX20',
    title: 'Giảm 20% Sơn Dulux',
    discount: '20%',
    minOrder: 500000,
    maxDiscount: 200000,
    expiry: '31/01/2026',
    status: 'active',
  },
  {
    id: '2',
    code: 'FREESHIP1M',
    title: 'Freeship đơn từ 1 triệu',
    discount: 'Freeship',
    minOrder: 1000000,
    maxDiscount: 50000,
    expiry: '15/01/2026',
    status: 'active',
  },
  {
    id: '3',
    code: 'NEWYEAR50',
    title: 'Mừng năm mới giảm 50K',
    discount: '50K',
    minOrder: 300000,
    maxDiscount: 50000,
    expiry: '05/01/2026',
    status: 'expired',
  },
  {
    id: '4',
    code: 'WELCOME100',
    title: 'Chào mừng thành viên mới',
    discount: '100K',
    minOrder: 500000,
    maxDiscount: 100000,
    expiry: '01/01/2026',
    status: 'used',
  },
];

const tabs = ['Tất cả', 'Còn hiệu lực', 'Đã dùng', 'Hết hạn'];

export default function VouchersScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [voucherCode, setVoucherCode] = useState('');

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const filteredVouchers = activeTab === 'Tất cả' 
    ? myVouchers
    : myVouchers.filter(v => {
        if (activeTab === 'Còn hiệu lực') return v.status === 'active';
        if (activeTab === 'Đã dùng') return v.status === 'used';
        if (activeTab === 'Hết hạn') return v.status === 'expired';
        return true;
      });

  const handleAddVoucher = () => {
    if (!voucherCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã voucher');
      return;
    }
    // In real app, validate voucher code with API
    Alert.alert('Thành công', 'Đã thêm voucher vào tài khoản!');
    setVoucherCode('');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#E8F5E9', color: '#4CAF50', label: 'Còn hiệu lực' };
      case 'used':
        return { bg: '#E3F2FD', color: '#2196F3', label: 'Đã sử dụng' };
      case 'expired':
        return { bg: '#F5F5F5', color: '#999', label: 'Hết hạn' };
      default:
        return { bg: '#f0f0f0', color: '#666', label: status };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Voucher của tôi', headerShown: true }} />
      
      {/* Add Voucher */}
      <View style={[styles.addSection, { backgroundColor: cardBg }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor, color: textColor }]}
            placeholder="Nhập mã voucher"
            placeholderTextColor="#999"
            value={voucherCode}
            onChangeText={setVoucherCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddVoucher}>
            <Text style={styles.addBtnText}>Thêm</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.browseBtn}
          onPress={() => router.push('/promotions' as any)}
        >
          <Ionicons name="pricetags-outline" size={18} color="#FF6B35" />
          <Text style={styles.browseText}>Xem thêm voucher</Text>
          <Ionicons name="chevron-forward" size={18} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vouchers List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredVouchers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có voucher</Text>
          </View>
        ) : (
          filteredVouchers.map((voucher) => {
            const statusStyle = getStatusStyle(voucher.status);
            const isDisabled = voucher.status !== 'active';
            
            return (
              <View 
                key={voucher.id} 
                style={[
                  styles.voucherCard, 
                  { backgroundColor: cardBg },
                  isDisabled && styles.voucherDisabled,
                ]}
              >
                <View style={styles.voucherLeft}>
                  <View style={[styles.discountCircle, isDisabled && { backgroundColor: '#ccc' }]}>
                    <Text style={styles.discountText}>{voucher.discount}</Text>
                  </View>
                </View>
                
                <View style={styles.voucherDivider}>
                  <View style={styles.dividerDot} />
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerDot} />
                </View>
                
                <View style={styles.voucherRight}>
                  <View style={styles.voucherHeader}>
                    <Text style={[styles.voucherTitle, { color: textColor }]} numberOfLines={1}>
                      {voucher.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.voucherDetail}>
                    Đơn tối thiểu: {formatPrice(voucher.minOrder)}
                  </Text>
                  <Text style={styles.voucherDetail}>
                    Giảm tối đa: {formatPrice(voucher.maxDiscount)}
                  </Text>
                  
                  <View style={styles.voucherFooter}>
                    <Text style={[
                      styles.expiryText,
                      voucher.status === 'expired' && { color: '#F44336' },
                    ]}>
                      HSD: {voucher.expiry}
                    </Text>
                    {voucher.status === 'active' && (
                      <TouchableOpacity style={styles.useBtn}>
                        <Text style={styles.useBtnText}>Dùng ngay</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addSection: { padding: 16 },
  inputRow: { flexDirection: 'row', gap: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 8,
  },
  browseText: { color: '#FF6B35', fontWeight: '500' },
  tabsContainer: { paddingVertical: 4 },
  tab: { paddingVertical: 12, paddingHorizontal: 16 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FF6B35' },
  tabText: { color: '#666', fontSize: 14 },
  tabTextActive: { color: '#FF6B35', fontWeight: '600' },
  listContainer: { flex: 1, padding: 16 },
  voucherCard: { flexDirection: 'row', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  voucherDisabled: { opacity: 0.6 },
  voucherLeft: {
    width: 80,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  discountCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountText: { color: '#FF6B35', fontWeight: 'bold', fontSize: 14 },
  voucherDivider: { width: 16, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  dividerDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#f0f0f0' },
  dividerLine: { flex: 1, width: 1, borderLeftWidth: 1, borderLeftColor: '#ddd', borderStyle: 'dashed' },
  voucherRight: { flex: 1, padding: 12 },
  voucherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  voucherTitle: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '500' },
  voucherDetail: { color: '#666', fontSize: 12, marginBottom: 2 },
  voucherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  expiryText: { color: '#999', fontSize: 11 },
  useBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  useBtnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#999', marginTop: 12 },
});
