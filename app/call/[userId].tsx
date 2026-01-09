/**
 * Voice/Video Call Screen
 * Real-time audio/video calling
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    notifyCallEnded,
    notifyCallStarted,
    notifyIncomingCall,
} from '@/services/call-notification';

const { width, height } = Dimensions.get('window');

type CallType = 'audio' | 'video';
type CallStatus = 'calling' | 'connected' | 'ended';

export default function CallScreen() {
  const { userId, type: callType, isIncoming } = useLocalSearchParams<{
    userId: string;
    type: CallType;
    isIncoming?: string;
  }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const surface = useThemeColor({}, 'surface');

  const [status, setStatus] = useState<CallStatus>(isIncoming === 'true' ? 'calling' : 'calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

  const callerName = `Người dùng ${userId}`;

  // Gửi notification khi có cuộc gọi đến
  useEffect(() => {
    if (isIncoming === 'true') {
      notifyIncomingCall(
        userId,
        callerName,
        (callType as CallType) || 'audio'
      ).catch(console.error);
    }
  }, []);

  useEffect(() => {
    // Simulate connecting
    const connectTimer = setTimeout(() => {
      setStatus('connected');
      
      // Gửi notification khi cuộc gọi bắt đầu
      notifyCallStarted(
        userId,
        callerName,
        (callType as CallType) || 'audio'
      ).catch(console.error);
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setStatus('ended');
    
    // Gửi notification khi cuộc gọi kết thúc
    notifyCallEnded(
      userId,
      callerName,
      (callType as CallType) || 'audio'
    ).catch(console.error);
    
    setTimeout(() => router.back(), 500);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  return (
    <View style={styles.container}>
      {/* Video View */}
      {callType === 'video' && isVideoOn ? (
        <>
          {/* Remote Video (Full Screen) */}
          <View style={styles.remoteVideo}>
            <View style={[styles.videoPlaceholder, { backgroundColor: '#1a1a1a' }]}>
              <Ionicons name="videocam-off" size={48} color="#666" />
              <Text style={styles.placeholderText}>Đang kết nối video...</Text>
            </View>
          </View>

          {/* Local Video (PiP) */}
          <View style={[styles.localVideo, { backgroundColor: surface }]}>
            <View style={[styles.videoPlaceholder, { backgroundColor: '#2a2a2a' }]}>
              <Ionicons name="person" size={32} color="#888" />
            </View>
          </View>
        </>
      ) : (
        /* Audio Only View */
        <View style={[styles.audioView, { backgroundColor: primary }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: '#fff' }]}>
              <Ionicons name="person" size={64} color={primary} />
            </View>
          </View>

          <Text style={styles.callerName}>Người dùng {userId}</Text>

          {status === 'calling' && (
            <Text style={styles.statusText}>Đang gọi...</Text>
          )}

          {status === 'connected' && (
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          {/* Mute */}
          <Pressable
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={handleToggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color={isMuted ? '#fff' : '#333'}
            />
          </Pressable>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <Pressable
              style={[styles.controlButton, !isVideoOn && styles.controlButtonActive]}
              onPress={handleToggleVideo}
            >
              <Ionicons
                name={isVideoOn ? 'videocam' : 'videocam-off'}
                size={28}
                color={isVideoOn ? '#333' : '#fff'}
              />
            </Pressable>
          )}

          {/* Speaker */}
          <Pressable
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={handleToggleSpeaker}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-medium'}
              size={28}
              color={isSpeaker ? '#fff' : '#333'}
            />
          </Pressable>

          {/* End Call */}
          <Pressable style={[styles.controlButton, styles.endCallButton]} onPress={handleEndCall}>
            <Ionicons name="call" size={28} color="#fff" />
          </Pressable>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <Ionicons
            name={callType === 'video' ? 'videocam' : 'call'}
            size={16}
            color="#fff"
          />
          <Text style={styles.infoText}>
            {status === 'calling' ? 'Đang kết nối' : status === 'connected' ? 'Đã kết nối' : 'Đã kết thúc'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
  },
  audioView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#555',
  },
  endCallButton: {
    backgroundColor: '#000000',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
});
