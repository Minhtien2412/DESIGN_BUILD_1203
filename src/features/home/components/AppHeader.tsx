import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import SearchBar from "./SearchBar";

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
};

export default function AppHeader({
  eyebrow = "APP DESIGN BUILD",
  title,
  subtitle,
  searchPlaceholder,
  onMenuPress,
  onSearchPress,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copyWrap}>
        <View style={styles.eyebrowChip}>
          <AppText variant="overline" color={colors.brandDark}>
            {eyebrow}
          </AppText>
        </View>
        <AppText variant="h1" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="bodySmall" color={colors.textSecondary}>
          {subtitle}
        </AppText>
      </View>

      <View style={styles.searchRow}>
        <SearchBar
          placeholder={searchPlaceholder}
          style={styles.searchBar}
          onPress={onSearchPress}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Ionicons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 12,
  },
  copyWrap: {
    gap: 6,
  },
  eyebrowChip: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
  },
  title: {
    marginTop: 0,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBar: {
    flex: 1,
    ...shadows.soft,
  },
  menuButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
});
