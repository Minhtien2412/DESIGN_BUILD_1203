/**
 * Join Meeting Screen
 * Join a meeting by code or link
 */

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMeetingByCode, joinMeeting } from '@/services/scheduled-meeting.service';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JoinMeetingScreen() {
  const [meetingCode, setMeetingCode] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<{ title: string; requiresPassword: boolean } | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'surface');
  const primary = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');

  // Format meeting code as user types (abc-defg-hij)
  const formatMeetingCode = (text: string) => {
    const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 10; i++) {
      if (i === 3 || i === 7) formatted += '-';
      formatted += cleaned[i];
    }
    return formatted;
  };

  const handleCodeChange = async (text: string) => {
    const formatted = formatMeetingCode(text);
    setMeetingCode(formatted);

    // Check meeting when code is complete
    if (formatted.length === 12) { // abc-defg-hij
      try {
        const meeting = await getMeetingByCode(formatted);
        if (meeting) {
          setMeetingInfo({
            title: meeting.title,
            requiresPassword: meeting.requiresPassword,
          });
          setShowPassword(meeting.requiresPassword);
        }
      } catch {
        setMeetingInfo(null);
      }
    } else {
      setMeetingInfo(null);
      setShowPassword(false);
    }
  };

  const handlePasteCode = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      // Extract meeting code from URL or plain text
      const codeMatch = text.match(/([a-z]{3}-[a-z]{4}-[a-z]{3})/i);
      if (codeMatch) {
        handleCodeChange(codeMatch[1]);
      } else {
        handleCodeChange(text);
      }
    }
  };

  const handleJoin = async () => {
    if (meetingCode.length < 12) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã cuộc họp hợp lệ');
      return;
    }

    try {
      setLoading(true);
      
      await joinMeeting({
        meetingCode,
        password: showPassword ? password : undefined,
        displayName: displayName.trim() || undefined,
        isAudioMuted,
        isVideoOff,
      });

      // Navigate to meeting room
      router.replace(`/meet/${meetingCode}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tham gia cuộc họp';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Tham gia cuộc họp</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Meeting Code Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Mã cuộc họp</Text>
          <View style={styles.codeInputRow}>
            <TextInput
              style={[styles.codeInput, { backgroundColor: cardBg, borderColor, color: textColor }]}
              placeholder="abc-defg-hij"
              placeholderTextColor={mutedColor}
              value={meetingCode}
              onChangeText={handleCodeChange}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={12}
            />
            <Pressable
              style={[styles.pasteButton, { backgroundColor: cardBg, borderColor }]}
              onPress={handlePasteCode}
            >
              <Ionicons name="clipboard-outline" size={20} color={primary} />
            </Pressable>
          </View>
          <Text style={[styles.hint, { color: mutedColor }]}>
            Nhập mã cuộc họp hoặc dán link mời
          </Text>
        </View>

        {/* Meeting Info */}
        {meetingInfo && (
          <View style={[styles.meetingInfoCard, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="videocam" size={24} color={primary} />
            <View style={styles.meetingInfoText}>
              <Text style={[styles.meetingTitle, { color: textColor }]}>
                {meetingInfo.title}
              </Text>
              <Text style={[styles.meetingStatus, { color: mutedColor }]}>
                Cuộc họp đã được tìm thấy
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
          </View>
        )}

        {/* Password */}
        {showPassword && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Mật khẩu</Text>
            <TextInput
              style={[styles.input, { backgroundColor: cardBg, borderColor, color: textColor }]}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={mutedColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )}

        {/* Display Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Tên hiển thị (tùy chọn)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: cardBg, borderColor, color: textColor }]}
            placeholder="Tên của bạn trong cuộc họp"
            placeholderTextColor={mutedColor}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        {/* Join Settings */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Tùy chọn tham gia</Text>
          <View style={[styles.settingsCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="mic-off-outline" size={20} color={mutedColor} />
                <Text style={[styles.settingLabel, { color: textColor }]}>Tắt mic khi vào</Text>
              </View>
              <Switch
                value={isAudioMuted}
                onValueChange={setIsAudioMuted}
                trackColor={{ false: borderColor, true: primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="videocam-off-outline" size={20} color={mutedColor} />
                <Text style={[styles.settingLabel, { color: textColor }]}>Tắt camera khi vào</Text>
              </View>
              <Switch
                value={isVideoOff}
                onValueChange={setIsVideoOff}
                trackColor={{ false: borderColor, true: primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Join Button */}
        <Pressable
          style={[
            styles.joinButton,
            { backgroundColor: primary },
            (meetingCode.length < 12 || loading) && styles.joinButtonDisabled,
          ]}
          onPress={handleJoin}
          disabled={meetingCode.length < 12 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="enter-outline" size={22} color="#fff" />
              <Text style={styles.joinButtonText}>Tham gia cuộc họp</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  pasteButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  meetingInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  meetingInfoText: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  meetingStatus: {
    fontSize: 13,
    marginTop: 2,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
