/**
 * Quick Action Bottom Sheet - Shopee Style
 * Opens from center tab with 4 quick actions: Live, Videos, QR, Utilities
 */
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
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

const ACTIONS = [
  { id: 'live', label: 'Live Stream', icon: 'videocam', color: Colors.light.primary, bgColor: Colors.light.chipBackground },
  { id: 'videos', label: 'Videos', icon: 'play-circle', color: '#f57c00', bgColor: '#fff3e0' },
  { id: 'qr', label: 'QR Code', icon: 'qr-code', color: '#1976d2', bgColor: '#e3f2fd' },
  { id: 'utilities', label: 'Tiện ích', icon: 'apps', color: '#43a047', bgColor: '#e8f5e9' },
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
    onActionPress?.(actionId);
    onClose();
  };

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

          {/* Title */}
          <Text style={styles.title}>Chức năng nhanh</Text>

          {/* Actions Grid */}
          <View style={styles.actionsGrid}>
            {ACTIONS.map((action) => (
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
            ))}
          </View>

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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
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
