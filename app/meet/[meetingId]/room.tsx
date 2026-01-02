import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CallParticipant, CallStats, videoCallService } from '@/services/videoCallService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Lazy load LiveKit only on native platforms (not available in Expo Go)
let AudioSession: any = null;
let Room: any = null;
let VideoView: any = null;
let isLiveKitAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const livekit = require('@livekit/react-native');
    AudioSession = livekit.AudioSession;
    Room = livekit.Room;
    VideoView = livekit.VideoView;
    isLiveKitAvailable = true;
  } catch (error) {
    console.warn('[VideoCall] LiveKit not available - requires development build');
  }
}

const { width, height } = Dimensions.get('window');

export default function VideoCallRoomScreen() {
  const params = useLocalSearchParams<{ meetingId: string; participantName?: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callStats, setCallStats] = useState<CallStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Stats update interval
  const statsInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCall();

    return () => {
      cleanup();
    };
  }, []);

  /**
   * Initialize video call
   */
  const initializeCall = async () => {
    try {
      // Check if LiveKit is available
      if (!isLiveKitAvailable || !AudioSession) {
        setError('Video calls require a development build. Please run: npx expo run:android');
        setIsConnecting(false);
        return;
      }

      setIsConnecting(true);
      setError(null);

      // Configure audio session
      await AudioSession.startAudioSession();

      // Initialize call
      const roomInstance = await videoCallService.initializeCall(
        {
          meetingId: params.meetingId,
          participantName: params.participantName || 'Guest',
          isCameraOn: true,
          isMicOn: true,
        },
        {
          onParticipantJoined: handleParticipantJoined,
          onParticipantLeft: handleParticipantLeft,
          onDisconnected: handleDisconnected,
          onReconnecting: handleReconnecting,
          onReconnected: handleReconnected,
        }
      );

      setRoom(roomInstance);
      updateParticipants();
      startStatsUpdates();
      setIsConnecting(false);
    } catch (err: any) {
      console.error('Failed to initialize call:', err);
      setError(err.message || 'Failed to join call');
      setIsConnecting(false);
    }
  };

  /**
   * Update participants list
   */
  const updateParticipants = () => {
    const participantsList = videoCallService.getParticipants();
    setParticipants(participantsList);
  };

  /**
   * Start stats updates
   */
  const startStatsUpdates = () => {
    statsInterval.current = setInterval(() => {
      const stats = videoCallService.getCallStats();
      setCallStats(stats);
    }, 1000);
  };

  /**
   * Handle participant joined
   */
  const handleParticipantJoined = (participant: CallParticipant) => {
    console.log('Participant joined:', participant.name);
    updateParticipants();
  };

  /**
   * Handle participant left
   */
  const handleParticipantLeft = (participant: CallParticipant) => {
    console.log('Participant left:', participant.name);
    updateParticipants();
  };

  /**
   * Handle disconnected
   */
  const handleDisconnected = () => {
    console.log('Disconnected from call');
    cleanup();
    router.back();
  };

  /**
   * Handle reconnecting
   */
  const handleReconnecting = () => {
    console.log('Reconnecting...');
  };

  /**
   * Handle reconnected
   */
  const handleReconnected = () => {
    console.log('Reconnected');
    updateParticipants();
  };

  /**
   * Toggle camera
   */
  const toggleCamera = async () => {
    try {
      const newState = await videoCallService.toggleCamera();
      setIsCameraOn(newState);
    } catch (err) {
      console.error('Failed to toggle camera:', err);
    }
  };

  /**
   * Toggle microphone
   */
  const toggleMicrophone = async () => {
    try {
      const newState = await videoCallService.toggleMicrophone();
      setIsMicOn(newState);
    } catch (err) {
      console.error('Failed to toggle microphone:', err);
    }
  };

  /**
   * Switch camera
   */
  const switchCamera = async () => {
    try {
      await videoCallService.switchCamera();
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  };

  /**
   * Toggle speaker
   */
  const toggleSpeaker = async () => {
    try {
      const newState = !isSpeakerOn;
      if (newState) {
        await AudioSession.setSpeakerphoneOn(true);
      } else {
        await AudioSession.setSpeakerphoneOn(false);
      }
      setIsSpeakerOn(newState);
    } catch (err) {
      console.error('Failed to toggle speaker:', err);
    }
  };

  /**
   * End call
   */
  const endCall = async () => {
    try {
      await videoCallService.disconnect();
      cleanup();
      router.back();
    } catch (err) {
      console.error('Failed to end call:', err);
      router.back();
    }
  };

  /**
   * Cleanup
   */
  const cleanup = async () => {
    if (statsInterval.current) {
      clearInterval(statsInterval.current);
      statsInterval.current = null;
    }

    await AudioSession.stopAudioSession();
  };

  /**
   * Format call duration
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Render participant video
   */
  const renderParticipant = ({ item }: { item: CallParticipant }) => {
    return (
      <View style={styles.participantContainer}>
        <View style={[styles.videoContainer, { backgroundColor: '#000' }]}>
          {item.isCameraOn ? (
            <VideoView
              style={styles.video}
              videoTrack={item.isLocal ? room?.localParticipant.videoTracks[0]?.track : undefined}
              objectFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
          )}

          {/* Participant info overlay */}
          <View style={styles.participantInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.participantName}>{item.name}</Text>
              {!item.isMicOn && (
                <Ionicons name="mic-off" size={16} color="#fff" style={styles.mutedIcon} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (isConnecting) {
    return (
      <Container>
        <Loader size={40} />
        <Text style={[styles.loadingText, { color: textColor }]}>Connecting to call...</Text>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container>
        <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />
        <Text style={[styles.errorTitle, { color: textColor }]}>Failed to join call</Text>
        <Text style={[styles.errorMessage, { color: `${textColor}80` }]}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: primaryColor }]}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </Container>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Header with stats */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          {callStats && (
            <>
              <Text style={styles.statText}>{formatDuration(callStats.duration)}</Text>
              <View style={styles.statDivider} />
              <Ionicons name="people" size={16} color="#fff" />
              <Text style={styles.statText}>{callStats.participantCount}</Text>
              <View style={styles.statDivider} />
              <View style={[styles.qualityIndicator, { backgroundColor: callStats.networkQuality === 'good' ? '#34C759' : '#FF9500' }]} />
            </>
          )}
        </View>
      </View>

      {/* Participants grid */}
      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={(item) => item.id}
        numColumns={participants.length === 1 ? 1 : 2}
        key={participants.length === 1 ? 'one' : 'two'}
        contentContainerStyle={styles.participantsGrid}
      />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Camera toggle */}
        <TouchableOpacity
          onPress={toggleCamera}
          style={[styles.controlButton, !isCameraOn && styles.controlButtonOff]}
        >
          <Ionicons name={isCameraOn ? 'videocam' : 'videocam-off'} size={28} color="#fff" />
        </TouchableOpacity>

        {/* Microphone toggle */}
        <TouchableOpacity
          onPress={toggleMicrophone}
          style={[styles.controlButton, !isMicOn && styles.controlButtonOff]}
        >
          <Ionicons name={isMicOn ? 'mic' : 'mic-off'} size={28} color="#fff" />
        </TouchableOpacity>

        {/* Speaker toggle */}
        <TouchableOpacity
          onPress={toggleSpeaker}
          style={styles.controlButton}
        >
          <Ionicons name={isSpeakerOn ? 'volume-high' : 'volume-mute'} size={28} color="#fff" />
        </TouchableOpacity>

        {/* Switch camera */}
        <TouchableOpacity
          onPress={switchCamera}
          style={styles.controlButton}
        >
          <Ionicons name="camera-reverse" size={28} color="#fff" />
        </TouchableOpacity>

        {/* End call */}
        <TouchableOpacity
          onPress={endCall}
          style={[styles.controlButton, styles.endCallButton]}
        >
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#fff4',
  },
  qualityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  participantsGrid: {
    flexGrow: 1,
    padding: 8,
  },
  participantContainer: {
    flex: 1,
    aspectRatio: 0.75,
    padding: 4,
  },
  videoContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  participantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#0008',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mutedIcon: {
    marginLeft: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonOff: {
    backgroundColor: '#FF3B30',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
