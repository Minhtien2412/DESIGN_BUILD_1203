/**
 * FindWorkerBanner (Contractor variant) — CTA banner themed for Nhà thầu
 *
 * Two actions:
 *  1. "Xem danh sách thợ" → /find-workers
 *  2. "Tìm trên bản đồ" → /service-booking/worker-map
 *
 * Uses teal (#0D9488) accent to match contractor palette.
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
            <Text style={s.title}>TÌM THỢ CHO DỰ ÁN</Text>
            <Text style={s.subtitle}>
              Tìm thợ lành nghề, đội thi công — bổ sung nhân lực nhanh chóng
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
            <Ionicons name="map-outline" size={16} color="#0D9488" />
            <Text style={s.btnSecondaryText}>Tìm trên bản đồ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  card: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
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
    backgroundColor: "#0D9488",
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
    backgroundColor: "#0D9488",
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
    gap: 6,
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D9488",
  },
});
