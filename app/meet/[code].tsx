/**
 * Meeting Room Screen
 * Video conference room like Google Meet
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    endMeeting as endMeetingAPI,
    getMeetingByCode,
    leaveMeeting,
} from '@/services/scheduled-meeting.service';
import type { MeetingChatMessage, MeetingParticipant, ScheduledMeeting } from '@/types/scheduled-meeting';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function MeetingRoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  
  const [meeting, setMeeting] = useState<ScheduledMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  
  // Controls
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Chat
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Participants (mock)
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'surface');
  const primary = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');

  // Load meeting info
  useEffect(() => {
    const loadMeeting = async () => {
      if (!code) {
        Alert.alert('Lỗi', 'Mã cuộc họp không hợp lệ');
        router.back();
        return;
      }
      
      try {
        const meetingData = await getMeetingByCode(code);
        if (!meetingData) {
          Alert.alert('Lỗi', 'Không tìm thấy cuộc họp');
          router.back();
          return;
        }
        setMeeting(meetingData);
        setParticipants(meetingData.participants);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin cuộc họp');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    loadMeeting();
  }, [code]);

  // Duration timer
  useEffect(() => {
    durationRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeaveMeeting = () => {
    Alert.alert(
      'Rời cuộc họp?',
      'Bạn có chắc muốn rời khỏi cuộc họp?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời đi',
          style: 'destructive',
          onPress: async () => {
            if (meeting) {
              await leaveMeeting(meeting.id);
            }
            router.back();
          },
        },
      ]
    );
  };

  const handleEndMeeting = () => {
    Alert.alert(
      'Kết thúc cuộc họp?',
      'Điều này sẽ kết thúc cuộc họp cho tất cả mọi người',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Kết thúc',
          style: 'destructive',
          onPress: async () => {
            if (meeting) {
              await endMeetingAPI(meeting.id);
            }
            router.back();
          },
        },
      ]
    );
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage: MeetingChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'Bạn',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const renderParticipantVideo = ({ item }: { item: MeetingParticipant }) => (
    <View style={styles.participantVideo}>
      <View style={styles.videoPlaceholder}>
        <Ionicons name="person" size={32} color="#888" />
      </View>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.isAudioMuted && (
          <Ionicons name="mic-off" size={14} color="#000000" />
        )}
      </View>
    </View>
  );

  const renderChatMessage = ({ item }: { item: MeetingChatMessage }) => {
    const isMe = item.senderId === 'current-user';
    return (
      <View style={[styles.chatMessage, isMe && styles.chatMessageMe]}>
        {!isMe && (
          <Text style={styles.chatSender}>{item.senderName}</Text>
        )}
        <Text style={[styles.chatContent, isMe && styles.chatContentMe]}>
          {item.content}
        </Text>
        <Text style={styles.chatTime}>
          {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: '#1a1a1a' }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.loadingText}>Đang kết nối...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1a1a1a' }]} edges={['top']}>
      <Pressable style={styles.mainArea} onPress={resetControlsTimeout}>
        {/* Main Video Area */}
        <View style={styles.mainVideo}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam-off" size={48} color="#666" />
            <Text style={styles.placeholderText}>
              {isVideoOff ? 'Camera đã tắt' : 'Đang kết nối video...'}
            </Text>
          </View>
        </View>

        {/* Self Video (PiP) */}
        <View style={styles.selfVideo}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="person" size={24} color="#888" />
          </View>
          {isAudioMuted && (
            <View style={styles.selfMicOff}>
              <Ionicons name="mic-off" size={12} color="#fff" />
            </View>
          )}
        </View>

        {/* Top Bar */}
        {showControls && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.topBar}
          >
            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle} numberOfLines={1}>
                {meeting?.title || 'Cuộc họp'}
              </Text>
              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
            </View>
            <Text style={styles.meetingCode}>{code}</Text>
          </Animated.View>
        )}

        {/* Bottom Controls */}
        {showControls && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.bottomControls}
          >
            <View style={styles.controlsRow}>
              <Pressable
                style={[styles.controlButton, isAudioMuted && styles.controlButtonActive]}
                onPress={() => setIsAudioMuted(!isAudioMuted)}
              >
                <Ionicons
                  name={isAudioMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isAudioMuted ? '#fff' : '#333'}
                />
              </Pressable>

              <Pressable
                style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
                onPress={() => setIsVideoOff(!isVideoOff)}
              >
                <Ionicons
                  name={isVideoOff ? 'videocam-off' : 'videocam'}
                  size={24}
                  color={isVideoOff ? '#fff' : '#333'}
                />
              </Pressable>

              <Pressable
                style={[styles.controlButton, isScreenSharing && styles.controlButtonSharing]}
                onPress={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Ionicons
                  name="laptop-outline"
                  size={24}
                  color={isScreenSharing ? '#fff' : '#333'}
                />
              </Pressable>

              <Pressable
                style={styles.controlButton}
                onPress={() => setIsChatOpen(true)}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#333" />
                {chatMessages.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{chatMessages.length}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={styles.controlButton}
                onPress={() => setIsParticipantsOpen(true)}
              >
                <Ionicons name="people-outline" size={24} color="#333" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{participants.length}</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.controlButton, styles.endCallButton]}
                onPress={handleLeaveMeeting}
              >
                <Ionicons name="call" size={24} color="#fff" />
              </Pressable>
            </View>
          </Animated.View>
        )}
      </Pressable>

      {/* Chat Panel */}
      {isChatOpen && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={[styles.sidePanel, { backgroundColor }]}
        >
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: textColor }]}>Chat</Text>
            <Pressable onPress={() => setIsChatOpen(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>
          
          <FlatList
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderChatMessage}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            inverted={false}
          />
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.chatInputRow, { borderColor: mutedColor }]}>
              <TextInput
                style={[styles.chatInput, { color: textColor }]}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor={mutedColor}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendMessage}
              />
              <Pressable
                style={[styles.sendButton, { backgroundColor: primary }]}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* Participants Panel */}
      {isParticipantsOpen && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={[styles.sidePanel, { backgroundColor }]}
        >
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: textColor }]}>
              Người tham gia ({participants.length})
            </Text>
            <Pressable onPress={() => setIsParticipantsOpen(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>
          
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.participantRow}>
                <View style={[styles.participantAvatar, { backgroundColor: cardBg }]}>
                  <Ionicons name="person" size={20} color={mutedColor} />
                </View>
                <View style={styles.participantDetails}>
                  <Text style={[styles.participantListName, { color: textColor }]}>
                    {item.name}
                    {item.role === 'HOST' && ' (Host)'}
                  </Text>
                  <Text style={[styles.participantStatus, { color: mutedColor }]}>
                    {item.status === 'JOINED' ? 'Đang tham gia' : item.status}
                  </Text>
                </View>
                <View style={styles.participantActions}>
                  {item.isAudioMuted && (
                    <Ionicons name="mic-off" size={16} color="#000000" />
                  )}
                  {item.isVideoOff && (
                    <Ionicons name="videocam-off" size={16} color="#000000" />
                  )}
                </View>
              </View>
            )}
            contentContainerStyle={styles.participantsList}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  mainArea: {
    flex: 1,
  },
  mainVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
  selfVideo: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#333',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#555',
  },
  selfMicOff: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 4,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  durationText: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  meetingCode: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#555',
  },
  controlButtonSharing: {
    backgroundColor: '#3B82F6',
  },
  endCallButton: {
    backgroundColor: '#000000',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000000',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  participantVideo: {
    width: (width - 48) / 2,
    height: 150,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 4,
  },
  participantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  participantName: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  sidePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 16,
  },
  chatMessage: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  chatMessageMe: {
    alignSelf: 'flex-end',
  },
  chatSender: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  chatContent: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 12,
    fontSize: 14,
  },
  chatContentMe: {
    backgroundColor: '#3B82F6',
    color: '#fff',
  },
  chatTime: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsList: {
    padding: 16,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantDetails: {
    flex: 1,
  },
  participantListName: {
    fontSize: 15,
    fontWeight: '500',
  },
  participantStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  participantActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
