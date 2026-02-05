/**
 * Language Settings Screen
 * Allow user to change app language
 * @created 04/02/2026
 */

import { BorderRadius, Spacing } from "@/constants/spacing";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SupportedLanguage } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, availableLanguages, t } = useLanguage();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "textMuted");
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");

  const handleLanguageSelect = useCallback(
    async (lang: SupportedLanguage) => {
      await setLanguage(lang);
    },
    [setLanguage],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: t("settings.language"),
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View
          style={[styles.infoCard, { backgroundColor: cardColor, borderColor }]}
        >
          <Ionicons name="language" size={24} color={primaryColor} />
          <Text style={[styles.infoText, { color: mutedColor }]}>
            Chọn ngôn ngữ hiển thị cho ứng dụng. Thay đổi sẽ được áp dụng ngay
            lập tức.
          </Text>
        </View>

        {/* Language Options */}
        <View
          style={[styles.card, { backgroundColor: cardColor, borderColor }]}
        >
          {availableLanguages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                index < availableLanguages.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: borderColor,
                },
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: textColor }]}>
                  {lang.nativeName}
                </Text>
                <Text style={[styles.languageSubtitle, { color: mutedColor }]}>
                  {lang.name}
                </Text>
              </View>

              {language === lang.code && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={primaryColor}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Language Info */}
        <View
          style={[
            styles.currentLanguage,
            { backgroundColor: primaryColor + "15" },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={primaryColor} />
          <Text style={[styles.currentText, { color: primaryColor }]}>
            Ngôn ngữ hiện tại:{" "}
            {availableLanguages.find((l) => l.code === language)?.nativeName}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[4],
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing[4],
    gap: Spacing[3],
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing[4],
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: 13,
  },
  currentLanguage: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    marginTop: Spacing[4],
    gap: Spacing[2],
  },
  currentText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
