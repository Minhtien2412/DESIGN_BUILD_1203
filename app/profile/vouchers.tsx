import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  minOrder: number;
  type: 'discount' | 'shipping' | 'cashback';
  isUsed: boolean;
  isExpired: boolean;
}

const MOCK_VOUCHERS: Voucher[] = [
  {
    id: '1',
    code: 'FREESHIP50K',
    title: 'Miễn phí vận chuyển',
    description: 'Giảm 50.000đ phí ship cho đơn từ 500.000đ',
    discount: '50.000đ',
    expiryDate: '31/12/2025',
    minOrder: 500000,
    type: 'shipping',
    isUsed: false,
    isExpired: false,
  },
  {
    id: '2',
    code: 'SALE20',
    title: 'Giảm 20%',
    description: 'Giảm 20% tối đa 200.000đ cho đơn từ 1.000.000đ',
    discount: '20%',
    expiryDate: '25/12/2025',
    minOrder: 1000000,
    type: 'discount',
    isUsed: false,
    isExpired: false,
  },
  {
    id: '3',
    code: 'CASHBACK100K',
    title: 'Hoàn tiền 100K',
    description: 'Hoàn 100.000đ vào ví cho đơn từ 2.000.000đ',
    discount: '100.000đ',
    expiryDate: '20/11/2025',
    minOrder: 2000000,
    type: 'cashback',
    isUsed: false,
    isExpired: false,
  },
  {
    id: '4',
    code: 'NEWUSER50',
    title: 'Ưu đãi người mới',
    description: 'Giảm 50% tối đa 100.000đ cho khách hàng mới',
    discount: '50%',
    expiryDate: '15/11/2025',
    minOrder: 200000,
    type: 'discount',
    isUsed: true,
    isExpired: false,
  },
  {
    id: '5',
    code: 'SUMMER2025',
    title: 'Khuyến mãi hè',
    description: 'Giảm 30% tối đa 300.000đ',
    discount: '30%',
    expiryDate: '10/11/2025',
    minOrder: 1000000,
    type: 'discount',
    isUsed: false,
    isExpired: true,
  },
];

