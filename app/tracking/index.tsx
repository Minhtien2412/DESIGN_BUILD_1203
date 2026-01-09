import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const trackingData = {
  orderId: 'ORD002',
  status: 'shipping',
  estimatedDelivery: '10/01/2026',
  carrier: 'Giao Hàng Nhanh',
  trackingNumber: 'GHN123456789',
  currentLocation: 'Trung tâm phân loại Q.Tân Bình',
};

const timeline = [
  { 
    status: 'ordered', 
    title: 'Đặt hàng thành công', 
    time: '03/01/2026 14:30', 
    completed: true,
    description: 'Đơn hàng đã được đặt thành công' 
  },
  { 
    status: 'confirmed', 
    title: 'Đã xác nhận', 
    time: '03/01/2026 15:45', 
    completed: true,
    description: 'Người bán đã xác nhận đơn hàng' 
  },
  { 
    status: 'packed', 
    title: 'Đã đóng gói', 
    time: '04/01/2026 10:20', 
    completed: true,
    description: 'Đơn hàng đã được đóng gói và sẵn sàng giao' 
  },
  { 
    status: 'shipping', 
    title: 'Đang vận chuyển', 
    time: '04/01/2026 16:00', 
    completed: true,
    description: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
    current: true,
  },
  { 
    status: 'hub', 
    title: 'Tại trung tâm phân loại', 
    time: '08/01/2026 08:30', 
    completed: true,
    description: 'Đơn hàng đang tại Trung tâm phân loại Q.Tân Bình' 
  },
  { 
    status: 'delivering', 
    title: 'Đang giao hàng', 
    time: '', 
    completed: false,
    description: 'Shipper đang giao hàng đến bạn' 
  },
  { 
    status: 'delivered', 
    title: 'Đã giao hàng', 
    time: '', 
    completed: false,
    description: 'Giao hàng thành công' 
  },
];

const orderItems = [
  { name: 'Bồn cầu TOTO 1 khối', qty: 1, image: 'https://via.placeholder.com/60' },
];

export default function TrackingScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Theo dõi đơn hàng', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={[styles.orderId, { color: textColor }]}>#{trackingData.orderId}</Text>
              <Text style={styles.carrier}>{trackingData.carrier}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn}>
              <Text style={styles.trackingNum}>{trackingData.trackingNumber}</Text>
              <Ionicons name="copy-outline" size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.deliveryInfo}>
            <View style={[styles.deliveryIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="car" size={24} color="#4CAF50" />
            </View>
            <View style={styles.deliveryText}>
              <Text style={styles.deliveryLabel}>Dự kiến giao hàng</Text>
              <Text style={[styles.deliveryDate, { color: textColor }]}>
                {trackingData.estimatedDelivery}
              </Text>
            </View>
          </View>

          <View style={styles.locationBox}>
            <Ionicons name="location" size={18} color="#FF6B35" />
            <Text style={[styles.locationText, { color: textColor }]}>
              {trackingData.currentLocation}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Hành trình đơn hàng</Text>
          
          <View style={styles.timeline}>
            {timeline.map((item, index) => (
              <View key={item.status} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    item.completed && styles.timelineDotCompleted,
                    item.current && styles.timelineDotCurrent,
                  ]}>
                    {item.completed && !item.current && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                    {item.current && (
                      <View style={styles.currentDot} />
                    )}
                  </View>
                  {index < timeline.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      item.completed && styles.timelineLineCompleted,
                    ]} />
                  )}
                </View>
                
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTitle, 
                    { color: textColor },
                    item.current && styles.timelineTitleCurrent,
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.timelineDesc}>{item.description}</Text>
                  {item.time && (
                    <Text style={styles.timelineTime}>{item.time}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Sản phẩm</Text>
          {orderItems.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: textColor }]}>{item.name}</Text>
                <Text style={styles.productQty}>x{item.qty}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: cardBg }]}>
            <Ionicons name="call-outline" size={20} color="#FF6B35" />
            <Text style={[styles.actionText, { color: textColor }]}>Gọi shipper</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: cardBg }]}>
            <Ionicons name="chatbubble-outline" size={20} color="#FF6B35" />
            <Text style={[styles.actionText, { color: textColor }]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: cardBg }]}>
            <Ionicons name="help-circle-outline" size={20} color="#FF6B35" />
            <Text style={[styles.actionText, { color: textColor }]}>Hỗ trợ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 18, fontWeight: '600' },
  carrier: { color: '#666', fontSize: 13, marginTop: 2 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trackingNum: { color: '#FF6B35', fontSize: 13 },
  deliveryInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  deliveryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  deliveryText: { flex: 1 },
  deliveryLabel: { color: '#666', fontSize: 13 },
  deliveryDate: { fontSize: 18, fontWeight: '600', marginTop: 2 },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  locationText: { flex: 1, fontSize: 14 },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', minHeight: 70 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: { backgroundColor: '#4CAF50' },
  timelineDotCurrent: { backgroundColor: '#FF6B35', width: 24, height: 24, borderRadius: 12 },
  currentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#ddd', marginVertical: 4 },
  timelineLineCompleted: { backgroundColor: '#4CAF50' },
  timelineContent: { flex: 1, marginLeft: 12, paddingBottom: 16 },
  timelineTitle: { fontSize: 15, fontWeight: '500' },
  timelineTitleCurrent: { color: '#FF6B35', fontWeight: '600' },
  timelineDesc: { color: '#666', fontSize: 13, marginTop: 2 },
  timelineTime: { color: '#999', fontSize: 12, marginTop: 4 },
  productItem: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: '500' },
  productQty: { color: '#666', fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', padding: 16, gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: { fontSize: 13, fontWeight: '500' },
});
