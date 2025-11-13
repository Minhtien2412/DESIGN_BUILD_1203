import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Driver {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  avatar: string;
  vehicle: string;
  licensePlate: string;
  phone: string;
}

type RideStatus = 'finding' | 'accepted' | 'arriving' | 'onboard' | 'completed';

export default function RideTrackingScreen() {
  const [status, setStatus] = useState<RideStatus>('finding');
  const [eta, setEta] = useState(3);
  const [progress, setProgress] = useState(0);
  
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  const driver: Driver = {
    id: '1',
    name: 'Nguyễn Văn A',
    rating: 4.9,
    reviews: 1234,
    avatar: 'https://i.pravatar.cc/150?img=12',
    vehicle: 'Toyota Vios',
    licensePlate: '59A-12345',
    phone: '0901234567'
  };

  useEffect(() => {
    // Simulate ride progression
    const timer = setTimeout(() => {
      if (status === 'finding') {
        setStatus('accepted');
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8
        }).start();
      } else if (status === 'accepted') {
        setTimeout(() => setStatus('arriving'), 3000);
      } else if (status === 'arriving') {
        setTimeout(() => setStatus('onboard'), 5000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    // Pulse animation for finding driver
    if (status === 'finding') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status]);

  const handleCancelRide = () => {
    Alert.alert(
      'Hủy chuyến',
      'Bạn có chắc muốn hủy chuyến đi này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy chuyến',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleChat = () => {
    router.push('/messages' as any);
  };

  const handleCall = () => {
    Alert.alert('Gọi cho tài xế', `Số điện thoại: ${driver.phone}`);
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'finding':
        return {
          title: 'Đang tìm tài xế...',
          subtitle: 'Vui lòng đợi trong giây lát',
          icon: 'search',
          color: '#F59E0B'
        };
      case 'accepted':
        return {
          title: 'Tài xế đã nhận chuyến',
          subtitle: `${driver.name} đang di chuyển đến điểm đón`,
          icon: 'checkmark-circle',
          color: '#10B981'
        };
      case 'arriving':
        return {
          title: 'Tài xế sắp tới',
          subtitle: `Còn ${eta} phút nữa`,
          icon: 'time',
          color: '#0891B2'
        };
      case 'onboard':
        return {
          title: 'Đang di chuyển',
          subtitle: 'Đến nơi sau 15 phút',
          icon: 'car',
          color: '#8B5CF6'
        };
      case 'completed':
        return {
          title: 'Hoàn thành',
          subtitle: 'Cảm ơn bạn đã sử dụng dịch vụ',
          icon: 'checkmark-done',
          color: '#10B981'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="navigate" size={80} color="#0891B2" />
          <Text style={styles.mapText}>Tracking trực tiếp</Text>
          <Text style={styles.mapSubtext}>Google Maps API</Text>
          
          {/* Animated Driver Marker */}
          {status !== 'finding' && (
            <Animated.View 
              style={[
                styles.driverMarker,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Ionicons name="car" size={32} color="#0891B2" />
            </Animated.View>
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Ionicons name={statusInfo.icon as any} size={20} color="#fff" />
          <Text style={styles.statusText}>{statusInfo.title}</Text>
        </View>
      </View>

      {/* Finding Driver Overlay */}
      {status === 'finding' && (
        <View style={styles.findingOverlay}>
          <Animated.View 
            style={[
              styles.findingCircle,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Ionicons name="search" size={48} color="#F59E0B" />
          </Animated.View>
          <Text style={styles.findingText}>Đang tìm tài xế gần bạn...</Text>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelRide}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Driver Info Sheet */}
      {status !== 'finding' && (
        <Animated.View 
          style={[
            styles.driverSheet,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.handle} />

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${
                      status === 'accepted' ? 33 :
                      status === 'arriving' ? 66 :
                      status === 'onboard' ? 100 : 0
                    }%`,
                    backgroundColor: statusInfo.color
                  }
                ]}
              />
            </View>
            <View style={styles.progressSteps}>
              {['Đón khách', 'Đang đến', 'Hoàn thành'].map((step, index) => (
                <Text key={index} style={styles.progressStep}>{step}</Text>
              ))}
            </View>
          </View>

          {/* Driver Card */}
          <View style={styles.driverCard}>
            <Image 
              source={{ uri: driver.avatar }}
              style={styles.driverAvatar}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <View style={styles.driverRating}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  {driver.rating} ({driver.reviews} đánh giá)
                </Text>
              </View>
              <Text style={styles.vehicleInfo}>
                {driver.vehicle} • {driver.licensePlate}
              </Text>
            </View>
          </View>

          {/* ETA Info */}
          <View style={styles.etaCard}>
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={24} color="#0891B2" />
              <View style={styles.etaInfo}>
                <Text style={styles.etaLabel}>Thời gian đến</Text>
                <Text style={styles.etaValue}>{eta} phút</Text>
              </View>
            </View>
            <View style={styles.etaRow}>
              <Ionicons name="location-outline" size={24} color="#EF4444" />
              <View style={styles.etaInfo}>
                <Text style={styles.etaLabel}>Khoảng cách</Text>
                <Text style={styles.etaValue}>1.2 km</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleChat}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble" size={24} color="#0891B2" />
              </View>
              <Text style={styles.actionLabel}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="call" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>Gọi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCancelRide}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="close" size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionLabel}>Hủy</Text>
            </TouchableOpacity>
          </View>

          {/* Trip Details */}
          <View style={styles.tripDetails}>
            <View style={styles.tripRow}>
              <View style={styles.tripDot} />
              <Text style={styles.tripAddress}>123 Nguyễn Huệ, Q1</Text>
            </View>
            <View style={styles.tripLine} />
            <View style={styles.tripRow}>
              <View style={[styles.tripDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.tripAddress}>456 Lê Lợi, Q3</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  mapText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  mapSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  driverMarker: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -16,
    marginTop: -16,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 72,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  findingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  findingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  findingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 32,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  driverSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStep: {
    fontSize: 11,
    color: '#6B7280',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  etaCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  etaInfo: {
    alignItems: 'flex-start',
  },
  etaLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  etaValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tripDetails: {
    marginHorizontal: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tripDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0891B2',
  },
  tripLine: {
    width: 2,
    height: 20,
    backgroundColor: '#D1D5DB',
    marginLeft: 5,
    marginVertical: 4,
  },
  tripAddress: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
});
