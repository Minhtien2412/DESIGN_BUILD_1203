import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { spacing } from "../../shared/theme/spacing";

type SearchPillProps = {
  label: string;
};

export default function SearchPill({ label }: SearchPillProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={14} color={colors.brandDark} />
      <AppText variant="caption" color={colors.brandDark}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
  },
});
