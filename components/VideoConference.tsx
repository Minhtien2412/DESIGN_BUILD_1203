// LiveKit Video Conference Component for React Native
// Simple wrapper component - LiveKit packages to be installed separately:
// npm install @livekit/react-native @livekit/react-native-webrtc livekit-client

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import integratedApi, { LiveKitRoom } from '../services/integratedApi';

interface VideoConferenceProps {
  roomName?: string;
  identity?: string;
  onDisconnect?: () => void;
  autoRecord?: boolean;
  enableChat?: boolean;
}

interface ConferenceState {
  isConnected: boolean;
  isConnecting: boolean;
  participants: any[];
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
  recordingId: string | null;
  isRecording: boolean;
  connectionError: string | null;
  roomInfo: LiveKitRoom | null;
}

const { width: screenWidth } = Dimensions.get('window');

export default function VideoConference({
  roomName,
  identity,
  onDisconnect,
  autoRecord = false,
  enableChat = true,
}: VideoConferenceProps) {
  const backgroundColor = '#000000';
  const textColor = '#FFFFFF';
  
  const [state, setState] = useState<ConferenceState>({
    isConnected: false,
    isConnecting: false,
    participants: [],
    isMuted: false,
    isVideoEnabled: true,
    isSpeakerEnabled: true,
    recordingId: null,
    isRecording: false,
    connectionError: null,
    roomInfo: null,
  });

  // Initialize room connection
  useEffect(() => {
    if (roomName) {
      initializeRoom();
    }
  }, [roomName, identity]);

  const initializeRoom = async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));

      // Create or join room
      const roomInfo = await integratedApi.joinVideoRoom(
        roomName!,
        identity || `user_${Date.now()}`
      );

      setState(prev => ({
        ...prev,
        roomInfo,
        isConnected: true,
        isConnecting: false,
      }));

      // Start recording if requested
      if (autoRecord && roomName) {
        await startRecording();
      }
      
      // Show success message
      Alert.alert(
        'Conference Ready',
        `Join the video conference at:\n${roomInfo.url}\n\nRoom: ${roomName}`,
        [
          { 
            text: 'Copy URL', 
            onPress: () => {
              // In a real app, you'd copy to clipboard here
              console.log('Conference URL:', roomInfo.url);
            }
          },
          { text: 'OK' }
        ]
      );

    } catch (error) {
      console.error('Failed to initialize room:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'Failed to connect to the room',
      }));
      Alert.alert('Connection Error', 'Failed to connect to the video conference');
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!roomName) return;

    try {
      const recording = await integratedApi.startVideoRecording(roomName);
      setState(prev => ({
        ...prev,
        recordingId: recording.egressId,
        isRecording: true,
      }));
      Alert.alert('Recording Started', 'The conference is now being recorded');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!state.recordingId) return;

    try {
      await integratedApi.stopVideoRecording(state.recordingId);
      setState(prev => ({
        ...prev,
        isRecording: false,
        recordingId: null,
      }));
      Alert.alert('Recording Stopped', 'The recording has been saved');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording');
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    Alert.alert(
      state.isMuted ? 'Microphone Enabled' : 'Microphone Muted',
      'This is a demo. In a real app, this would control your microphone.'
    );
  };

  // Toggle camera
  const toggleCamera = () => {
    setState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
    Alert.alert(
      state.isVideoEnabled ? 'Camera Disabled' : 'Camera Enabled',
      'This is a demo. In a real app, this would control your camera.'
    );
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    setState(prev => ({ ...prev, isSpeakerEnabled: !prev.isSpeakerEnabled }));
    Alert.alert(
      state.isSpeakerEnabled ? 'Speaker Off' : 'Speaker On',
      'This is a demo. In a real app, this would control your speaker.'
    );
  };

  // Switch camera (front/back)
  const switchCamera = () => {
    Alert.alert('Camera Switched', 'This is a demo. In a real app, this would switch between front/back camera.');
  };

  // Disconnect from room
  const disconnect = async () => {
    try {
      if (state.isRecording && state.recordingId) {
        await stopRecording();
      }
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        roomInfo: null,
      }));
      
      onDisconnect?.();
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  };

  if (state.isConnecting) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Connecting to conference...
        </Text>
      </View>
    );
  }

  if (state.connectionError) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Ionicons name="warning" size={48} color="#FF4444" />
        <Text style={styles.errorText}>{state.connectionError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setState(prev => ({ ...prev, connectionError: null }));
            if (roomName) {
              initializeRoom();
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!state.isConnected || !state.roomInfo) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>
          Preparing conference...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Recording indicator */}
      {state.isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>REC</Text>
        </View>
      )}

      {/* Conference Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.roomTitle, { color: textColor }]}>
          Room: {roomName}
        </Text>
        <Text style={[styles.roomUrl, { color: textColor }]}>
          URL: {state.roomInfo.url}
        </Text>
        <Text style={[styles.demoText, { color: '#666' }]}>
          Demo Mode - Install LiveKit packages for full functionality
        </Text>
      </View>

      {/* Video placeholder */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam" size={64} color="#666" />
          <Text style={styles.placeholderText}>Video Conference</Text>
          <Text style={styles.placeholderSubtext}>
            Install @livekit/react-native for video
          </Text>
        </View>
      </View>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, state.isMuted && styles.mutedButton]}
          onPress={toggleMicrophone}
        >
          <Ionicons
            name={state.isMuted ? 'mic-off' : 'mic'}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !state.isVideoEnabled && styles.mutedButton]}
          onPress={toggleCamera}
        >
          <Ionicons
            name={state.isVideoEnabled ? 'videocam' : 'videocam-off'}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={switchCamera}
        >
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, state.isSpeakerEnabled && styles.activeButton]}
          onPress={toggleSpeaker}
        >
          <Ionicons
            name={state.isSpeakerEnabled ? 'volume-high' : 'volume-low'}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        {autoRecord && (
          <TouchableOpacity
            style={[styles.controlButton, state.isRecording && styles.recordingButton]}
            onPress={state.isRecording ? stopRecording : startRecording}
          >
            <Ionicons
              name={state.isRecording ? 'stop' : 'radio-button-on'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={disconnect}
        >
          <Ionicons name="call" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Room actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Room Token',
              `Token: ${state.roomInfo?.token || 'No token'}`,
              [
                { 
                  text: 'Copy', 
                  onPress: () => console.log('Token:', state.roomInfo?.token)
                },
                { text: 'OK' }
              ]
            );
          }}
        >
          <Text style={styles.actionButtonText}>Show Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Join Instructions',
              `To join this conference:\n\n1. Open LiveKit app\n2. Enter URL: ${state.roomInfo?.url || 'No URL'}\n3. Use token: ${state.roomInfo?.token?.substring(0, 20) || 'No token'}...`
            );
          }}
        >
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1000,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 50,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  roomUrl: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  videoContainer: {
    flex: 1,
    margin: 20,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 40,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  placeholderSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  participantsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  participantContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 4,
    position: 'relative',
  },
  mainParticipant: {
    width: screenWidth - 16,
    height: (screenWidth - 16) * 9 / 16,
  },
  gridParticipant: {
    width: (screenWidth - 32) / 2,
    height: ((screenWidth - 32) / 2) * 9 / 16,
  },
  video: {
    flex: 1,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  participantInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  mutedButton: {
    backgroundColor: '#FF4444',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  recordingButton: {
    backgroundColor: '#FF0000',
  },
  endCallButton: {
    backgroundColor: '#FF4444',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export { VideoConference };
