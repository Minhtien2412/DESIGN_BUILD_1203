/**
 * VerificationTimeline — Visual audit trail of confirmation steps
 */
import type { AuditItem } from "@/types/workflow";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  items: AuditItem[];
}

const METHOD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  biometric_face: "scan-outline",
  biometric_fingerprint: "finger-print-outline",
  manual_signature: "pencil-outline",
  photo_confirmation: "camera-outline",
};

const METHOD_LABELS: Record<string, string> = {
  biometric_face: "Xác thực khuôn mặt",
  biometric_fingerprint: "Xác thực vân tay",
  manual_signature: "Chữ ký",
  photo_confirmation: "Ảnh xác nhận",
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const VerificationTimeline = memo<Props>(({ items }) => {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="time-outline" size={24} color="#D1D5DB" />
        <Text style={styles.emptyText}>Chưa có hoạt động xác nhận</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isSuccess = item.status === "confirmed";
        const dotColor = isSuccess
          ? "#10B981"
          : item.status === "rejected"
            ? "#EF4444"
            : "#F59E0B";
        const icon = METHOD_ICONS[item.method] || "checkmark-outline";

        return (
          <View key={item.id} style={styles.row}>
            {/* timeline rail */}
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* content */}
            <View style={styles.content}>
              <View style={styles.header}>
                <Ionicons name={icon} size={14} color="#6B7280" />
                <Text style={styles.method}>
                  {METHOD_LABELS[item.method] || item.method}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isSuccess
                        ? "#D1FAE5"
                        : item.status === "rejected"
                          ? "#FEE2E2"
                          : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: isSuccess
                          ? "#065F46"
                          : item.status === "rejected"
                            ? "#991B1B"
                            : "#92400E",
                      },
                    ]}
                  >
                    {isSuccess
                      ? "Đã xác nhận"
                      : item.status === "rejected"
                        ? "Từ chối"
                        : "Chờ xử lý"}
                  </Text>
                </View>
              </View>

              <Text style={styles.actor}>{item.actorName}</Text>
              <Text style={styles.ts}>{formatTimestamp(item.timestamp)}</Text>

              {item.note && <Text style={styles.note}>{item.note}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingLeft: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rail: {
    alignItems: "center",
    width: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 2,
    marginBottom: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 16,
    gap: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  method: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actor: {
    fontSize: 12,
    color: "#6B7280",
  },
  ts: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  note: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});
