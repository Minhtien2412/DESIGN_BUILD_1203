/**
 * CancelBookingModal — Bottom-sheet modal for cancelling a service order.
 * Uses CANCEL_REASONS from types/service-order.ts.
 * Calls BookingContext.cancelActiveBooking() on confirm.
 */

import { useBooking } from "@/context/BookingContext";
import { CANCEL_REASONS, type CancelReasonId } from "@/types/service-order";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  bookingId: string;
  onClose: () => void;
  onCancelled?: () => void;
}

export default function CancelBookingModal({
  visible,
  bookingId,
  onClose,
  onCancelled,
}: Props) {
  const { cancelActiveBooking } = useBooking();
  const [selectedReason, setSelectedReason] = useState<CancelReasonId | null>(
    null,
  );
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!selectedReason) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn lý do hủy.");
      return;
    }

    setSubmitting(true);
    try {
      await cancelActiveBooking(bookingId);
      onCancelled?.();
      onClose();
    } catch {
      Alert.alert("Lỗi", "Không thể hủy đơn. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSelectedReason(null);
    setCustomReason("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <View />
      </Pressable>

      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        <Text style={s.title}>Hủy dịch vụ</Text>
        <Text style={s.subtitle}>
          Vui lòng cho biết lý do hủy để chúng tôi cải thiện
        </Text>

        {/* Reason list */}
        <View style={s.reasonList}>
          {CANCEL_REASONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[
                s.reasonChip,
                selectedReason === r.id && s.reasonChipActive,
              ]}
              onPress={() => setSelectedReason(r.id as CancelReasonId)}
            >
              <Text
                style={[
                  s.reasonText,
                  selectedReason === r.id && s.reasonTextActive,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedReason === "other" && (
          <TextInput
            style={s.customInput}
            placeholder="Nhập lý do cụ thể..."
            placeholderTextColor="#9CA3AF"
            value={customReason}
            onChangeText={setCustomReason}
            multiline
          />
        )}

        {/* Warning */}
        <View style={s.warningBox}>
          <Ionicons name="warning-outline" size={18} color="#F59E0B" />
          <Text style={s.warningText}>
            Hủy đơn sau khi thợ đã xác nhận có thể bị tính phí hủy.
          </Text>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.keepBtn}
            onPress={() => {
              reset();
              onClose();
            }}
          >
            <Text style={s.keepBtnText}>Giữ đơn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.cancelBtn,
              (!selectedReason || submitting) && s.btnDisabled,
            ]}
            disabled={!selectedReason || submitting}
            onPress={handleCancel}
          >
            <Text style={s.cancelBtnText}>
              {submitting ? "Đang hủy..." : "Xác nhận hủy"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 4, marginBottom: 16 },
  reasonList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  reasonChipActive: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  reasonText: { fontSize: 13, color: "#6B7280" },
  reasonTextActive: { color: "#EF4444", fontWeight: "600" },
  customInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
    marginTop: 12,
    color: "#1F2937",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFFBEB",
    marginTop: 16,
  },
  warningText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 18 },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  keepBtnText: { fontSize: 15, fontWeight: "600", color: "#4B5563" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  btnDisabled: { opacity: 0.5 },
});
