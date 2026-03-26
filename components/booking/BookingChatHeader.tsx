/**
 * BookingChatHeader — Compact header shown at the top of chat screen
 * when linked to an active booking. Shows status badge, quick actions.
 */

import { R } from "@/constants/route-registry";
import {
    SERVICE_ORDER_STATUS_META,
    type ServiceOrderStatus,
} from "@/types/service-order";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  bookingId: string;
  workerName: string;
  workerAvatar?: string;
  status: ServiceOrderStatus;
  serviceName?: string;
}

export default function BookingChatHeader({
  bookingId,
  workerName,
  workerAvatar,
  status,
  serviceName,
}: Props) {
  const meta = SERVICE_ORDER_STATUS_META[status];

  const goToOrderDetail = () => {
    router.push({
      pathname: R.SERVICE_BOOKING.DETAIL as any,
      params: { id: bookingId, name: workerName },
    });
  };

  const avatarUrl =
    workerAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(workerName)}&background=0D9488&color=fff&size=64`;

  return (
    <TouchableOpacity
      style={s.container}
      onPress={goToOrderDetail}
      activeOpacity={0.7}
    >
      <Image source={{ uri: avatarUrl }} style={s.avatar} />

      <View style={s.info}>
        <Text style={s.workerName} numberOfLines={1}>
          {workerName}
        </Text>
        {serviceName && (
          <Text style={s.serviceName} numberOfLines={1}>
            {serviceName}
          </Text>
        )}
      </View>

      {/* Status badge */}
      <View style={[s.badge, { backgroundColor: meta.bgColor }]}>
        <Ionicons name={meta.icon as any} size={12} color={meta.color} />
        <Text style={[s.badgeText, { color: meta.color }]}>{meta.label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F0FDFA",
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2F1",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  info: { flex: 1 },
  workerName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  serviceName: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
});
