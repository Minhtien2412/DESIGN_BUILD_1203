// CallSessionContext not implemented yet - commented out to prevent bundling errors
// import { useCallSession } from '@/context/CallSessionContext';
import { useCallSession } from '@/hooks/useCallSession';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface CallActionButtonsProps {
  userId?: string;
  userName?: string;
  userAvatar?: string;
  isOnline?: boolean;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'vertical';
  showLabels?: boolean;
}

export function CallActionButtons({
  userId,
  userName = 'Người dùng',
  userAvatar,
  isOnline = false,
  style,
  size = 'medium',
  variant = 'horizontal',
  showLabels = true,
}: CallActionButtonsProps) {
  const { startCall, startVideoAndNavigate } = useCallSession();
  const handleVideoCall = () => {
    if (userId) {
      startVideoAndNavigate({ participantIds: [userId], participantNames: { [userId]: userName }, peerId: userId });
    } else {
      router.push('/contact-picker' as any);
    }
  };

  const handleVoiceCall = async () => {
    if (userId) {
      const roomId = `voice-${Date.now()}`;
      await startCall({ roomId, participantIds: [userId], kind: 'voice', participantNames: { [userId]: userName } });
      router.push(`/call-popup?roomId=${roomId}&kind=voice&peerId=${userId}&peerName=${encodeURIComponent(userName)}` as any);
    } else {
      router.push('/contact-picker' as any);
    }
  };

  const buttonSizes = {
    small: { width: 32, height: 32, iconSize: 16 },
    medium: { width: 44, height: 44, iconSize: 20 },
    large: { width: 56, height: 56, iconSize: 24 },
  };

  const currentSize = buttonSizes[size];
  const isVertical = variant === 'vertical';

  return (
    <View style={[
      styles.container,
      isVertical ? styles.vertical : styles.horizontal,
      style,
    ]}>
      {/* Video Call Button */}
      <View style={styles.buttonGroup}>
        <Pressable
          style={[
            styles.actionButton,
            styles.videoButton,
            {
              width: currentSize.width,
              height: currentSize.height,
              borderRadius: currentSize.width / 2,
            },
            !isOnline && styles.disabledButton,
          ]}
          onPress={handleVideoCall}
          disabled={!isOnline && !!userId}
        >
          <MaterialCommunityIcons
            name="video"
            size={currentSize.iconSize}
            color={!isOnline && !!userId ? '#999' : '#fff'}
          />
        </Pressable>
        
        {showLabels && (
          <Text style={[
            styles.buttonLabel,
            size === 'small' && styles.smallLabel,
          ]}>
            Video
          </Text>
        )}
      </View>

      {/* Voice Call Button */}
      <View style={styles.buttonGroup}>
        <Pressable
          style={[
            styles.actionButton,
            styles.voiceButton,
            {
              width: currentSize.width,
              height: currentSize.height,
              borderRadius: currentSize.width / 2,
            },
            !isOnline && styles.disabledButton,
          ]}
          onPress={handleVoiceCall}
          disabled={!isOnline && !!userId}
        >
          <MaterialIcons
            name="call"
            size={currentSize.iconSize}
            color={!isOnline && !!userId ? '#999' : '#fff'}
          />
        </Pressable>
        
        {showLabels && (
          <Text style={[
            styles.buttonLabel,
            size === 'small' && styles.smallLabel,
          ]}>
            Gọi
          </Text>
        )}
      </View>
    </View>
  );
}

// Quick Call Button for minimal usage
export function QuickCallButton({
  userId,
  isOnline = true,
  style,
  size = 32,
}: {
  userId?: string;
  isOnline?: boolean;
  style?: any;
  size?: number;
}) {
  const handleCall = () => {
    if (userId) {
      const roomId = `quick-${Date.now()}`;
  router.push(`/call-popup?roomId=${roomId}&kind=video&peerId=${userId}` as any);
    } else {
      router.push('/contact-picker' as any);
    }
  };

  return (
    <Pressable
      style={[
        styles.quickButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        !isOnline && styles.disabledButton,
        style,
      ]}
      onPress={handleCall}
      disabled={!isOnline && !!userId}
    >
      <MaterialCommunityIcons
        name="video"
        size={size * 0.5}
        color={!isOnline && !!userId ? '#999' : '#fff'}
      />
    </Pressable>
  );
}

// Call Status Indicator
export function CallStatusIndicator({
  status,
  size = 12,
}: {
  status: 'online' | 'busy' | 'away' | 'offline' | 'in-call';
  size?: number;
}) {
  const statusConfig = {
    online: { color: '#4CAF50', icon: null },
    busy: { color: '#FF5722', icon: 'do-not-disturb-on' },
    away: { color: '#FF9800', icon: 'schedule' },
    offline: { color: '#9E9E9E', icon: null },
    'in-call': { color: '#2196F3', icon: 'call' },
  };

  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.statusIndicator,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.color,
        },
      ]}
    >
      {config.icon && (
        <MaterialIcons
          name={config.icon as any}
          size={size * 0.6}
          color="#fff"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    gap: 12,
  },
  vertical: {
    flexDirection: 'column',
    gap: 8,
  },
  buttonGroup: {
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  videoButton: {
    backgroundColor: '#667eea',
  },
  voiceButton: {
    backgroundColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0.1,
    elevation: 1,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  smallLabel: {
    fontSize: 9,
  },
  quickButton: {
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
