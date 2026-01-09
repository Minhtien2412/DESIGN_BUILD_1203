import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const flashSaleProducts = [
  { id: '1', name: 'Gạch lát nền 60x60', price: 129000, originalPrice: 185000, discount: 30, sold: 856, remaining: 44, image: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Sơn Dulux 5L', price: 599000, originalPrice: 890000, discount: 33, sold: 234, remaining: 66, image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Vòi sen Inax', price: 399000, originalPrice: 600000, discount: 34, sold: 567, remaining: 33, image: 'https://via.placeholder.com/150' },
  { id: '4', name: 'Keo dán gạch', price: 89000, originalPrice: 175000, discount: 49, sold: 1234, remaining: 66, image: 'https://via.placeholder.com/150' },
  { id: '5', name: 'Bồn rửa mặt', price: 890000, originalPrice: 1500000, discount: 41, sold: 123, remaining: 77, image: 'https://via.placeholder.com/150' },
  { id: '6', name: 'Đèn LED âm trần', price: 45000, originalPrice: 85000, discount: 47, sold: 2345, remaining: 55, image: 'https://via.placeholder.com/150' },
];

const timeSlots = [
  { id: '1', time: '10:00', status: 'ended' },
  { id: '2', time: '12:00', status: 'active' },
  { id: '3', time: '14:00', status: 'upcoming' },
  { id: '4', time: '18:00', status: 'upcoming' },
  { id: '5', time: '20:00', status: 'upcoming' },
];

export default function FlashSaleScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState('12:00');
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 45, seconds: 32 });

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const renderProduct = ({ item }: { item: typeof flashSaleProducts[0] }) => (
    <TouchableOpacity style={[styles.productCard, { backgroundColor: cardBg }]}>
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>-{item.discount}%</Text>
      </View>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productContent}>
        <Text style={[styles.productName, { color: textColor }]} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${100 - item.remaining}%` }]} />
          <Text style={styles.progressText}>
            {item.remaining < 50 ? `Còn ${item.remaining}%` : `Đã bán ${item.sold}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen 
        options={{ 
          title: 'Flash Sale',
          headerShown: true,
          headerStyle: { backgroundColor: '#FF6B35' },
          headerTintColor: '#fff',
        }} 
      />
      
      {/* Countdown Header */}
      <View style={styles.countdownHeader}>
        <View style={styles.countdownContent}>
          <Ionicons name="flash" size={24} color="#FFD700" />
          <Text style={styles.countdownLabel}>Kết thúc sau</Text>
          <View style={styles.countdownTimer}>
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{String(countdown.hours).padStart(2, '0')}</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{String(countdown.minutes).padStart(2, '0')}</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{String(countdown.seconds).padStart(2, '0')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Time Slots */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.timeSlotsContainer}
        contentContainerStyle={styles.timeSlotsContent}
      >
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              activeSlot === slot.time && styles.timeSlotActive,
              slot.status === 'ended' && styles.timeSlotEnded,
            ]}
            onPress={() => setActiveSlot(slot.time)}
          >
            <Text style={[
              styles.timeSlotTime,
              activeSlot === slot.time && styles.timeSlotTextActive,
              slot.status === 'ended' && styles.timeSlotTextEnded,
            ]}>
              {slot.time}
            </Text>
            <Text style={[
              styles.timeSlotStatus,
              activeSlot === slot.time && styles.timeSlotTextActive,
              slot.status === 'ended' && styles.timeSlotTextEnded,
            ]}>
              {slot.status === 'ended' ? 'Đã kết thúc' : 
               slot.status === 'active' ? 'Đang diễn ra' : 'Sắp diễn ra'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <FlatList
        data={flashSaleProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContent}
        columnWrapperStyle={styles.productsRow}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  countdownHeader: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  countdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  countdownLabel: { color: '#fff', fontSize: 14 },
  countdownTimer: { flexDirection: 'row', alignItems: 'center' },
  timerBox: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timerSeparator: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginHorizontal: 4 },
  timeSlotsContainer: { backgroundColor: '#fff', maxHeight: 70 },
  timeSlotsContent: { paddingHorizontal: 8 },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeSlotActive: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    marginVertical: 4,
  },
  timeSlotEnded: { opacity: 0.5 },
  timeSlotTime: { fontSize: 16, fontWeight: '600', color: '#333' },
  timeSlotStatus: { fontSize: 11, color: '#666', marginTop: 2 },
  timeSlotTextActive: { color: '#fff' },
  timeSlotTextEnded: { color: '#999' },
  productsContent: { padding: 8 },
  productsRow: { justifyContent: 'space-between' },
  productCard: {
    width: (width - 32) / 2,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  productImage: { width: '100%', height: 150, backgroundColor: '#f0f0f0' },
  productContent: { padding: 12 },
  productName: { fontSize: 13, marginBottom: 6, height: 36 },
  price: { color: '#FF6B35', fontSize: 16, fontWeight: 'bold' },
  originalPrice: { color: '#999', fontSize: 12, textDecorationLine: 'line-through', marginBottom: 8 },
  progressContainer: {
    height: 18,
    backgroundColor: '#FFE0D6',
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 9,
  },
  progressText: { color: '#fff', fontSize: 10, fontWeight: '500', textAlign: 'center' },
});
