import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface IncomingCall {
  id: string;
  roomId: string;
  caller: {
    id: string;
    name: string;
    avatar?: string;
  };
  isGroupCall: boolean;
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

interface IncomingCallOverlayProps {
  visible: boolean;
  call?: IncomingCall;
  onAccept: (call: IncomingCall) => void;
  onDecline: (call: IncomingCall) => void;
  onDismiss: () => void;
}

export function IncomingCallOverlay({
  visible,
  call,
  onAccept,
  onDecline,
  onDismiss,
}: IncomingCallOverlayProps) {
  const [slideAnim] = useState(new Animated.Value(height));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible && call) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Pulse animation for avatar
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, call]);

  if (!visible || !call) return null;

  const handleAccept = () => {
    onAccept(call);
    onDismiss();
  };

  const handleDecline = () => {
    onDecline(call);
    onDismiss();
  };

  const displayName = call.isGroupCall
    ? `Cuộc gọi nhóm (${call.participants?.length || 1} người)`
    : call.caller.name;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Blur */}
      <View style={[StyleSheet.absoluteFill, styles.backdrop]} />

      {/* Call Interface */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(102,126,234,0.9)', 'rgba(118,75,162,0.9)']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Cuộc gọi video đến</Text>
            <Pressable style={styles.minimizeButton} onPress={onDismiss}>
              <MaterialIcons name="remove" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Caller Info */}
          <View style={styles.callerInfo}>
            <Animated.View
              style={[
                styles.avatarContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              {call.caller.avatar ? (
                <Image source={{ uri: call.caller.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  {call.isGroupCall ? (
                    <MaterialCommunityIcons name="account-group" size={48} color="#fff" />
                  ) : (
                    <Text style={styles.avatarText}>
                      {call.caller.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              )}

              {/* Pulse rings */}
              <View style={[styles.pulseRing, styles.pulseRing1]} />
              <View style={[styles.pulseRing, styles.pulseRing2]} />
              <View style={[styles.pulseRing, styles.pulseRing3]} />
            </Animated.View>

            <Text style={styles.callerName}>{displayName}</Text>
            
            {call.isGroupCall && call.participants && (
              <View style={styles.participantsPreview}>
                {call.participants.slice(0, 3).map((participant, index) => (
                  <View
                    key={participant.id}
                    style={[
                      styles.participantAvatar,
                      { marginLeft: index > 0 ? -8 : 0, zIndex: 3 - index },
                    ]}
                  >
                    {participant.avatar ? (
                      <Image source={{ uri: participant.avatar }} style={styles.participantImage} />
                    ) : (
                      <View style={styles.participantPlaceholder}>
                        <Text style={styles.participantText}>
                          {participant.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
                {call.participants.length > 3 && (
                  <View style={[styles.participantAvatar, styles.participantMore, { marginLeft: -8 }]}>
                    <Text style={styles.participantMoreText}>+{call.participants.length - 3}</Text>
                  </View>
                )}
              </View>
            )}

            <Text style={styles.callStatus}>Đang gọi video...</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Decline */}
            <Pressable
              style={[styles.actionButton, styles.declineButton]}
              onPress={handleDecline}
            >
              <MaterialIcons name="call-end" size={32} color="#fff" />
            </Pressable>

            {/* Message */}
            <Pressable style={[styles.actionButton, styles.messageButton]}>
              <MaterialCommunityIcons name="message-text" size={24} color="#fff" />
            </Pressable>

            {/* Accept */}
            <Pressable
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
            >
              <MaterialCommunityIcons name="video" size={32} color="#fff" />
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.quickActionText}>Vuốt lên để trả lời</Text>
            <Text style={styles.quickActionText}>Vuốt xuống để từ chối</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

// Hook to manage incoming call state
export function useIncomingCall() {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [visible, setVisible] = useState(false);

  const showIncomingCall = (call: IncomingCall) => {
    setIncomingCall(call);
    setVisible(true);
  };

  const hideIncomingCall = () => {
    setVisible(false);
    setTimeout(() => setIncomingCall(null), 300); // Wait for animation
  };

  const acceptCall = (call: IncomingCall) => {
  router.push(`/call-popup?roomId=${call.roomId}&kind=video` as any);
  };

  const declineCall = (call: IncomingCall) => {
    // Implement decline call logic
    console.log('Call declined:', call.id);
  };

  return {
    incomingCall,
    visible,
    showIncomingCall,
    hideIncomingCall,
    acceptCall,
    declineCall,
  };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    flex: 1,
  },
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerInfo: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#fff',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pulseRing1: {
    width: 140,
    height: 140,
    top: -10,
    left: -10,
  },
  pulseRing2: {
    width: 160,
    height: 160,
    top: -20,
    left: -20,
  },
  pulseRing3: {
    width: 180,
    height: 180,
    top: -30,
    left: -30,
  },
  callerName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  participantsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  participantImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  participantPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  participantMore: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  messageButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  quickActions: {
    alignItems: 'center',
    paddingBottom: 20,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
