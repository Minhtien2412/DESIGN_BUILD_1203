import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import { UserRole } from "@/types/role";

type RoleSwitcherDevOnlyProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

const roleOptions: { label: string; value: UserRole }[] = [
  { label: "Khách hàng", value: "customer" },
  { label: "Thợ", value: "worker" },
  { label: "Nội bộ", value: "internal_manager" },
];

export default function RoleSwitcherDevOnly({
  value,
  onChange,
}: RoleSwitcherDevOnlyProps) {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <AppText variant="micro" color={colors.textSecondary}>
        Dev role switch
      </AppText>
      <View style={styles.row}>
        {roleOptions.map((option) => {
          const isActive = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.85}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onChange(option.value)}
            >
              <AppText
                variant="caption"
                color={isActive ? colors.white : colors.textSecondary}
              >
                {option.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.floating,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  pillActive: {
    backgroundColor: colors.brand,
  },
});
