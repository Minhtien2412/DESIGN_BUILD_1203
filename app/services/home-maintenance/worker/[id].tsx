/**
 * Worker Detail Screen
 * Chi tiết thợ dịch vụ bảo trì nhà
 */

import { SERVICE_WORKERS, ServiceWorker } from '@/services/api/homeMaintenanceApi';
import { mediumImpact, successNotification } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [worker, setWorker] = useState<ServiceWorker | null>(null);
  
  useEffect(() => {
    // Find worker from mock data
    const found = SERVICE_WORKERS.find(w => w.id === id);
    setWorker(found || null);
  }, [id]);
  
  const handleCall = () => {
    mediumImpact();
    if (worker?.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    }
  };
  
  const handleMessage = () => {
    mediumImpact();
    router.push(`/messages/${id}`);
  };
  
  const handleBooking = () => {
    mediumImpact();
    successNotification();
    Alert.alert(
      'Đặt lịch thành công!',
      `Yêu cầu đặt lịch với ${worker?.name} đã được gửi. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.`,
      [{ text: 'OK' }]
    );
  };
  
  if (!worker) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1c1e21" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết thợ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="person-outline" size={64} color="#d1d5db" />
          <Text style={styles.notFoundText}>Không tìm thấy thông tin</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1c1e21" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thợ</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#1c1e21" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          
          <View style={styles.nameRow}>
            <Text style={styles.workerName}>{worker.name}</Text>
            {worker.isVerified && (
              <Ionicons name="checkmark-circle" size={20} color="#1877F2" />
            )}
          </View>
          
          <Text style={styles.specialty}>{worker.specialty}</Text>
          
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text style={styles.statValue}>{worker.rating}</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles" size={20} color="#1877F2" />
              <Text style={styles.statValue}>{worker.reviews}</Text>
              <Text style={styles.statLabel}>Nhận xét</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#22c55e" />
              <Text style={styles.statValue}>{worker.experience}</Text>
              <Text style={styles.statLabel}>Kinh nghiệm</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="call" size={22} color="#22c55e" />
            </View>
            <Text style={styles.actionText}>Gọi điện</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <View style={[styles.actionIcon, { backgroundColor: '#e7f3ff' }]}>
              <Ionicons name="chatbubble" size={22} color="#1877F2" />
            </View>
            <Text style={styles.actionText}>Nhắn tin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="bookmark" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Lưu</Text>
          </TouchableOpacity>
        </View>
        
        {/* Services */}
        {worker.services && worker.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dịch vụ cung cấp</Text>
            <View style={styles.servicesList}>
              {worker.services.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Price */}
        {worker.price && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bảng giá tham khảo</Text>
            <View style={styles.priceCard}>
              <Ionicons name="pricetag" size={24} color="#1877F2" />
              <View style={styles.priceInfo}>
                <Text style={styles.priceValue}>
                  {worker.price.min.toLocaleString('vi-VN')}đ - {worker.price.max.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.priceUnit}>/{worker.price.unit}</Text>
              </View>
            </View>
            <Text style={styles.priceNote}>
              * Giá có thể thay đổi tùy theo độ phức tạp của công việc
            </Text>
          </View>
        )}
        
        {/* Reviews Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá ({worker.reviews})</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {/* Sample review */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/100?img=10' }} 
                style={styles.reviewerAvatar} 
              />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>Nguyễn Thị Mai</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons key={star} name="star" size={12} color="#fbbf24" />
                  ))}
                  <Text style={styles.reviewDate}>2 ngày trước</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>
              Thợ làm việc rất chuyên nghiệp, nhanh chóng và giá cả hợp lý. Sẽ tiếp tục sử dụng dịch vụ!
            </Text>
          </View>
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity 
          style={styles.bookingButton}
          onPress={handleBooking}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.bookingButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1e21',
  },
  scrollView: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  
  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  workerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1e21',
  },
  specialty: {
    fontSize: 14,
    color: '#65676b',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1e21',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#d1d5db',
    marginHorizontal: 16,
  },
  
  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  
  // Section
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1e21',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#1877F2',
    fontWeight: '600',
  },
  
  // Services
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  serviceText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },
  
  // Price
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 12,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1877F2',
  },
  priceUnit: {
    fontSize: 14,
    color: '#1877F2',
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  
  // Review
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: '#65676b',
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  
  // Bottom CTA
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  bookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1877F2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
