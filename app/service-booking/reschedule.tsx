/**
 * Reschedule — S08
 * Allows customer or provider to propose a new date/time.
 * The other party sees this screen to accept/reject.
 *
 * Status: scheduled → reschedule_requested → scheduled
 * Role: Customer + Provider
 */
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    RESCHEDULE_REASONS
} from "@/types/service-order";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "propose" | "respond";

export default function RescheduleScreen() {
  const router = useRouter();
  const colors = useThemeColor();
  const params = useLocalSearchParams<{
    bookingId?: string;
    mode?: Mode; // "propose" | "respond"
    originalDate?: string;
    originalTime?: string;
    proposedDate?: string; // only when mode=respond
    proposedTime?: string;
    proposedReason?: string;
    serviceName?: string;
  }>();

  const mode: Mode = (params.mode as Mode) || "propose";

  // ── propose mode state ──
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── time slot options (simplified) ──
  const TIME_SLOTS = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // ── date options: today+1 → today+7 ──
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
      }),
    };
  });

  const handleSubmitProposal = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn ngày và giờ mới.");
      return;
    }
    if (!reasonId) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn lý do đổi lịch.");
      return;
    }
    setSubmitting(true);
    try {
      // TODO: call API to send reschedule request
      // await rescheduleBooking(params.bookingId, { newDate: selectedDate, newTime: selectedTime, reason });
      router.back();
      Alert.alert(
        "Đã gửi",
        "Yêu cầu đổi lịch đã được gửi. Chờ bên kia xác nhận.",
      );
    } catch {
      Alert.alert("Lỗi", "Không gửi được yêu cầu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      // TODO: call API to accept reschedule
      router.back();
      Alert.alert("Đã xác nhận", "Lịch hẹn đã được cập nhật.");
    } catch {
      Alert.alert("Lỗi", "Không xác nhận được. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      // TODO: call API to reject reschedule
      router.back();
      Alert.alert("Đã từ chối", "Lịch hẹn giữ nguyên.");
    } catch {
      Alert.alert("Lỗi", "Không thực hiện được. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {mode === "propose" ? "Đổi lịch hẹn" : "Yêu cầu đổi lịch"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Current schedule */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Lịch hiện tại
          </Text>
          <View style={styles.scheduleRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.scheduleText, { color: colors.text }]}>
              {params.originalDate || "—"}
            </Text>
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.scheduleText, { color: colors.text }]}>
              {params.originalTime || "—"}
            </Text>
          </View>
          {params.serviceName && (
            <Text style={[styles.serviceName, { color: colors.textSecondary }]}>
              {params.serviceName}
            </Text>
          )}
        </View>

        {mode === "respond" ? (
          /* ── RESPOND MODE: show proposal from other party ── */
          <>
            <View style={[styles.card, { backgroundColor: "#E3F2FD" }]}>
              <Text style={[styles.cardTitle, { color: "#1565C0" }]}>
                Lịch đề xuất mới
              </Text>
              <View style={styles.scheduleRow}>
                <Ionicons name="calendar-outline" size={18} color="#1565C0" />
                <Text
                  style={[
                    styles.scheduleText,
                    { color: "#1565C0", fontWeight: "700" },
                  ]}
                >
                  {params.proposedDate || "—"}
                </Text>
                <Ionicons name="time-outline" size={18} color="#1565C0" />
                <Text
                  style={[
                    styles.scheduleText,
                    { color: "#1565C0", fontWeight: "700" },
                  ]}
                >
                  {params.proposedTime || "—"}
                </Text>
              </View>
              {params.proposedReason && (
                <View style={styles.reasonBox}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#1565C0"
                  />
                  <Text style={{ color: "#1565C0", fontSize: 13, flex: 1 }}>
                    Lý do: {params.proposedReason}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.dualBtnRow}>
              <Button
                title="Từ chối"
                variant="outline"
                onPress={handleReject}
                disabled={submitting}
                style={{ flex: 1 }}
              />
              <Button
                title="Đồng ý"
                onPress={handleAccept}
                disabled={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </>
        ) : (
          /* ── PROPOSE MODE: pick new date/time ── */
          <>
            {/* Date picker */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Chọn ngày mới
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dateScroll}
            >
              {dateOptions.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[
                    styles.dateChip,
                    selectedDate === d.value && styles.dateChipActive,
                  ]}
                  onPress={() => setSelectedDate(d.value)}
                >
                  <Text
                    style={[
                      styles.dateChipText,
                      selectedDate === d.value && styles.dateChipTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time picker */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Chọn giờ
            </Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.timeChip,
                    selectedTime === t && styles.timeChipActive,
                  ]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      selectedTime === t && styles.timeChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reason picker */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Lý do đổi lịch
            </Text>
            <View style={styles.reasonGrid}>
              {RESCHEDULE_REASONS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.reasonChip,
                    { borderColor: reasonId === r.id ? "#1976D2" : "#E0E0E0" },
                    reasonId === r.id && { backgroundColor: "#E3F2FD" },
                  ]}
                  onPress={() => setReasonId(r.id)}
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      {
                        color:
                          reasonId === r.id ? "#1976D2" : colors.textSecondary,
                      },
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {reasonId === "other" && (
              <TextInput
                style={[
                  styles.customInput,
                  { color: colors.text, borderColor: "#E0E0E0" },
                ]}
                placeholder="Nhập lý do cụ thể..."
                placeholderTextColor={colors.textSecondary}
                value={customReason}
                onChangeText={setCustomReason}
                multiline
              />
            )}

            <Button
              title="Gửi yêu cầu đổi lịch"
              onPress={handleSubmitProposal}
              disabled={
                submitting || !selectedDate || !selectedTime || !reasonId
              }
              style={styles.submitBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  body: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scheduleText: { fontSize: 15, fontWeight: "500" },
  serviceName: { fontSize: 13, marginTop: 8 },
  reasonBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
  },
  sectionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  dateScroll: { marginBottom: 20 },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  dateChipActive: { backgroundColor: "#1F2937" },
  dateChipText: { fontSize: 13, color: "#6B7280" },
  dateChipTextActive: { color: "#fff", fontWeight: "600" },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  timeChipActive: { backgroundColor: "#1F2937" },
  timeChipText: { fontSize: 14, color: "#6B7280" },
  timeChipTextActive: { color: "#fff", fontWeight: "600" },
  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  reasonChipText: { fontSize: 13 },
  customInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitBtn: { width: "100%", marginTop: 8 },
  dualBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
