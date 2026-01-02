/**
 * Orders Screen - Modern International Design
 * Quản lý đơn hàng với giao diện hiện đại quốc tế
 */

import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, Stack } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '#DH123456',
    date: '2025-11-15 14:30',
    status: 'shipping',
    total: 2280000,
    items: [
      {
        id: '1',
        name: 'Xi măng PCB40',
        quantity: 10,
        price: 100000,
        image: 'https://picsum.photos/200/200?random=1',
      },
      {
        id: '2',
        name: 'Gạch ốp lát Viglacera',
        quantity: 50,
        price: 25600,
        image: 'https://picsum.photos/200/200?random=2',
      },
    ],
    shippingAddress: '123 Nguyễn Văn A, Q.1, TP.HCM',
    paymentMethod: 'MoMo',
  },
  {
    id: '2',
    orderNumber: '#DH123455',
    date: '2025-11-10 10:15',
    status: 'delivered',
    total: 1580000,
    items: [
      {
        id: '3',
        name: 'Sơn Dulux',
        quantity: 5,
        price: 280000,
        image: 'https://picsum.photos/200/200?random=3',
      },
      {
        id: '4',
        name: 'Cát xây dựng',
        quantity: 2,
        price: 150000,
        image: 'https://picsum.photos/200/200?random=4',
      },
    ],
    shippingAddress: '456 Lê Văn B, Q.3, TP.HCM',
    paymentMethod: 'ZaloPay',
  },
  {
    id: '3',
    orderNumber: '#DH123454',
    date: '2025-11-05 16:45',
    status: 'cancelled',
    total: 890000,
    items: [
      {
        id: '5',
        name: 'Thép xây dựng',
        quantity: 20,
        price: 44500,
        image: 'https://picsum.photos/200/200?random=5',
      },
    ],
    shippingAddress: '789 Trần Văn C, Q.Tân Bình, TP.HCM',
    paymentMethod: 'COD',
  },
  {
    id: '4',
    orderNumber: '#DH123453',
    date: '2025-11-01 09:20',
    status: 'pending',
    total: 1250000,
    items: [
      {
        id: '6',
        name: 'Đá xây dựng',
        quantity: 15,
        price: 83333,
        image: 'https://picsum.photos/200/200?random=6',
      },
    ],
    shippingAddress: '321 Nguyễn Văn D, Q.5, TP.HCM',
    paymentMethod: 'VNPay',
  },
];

const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    color: '#FFB800',
    bg: '#FFB80020',
    icon: 'time-outline' as const,
  },
  processing: {
    label: 'Đang xử lý',
    color: '#3B82F6',
    bg: '#3B82F620',
    icon: 'settings-outline' as const,
  },
  shipping: {
    label: 'Đang giao',
    color: '#8B5CF6',
    bg: '#8B5CF620',
    icon: 'car-outline' as const,
  },
  delivered: {
    label: 'Đã giao',
    color: '#10B981',
    bg: '#10B98120',
    icon: 'checkmark-circle-outline' as const,
  },
  cancelled: {
    label: 'Đã hủy',
    color: '#EF4444',
    bg: '#EF444420',
    icon: 'close-circle-outline' as const,
  },
};

