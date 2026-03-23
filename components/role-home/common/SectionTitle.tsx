/**
 * SectionTitle — Reusable section header for home screens
 *
 * @created 2026-03-21
 */

import { ROLE_THEME } from "@/constants/roleTheme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function RoleHomeSectionTitle({ title, actionLabel, onAction }: Props) {
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={s.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: ROLE_THEME.fontSize.xl,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
  },
  action: {
    fontSize: ROLE_THEME.fontSize.md,
    color: ROLE_THEME.primary,
    fontWeight: "600",
  },
});
