/**
 * Create Meeting Screen
 * Schedule a new meeting with date/time picker
 */

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
    createScheduledMeeting,
    getMeetingShareText,
} from "@/services/scheduled-meeting.service";
import { ScheduledMeetingType } from "@/types/scheduled-meeting";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEETING_TYPES: {
  value: ScheduledMeetingType;
  label: string;
  icon: string;
}[] = [
  {
    value: ScheduledMeetingType.VIDEO_CALL,
    label: "Video Call",
    icon: "videocam",
  },
  { value: ScheduledMeetingType.AUDIO_CALL, label: "Audio Call", icon: "call" },
  {
    value: ScheduledMeetingType.CONFERENCE,
    label: "Conference",
    icon: "people",
  },
  {
    value: ScheduledMeetingType.TEAM_MEETING,
    label: "Team Meeting",
    icon: "business",
  },
  {
    value: ScheduledMeetingType.ONE_ON_ONE,
    label: "1:1 Meeting",
    icon: "person",
  },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const REMINDER_OPTIONS = [
  { value: 5, label: "5 phút trước" },
  { value: 10, label: "10 phút trước" },
  { value: 15, label: "15 phút trước" },
  { value: 30, label: "30 phút trước" },
  { value: 60, label: "1 giờ trước" },
];

export default function CreateMeetingScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState<ScheduledMeetingType>(
    ScheduledMeetingType.VIDEO_CALL,
  );
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 3600000),
  ); // 1 hour from now
  const [duration, setDuration] = useState(30);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(false);
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<number[]>([15]);
  const [creating, setCreating] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const cardBg = useThemeColor({}, "surface");
  const primary = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "textMuted");
  const borderColor = useThemeColor({}, "border");

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const newDate = new Date(scheduledDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setScheduledDate(newDate);
    }
  };

  const handleTimeChange = (_: unknown, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const newDate = new Date(scheduledDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledDate(newDate);
    }
  };

  const toggleReminder = (minutes: number) => {
    setSelectedReminders((prev) =>
      prev.includes(minutes)
        ? prev.filter((m) => m !== minutes)
        : [...prev, minutes],
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề cuộc họp");
      return;
    }

    try {
      setCreating(true);
      const response = await createScheduledMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        type: meetingType,
        scheduledStartTime: scheduledDate.toISOString(),
        duration,
        isWaitingRoomEnabled,
        isRecordingEnabled,
        requiresPassword,
        reminders: selectedReminders.map((m) => ({
          minutesBefore: m,
          notificationType: "push" as const,
        })),
      });

      // Show success and options
      Alert.alert("✅ Đã tạo cuộc họp", `Mã: ${response.meeting.meetingCode}`, [
        {
          text: "Chia sẻ",
          onPress: async () => {
            const shareText = getMeetingShareText(response.meeting);
            try {
              await Share.share({ message: shareText });
            } catch {
              await Clipboard.setStringAsync(response.meetingLink);
            }
          },
        },
        {
          text: "Tham gia ngay",
          onPress: () =>
            router.replace(
              `/meetings/room/${response.meeting.meetingCode}` as any,
            ),
        },
        {
          text: "Xong",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo cuộc họp. Vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={textColor} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Tạo cuộc họp</ThemedText>
        <Pressable
          style={[styles.createButton, { backgroundColor: primary }]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Tạo</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Tiêu đề *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardBg, borderColor, color: textColor },
            ]}
            placeholder="VD: Họp team hàng tuần"
            placeholderTextColor={mutedColor}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Mô tả</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: cardBg, borderColor, color: textColor },
            ]}
            placeholder="Nội dung cuộc họp (tùy chọn)"
            placeholderTextColor={mutedColor}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Meeting Type */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>
            Loại cuộc họp
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
          >
            {MEETING_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={[
                  styles.typeOption,
                  { backgroundColor: cardBg, borderColor },
                  meetingType === type.value && {
                    backgroundColor: primary,
                    borderColor: primary,
                  },
                ]}
                onPress={() => setMeetingType(type.value)}
              >
                <Ionicons
                  name={type.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={meetingType === type.value ? "#fff" : primary}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    { color: meetingType === type.value ? "#fff" : textColor },
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Ngày và giờ</Text>
          <View style={styles.dateTimeRow}>
            <Pressable
              style={[
                styles.dateTimeButton,
                { backgroundColor: cardBg, borderColor },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={primary} />
              <Text style={[styles.dateTimeText, { color: textColor }]}>
                {scheduledDate.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.dateTimeButton,
                { backgroundColor: cardBg, borderColor },
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={primary} />
              <Text style={[styles.dateTimeText, { color: textColor }]}>
                {scheduledDate.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Duration */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Thời lượng</Text>
          <View style={styles.durationOptions}>
            {DURATION_OPTIONS.map((d) => (
              <Pressable
                key={d}
                style={[
                  styles.durationOption,
                  { backgroundColor: cardBg, borderColor },
                  duration === d && {
                    backgroundColor: primary,
                    borderColor: primary,
                  },
                ]}
                onPress={() => setDuration(d)}
              >
                <Text
                  style={[
                    styles.durationText,
                    { color: duration === d ? "#fff" : textColor },
                  ]}
                >
                  {d} phút
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Nhắc nhở</Text>
          <View style={styles.reminderOptions}>
            {REMINDER_OPTIONS.map((r) => (
              <Pressable
                key={r.value}
                style={[
                  styles.reminderOption,
                  { backgroundColor: cardBg, borderColor },
                  selectedReminders.includes(r.value) && {
                    backgroundColor: primary,
                    borderColor: primary,
                  },
                ]}
                onPress={() => toggleReminder(r.value)}
              >
                <Text
                  style={[
                    styles.reminderText,
                    {
                      color: selectedReminders.includes(r.value)
                        ? "#fff"
                        : textColor,
                    },
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Cài đặt</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: cardBg, borderColor },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="hourglass-outline"
                  size={20}
                  color={mutedColor}
                />
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  Phòng chờ
                </Text>
              </View>
              <Switch
                value={isWaitingRoomEnabled}
                onValueChange={setIsWaitingRoomEnabled}
                trackColor={{ false: borderColor, true: primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="recording-outline"
                  size={20}
                  color={mutedColor}
                />
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  Cho phép ghi lại
                </Text>
              </View>
              <Switch
                value={isRecordingEnabled}
                onValueChange={setIsRecordingEnabled}
                trackColor={{ false: borderColor, true: primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={mutedColor}
                />
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  Yêu cầu mật khẩu
                </Text>
              </View>
              <Switch
                value={requiresPassword}
                onValueChange={setRequiresPassword}
                trackColor={{ false: borderColor, true: primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  typeScroll: {
    flexDirection: "row",
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 10,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateTimeText: {
    fontSize: 15,
  },
  durationOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  durationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  reminderOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reminderOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  reminderText: {
    fontSize: 13,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
  },
});
