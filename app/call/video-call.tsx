/**
 * Video Call Screen
 * Full-screen video call interface with Agora
 * 
 * Features:
 * - Permission check for camera & microphone
 * - Local video preview
 * - Remote video display
 * - Control buttons (mute, video, speaker, end call)
 * - Call duration timer
 * - Connection status
 */

import { useAgoraCall } from '@/hooks/useAgoraCall';
import {
    checkCameraPermission,
    checkMicrophonePermission,
    requestCameraPermission,
    requestMicrophonePermission
} from '@/hooks/useAppPermissions';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VideoCallScreen() {
  const params = useLocalSearchParams<{
    channelName?: string;
    participantId?: string;
    participantName?: string;
    token?: string;
    uid?: string;
    appId?: string;
    callType?: 'video' | 'voice';
    isIncoming?: string;
  }>();

  const {
    isInCall,
    callState,
    isMuted,
    isVideoEnabled,
    isSpeakerOn,
    remoteUsers,
    error,
    initialize,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
  } = useAgoraCall();

  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [permissionsChecking, setPermissionsChecking] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check and request permissions first
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setPermissionsChecking(true);

        // Check current permission status
        const cameraStatus = await checkCameraPermission();
        const micStatus = await checkMicrophonePermission();

        if (cameraStatus === 'granted' && micStatus === 'granted') {
          setPermissionsGranted(true);
          setPermissionsChecking(false);
          return;
        }

        // Request permissions if not granted
        const cameraResult = await requestCameraPermission();
        const micResult = await requestMicrophonePermission();

        if (cameraResult.status === 'granted' && micResult.status === 'granted') {
          setPermissionsGranted(true);
        } else {
          // Permissions denied
          Alert.alert(
            'Không có quyền',
            'Ứng dụng cần quyền Camera và Microphone để thực hiện cuộc gọi video. Vui lòng cấp quyền trong Cài đặt.',
            [
              {
                text: 'Quay lại',
                onPress: () => router.back(),
                style: 'cancel',
              },
            ]
          );
        }
      } catch (err) {
        console.error('Permission check failed:', err);
        Alert.alert('Lỗi', 'Không thể kiểm tra quyền. Vui lòng thử lại.');
        router.back();
      } finally {
        setPermissionsChecking(false);
      }
    };

    checkPermissions();
  }, []);

  // Initialize and start/answer call (only after permissions granted)
  useEffect(() => {
    if (!permissionsGranted) return;

    const initCall = async () => {
      try {
        const { 
          channelName, 
          participantId, 
          token, 
          uid, 
          appId,
          isIncoming 
        } = params;

        if (!appId) {
          throw new Error('App ID không được cung cấp');
        }

        // Initialize engine
        await initialize(appId);

        if (isIncoming === 'true' && channelName && token && uid) {
          // Answer incoming call
          await answerCall(channelName, token, parseInt(uid), appId);
        } else if (participantId) {
          // Start outgoing call
          await startCall(participantId, params.callType || 'video');
        } else {
          throw new Error('Thiếu thông tin cuộc gọi');
        }

        setIsConnecting(false);
      } catch (err: any) {
        console.error('Failed to initialize call:', err);
        Alert.alert('Lỗi', err.message, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    };

    initCall();
  }, [permissionsGranted]);

  // Call duration timer
  useEffect(() => {
    if (callState === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [callState]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error);
    }
  }, [error]);

  // Handle call end
  const handleEndCall = async () => {
    try {
      await endCall();
      router.back();
    } catch (err) {
      console.error('Failed to end call:', err);
      router.back();
    }
  };

  // Auto-end call when remote users leave (1-1 call)
  useEffect(() => {
    if (isInCall && remoteUsers.length === 0 && callState === 'connected') {
      // Wait 5 seconds in case of temporary disconnect
      const timeout = setTimeout(() => {
        if (remoteUsers.length === 0) {
          Alert.alert(
            'Cuộc gọi đã kết thúc',
            'Người dùng khác đã rời khỏi cuộc gọi',
            [{ text: 'OK', onPress: handleEndCall }]
          );
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isInCall, remoteUsers.length, callState]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Permission Checking Screen */}
      {permissionsChecking && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
          <Text style={styles.loadingSubtext}>Camera và Microphone</Text>
        </View>
      )}

      {/* Main Call UI (only show after permissions granted) */}
      {!permissionsChecking && permissionsGranted && (
        <>
          {/* Header - Participant Info */}
          <View style={styles.header}>
            <Text style={styles.participantName}>
              {params.participantName || 'Đang kết nối...'}
            </Text>
            
            <Text style={styles.callStatus}>
              {isConnecting ? 'Đang kết nối...' : 
               callState === 'calling' ? 'Đang gọi...' :
               callState === 'ringing' ? 'Đang đổ chuông...' :
               callState === 'connected' ? formatDuration(callDuration) :
               callState === 'failed' ? 'Kết nối thất bại' :
               'Cuộc gọi đã kết thúc'}
            </Text>

            {remoteUsers.length > 0 && (
              <Text style={styles.userCount}>
                {remoteUsers.length} người trong cuộc gọi
              </Text>
            )}
          </View>

          {/* Video Container */}
          <View style={styles.videoContainer}>
            {isConnecting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Đang thiết lập cuộc gọi...</Text>
              </View>
        ) : (
          <>
            {/* Remote Video - Full screen */}
            <View style={styles.remoteVideo}>
              {remoteUsers.length === 0 ? (
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarCircle}>
                    <MaterialIcons name="person" size={80} color="#fff" />
                  </View>
                  <Text style={styles.waitingText}>
                    Đang chờ người dùng khác...
                  </Text>
                </View>
              ) : (
                <View style={styles.remoteVideoPlaceholder}>
                  <Text style={styles.remoteVideoText}>
                    Remote Video (UID: {remoteUsers[0]})
                  </Text>
                  <Text style={styles.noteText}>
                    ⚠️ Note: Video surface requires react-native-agora package
                  </Text>
                </View>
              )}
            </View>

            {/* Local Video - Small preview */}
            {isVideoEnabled && (
              <View style={styles.localVideo}>
                <View style={styles.localVideoPlaceholder}>
                  <MaterialIcons name="videocam" size={32} color="#fff" />
                  <Text style={styles.localVideoText}>You</Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          {/* Toggle Microphone */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <MaterialIcons
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color="#fff"
            />
            <Text style={styles.controlLabel}>
              {isMuted ? 'Tắt tiếng' : 'Mic'}
            </Text>
          </TouchableOpacity>

          {/* Toggle Video */}
          <TouchableOpacity
            style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
            onPress={toggleVideo}
          >
            <MaterialIcons
              name={isVideoEnabled ? 'videocam' : 'videocam-off'}
              size={28}
              color="#fff"
            />
            <Text style={styles.controlLabel}>
              {isVideoEnabled ? 'Camera' : 'Tắt cam'}
            </Text>
          </TouchableOpacity>

          {/* Switch Camera */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={switchCamera}
            disabled={!isVideoEnabled}
          >
            <MaterialCommunityIcons
              name="camera-flip"
              size={28}
              color={isVideoEnabled ? '#fff' : '#666'}
            />
            <Text style={[
              styles.controlLabel,
              !isVideoEnabled && styles.controlLabelDisabled
            ]}>
              Đổi cam
            </Text>
          </TouchableOpacity>

          {/* Toggle Speaker */}
          <TouchableOpacity
            style={[styles.controlButton, !isSpeakerOn && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <MaterialIcons
              name={isSpeakerOn ? 'volume-up' : 'volume-off'}
              size={28}
              color="#fff"
            />
            <Text style={styles.controlLabel}>
              {isSpeakerOn ? 'Loa' : 'Tắt loa'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity
          style={styles.endCallButton}
          onPress={handleEndCall}
        >
          <MaterialIcons name="call-end" size={32} color="#fff" />
          <Text style={styles.endCallText}>Kết thúc</Text>
        </TouchableOpacity>
      </View>
      </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  participantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 4,
  },
  userCount: {
    fontSize: 14,
    color: '#888',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  remoteVideoText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  waitingText: {
    fontSize: 16,
    color: '#aaa',
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoText: {
    marginTop: 8,
    fontSize: 12,
    color: '#fff',
  },
  controls: {
    padding: 20,
    paddingBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  controlButton: {
    alignItems: 'center',
    width: 70,
  },
  controlButtonActive: {
    opacity: 0.6,
  },
  controlLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#fff',
  },
  controlLabelDisabled: {
    color: '#666',
  },
  endCallButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  endCallText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
});
