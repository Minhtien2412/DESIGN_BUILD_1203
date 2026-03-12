/**
 * Schedule Booking Screen
 * Date/time picker + notes before confirming a service booking
 * Bridges worker selection → booking creation via BookingContext
 */

import { useBooking } from "@/context/BookingContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================================================
// TIME SLOTS
// ============================================================================
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
  "18:00",
  "19:00",
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function ScheduleBookingScreen() {
  const params = useLocalSearchParams<{
    workerId: string;
    name: string;
    avatar: string;
    price: string;
    category: string;
    categoryLabel: string;
  }>();

  const { createNewBooking } = useBooking();

  const workerName = params.name || "Thợ";
  const workerAvatar = params.avatar || "https://i.pravatar.cc/150?img=11";
  const price = parseInt(params.price || "150000", 10);
  const categoryLabel = params.categoryLabel || "Dịch vụ";

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // Generate next 14 days
  const dateOptions = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const formatDay = (date: Date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => date.getDate().toString();

  const formatMonth = (date: Date) => {
    return `Tháng ${date.getMonth() + 1}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedDate) {
      Alert.alert("Lưu ý", "Vui lòng chọn ngày hẹn");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Lưu ý", "Vui lòng chọn giờ hẹn");
      return;
    }

    setSubmitting(true);
    try {
      const startDate = selectedDate.toISOString().split("T")[0];
      const endDate = startDate; // Same day service

      const booking = await createNewBooking(
        {
          id: params.workerId,
          name: workerName,
          avatar: workerAvatar,
          rating: 0,
          category: params.category || "",
        },
        {
          serviceId: parseInt(params.workerId, 10) || 1,
          startDate,
          endDate,
          notes: notes.trim() || undefined,
        },
        price,
        selectedTime,
      );

      Alert.alert(
        "Đặt lịch thành công!",
        `Lịch hẹn ngày ${startDate} lúc ${selectedTime}\nThợ: ${workerName}\nDịch vụ: ${categoryLabel}`,
        [
          {
            text: "Xem đơn",
            onPress: () =>
              router.push(
                `/service-booking/${booking.id}?name=${encodeURIComponent(workerName)}&price=${price}&category=${params.category}&categoryLabel=${encodeURIComponent(categoryLabel)}&avatar=${encodeURIComponent(workerAvatar)}` as any,
              ),
          },
          {
            text: "Về trang chính",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt lịch. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedDate,
    selectedTime,
    notes,
    params,
    workerName,
    workerAvatar,
    price,
    categoryLabel,
    createNewBooking,
  ]);

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Chọn lịch hẹn</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Worker Info */}
        <View style={s.workerCard}>
          <Image source={{ uri: workerAvatar }} style={s.workerAvatar} />
          <View style={s.workerInfo}>
            <Text style={s.workerName}>{workerName}</Text>
            <Text style={s.workerService}>{categoryLabel}</Text>
            <Text style={s.workerPrice}>{formatPrice(price)}</Text>
          </View>
        </View>

        {/* Date Picker */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            <MaterialCommunityIcons name="calendar" size={16} color="#333" />{" "}
            Chọn ngày
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.dateScroll}
          >
            {dateOptions.map((date, index) => {
              const selected =
                selectedDate?.toDateString() === date.toDateString();
              const today = isToday(date);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    s.dateCard,
                    selected && s.dateCardActive,
                    today && !selected && s.dateCardToday,
                  ]}
                  onPress={() => handleDateSelect(date)}
                >
                  <Text style={[s.dateDay, selected && s.dateDayActive]}>
                    {today ? "Hôm nay" : formatDay(date)}
                  </Text>
                  <Text style={[s.dateNumber, selected && s.dateNumberActive]}>
                    {formatDate(date)}
                  </Text>
                  <Text style={[s.dateMonth, selected && s.dateMonthActive]}>
                    {formatMonth(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Picker */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#333"
            />{" "}
            Chọn giờ
          </Text>
          <View style={s.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const selected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[s.timeSlot, selected && s.timeSlotActive]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text style={[s.timeText, selected && s.timeTextActive]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={16}
              color="#333"
            />{" "}
            Ghi chú cho thợ (tuỳ chọn)
          </Text>
          <TextInput
            style={s.notesInput}
            placeholder="Mô tả vấn đề cần xử lý, địa chỉ cụ thể..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={1000}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Tóm tắt lịch hẹn</Text>
            <View style={s.summaryRow}>
              <Ionicons name="person" size={16} color="#0D9488" />
              <Text style={s.summaryText}>{workerName}</Text>
            </View>
            <View style={s.summaryRow}>
              <Ionicons name="construct" size={16} color="#0D9488" />
              <Text style={s.summaryText}>{categoryLabel}</Text>
            </View>
            <View style={s.summaryRow}>
              <Ionicons name="calendar" size={16} color="#0D9488" />
              <Text style={s.summaryText}>
                {selectedDate.toLocaleDateString("vi-VN")} lúc {selectedTime}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Ionicons name="cash" size={16} color="#0D9488" />
              <Text style={s.summaryText}>{formatPrice(price)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={s.bottomBar}>
        <View style={s.bottomPrice}>
          <Text style={s.bottomPriceLabel}>Tổng chi phí dự kiến</Text>
          <Text style={s.bottomPriceValue}>{formatPrice(price)}</Text>
        </View>
        <TouchableOpacity
          style={[
            s.confirmButton,
            (!selectedDate || !selectedTime) && s.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={submitting || !selectedDate || !selectedTime}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.confirmText}>Xác nhận đặt lịch</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },

  // Worker Card
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0E0E0",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  workerService: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  workerPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D9488",
    marginTop: 4,
  },

  // Section
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  // Date Picker
  dateScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  dateCard: {
    width: 72,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateCardActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  dateCardToday: {
    borderColor: "#0D9488",
    borderWidth: 2,
  },
  dateDay: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  dateDayActive: {
    color: "#fff",
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  dateNumberActive: {
    color: "#fff",
  },
  dateMonth: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  dateMonthActive: {
    color: "rgba(255,255,255,0.8)",
  },

  // Time Picker
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minWidth: 72,
    alignItems: "center",
  },
  timeSlotActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  timeTextActive: {
    color: "#fff",
  },

  // Notes
  notesInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 80,
    backgroundColor: "#FAFAFA",
  },

  // Summary
  summaryCard: {
    backgroundColor: "#E6FFFA",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B2DFDB",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D9488",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    color: "#333",
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bottomPrice: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: "#999",
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D9488",
  },
  confirmButton: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCC",
  },
  confirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
