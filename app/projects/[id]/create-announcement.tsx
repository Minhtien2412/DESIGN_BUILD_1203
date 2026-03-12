/**
 * Create Announcement Screen
 * Create new team announcement
 */

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import communicationService from '@/services/api/communication.service';

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

const PRIORITIES: { value: Priority; label: string; color: string; icon: string }[] = [
  { value: 'LOW', label: 'Thấp', color: '#6B7280', icon: 'chatbubble-outline' },
  { value: 'NORMAL', label: 'Bình thường', color: '#0D9488', icon: 'information-circle-outline' },
  { value: 'HIGH', label: 'Cao', color: '#0D9488', icon: 'warning-outline' },
  { value: 'URGENT', label: 'Khẩn cấp', color: '#000000', icon: 'alert-circle-outline' },
];

export default function CreateAnnouncementScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        setAttachments(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Lỗi', 'Không thể chọn tệp');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
      return;
    }

    if (!projectId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin dự án');
      return;
    }

    const days = parseInt(expiresInDays);
    if (isNaN(days) || days < 1) {
      Alert.alert('Lỗi', 'Số ngày hết hạn không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      await communicationService.createAnnouncement({
        projectId: parseInt(projectId),
        title: title.trim(),
        content: content.trim(),
        priority,
        expiresAt: expiresAt.toISOString(),
        attachments: attachments.map(a => ({
          name: a.name,
          url: a.uri,
          type: a.mimeType || 'application/octet-stream',
          size: a.size || 0,
        })),
      });

      Alert.alert('Thành công', 'Đã tạo thông báo', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Create failed:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo thông báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Tạo thông báo</Text>
        <Pressable
          onPress={handleCreate}
          disabled={loading}
          style={[styles.createButton, loading && styles.createButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={primary} />
          ) : (
            <Text style={[styles.createButtonText, { color: primary }]}>Tạo</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: text }]}>Tiêu đề *</Text>
              <TextInput
                style={[styles.input, { borderColor: border, backgroundColor: surface, color: text }]}
                placeholder="Nhập tiêu đề thông báo..."
                placeholderTextColor={textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: text }]}>Mức độ ưu tiên *</Text>
              <View style={styles.priorityGrid}>
                {PRIORITIES.map(p => (
                  <Pressable
                    key={p.value}
                    style={[
                      styles.priorityButton,
                      { borderColor: border },
                      priority === p.value && {
                        backgroundColor: p.color + '20',
                        borderColor: p.color,
                      },
                    ]}
                    onPress={() => setPriority(p.value)}
                  >
                    <Ionicons
                      name={p.icon as any}
                      size={20}
                      color={priority === p.value ? p.color : textMuted}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priority === p.value ? p.color : text },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Content */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: text }]}>Nội dung *</Text>
              <TextInput
                style={[
                  styles.textarea,
                  { borderColor: border, backgroundColor: surface, color: text },
                ]}
                placeholder="Nhập nội dung thông báo..."
                placeholderTextColor={textMuted}
                multiline
                numberOfLines={8}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
            </View>

            {/* Expiration */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: text }]}>Hết hạn sau (ngày) *</Text>
              <TextInput
                style={[styles.input, { borderColor: border, backgroundColor: surface, color: text }]}
                placeholder="7"
                placeholderTextColor={textMuted}
                keyboardType="number-pad"
                value={expiresInDays}
                onChangeText={setExpiresInDays}
              />
              <Text style={[styles.hint, { color: textMuted }]}>
                Thông báo sẽ hết hạn sau {expiresInDays || '0'} ngày
              </Text>
            </View>

            {/* Attachments */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: text }]}>Tệp đính kèm</Text>
                <Pressable
                  style={[styles.addButton, { borderColor: primary }]}
                  onPress={handlePickDocument}
                >
                  <Ionicons name="attach-outline" size={16} color={primary} />
                  <Text style={[styles.addButtonText, { color: primary }]}>Thêm tệp</Text>
                </Pressable>
              </View>

              {attachments.length > 0 && (
                <View style={styles.attachmentList}>
                  {attachments.map((attachment, index) => (
                    <View
                      key={index}
                      style={[styles.attachmentItem, { backgroundColor: surface, borderColor: border }]}
                    >
                      <View style={styles.attachmentInfo}>
                        <Ionicons name="document-outline" size={20} color={primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.attachmentName, { color: text }]} numberOfLines={1}>
                            {attachment.name}
                          </Text>
                          {attachment.size && (
                            <Text style={[styles.attachmentSize, { color: textMuted }]}>
                              {(attachment.size / 1024).toFixed(1)} KB
                            </Text>
                          )}
                        </View>
                      </View>
                      <Pressable onPress={() => handleRemoveAttachment(index)}>
                        <Ionicons name="close-circle" size={24} color="#000000" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Info Box */}
            <View style={[styles.infoBox, { backgroundColor: primary + '10', borderColor: primary }]}>
              <Ionicons name="information-circle-outline" size={20} color={primary} />
              <Text style={[styles.infoText, { color: primary }]}>
                Tất cả thành viên dự án sẽ nhận được thông báo này
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  createButton: {
    padding: 4,
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 150,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  attachmentList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  attachmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
