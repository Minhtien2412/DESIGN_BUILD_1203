// features/call/SimpleCallScreen.tsx
/**
 * Simple Call Screen - Expo Go Compatible
 * Uses expo-camera instead of WebRTC
 * Good for UI testing and prototyping
 * 
 * LIMITATION: This is NOT a real video call.
 * For production, use development build with react-native-webrtc
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type SimpleCallScreenProps = {
  calleeId?: string;
  calleeName?: string;
  roomId?: string;
  userId?: string;
  userName?: string;
};

export default function SimpleCallScreen({
  calleeId,
  calleeName,
  roomId,
  userId,
  userName,
}: SimpleCallScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  const isCaller = !!calleeId;
  const displayName = isCaller ? calleeName : userName;

  useEffect(() => {
    // Request permissions
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setStatus('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleEndCall = () => {
    setStatus('ended');
    router.back();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="videocam-off" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Camera permission required</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isCaller ? `Calling ${displayName}...` : displayName || 'Unknown'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {status === 'connecting' ? 'Connecting...' : 'Connected'}
        </Text>
      </View>

      {/* Video Container */}
      <View style={styles.videoContainer}>
        {/* Remote Video (Placeholder) */}
        <View style={styles.remoteVideo}>
          <View style={styles.placeholderRemote}>
            <Ionicons name="person-circle" size={120} color="#666" />
            <Text style={styles.placeholderText}>
              {displayName || 'Other Person'}
            </Text>
          </View>
        </View>

        {/* Local Video (Camera Preview) */}
        <View style={styles.localVideo}>
          {isVideoOff ? (
            <View style={styles.videoOffContainer}>
              <Ionicons name="person-circle" size={48} color="#FFF" />
              <Text style={styles.videoOffText}>Camera Off</Text>
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              facing="front"
            />
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Mute Button */}
        <Pressable
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={28}
            color="#FFF"
          />
        </Pressable>

        {/* Video Toggle Button */}
        <Pressable
          style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
          onPress={() => setIsVideoOff(!isVideoOff)}
        >
          <Ionicons
            name={isVideoOff ? 'videocam-off' : 'videocam'}
            size={28}
            color="#FFF"
          />
        </Pressable>

        {/* End Call Button */}
        <Pressable
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={28} color="#FFF" />
        </Pressable>
      </View>

      {/* Connecting Overlay */}
      {status === 'connecting' && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.overlayText}>Connecting...</Text>
        </View>
      )}

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <Ionicons name="information-circle" size={16} color="#FF9500" />
        <Text style={styles.warningText}>
          Demo Mode - Not a real call
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },
  videoContainer: {
    flex: 1,
    width: '100%',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderRemote: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  localVideo: {
    position: 'absolute',
    top: 120,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  camera: {
    flex: 1,
  },
  videoOffContainer: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#FF3B30',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  warningBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
});
