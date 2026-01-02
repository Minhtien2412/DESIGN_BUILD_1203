import { useCall } from '@/context/CallContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { RTCView } from '@/utils/webrtc';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export function ActiveCallScreen() {
  const { 
    currentCall, 
    endCall, 
    localStream, 
    remoteStream,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    toggleSpeaker,
  } = useCall();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Call duration timer
  useEffect(() => {
    if (currentCall?.status === 'active') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentCall?.status]);

  if (!currentCall) {
    router.back();
    return null;
  }

  const handleEndCall = async () => {
    try {
      await endCall();
      router.back();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleToggleMute = () => {
    const enabled = toggleMicrophone();
    setIsMuted(!enabled);
  };

  const handleToggleVideo = () => {
    const enabled = toggleCamera();
    setIsVideoOff(!enabled);
  };

  const handleSwitchCamera = async () => {
    await switchCamera();
  };

  const handleToggleSpeaker = () => {
    const enabled = toggleSpeaker();
    setIsSpeakerOn(enabled);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isVideoCall = currentCall.type === 'video';
  const otherUser = currentCall.caller?.id === currentCall.callerId 
    ? currentCall.callee 
    : currentCall.caller;

  const hasRemoteVideo = remoteStream && isVideoCall && !isVideoOff;
  const hasLocalVideo = localStream && isVideoCall && !isVideoOff;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1a1a1a' }]}>
      {/* Video Area */}
      <View style={styles.videoContainer}>
        {/* Remote Video */}
        <View style={styles.remoteVideo}>
          {hasRemoteVideo ? (
            <RTCView
              streamURL={remoteStream!.toURL()}
              style={styles.rtcView}
              objectFit="cover"
              mirror={false}
            />
          ) : (
            <>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={80} color="#FFFFFF" />
              </View>
              
              <Text style={styles.remoteName}>
                {otherUser?.name || 'Unknown'}
              </Text>
              
              <Text style={styles.callStatus}>
                {currentCall.status === 'active' 
                  ? formatDuration(callDuration) 
                  : 'Connecting...'}
              </Text>
            </>
          )}
        </View>

        {/* Local Video Preview */}
        {isVideoCall && (
          <View style={styles.localVideo}>
            {hasLocalVideo ? (
              <>
                <RTCView
                  streamURL={localStream!.toURL()}
                  style={styles.localRtcView}
                  objectFit="cover"
                  mirror={true}
                />
                {/* Flip Camera Button */}
                <Pressable
                  onPress={handleSwitchCamera}
                  style={styles.flipCameraButton}
                >
                  <Ionicons name="camera-reverse" size={20} color="#FFFFFF" />
                </Pressable>
              </>
            ) : (
              <View style={styles.localVideoPlaceholder}>
                <Ionicons name="videocam-off" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          {/* Mute Button */}
          <Pressable
            onPress={handleToggleMute}
            style={({ pressed }) => [
              styles.controlButton,
              isMuted && styles.controlButtonActive,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color={isMuted ? '#EF4444' : '#FFFFFF'}
            />
          </Pressable>

          {/* Video Toggle (video calls only) */}
          {isVideoCall && (
            <Pressable
              onPress={handleToggleVideo}
              style={({ pressed }) => [
                styles.controlButton,
                isVideoOff && styles.controlButtonActive,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name={isVideoOff ? 'videocam-off' : 'videocam'}
                size={28}
                color={isVideoOff ? '#EF4444' : '#FFFFFF'}
              />
            </Pressable>
          )}

          {/* Speaker Button */}
          <Pressable
            onPress={handleToggleSpeaker}
            style={({ pressed }) => [
              styles.controlButton,
              isSpeakerOn && styles.controlButtonActive,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
              size={28}
              color={isSpeakerOn ? '#10B981' : '#FFFFFF'}
            />
          </Pressable>
        </View>

        {/* End Call Button */}
        <Pressable
          onPress={handleEndCall}
          style={({ pressed }) => [
            styles.endCallButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="call" size={32} color="#FFFFFF" />
          <Text style={styles.endCallText}>Kết thúc</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  rtcView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#3a3a3a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  remoteName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  localRtcView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  localVideoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  flipCameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    gap: 8,
    alignSelf: 'center',
  },
  endCallText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