const VOUCHER_TYPE_CONFIG = {
  discount: {
    label: 'Giảm giá',
    icon: 'pricetag' as const,
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  shipping: {
    label: 'Miễn ship',
    icon: 'car' as const,
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  cashback: {
    label: 'Hoàn tiền',
    icon: 'wallet' as const,
    color: '#10B981',
    bg: '#D1FAE5',
  },
};

export default function VouchersScreen() {
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const [selectedTab, setSelectedTab] = useState<'available' | 'used' | 'expired'>('available');

  const tabs = [
    { key: 'available' as const, label: 'Có thể dùng', count: MOCK_VOUCHERS.filter(v => !v.isUsed && !v.isExpired).length },
    { key: 'used' as const, label: 'Đã dùng', count: MOCK_VOUCHERS.filter(v => v.isUsed).length },
    { key: 'expired' as const, label: 'Hết hạn', count: MOCK_VOUCHERS.filter(v => v.isExpired).length },
  ];

  const filteredVouchers = MOCK_VOUCHERS.filter(voucher => {
    if (selectedTab === 'available') return !voucher.isUsed && !voucher.isExpired;
    if (selectedTab === 'used') return voucher.isUsed;
    if (selectedTab === 'expired') return voucher.isExpired;
    return false;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleUseVoucher = (voucher: Voucher) => {
    if (voucher.isExpired) {
      Alert.alert('Thông báo', 'Mã này đã hết hạn');
      return;
    }
    if (voucher.isUsed) {
      Alert.alert('Thông báo', 'Mã này đã được sử dụng');
      return;
    }
    
    Alert.alert(
      'Sử dụng mã',
      `Áp dụng mã ${voucher.code} cho đơn hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => {
            // Navigate to cart with voucher code
            router.push('/(tabs)' as any);
          },
        },
      ]
    );
  };

  const handleCopyCode = (code: string) => {
    // In a real app, copy to clipboard
    Alert.alert('Đã sao chép', `Mã ${code} đã được sao chép`);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Kho Voucher',
          headerShown: true,
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: surface, borderBottomColor: border }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && [styles.activeTab, { borderBottomColor: primary }],
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === tab.key ? primary : textMuted },
                selectedTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.badge, { backgroundColor: primary }]}>
                <Text style={styles.badgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Vouchers List */}
      <ScrollView contentContainerStyle={styles.content}>
        {filteredVouchers.map(voucher => {
          const typeConfig = VOUCHER_TYPE_CONFIG[voucher.type];
          const isDisabled = voucher.isUsed || voucher.isExpired;

          return (
            <View
              key={voucher.id}
              style={[
                styles.voucherCard,
                { backgroundColor: surface, borderColor: border },
                isDisabled && styles.disabledCard,
              ]}
            >
              {/* Type Badge */}
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: typeConfig.bg },
                  isDisabled && styles.disabledBadge,
                ]}
              >
                <Ionicons
                  name={typeConfig.icon}
                  size={20}
                  color={isDisabled ? textMuted : typeConfig.color}
                />
              </View>

              <View style={styles.voucherContent}>
                {/* Title & Description */}
                <View style={styles.voucherHeader}>
                  <Text
                    style={[
                      styles.voucherTitle,
                      { color: isDisabled ? textMuted : text },
                    ]}
                  >
                    {voucher.title}
                  </Text>
                  <Text style={[styles.voucherDiscount, { color: isDisabled ? textMuted : typeConfig.color }]}>
                    {voucher.discount}
                  </Text>
                </View>

                <Text style={[styles.voucherDescription, { color: textMuted }]}>
                  {voucher.description}
                </Text>

                {/* Code & Expiry */}
                <View style={styles.voucherFooter}>
                  <TouchableOpacity
                    style={[styles.codeContainer, { borderColor: border }]}
                    onPress={() => handleCopyCode(voucher.code)}
                    disabled={isDisabled}
                  >
                    <Text style={[styles.code, { color: isDisabled ? textMuted : primary }]}>
                      {voucher.code}
                    </Text>
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={isDisabled ? textMuted : primary}
                    />
                  </TouchableOpacity>

                  <View style={styles.expiryContainer}>
                    <Ionicons name="time-outline" size={14} color={textMuted} />
                    <Text style={[styles.expiry, { color: textMuted }]}>
                      HSD: {voucher.expiryDate}
                    </Text>
                  </View>
                </View>

                {/* Min Order */}
                <Text style={[styles.minOrder, { color: textMuted }]}>
                  Đơn tối thiểu: {formatCurrency(voucher.minOrder)}
                </Text>

                {/* Status & Action */}
                <View style={styles.voucherActions}>
                  {voucher.isUsed && (
                    <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
                      <Text style={[styles.statusText, { color: textMuted }]}>
                        Đã sử dụng
                      </Text>
                    </View>
                  )}
                  {voucher.isExpired && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.statusText, { color: '#EF4444' }]}>
                        Hết hạn
                      </Text>
                    </View>
                  )}
                  {!isDisabled && (
                    <TouchableOpacity
                      style={[styles.useButton, { backgroundColor: primary }]}
                      onPress={() => handleUseVoucher(voucher)}
                    >
                      <Text style={styles.useButtonText}>Dùng ngay</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {filteredVouchers.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={80} color={textMuted} />
            <Text style={[styles.emptyTitle, { color: text }]}>
              {selectedTab === 'available' && 'Không có voucher khả dụng'}
              {selectedTab === 'used' && 'Chưa sử dụng voucher nào'}
              {selectedTab === 'expired' && 'Không có voucher hết hạn'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: textMuted }]}>
              Khám phá các ưu đãi mới từ shop
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  voucherCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  disabledCard: {
    opacity: 0.6,
  },
  typeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBadge: {
    backgroundColor: '#F3F4F6',
  },
  voucherContent: {
    flex: 1,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  voucherTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  voucherDiscount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  voucherDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  voucherFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  code: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiry: {
    fontSize: 12,
  },
  minOrder: {
    fontSize: 12,
    marginBottom: 12,
  },
  voucherActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  useButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
