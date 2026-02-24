/**
 * Enhanced Call Screen - Zalo Style
 * Video/Voice calls with modern UI
 */

import { MODERN_SHADOWS } from '@/constants/modern-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type CallState = 'ringing' | 'connecting' | 'connected' | 'ended';
export type CallType = 'video' | 'voice';

export interface CallUser {
  id: string;
  name: string;
  avatar?: string;
}

interface CallScreenProps {
  caller: CallUser;
  callType: CallType;
  callState: CallState;
  isIncoming?: boolean;
  callDuration?: number; // seconds
  
  // Video streams
  localVideoRef?: React.RefObject<any>;
  remoteVideoRef?: React.RefObject<any>;
  
  // Controls state
  isMuted?: boolean;
  isCameraOff?: boolean;
  isSpeakerOn?: boolean;
  isVideoEnabled?: boolean;
  
  // Callbacks
  onAnswer?: () => void;
  onDecline?: () => void;
  onEndCall?: () => void;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onToggleSpeaker?: () => void;
  onSwitchCamera?: () => void;
  onToggleVideo?: () => void;
}

export function EnhancedCallScreen({
  caller,
  callType,
  callState,
  isIncoming = false,
  callDuration = 0,
  localVideoRef,
  remoteVideoRef,
  isMuted = false,
  isCameraOff = false,
  isSpeakerOn = false,
  isVideoEnabled = true,
  onAnswer,
  onDecline,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onToggleSpeaker,
  onSwitchCamera,
  onToggleVideo,
}: CallScreenProps) {
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pulse animation for ringing state
  useEffect(() => {
    if (callState === 'ringing') {
      const pulse = Animated.loop(
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
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [callState]);

  // Slide in controls
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto hide controls during video call
  useEffect(() => {
    if (callType === 'video' && callState === 'connected') {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      
      if (showControls) {
        controlsTimeout.current = setTimeout(() => {
          setShowControls(false);
        }, 5000);
      }
    }
    
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [showControls, callState, callType]);

  const handleScreenTap = () => {
    if (callType === 'video' && callState === 'connected') {
      setShowControls(!showControls);
    }
  };

  const handleControlPress = (callback?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback?.();
  };

  // Get status text
  const getStatusText = () => {
    switch (callState) {
      case 'ringing':
        return isIncoming ? 'Đang gọi đến...' : 'Đang gọi...';
      case 'connecting':
        return 'Đang kết nối...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Cuộc gọi đã kết thúc';
      default:
        return '';
    }
  };

  // Control button component
  const ControlButton = ({
    icon,
    label,
    onPress,
    isActive = false,
    isRed = false,
    isGreen = false,
    size = 'normal',
  }: {
    icon: string;
    label?: string;
    onPress?: () => void;
    isActive?: boolean;
    isRed?: boolean;
    isGreen?: boolean;
    size?: 'normal' | 'large';
  }) => {
    const buttonSize = size === 'large' ? 70 : 56;
    const iconSize = size === 'large' ? 32 : 26;

    return (
      <View style={styles.controlWrapper}>
        <Pressable
          style={[
            styles.controlButton,
            { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
            isActive && styles.controlButtonActive,
            isRed && styles.controlButtonRed,
            isGreen && styles.controlButtonGreen,
          ]}
          onPress={() => handleControlPress(onPress)}
        >
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={isActive || isRed || isGreen ? '#fff' : '#fff'}
          />
        </Pressable>
        {label && <Text style={styles.controlLabel}>{label}</Text>}
      </View>
    );
  };

  // Render incoming call UI
  const renderIncomingCall = () => (
    <View style={styles.incomingContainer}>
      {/* Avatar with pulse */}
      <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.avatarPulse} />
        <View style={styles.avatarPulse2} />
        {caller.avatar ? (
          <Image source={{ uri: caller.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{caller.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </Animated.View>

      {/* Caller info */}
      <Text style={styles.callerName}>{caller.name}</Text>
      <Text style={styles.callStatus}>
        {callType === 'video' ? '📹 Cuộc gọi video đến' : '📞 Cuộc gọi thoại đến'}
      </Text>

      {/* Answer/Decline buttons */}
      <Animated.View
        style={[
          styles.incomingActions,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        <ControlButton
          icon="close"
          label="Từ chối"
          onPress={onDecline}
          isRed
          size="large"
        />
        <ControlButton
          icon={callType === 'video' ? 'videocam' : 'call'}
          label="Trả lời"
          onPress={onAnswer}
          isGreen
          size="large"
        />
      </Animated.View>
    </View>
  );

  // Render voice call UI
  const renderVoiceCall = () => (
    <View style={styles.voiceContainer}>
      {/* Avatar */}
      <Animated.View style={[styles.avatarContainer, callState === 'ringing' && { transform: [{ scale: pulseAnim }] }]}>
        {caller.avatar ? (
          <Image source={{ uri: caller.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{caller.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </Animated.View>

      {/* Caller info */}
      <Text style={styles.callerName}>{caller.name}</Text>
      <Text style={styles.callStatus}>{getStatusText()}</Text>

      {/* Controls */}
      <Animated.View
        style={[
          styles.controlsContainer,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        <View style={styles.controlsRow}>
          <ControlButton
            icon={isMuted ? 'mic-off' : 'mic'}
            label={isMuted ? 'Bật mic' : 'Tắt mic'}
            onPress={onToggleMute}
            isActive={isMuted}
          />
          <ControlButton
            icon={isSpeakerOn ? 'volume-high' : 'volume-medium'}
            label={isSpeakerOn ? 'Loa ngoài' : 'Tai nghe'}
            onPress={onToggleSpeaker}
            isActive={isSpeakerOn}
          />
          <ControlButton
            icon="videocam"
            label="Video"
            onPress={onToggleVideo}
          />
        </View>

        <View style={styles.endCallContainer}>
          <ControlButton
            icon="call"
            onPress={onEndCall}
            isRed
            size="large"
          />
        </View>
      </Animated.View>
    </View>
  );

  // Render video call UI
  const renderVideoCall = () => (
    <Pressable style={styles.videoContainer} onPress={handleScreenTap}>
      {/* Remote video (full screen) */}
      <View style={styles.remoteVideo}>
        {/* Placeholder for RTCView */}
        <View style={styles.videoPlaceholder}>
          {caller.avatar ? (
            <Image source={{ uri: caller.avatar }} style={styles.videoAvatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { width: 120, height: 120, borderRadius: 60 }]}>
              <Text style={[styles.avatarText, { fontSize: 48 }]}>{caller.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.videoName}>{caller.name}</Text>
          <Text style={styles.videoStatus}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Local video (small) */}
      <Animated.View style={[styles.localVideo, { opacity: fadeAnim }]}>
        <View style={styles.localVideoPlaceholder}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Pressable style={styles.switchCameraBtn} onPress={() => handleControlPress(onSwitchCamera)}>
          <Ionicons name="camera-reverse" size={18} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* Top overlay */}
      {showControls && (
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topOverlay}
        >
          <View style={styles.topInfo}>
            <Text style={styles.topName}>{caller.name}</Text>
            <Text style={styles.topStatus}>{getStatusText()}</Text>
          </View>
        </LinearGradient>
      )}

      {/* Bottom controls */}
      {showControls && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomOverlay}
        >
          <View style={styles.videoControls}>
            <ControlButton
              icon={isMuted ? 'mic-off' : 'mic'}
              onPress={onToggleMute}
              isActive={isMuted}
            />
            <ControlButton
              icon={isCameraOff ? 'videocam-off' : 'videocam'}
              onPress={onToggleCamera}
              isActive={isCameraOff}
            />
            <ControlButton
              icon="call"
              onPress={onEndCall}
              isRed
              size="large"
            />
            <ControlButton
              icon={isSpeakerOn ? 'volume-high' : 'volume-medium'}
              onPress={onToggleSpeaker}
              isActive={isSpeakerOn}
            />
            <ControlButton
              icon="ellipsis-horizontal"
              onPress={() => {}}
            />
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E3A5F', '#0D1B2A', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      {isIncoming && callState === 'ringing' && renderIncomingCall()}
      {!isIncoming && callType === 'voice' && callState !== 'ringing' && renderVoiceCall()}
      {callType === 'voice' && !isIncoming && callState === 'ringing' && renderVoiceCall()}
      {callType === 'video' && callState === 'connected' && renderVideoCall()}
      {callType === 'video' && callState !== 'connected' && !isIncoming && renderVoiceCall()}
    </View>
  );
}

// ==================== INCOMING CALL MODAL ====================

interface IncomingCallModalProps {
  visible: boolean;
  caller: CallUser;
  callType: CallType;
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallModalEnhanced({
  visible,
  caller,
  callType,
  onAnswer,
  onDecline,
}: IncomingCallModalProps) {
  const slideAnim = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }
  }, [visible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.modalContainer,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <EnhancedCallScreen
        caller={caller}
        callType={callType}
        callState="ringing"
        isIncoming={true}
        onAnswer={onAnswer}
        onDecline={onDecline}
      />
    </Animated.View>
  );
}

// ==================== CALL HISTORY LIST ENHANCED ====================

export interface CallHistoryItem {
  id: string;
  user: CallUser;
  type: CallType;
  direction: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  timestamp: number;
}

interface CallHistoryListProps {
  calls: CallHistoryItem[];
  onCallPress?: (call: CallHistoryItem) => void;
  onVideoCall?: (user: CallUser) => void;
  onVoiceCall?: (user: CallUser) => void;
}

export function CallHistoryListEnhanced({
  calls,
  onCallPress,
  onVideoCall,
  onVoiceCall,
}: CallHistoryListProps) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const background = useThemeColor({}, 'background');

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getCallIcon = (direction: string) => {
    switch (direction) {
      case 'incoming': return { name: 'call', color: '#10B981' };
      case 'outgoing': return { name: 'call', color: '#0D9488' };
      case 'missed': return { name: 'call', color: '#EF4444' };
      default: return { name: 'call', color: '#6B7280' };
    }
  };

  const renderItem = ({ item }: { item: CallHistoryItem }) => {
    const icon = getCallIcon(item.direction);
    
    return (
      <Pressable style={[styles.historyItem, { backgroundColor: background }]} onPress={() => onCallPress?.(item)}>
        {item.user.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.historyAvatar} />
        ) : (
          <View style={styles.historyAvatarPlaceholder}>
            <Text style={styles.historyAvatarText}>{item.user.name.charAt(0)}</Text>
          </View>
        )}
        
        <View style={styles.historyInfo}>
          <Text style={[styles.historyName, { color: text }]}>{item.user.name}</Text>
          <View style={styles.historyMeta}>
            <Ionicons
              name={icon.name as any}
              size={14}
              color={icon.color}
              style={{ transform: [{ rotate: item.direction === 'outgoing' ? '45deg' : item.direction === 'incoming' ? '-45deg' : '0deg' }] }}
            />
            <Text style={[styles.historyType, { color: textMuted }]}>
              {item.type === 'video' ? 'Video' : 'Thoại'} • {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
        
        <View style={styles.historyActions}>
          <Pressable style={styles.historyActionBtn} onPress={() => onVoiceCall?.(item.user)}>
            <Ionicons name="call" size={22} color="#0D9488" />
          </Pressable>
          <Pressable style={styles.historyActionBtn} onPress={() => onVideoCall?.(item.user)}>
            <Ionicons name="videocam" size={22} color="#0D9488" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.historyContainer}>
      {calls.map((item) => renderItem({ item }))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Incoming call styles
  incomingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatarPulse: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -20,
    left: -20,
  },
  avatarPulse2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -40,
    left: -40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 60,
  },
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },

  // Voice call styles
  voiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 32,
  },
  endCallContainer: {
    marginTop: 16,
  },

  // Control button styles
  controlWrapper: {
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...MODERN_SHADOWS.md,
  },
  controlButtonActive: {
    backgroundColor: '#6B7280',
  },
  controlButtonRed: {
    backgroundColor: '#EF4444',
  },
  controlButtonGreen: {
    backgroundColor: '#10B981',
  },
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },

  // Video call styles
  videoContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  videoName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  videoStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
    ...MODERN_SHADOWS.lg,
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  switchCameraBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  topInfo: {
    alignItems: 'center',
  },
  topName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  topStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },

  // Modal styles
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },

  // History styles
  historyContainer: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  historyAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  historyType: {
    fontSize: 13,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  historyActionBtn: {
    padding: 8,
  },
});
