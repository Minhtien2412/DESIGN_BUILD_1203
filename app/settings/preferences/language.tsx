/**
 * Language Settings Screen — Enhanced with AI Translation
 * 13 languages + search + auto-detect + AI translate indicator
 * @date 2026-01-24
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    getDeviceLanguage,
    SUPPORTED_LANGUAGES,
    SupportedLanguage,
    useI18n,
    type LanguageInfo,
} from "@/services/i18nService";

// ==================== DESIGN TOKENS ====================

const C = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  primary: "#0D9488",
  primaryDark: "#0F766E",
  accent: "#6366F1",
  text: "#0F172A",
  sub: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",
  green: "#10B981",
  orange: "#F59E0B",
  red: "#EF4444",
};

// ==================== COMPONENT ====================

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t } = useI18n();
  const [isChanging, setIsChanging] = useState(false);
  const [search, setSearch] = useState("");

  const deviceLang = useMemo(() => getDeviceLanguage(), []);

  // Filter languages by search
  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return SUPPORTED_LANGUAGES;
    const q = search.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.includes(q),
    );
  }, [search]);

  const handleSelectLanguage = useCallback(
    async (langCode: SupportedLanguage) => {
      if (langCode === language) return;

      setIsChanging(true);
      try {
        await setLanguage(langCode);
        Alert.alert(t("common.success"), t("success.updated"), [
          { text: t("common.ok"), onPress: () => router.back() },
        ]);
      } catch {
        Alert.alert(t("common.error"), t("errors.tryAgain"));
      } finally {
        setIsChanging(false);
      }
    },
    [language, setLanguage, t],
  );

  const handleAutoDetect = useCallback(() => {
    const detected = deviceLang;
    if (detected !== language) {
      handleSelectLanguage(detected);
    } else {
      Alert.alert(t("settings.language"), `${t("settings.languageCurrent")} ✓`);
    }
  }, [deviceLang, language, handleSelectLanguage, t]);

  const renderLanguageItem = useCallback(
    ({ item }: { item: LanguageInfo }) => {
      const isActive = language === item.code;
      const isDevice = item.code === deviceLang;

      return (
        <TouchableOpacity
          style={[styles.card, isActive && styles.cardActive]}
          onPress={() => handleSelectLanguage(item.code)}
          disabled={isChanging}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{item.flag}</Text>

          <View style={styles.cardBody}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.nativeName, isActive && styles.textActive]}
                numberOfLines={1}
              >
                {item.nativeName}
              </Text>
              {isDevice && (
                <View style={styles.deviceBadge}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={10}
                    color={C.accent}
                  />
                  <Text style={styles.deviceBadgeText}>Device</Text>
                </View>
              )}
              {item.rtl && (
                <View style={styles.rtlBadge}>
                  <Text style={styles.rtlBadgeText}>RTL</Text>
                </View>
              )}
            </View>
            <Text style={styles.engName}>{item.name}</Text>
          </View>

          {isActive ? (
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={16} color={C.white} />
            </View>
          ) : (
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [language, deviceLang, isChanging, handleSelectLanguage],
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
        colors={["#1E3A5F", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t("settings.selectLanguage")}
            </Text>
            <Text style={styles.headerSub}>
              {SUPPORTED_LANGUAGES.length}{" "}
              {t("settings.language").toLowerCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.aiBtn} onPress={handleAutoDetect}>
            <Ionicons name="sparkles" size={18} color="#FFD700" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
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
                size={18}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Loading Overlay */}
      {isChanging && (
        <View style={styles.overlay}>
          <View style={styles.overlayBox}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.overlayText}>{t("common.loading")}</Text>
          </View>
        </View>
      )}

      {/* Current Language Banner */}
      <View style={styles.currentBanner}>
        <View style={styles.currentLeft}>
          <Text style={styles.currentFlag}>
            {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.flag}
          </Text>
          <View>
            <Text style={styles.currentLabel}>
              {t("settings.languageCurrent")}
            </Text>
            <Text style={styles.currentName}>
              {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName}
            </Text>
          </View>
        </View>
        <Ionicons name="checkmark-circle" size={24} color={C.green} />
      </View>

      {/* Language List */}
      <FlatList
        data={filteredLanguages}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguageItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color={C.muted} />
            <Text style={styles.emptyText}>{t("common.noResults")}</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerWrap}>
            <View style={styles.aiInfoCard}>
              <LinearGradient
                colors={["#6366F110", "#8B5CF610"]}
                style={styles.aiInfoGradient}
              >
                <View style={styles.aiInfoRow}>
                  <Ionicons name="sparkles" size={20} color={C.accent} />
                  <Text style={styles.aiInfoTitle}>AI Translation</Text>
                </View>
                <Text style={styles.aiInfoDesc}>
                  Ứng dụng sử dụng AI để dịch tự động nội dung sang 13 ngôn ngữ
                  phổ biến. Bản dịch được lưu cache để sử dụng offline.
                </Text>
              </LinearGradient>
            </View>
            <View style={{ height: insets.bottom + 20 }} />
          </View>
        }
      />
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { paddingBottom: 16, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  aiBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    height: 42,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, marginLeft: 8 },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  overlayBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  overlayText: { marginTop: 12, fontSize: 15, color: C.sub },

  // Current Banner
  currentBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: C.green + "0D",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.green + "30",
  },
  currentLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  currentFlag: { fontSize: 28 },
  currentLabel: {
    fontSize: 11,
    color: C.green,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  currentName: { fontSize: 15, fontWeight: "700", color: C.text, marginTop: 1 },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  cardActive: {
    borderColor: C.primary,
    backgroundColor: C.primary + "08",
    borderWidth: 2,
  },
  flag: { fontSize: 30, marginRight: 12 },
  cardBody: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nativeName: { fontSize: 16, fontWeight: "600", color: C.text },
  textActive: { color: C.primary },
  engName: { fontSize: 13, color: C.sub, marginTop: 2 },

  // Badges
  deviceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.accent + "12",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deviceBadgeText: { fontSize: 10, fontWeight: "600", color: C.accent },
  rtlBadge: {
    backgroundColor: C.orange + "15",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rtlBadgeText: { fontSize: 10, fontWeight: "600", color: C.orange },

  // Radio / Check
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 0, height: 0 },

  // Empty
  emptyWrap: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 15, color: C.muted, marginTop: 12 },

  // Footer
  footerWrap: { paddingTop: 8 },
  aiInfoCard: { borderRadius: 14, overflow: "hidden", marginBottom: 8 },
  aiInfoGradient: { padding: 16 },
  aiInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiInfoTitle: { fontSize: 15, fontWeight: "700", color: C.accent },
  aiInfoDesc: { fontSize: 13, color: C.sub, lineHeight: 19 },
});
