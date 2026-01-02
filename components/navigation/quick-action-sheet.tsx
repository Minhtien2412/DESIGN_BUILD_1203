/**
 * Quick Action Bottom Sheet - Shopee Style
 * Opens from center tab with quick actions: Call, Messages, Live, plus utilities
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onActionPress?: (action: string) => void;
}

// Primary communication actions
const PRIMARY_ACTIONS = [
  { id: 'call', label: 'Gọi điện', icon: 'call', color: '#22C55E', bgColor: '#DCFCE7' },
  { id: 'messages', label: 'Nhắn tin', icon: 'chatbubbles', color: '#3B82F6', bgColor: '#DBEAFE' },
  { id: 'live', label: 'Livestream', icon: 'videocam', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: 'contacts', label: 'Danh bạ', icon: 'people', color: '#8B5CF6', bgColor: '#EDE9FE' },
];

// Secondary utility actions
const SECONDARY_ACTIONS = [
  { id: 'cost-estimator', label: 'Dự toán', icon: 'calculator', color: '#1976D2', bgColor: '#E3F2FD' },
  { id: 'store-locator', label: 'Cửa hàng', icon: 'location', color: '#43A047', bgColor: '#E8F5E9' },
  { id: 'schedule', label: 'Lịch hẹn', icon: 'calendar', color: '#F57C00', bgColor: '#FFF3E0' },
  { id: 'quote-request', label: 'Báo giá', icon: 'document-text', color: '#0A6847', bgColor: '#E8F5E9' },
];

export function QuickActionSheet({ visible, onClose, onActionPress }: QuickActionSheetProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 16,
          bounciness: 6,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 16,
          bounciness: 6,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleActionPress = (actionId: string) => {
    onClose();
    
    // Handle navigation based on action
    switch (actionId) {
      case 'call':
        router.push('/call/history');
        break;
      case 'messages':
        router.push('/messages');
        break;
      case 'live':
        router.push('/live');
        break;
      case 'contacts':
        router.push('/communication');
        break;
      case 'cost-estimator':
        router.push('/utilities/cost-estimator');
        break;
      case 'store-locator':
        router.push('/utilities/store-locator');
        break;
      case 'schedule':
        router.push('/utilities/schedule');
        break;
      case 'quote-request':
        router.push('/utilities/quote-request');
        break;
      default:
        onActionPress?.(actionId);
    }
  };

  const renderActionButton = (action: typeof PRIMARY_ACTIONS[0]) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionButton}
      activeOpacity={0.7}
      onPress={() => handleActionPress(action.id)}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
        <Ionicons name={action.icon as any} size={28} color={action.color} />
      </View>
      <Text style={styles.actionLabel}>{action.label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: sheetTranslateY }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Primary Actions - Communication */}
            <Text style={styles.sectionTitle}>Liên lạc</Text>
            <View style={styles.actionsGrid}>
              {PRIMARY_ACTIONS.map(renderActionButton)}
            </View>

            {/* Secondary Actions - Utilities */}
            <Text style={styles.sectionTitle}>Tiện ích</Text>
            <View style={styles.actionsGrid}>
              {SECONDARY_ACTIONS.map(renderActionButton)}
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    letterSpacing: -0.2,
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
