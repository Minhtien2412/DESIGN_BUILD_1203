/**
 * Language Settings Screen
 * Allows users to change the app language
 * @date 2026-01-24
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  useI18n,
} from "@/services/i18nService";

const { width } = Dimensions.get("window");

// Design tokens
const COLORS = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  primary: "#10B981",
  primaryDark: "#059669",
  text: "#0F172A",
  textSecondary: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  success: "#10B981",
};

const SHADOWS = {
  small: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
};

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t } = useI18n();
  const [isChanging, setIsChanging] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);

  const handleSelectLanguage = useCallback(
    async (langCode: SupportedLanguage) => {
      if (langCode === language) return;

      setSelectedLang(langCode);
      setIsChanging(true);

      try {
        await setLanguage(langCode);

        // Show success message
        Alert.alert(t("common.success"), t("success.updated"), [
          { text: t("common.ok"), onPress: () => router.back() },
        ]);
      } catch (error) {
        // Revert selection on error
        setSelectedLang(language);
        Alert.alert(t("common.error"), t("errors.tryAgain"));
      } finally {
        setIsChanging(false);
      }
    },
    [language, setLanguage, t],
  );

  const renderLanguageItem = useCallback(
    ({ item }: { item: (typeof SUPPORTED_LANGUAGES)[0] }) => {
      const isSelected = selectedLang === item.code;
      const isCurrent = language === item.code;

      return (
        <TouchableOpacity
          style={[
            styles.languageItem,
            isSelected && styles.languageItemSelected,
          ]}
          onPress={() => handleSelectLanguage(item.code)}
          disabled={isChanging}
          activeOpacity={0.7}
        >
          <View style={styles.languageFlag}>
            <Text style={styles.flagEmoji}>{item.flag}</Text>
          </View>

          <View style={styles.languageInfo}>
            <Text
              style={[
                styles.languageName,
                isSelected && styles.languageNameSelected,
              ]}
            >
              {item.nativeName}
            </Text>
            <Text style={styles.languageNameEn}>{item.name}</Text>
          </View>

          <View style={styles.languageRight}>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>{t("common.ok")}</Text>
              </View>
            )}

            {isSelected && (
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedLang, language, isChanging, handleSelectLanguage, t],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={[styles.header, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t("settings.selectLanguage")}</Text>

          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      {/* Loading Overlay */}
      {isChanging && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      )}

      {/* Language List */}
      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguageItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Ionicons
              name="globe-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <Text style={styles.listHeaderText}>
              {t("settings.selectLanguage")}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Info Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={COLORS.textLight}
        />
        <Text style={styles.footerText}>
          Ngôn ngữ sẽ được áp dụng cho toàn bộ ứng dụng
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  headerPlaceholder: {
    width: 44,
  },

  // Loading
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  // List
  listContent: {
    padding: 20,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 0,
  },

  // Language Item
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  languageItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "08",
  },
  languageFlag: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  flagEmoji: {
    fontSize: 28,
  },
  languageInfo: {
    flex: 1,
    marginLeft: 14,
  },
  languageName: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  languageNameSelected: {
    color: COLORS.primary,
  },
  languageNameEn: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  languageRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currentBadge: {
    backgroundColor: COLORS.success + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
