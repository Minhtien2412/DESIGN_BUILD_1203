import { Loader } from '@/components/ui/loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import VoucherService, {
    MOCK_VOUCHERS as FALLBACK_VOUCHERS,
    Voucher as VoucherType
} from '@/services/voucherService';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    RefreshControl,
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

// Transform API voucher to local format
function transformVoucher(apiVoucher: VoucherType): Voucher {
  return {
    id: apiVoucher.id,
    code: apiVoucher.code,
    title: apiVoucher.title,
    description: apiVoucher.description || '',
    discount: apiVoucher.type === 'percent' 
      ? `${apiVoucher.discount}%` 
      : new Intl.NumberFormat('vi-VN').format(apiVoucher.discount) + 'đ',
    expiryDate: new Date(apiVoucher.expiresAt).toLocaleDateString('vi-VN'),
    minOrder: apiVoucher.minOrder || 0,
    type: apiVoucher.type === 'percent' ? 'discount' : 'shipping',
    isUsed: apiVoucher.isUsed,
    isExpired: apiVoucher.isExpired,
  };
}

// Transform fallback data
const MOCK_VOUCHERS: Voucher[] = FALLBACK_VOUCHERS.map(transformVoucher);

const VOUCHER_TYPE_CONFIG = {
  discount: {
    label: 'Giảm giá',
    icon: 'pricetag' as const,
    color: '#000000',
    bg: '#FEE2E2',
  },
  shipping: {
    label: 'Miễn ship',
    icon: 'car' as const,
    color: '#3B82F6',
    bg: '#E8F4FF',
  },
  cashback: {
    label: 'Hoàn tiền',
    icon: 'wallet' as const,
    color: '#0066CC',
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
  const [vouchers, setVouchers] = useState<Voucher[]>(MOCK_VOUCHERS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');

  // Fetch vouchers from API
  const fetchVouchers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await VoucherService.getMyVouchers();
      if (result.ok && result.data?.vouchers) {
        setVouchers(result.data.vouchers.map(transformVoucher));
        setDataSource('api');
      } else {
        // Fallback to mock data
        setVouchers(MOCK_VOUCHERS);
        setDataSource('mock');
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVouchers(MOCK_VOUCHERS);
      setDataSource('mock');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVouchers(false);
  }, [fetchVouchers]);

  const tabs = [
    { key: 'available' as const, label: 'Có thể dùng', count: vouchers.filter(v => !v.isUsed && !v.isExpired).length },
    { key: 'used' as const, label: 'Đã dùng', count: vouchers.filter(v => v.isUsed).length },
    { key: 'expired' as const, label: 'Hết hạn', count: vouchers.filter(v => v.isExpired).length },
  ];

  const filteredVouchers = vouchers.filter(voucher => {
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

  if (loading) {
    return <Loader text="Đang tải voucher..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Kho Voucher',
          headerShown: true,
        }}
      />

      {/* Data Source Indicator */}
      {dataSource === 'mock' && (
        <View style={[styles.mockBanner, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="information-circle" size={16} color="#92400E" />
          <Text style={styles.mockBannerText}>📋 Dữ liệu mẫu - API đang cập nhật</Text>
        </View>
      )}

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
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                      <Text style={[styles.statusText, { color: '#000000' }]}>
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
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  mockBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
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
