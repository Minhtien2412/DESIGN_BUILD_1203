import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { spacing } from "../../shared/theme/spacing";
import SearchPill from "./SearchPill";

type SectionTitleProps = {
  title: string;
  actionLabel?: string;
  searchPillLabel?: string;
  titleColor?: string;
  onActionPress?: () => void;
};

export default function SectionTitle({
  title,
  actionLabel,
  searchPillLabel,
  titleColor = colors.text,
  onActionPress,
}: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <AppText variant="h3" color={titleColor} style={styles.title}>
        {title}
      </AppText>
      <View style={styles.rightWrap}>
        {searchPillLabel ? <SearchPill label={searchPillLabel} /> : null}
        {actionLabel ? (
          <TouchableOpacity activeOpacity={0.8} onPress={onActionPress}>
            <AppText variant="caption" color={colors.brand}>
              {actionLabel}
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
  },
  rightWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
