/**
 * FindWorkerBanner — CTA banner for Customer to find workers
 *
 * Two actions:
 *  1. "Xem danh sách thợ" → /find-workers (landing page with categories)
 *  2. "Tìm thợ trên bản đồ" → /service-booking/worker-map (Grab-style map)
 */
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onFindWorkerList?: () => void;
  onFindWorkerMap?: () => void;
}

export function FindWorkerBanner({ onFindWorkerList, onFindWorkerMap }: Props) {
  return (
    <View style={s.container}>
      <View style={s.card}>
        {/* Header row */}
        <View style={s.headerRow}>
          <View style={s.iconCircle}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
          </View>
          <View style={s.headerText}>
            <Text style={s.title}>TÌM THỢ GẦN BẠN</Text>
            <Text style={s.subtitle}>
              Thợ sơn, thợ điện, thợ nước, thợ xây — đặt nhanh trong vài phút
            </Text>
          </View>
        </View>

        {/* Two action buttons */}
        <View style={s.actionsRow}>
          <TouchableOpacity
            style={s.btnPrimary}
            activeOpacity={0.8}
            onPress={onFindWorkerList}
          >
            <Ionicons name="list-outline" size={16} color="#FFFFFF" />
            <Text style={s.btnPrimaryText}>Xem danh sách thợ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnSecondary}
            activeOpacity={0.8}
            onPress={onFindWorkerMap}
          >
            <Ionicons name="map-outline" size={16} color="#90B44C" />
            <Text style={s.btnSecondaryText}>Tìm trên bản đồ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  card: {
    backgroundColor: "#F4F9EC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0EDCC",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#90B44C",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#90B44C",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  btnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#90B44C",
    gap: 6,
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#90B44C",
  },
});
