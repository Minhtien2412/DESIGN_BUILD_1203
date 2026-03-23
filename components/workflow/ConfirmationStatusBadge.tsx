/**
 * ConfirmationStatusBadge — Displays verification status with color coding
 */
import {
    VERIFICATION_STATUS_COLORS,
    VERIFICATION_STATUS_LABELS,
    type VerificationStatus,
} from "@/types/workflow";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  status: VerificationStatus;
  size?: "sm" | "md";
}

export const ConfirmationStatusBadge = memo<Props>(
  ({ status, size = "sm" }) => {
    const color = VERIFICATION_STATUS_COLORS[status];
    const label = VERIFICATION_STATUS_LABELS[status];
    const isSmall = size === "sm";

    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: `${color}18` },
          isSmall && styles.badgeSm,
        ]}
      >
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.text, { color }, isSmall && styles.textSm]}>
          {label}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  textSm: {
    fontSize: 10,
  },
});
