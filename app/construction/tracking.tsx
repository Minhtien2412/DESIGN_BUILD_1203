import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Worker {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  specialty: string;
}

type WorkStatus = 'finding' | 'accepted' | 'traveling' | 'working' | 'completed';

const MOCK_WORKER: Worker = {
  id: '1',
  name: 'Nguyễn Văn Thợ',
  phone: '0901234567',
  avatar: 'https://i.pravatar.cc/150?img=33',
  rating: 4.9,
  specialty: 'Thợ Xây',
};

export default function WorkerTrackingScreen() {
  const [status, setStatus] = useState<WorkStatus>('finding');
  const [currentStep, setCurrentStep] = useState(0);
  const [eta, setEta] = useState(15);
  const [worker, setWorker] = useState<Worker | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const steps = [
    { key: 'finding', label: 'Đang tìm thợ', icon: 'search' },
    { key: 'accepted', label: 'Đã chấp nhận', icon: 'checkmark-circle' },
    { key: 'traveling', label: 'Đang đến', icon: 'car' },
    { key: 'working', label: 'Đang làm việc', icon: 'hammer' },
    { key: 'completed', label: 'Hoàn thành', icon: 'checkmark-done-circle' },
  ];

  useEffect(() => {
    // Simulate status progression
    const statusSequence = [
      { status: 'finding', delay: 0 },
      { status: 'accepted', delay: 3000 },
      { status: 'traveling', delay: 6000 },
      { status: 'working', delay: 10000 },
      { status: 'completed', delay: 15000 },
    ];

    statusSequence.forEach(({ status, delay }) => {
      setTimeout(() => {
        setStatus(status as WorkStatus);
        const stepIndex = steps.findIndex((s) => s.key === status);
        setCurrentStep(stepIndex);
        animateProgress(stepIndex);

        if (status === 'accepted') {
          setWorker(MOCK_WORKER);
        }
      }, delay);
    });

    // ETA countdown
    const etaInterval = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000); // Every minute

    // Pulse animation
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

    return () => clearInterval(etaInterval);
  }, []);

  const animateProgress = (step: number) => {
    Animated.timing(progressAnim, {
      toValue: step,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleCall = () => {
    if (worker) {
      Alert.alert('Gọi cho thợ', `Số điện thoại: ${worker.phone}`);
    }
  };

  const handleChat = () => {
    router.push('/messages' as any);
  };

  const handleCancel = () => {
    Alert.alert(
      'Hủy dịch vụ',
      'Bạn có chắc muốn hủy dịch vụ này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy dịch vụ',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Đã hủy', 'Dịch vụ đã được hủy');
            router.back();
          },
        },
      ]
    );
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, steps.length - 1],
    outputRange: ['0%', '100%'],
  });

  const getStatusMessage = () => {
    switch (status) {
      case 'finding':
        return 'Đang tìm thợ phù hợp...';
      case 'accepted':
        return 'Thợ đã chấp nhận yêu cầu';
      case 'traveling':
        return `Thợ đang đến - ${eta} phút`;
      case 'working':
        return 'Đang làm việc...';
      case 'completed':
        return 'Công việc đã hoàn thành!';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi dịch vụ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapOverlay}>
            <Ionicons name="map" size={60} color="#00B14F" />
            <Text style={styles.mapText}>Bản đồ theo dõi</Text>
            <Text style={styles.mapSubtext}>{getStatusMessage()}</Text>
          </View>

          {/* Worker Pin */}
          {(status === 'traveling' || status === 'working') && (
            <Animated.View style={[styles.workerPin, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="person" size={30} color="#00B14F" />
            </Animated.View>
          )}
        </View>

        {/* Progress Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.stepsRow}>
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <View key={step.key} style={styles.stepItem}>
                  <Animated.View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isActive && styles.stepDotActive,
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={16}
                      color={isCompleted || isActive ? '#fff' : '#ccc'}
                    />
                  </Animated.View>
                  <Text
                    style={[
                      styles.stepLabel,
                      (isActive || isCompleted) && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Worker Card */}
        {worker && status !== 'finding' && (
          <View style={styles.workerCard}>
            <Image source={{ uri: worker.avatar }} style={styles.workerAvatar} />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.workerSpecialty}>{worker.specialty}</Text>
              <View style={styles.workerRating}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.ratingText}>{worker.rating}</Text>
              </View>
            </View>
            <View style={styles.workerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#00B14F" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
                <Ionicons name="chatbubble" size={20} color="#00B14F" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Work Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Chi tiết công việc</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Địa chỉ</Text>
              <Text style={styles.detailValue}>
                123 Nguyễn Huệ, Quận 1, TP.HCM
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Thời gian</Text>
              <Text style={styles.detailValue}>1 ngày</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Chi phí</Text>
              <Text style={styles.detailValue}>500,000đ</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {status !== 'completed' && status !== 'finding' && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Hủy dịch vụ</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'completed' && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => Alert.alert('Đánh giá', 'Màn hình đánh giá')}
            >
              <Ionicons name="star" size={20} color="#fff" />
              <Text style={styles.rateButtonText}>Đánh giá dịch vụ</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapOverlay: {
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  workerPin: {
    position: 'absolute',
    top: 100,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timelineContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B14F',
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDotCompleted: {
    backgroundColor: '#00B14F',
  },
  stepDotActive: {
    backgroundColor: '#00B14F',
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  stepLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#00B14F',
    fontWeight: '600',
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workerSpecialty: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  workerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  workerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    padding: 16,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  rateButton: {
    backgroundColor: '#00B14F',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
