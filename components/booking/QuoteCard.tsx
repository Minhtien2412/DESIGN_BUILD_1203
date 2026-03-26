/**
 * QuoteCard — Displays a worker's quote/price proposal for a service order.
 * Status: quoted → awaiting_customer_confirmation → confirmed
 *
 * Used inside:
 *   - service-booking/agreement.tsx
 *   - service-booking/[id].tsx (cost tab)
 *   - AI assistant chat (inline quote block)
 */

import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface QuoteData {
  quoteId: string;
  workerName: string;
  workerAvatar?: string;
  workerRating?: number;
  laborCost: number; // nhân công
  materialCost: number; // vật tư (có thể 0)
  transportCost: number; // di chuyển
  discount?: number; // giảm giá (có thể 0)
  notes?: string; // ghi chú từ thợ
  validUntil?: string; // ISO date — hạn chấp nhận
  estimatedHours?: number;
}

interface Props {
  quote: QuoteData;
  onAccept?: () => void;
  onReject?: () => void;
  onChat?: () => void;
  /** read-only mode hides action buttons */
  readonly?: boolean;
}

export default function QuoteCard({
  quote,
  onAccept,
  onReject,
  onChat,
  readonly = false,
}: Props) {
  const total =
    quote.laborCost +
    quote.materialCost +
    quote.transportCost -
    (quote.discount || 0);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const avatarUrl =
    quote.workerAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(quote.workerName)}&background=0D9488&color=fff&size=80`;

  return (
    <View style={s.container}>
      {/* Worker header */}
      <View style={s.headerRow}>
        <Image source={{ uri: avatarUrl }} style={s.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={s.workerName}>{quote.workerName}</Text>
          {quote.workerRating != null && (
            <View style={s.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={s.ratingText}>{quote.workerRating}</Text>
            </View>
          )}
        </View>
        {onChat && (
          <TouchableOpacity style={s.chatBtn} onPress={onChat}>
            <Ionicons name="chatbubble-outline" size={18} color="#0D9488" />
          </TouchableOpacity>
        )}
      </View>

      {/* Price breakdown */}
      <View style={s.breakdown}>
        <Row label="Nhân công" value={fmt(quote.laborCost)} />
        {quote.materialCost > 0 && (
          <Row label="Vật tư" value={fmt(quote.materialCost)} />
        )}
        {quote.transportCost > 0 && (
          <Row label="Di chuyển" value={fmt(quote.transportCost)} />
        )}
        {(quote.discount ?? 0) > 0 && (
          <Row
            label="Giảm giá"
            value={`-${fmt(quote.discount!)}`}
            color="#10B981"
          />
        )}
        <View style={s.divider} />
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Tổng cộng</Text>
          <Text style={s.totalValue}>{fmt(total)}</Text>
        </View>
      </View>

      {quote.estimatedHours != null && (
        <View style={s.infoRow}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={s.infoText}>
            Thời gian ước tính: ~{quote.estimatedHours} giờ
          </Text>
        </View>
      )}

      {quote.notes ? (
        <View style={s.infoRow}>
          <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
          <Text style={s.infoText}>{quote.notes}</Text>
        </View>
      ) : null}

      {quote.validUntil && (
        <Text style={s.validText}>
          Hạn chấp nhận:{" "}
          {new Date(quote.validUntil).toLocaleDateString("vi-VN")}
        </Text>
      )}

      {/* Actions */}
      {!readonly && (
        <View style={s.actions}>
          {onReject && (
            <TouchableOpacity style={s.rejectBtn} onPress={onReject}>
              <Text style={s.rejectText}>Từ chối</Text>
            </TouchableOpacity>
          )}
          {onAccept && (
            <TouchableOpacity style={s.acceptBtn} onPress={onAccept}>
              <Text style={s.acceptText}>Chấp nhận báo giá</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, color ? { color } : undefined]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  workerName: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  ratingText: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  chatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  breakdown: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rowLabel: { fontSize: 13, color: "#6B7280" },
  rowValue: { fontSize: 13, fontWeight: "500", color: "#1F2937" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#FF6B35" },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  infoText: { flex: 1, fontSize: 12, color: "#6B7280", lineHeight: 18 },
  validText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "right",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  rejectText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  acceptBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0D9488",
    alignItems: "center",
  },
  acceptText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
