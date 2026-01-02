/**
 * Incoming Call Modal Component
 * Modal hiển thị khi có cuộc gọi đến - tích hợp với Communication Hub
 * 
 * @author AI Assistant
 * @date 22/12/2025
 */

import Avatar from '@/components/ui/avatar';
import { useCommunicationHub } from '@/context/CommunicationHubContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function IncomingCallModalHub() {
  const {
    incomingCall,
    acceptIncomingCall,
    rejectIncomingCall,
  } = useCommunicationHub();
  
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Pulse animation for incoming call
  useEffect(() => {
    if (incomingCall) {
      // Vibrate on incoming call (mobile only)
      if (Platform.OS !== 'web') {
        const pattern = [0, 500, 200, 500, 200, 500];
        Vibration.vibrate(pattern, true);
      }
      
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => {
        pulse.stop();
        if (Platform.OS !== 'web') {
          Vibration.cancel();
        }
      };
    }
  }, [incomingCall, pulseAnim]);
  
  const handleAccept = () => {
    acceptIncomingCall();
    if (incomingCall) {
      router.push({
        pathname: '/call/active',
        params: {
          roomId: incomingCall.roomId,
          type: incomingCall.type,
          callerId: String(incomingCall.callerId),
        },
      });
    }
  };
  
  const handleReject = () => {
    rejectIncomingCall();
  };
  
  if (!incomingCall) return null;
  
  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Caller info */}
          <View style={styles.callerSection}>
            <Animated.View style={[
              styles.avatarContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}>
              <Avatar
                avatar={incomingCall.callerAvatar || null}
                userId={String(incomingCall.callerId)}
                name={incomingCall.callerName}
                pixelSize={100}
                showBadge={false}
              />
            </Animated.View>
            
            <Text style={styles.callerName}>{incomingCall.callerName}</Text>
            <Text style={styles.callType}>
              {incomingCall.type === 'video' ? '📹 Cuộc gọi video' : '📞 Cuộc gọi thoại'}
            </Text>
          </View>
          
          {/* Call actions */}
          <View style={styles.actionsSection}>
            {/* Reject button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={handleReject}
            >
              <Ionicons name="close" size={32} color="#fff" />
              <Text style={styles.actionText}>Từ chối</Text>
            </TouchableOpacity>
            
            {/* Accept button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={handleAccept}
            >
              <Ionicons
                name={incomingCall.type === 'video' ? 'videocam' : 'call'}
                size={32}
                color="#fff"
              />
              <Text style={styles.actionText}>Trả lời</Text>
            </TouchableOpacity>
          </View>
          
          {/* Additional options */}
          <View style={styles.optionsSection}>
            <TouchableOpacity style={styles.optionBtn}>
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.optionText}>Gửi tin nhắn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionBtn}>
              <Ionicons name="notifications-off" size={20} color="#fff" />
              <Text style={styles.optionText}>Nhắc lại sau</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  callerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  callType: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default IncomingCallModalHub;