export default function OrdersScreen() {
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { key: 'all' as const, label: 'Tất cả', count: MOCK_ORDERS.length },
    { 
      key: 'pending' as const, 
      label: 'Chờ xác nhận', 
      count: MOCK_ORDERS.filter(o => o.status === 'pending').length 
    },
    { 
      key: 'shipping' as const, 
      label: 'Đang giao', 
      count: MOCK_ORDERS.filter(o => o.status === 'shipping').length 
    },
    { 
      key: 'delivered' as const, 
      label: 'Đã giao', 
      count: MOCK_ORDERS.filter(o => o.status === 'delivered').length 
    },
    { 
      key: 'cancelled' as const, 
      label: 'Đã hủy', 
      count: MOCK_ORDERS.filter(o => o.status === 'cancelled').length 
    },
  ];

  const filteredOrders = selectedTab === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(order => order.status === selectedTab);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = ORDER_STATUS_CONFIG[item.status];

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: surface, borderColor: border }]}
        onPress={() => router.push(`/orders/${item.id}` as Href)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.orderNumberRow}>
              <Ionicons name="receipt" size={16} color={primary} />
              <Text style={[styles.orderNumber, { color: primary }]}>
                {item.orderNumber}
              </Text>
            </View>
            <Text style={[styles.orderDate, { color: textMuted }]}>
              {item.date}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsContainer}>
          {item.items.map((orderItem) => (
            <View key={orderItem.id} style={[styles.item, { borderBottomColor: border }]}>
              <View style={styles.itemImageContainer}>
                <Image source={{ uri: orderItem.image }} style={styles.itemImage} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: text }]} numberOfLines={2}>
                  {orderItem.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: textMuted }]}>
                  Số lượng: x{orderItem.quantity}
                </Text>
              </View>
              <View style={styles.itemPriceContainer}>
                <Text style={[styles.itemPrice, { color: primary }]}>
                  {formatCurrency(orderItem.price * orderItem.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={textMuted} />
            <Text style={[styles.infoText, { color: textMuted }]} numberOfLines={1}>
              {item.shippingAddress}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={14} color={textMuted} />
            <Text style={[styles.infoText, { color: textMuted }]}>
              {item.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.orderFooter, { borderTopColor: border }]}>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: textMuted }]}>Tổng thanh toán:</Text>
            <Text style={[styles.totalAmount, { color: '#EF4444' }]}>
              {formatCurrency(item.total)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {item.status === 'delivered' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: border }]}
                onPress={() => {}}
              >
                <Ionicons name="chatbubble-outline" size={16} color={text} />
                <Text style={[styles.actionButtonText, { color: text }]}>
                  Đánh giá
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: primary }]}
                onPress={() => {}}
              >
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Mua lại</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'shipping' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: primary }]}
              onPress={() => {}}
            >
              <Ionicons name="navigate-outline" size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Theo dõi đơn hàng</Text>
            </TouchableOpacity>
          )}
          {item.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: '#EF4444' }]}
                onPress={() => {}}
              >
                <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                  Hủy đơn
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: primary }]}
                onPress={() => {}}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Liên hệ</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'cancelled' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: primary }]}
              onPress={() => {}}
            >
              <Ionicons name="cart-outline" size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Mua lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${primary}10` }]}>
        <Ionicons name="receipt-outline" size={60} color={primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: text }]}>Chưa có đơn hàng</Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        {selectedTab === 'all'
          ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!'
          : `Không có đơn hàng ${tabs.find(t => t.key === selectedTab)?.label.toLowerCase()}`}
      </Text>
      <TouchableOpacity
        style={[styles.shopButton, { backgroundColor: primary }]}
        onPress={() => router.push('/(tabs)' as Href)}
      >
        <Ionicons name="cart" size={20} color="#fff" />
        <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  // Stats
  const stats = {
    total: MOCK_ORDERS.length,
    pending: MOCK_ORDERS.filter(o => o.status === 'pending').length,
    shipping: MOCK_ORDERS.filter(o => o.status === 'shipping').length,
    delivered: MOCK_ORDERS.filter(o => o.status === 'delivered').length,
    totalSpent: MOCK_ORDERS.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Đơn hàng của tôi',
          headerShown: false,
        }}
      />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#0A6847', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {}}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[primary]}
            tintColor={primary}
          />
        }
      >
        <Container fullWidth>
          {/* Promotional Banner */}
          <View style={styles.promotionBanner}>
            <TouchableOpacity 
              style={styles.promotionCard}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 1 }}
                style={styles.promotionGradient}
              >
                {/* Decorative circles */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                
                <View style={styles.promotionContent}>
                  <View style={styles.promotionIconContainer}>
                    <Ionicons name="gift" size={32} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.promotionTitle}>🎉 Ưu đãi đặc biệt</Text>
                    <Text style={styles.promotionSubtitle}>
                      Giảm 20% vật liệu xây dựng - Chỉ hôm nay
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3B82F610' }]}>
                <Ionicons name="cart" size={24} color="#3B82F6" />
              </View>
              <Text style={[styles.statValue, { color: text }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Tổng đơn</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FFB80010' }]}>
                <Ionicons name="time" size={24} color="#FFB800" />
              </View>
              <Text style={[styles.statValue, { color: text }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Chờ xử lý</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#8B5CF610' }]}>
                <Ionicons name="car" size={24} color="#8B5CF6" />
              </View>
              <Text style={[styles.statValue, { color: text }]}>{stats.shipping}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Đang giao</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10B98110' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: text }]}>{stats.delivered}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Hoàn thành</Text>
            </View>
          </View>

          {/* Total Spent Card */}
          {stats.totalSpent > 0 && (
            <View style={[styles.totalSpentCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={styles.totalSpentLeft}>
                <Ionicons name="wallet" size={24} color="#10B981" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.totalSpentLabel, { color: textMuted }]}>
                    Tổng chi tiêu
                  </Text>
                  <Text style={[styles.totalSpentValue, { color: '#10B981' }]}>
                    {formatCurrency(stats.totalSpent)}
                  </Text>
                </View>
              </View>
              <Ionicons name="trending-up" size={28} color="#10B981" />
            </View>
          )}
        </Container>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabsContainer, { backgroundColor: surface, borderBottomColor: border }]}
          contentContainerStyle={styles.tabsContent}
        >
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
                <View style={[styles.badge, { backgroundColor: selectedTab === tab.key ? primary : textMuted }]}>
                  <Text style={styles.badgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Orders List */}
        <View style={{ paddingHorizontal: 16 }}>
          {filteredOrders.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredOrders.map(item => (
              <View key={item.id}>
                {renderOrderItem({ item })}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  promotionBanner: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  promotionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  promotionGradient: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  promotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1,
  },
  promotionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  promotionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  totalSpentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalSpentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalSpentLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalSpentValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  orderDate: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
  },
  itemPriceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  additionalInfo: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  orderFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  primaryButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
