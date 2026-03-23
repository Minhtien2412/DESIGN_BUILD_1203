import { APP_ROUTES } from "@/constants/typed-routes";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import {
    ScrollView,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

import AppContainer from "../../shared/components/AppContainer";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";

type DetailScreenScaffoldProps = {
  title: string;
  subtitle?: string;
  roleLabel?: string;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
  fallbackHref?: Href;
};

export default function DetailScreenScaffold({
  title,
  subtitle,
  roleLabel,
  children,
  contentContainerStyle,
  footer,
  fallbackHref,
}: DetailScreenScaffoldProps) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    // @ts-ignore — Href union (2835+ routes) exceeds TS complexity limit in root tsconfig
    router.replace(fallbackHref ?? APP_ROUTES.HOME);
  };

  return (
    <AppContainer>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <AppText variant="h2" numberOfLines={1}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="bodySmall" color={colors.textSecondary}>
                {subtitle}
              </AppText>
            ) : null}
          </View>

          {roleLabel ? (
            <View style={styles.roleChip}>
              <AppText variant="micro" color={colors.brandDark}>
                {roleLabel}
              </AppText>
            </View>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      >
        {children}
      </ScrollView>

      {footer}
    </AppContainer>
  );
}

export function DetailSectionCard({
  title,
  children,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      {title ? <AppText variant="h3">{title}</AppText> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.soft,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  roleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
  },
  headerSpacer: {
    width: 42,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card,
  },
});
