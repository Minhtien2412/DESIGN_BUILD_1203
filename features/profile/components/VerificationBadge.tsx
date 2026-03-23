/**
 * VerificationBadge — Inline verification status indicator
 */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { VerificationState } from "../types";

interface Props {
  verification: VerificationState;
  compact?: boolean;
}

export default function VerificationBadge({ verification, compact }: Props) {
  if (compact) {
    return (
      <View
        style={[
          styles.compactBadge,
          { borderColor: verification.badgeColor + "40" },
        ]}
      >
        <Ionicons
          name={
            verification.level === "full"
              ? "shield-checkmark"
              : "shield-outline"
          }
          size={12}
          color={verification.badgeColor}
        />
        <Text style={[styles.compactText, { color: verification.badgeColor }]}>
          {verification.badgeText}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Xác minh danh tính</Text>
      <View style={styles.itemsGrid}>
        <VerifyItem label="Email" done={verification.emailVerified} />
        <VerifyItem label="Điện thoại" done={verification.phoneVerified} />
        <VerifyItem label="CCCD" done={verification.idVerified} />
        <VerifyItem
          label="Chứng chỉ"
          done={verification.certificatesVerified}
        />
      </View>
    </View>
  );
}

function VerifyItem({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.item}>
      <Ionicons
        name={done ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={done ? "#34D399" : "#475569"}
      />
      <Text style={[styles.itemLabel, done && styles.itemDone]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  compactText: {
    fontSize: 10,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "700",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "46%" as any,
  },
  itemLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDone: {
    color: "#E2E8F0",
  },
});
