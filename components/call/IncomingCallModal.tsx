import { useCall } from '@/context/CallContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';

export function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useCall();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Vibrate when incoming call
  useEffect(() => {
    if (incomingCall) {
      const pattern = [0, 400, 200, 400];
      Vibration.vibrate(pattern, true);
      
      return () => {
        Vibration.cancel();
      };
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = async () => {
    try {
      Vibration.cancel();
      await acceptCall(incomingCall.id);
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  const handleReject = async () => {
    try {
      Vibration.cancel();
      await rejectCall(incomingCall.id);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  const isVideoCall = incomingCall.type === 'video';

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor }]}>
          {/* Caller Info */}
          <View style={styles.callerInfo}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
                <Ionicons name="person" size={64} color={tintColor} />
              </View>
              <View style={styles.pulseRing} />
              <View style={[styles.pulseRing, styles.pulseRingDelay]} />
            </View>

            <Text style={[styles.callerName, { color: textColor }]}>
              {incomingCall.caller?.name || 'Unknown'}
            </Text>
            
            <Text style={[styles.callType, { color: textColor + '80' }]}>
              {isVideoCall ? '📹 Video Call' : '📞 Voice Call'}
            </Text>

            <Text style={[styles.status, { color: textColor + '60' }]}>
              Incoming call...
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Reject Button */}
            <Pressable
              onPress={handleReject}
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
              <Text style={styles.actionLabel}>Từ chối</Text>
            </Pressable>

            {/* Accept Button */}
            <Pressable
              onPress={handleAccept}
              style={({ pressed }) => [
                styles.actionButton,
                styles.acceptButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name={isVideoCall ? 'videocam' : 'call'}
                size={32}
                color="#FFFFFF"
              />
              <Text style={styles.actionLabel}>Chấp nhận</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  callerInfo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0EA5E9',
    opacity: 0.6,
    transform: [{ scale: 1.3 }],
  },
  pulseRingDelay: {
    transform: [{ scale: 1.6 }],
    opacity: 0.3,
  },
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  callType: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  actionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
