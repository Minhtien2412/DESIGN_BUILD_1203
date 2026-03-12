/**
 * Language Settings Screen
 * Choose app display language — 13 languages supported
 * @route /profile/language
 */

import {
    SUPPORTED_LANGUAGES,
    useI18n,
    type SupportedLanguage,
} from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_H = StatusBar.currentHeight ?? 44;

export default function LanguageScreen() {
  const { language, setLanguage, t } = useI18n();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return SUPPORTED_LANGUAGES;
    const q = search.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.includes(q),
    );
  }, [search]);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <LinearGradient
        colors={["#1E3A5F", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("settings.selectLanguage")}</Text>
          <View style={styles.backBtn}>
            <Ionicons name="sparkles" size={18} color="#FFD700" />
          </View>
        </View>
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder={`${t("common.search")}...`}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={16}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          {t("settings.selectLanguage").toUpperCase()} ({filtered.length})
        </Text>

        <View style={styles.card}>
          {filtered.map((lang, idx) => {
            const isActive = language === lang.code;
            return (
              <View key={lang.code}>
                <TouchableOpacity
                  style={[styles.row, isActive && styles.rowActive]}
                  onPress={() => handleSelect(lang.code)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <View style={styles.rowContent}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[
                          styles.rowTitle,
                          isActive && styles.rowTitleActive,
                        ]}
                      >
                        {lang.nativeName}
                      </Text>
                      {lang.rtl && (
                        <View style={styles.rtlBadge}>
                          <Text style={styles.rtlText}>RTL</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.rowSub}>{lang.name}</Text>
                  </View>
                  {isActive && (
                    <View style={styles.checkWrap}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#0D9488"
                      />
                    </View>
                  )}
                </TouchableOpacity>
                {idx < filtered.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        <Text style={styles.note}>
          {t("settings.language")} — AI Translation Engine.{"\n"}
          Thay đổi ngôn ngữ sẽ áp dụng cho toàn bộ ứng dụng. Một số nội dung có
          thể vẫn hiển thị bằng ngôn ngữ gốc.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: STATUS_H + 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowActive: {
    backgroundColor: "#F0FDFA",
  },
  flag: {
    fontSize: 28,
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  rowTitleActive: {
    color: "#0D9488",
    fontWeight: "700",
  },
  rtlBadge: {
    backgroundColor: "#F59E0B20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rtlText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#F59E0B",
  },
  rowSub: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
  },
  checkWrap: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 58,
  },
  note: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginTop: 16,
    marginHorizontal: 4,
  },
});
