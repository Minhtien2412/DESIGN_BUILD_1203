/**
 * Incoming Call Overlay
 * Hiển thị popup khi có cuộc gọi đến
 */

import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    notifyCallRejected,
    notifyMissedCall,
} from '@/services/call-notification';

const { width, height } = Dimensions.get('window');

export interface IncomingCallData {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
}

interface IncomingCallOverlayProps {
  visible: boolean;
  callData: IncomingCallData | null;
  onAccept?: () => void;
  onReject?: () => void;
  onDismiss?: () => void;
}

export default function IncomingCallOverlay({
  visible,
  callData,
  onAccept,
  onReject,
  onDismiss,
}: IncomingCallOverlayProps) {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const [slideAnim] = useState(new Animated.Value(-height));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Auto dismiss after 30 seconds
  useEffect(() => {
    if (visible && callData) {
      const timer = setTimeout(() => {
        handleMissed();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [visible, callData]);

  const handleAccept = () => {
    onAccept?.();
    
    if (callData) {
      // Navigate to call screen with dynamic route
      const callRoute = `/call/${callData.callerId}` as const;
      router.push(callRoute as Href);
    }
    
    onDismiss?.();
  };

  const handleReject = () => {
    if (callData) {
      notifyCallRejected(
        callData.callerId,
        callData.callerName,
        callData.callType,
        callData.callerAvatar
      ).catch(console.error);
    }
    
    onReject?.();
    onDismiss?.();
  };

  const handleMissed = () => {
    if (callData) {
      notifyMissedCall(
        callData.callerId,
        callData.callerName,
        callData.callType,
        callData.callerAvatar
      ).catch(console.error);
    }
    
    onDismiss?.();
  };

  if (!callData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleReject}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Background */}
        <View style={[styles.background, { backgroundColor: primary }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Avatar */}
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: '#fff' }]}>
              <Ionicons name="person" size={64} color={primary} />
            </View>
          </Animated.View>

          {/* Caller Info */}
          <Text style={styles.callerName}>{callData.callerName}</Text>
          <View style={styles.callTypeContainer}>
            <Ionicons
              name={callData.callType === 'video' ? 'videocam' : 'call'}
              size={18}
              color="#fff"
            />
            <Text style={styles.callTypeText}>
              Cuộc gọi {callData.callType === 'video' ? 'video' : 'thoại'} đến
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Reject */}
            <Pressable
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <View style={[styles.buttonInner, { backgroundColor: '#000000' }]}>
                <Ionicons name="close" size={32} color="#fff" />
              </View>
              <Text style={styles.actionText}>Từ chối</Text>
            </Pressable>

            {/* Accept */}
            <Pressable
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
            >
              <View style={[styles.buttonInner, { backgroundColor: '#0066CC' }]}>
                <Ionicons name="call" size={32} color="#fff" />
              </View>
              <Text style={styles.actionText}>Trả lời</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 60,
  },
  callTypeText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    gap: 12,
  },
  buttonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
  },
  acceptButton: {
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

// Export helper for showing incoming call
export function showIncomingCall(callData: IncomingCallData) {
  // This would typically be managed by a global context or state manager
  console.log('[IncomingCall] Showing incoming call from:', callData.callerName);
}
