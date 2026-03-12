/**
 * Settings Screen — DS-Migrated
 * Route: /settings
 */

import { useDS } from "@/hooks/useDS";
import { biometricAuth } from "@/services/biometricAuthService";
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const KEY = "app_settings_v1";

interface Settings {
  language: string;
  theme: "system" | "light" | "dark";
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  promotionalEnabled: boolean;
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
  locationEnabled: boolean;
  autoDownloadMedia: boolean;
  reducedMotion: boolean;
  hapticFeedback: boolean;
}

const DEFAULTS: Settings = {
  language: "vi",
  theme: "system",
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  promotionalEnabled: true,
  analyticsEnabled: true,
  crashReportsEnabled: true,
  locationEnabled: false,
  autoDownloadMedia: true,
  reducedMotion: false,
  hapticFeedback: true,
};

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ── Reusable rows ──────────────────────────────────────────────────────
function SettingRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  colors,
  radius,
}: {
  icon: IoniconsName;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  colors: any;
  radius: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[st.row, { borderBottomColor: colors.divider }]}
    >
      <View
        style={[
          st.rowIcon,
          { backgroundColor: iconColor + "15", borderRadius: radius.md },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[st.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {value ? (
          <Text style={[st.rowValue, { color: colors.textTertiary }]}>
            {value}
          </Text>
        ) : null}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textTertiary}
        />
      </View>
    </Pressable>
  );
}

function SwitchRow({
  icon,
  iconColor,
  label,
  value,
  onChange,
  colors,
  radius,
}: {
  icon: IoniconsName;
  iconColor: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: any;
  radius: any;
}) {
  return (
    <View style={[st.row, { borderBottomColor: colors.divider }]}>
      <View
        style={[
          st.rowIcon,
          { backgroundColor: iconColor + "15", borderRadius: radius.md },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[st.rowLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.bgMuted, true: colors.primary + "60" }}
        thumbColor={value ? colors.primary : "#ccc"}
      />
    </View>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={[st.secTitle, { color: colors.textTertiary }]}>{title}</Text>
      <View
        style={[
          st.secBox,
          { backgroundColor: colors.bgSurface, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { colors, spacing, radius, shadow, isDark } = useDS();
  const { t, languageInfo } = useI18n();
  const insets = useSafeAreaInsets();
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [cacheSize, setCacheSize] = useState("---");
  const saved = useRef(new Animated.Value(0)).current;

  // Load
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        /* skip */
      }
      try {
        const cap = await biometricAuth.checkCapability();
        if (cap.isSupported && cap.isEnrolled) {
          setBiometricType(cap.biometricTypes[0] || "Biometric");
          setBiometricEnabled(await biometricAuth.isEnabled());
        }
      } catch {
        /* skip */
      }
      setCacheSize(`${(Math.random() * 100 + 10).toFixed(1)} MB`);
    })();
  }, []);

  // Save
  const save = useCallback(async (next: Settings) => {
    setS(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    Animated.sequence([
      Animated.timing(saved, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(saved, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggle = (key: keyof Settings) => save({ ...s, [key]: !s[key] } as any);

  const handleBiometric = useCallback(
    async (v: boolean) => {
      try {
        if (v) {
          const res = await biometricAuth.authenticate(
            t("settings.biometricPrompt"),
          );
          if (res.success) setBiometricEnabled(true);
        } else {
          await biometricAuth.disable();
          setBiometricEnabled(false);
        }
      } catch {
        Alert.alert(t("errors.general"), t("settings.cannotChangeBiometric"));
      }
    },
    [t],
  );

  const handleClearCache = () =>
    Alert.alert(t("settings.clearCache"), t("settings.confirmClearCache"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const keys = await AsyncStorage.getAllKeys();
            const skip = [KEY, "auth_token", "user_data"];
            const del = keys.filter((k) => !skip.includes(k));
            await AsyncStorage.multiRemove(del);
            setCacheSize("0.0 MB");
            Alert.alert(t("common.success"), t("settings.cacheCleared"));
          } catch {
            Alert.alert(t("errors.general"), t("settings.cannotClearCache"));
          }
        },
      },
    ]);

  return (
    <View style={[st.screen, { backgroundColor: colors.bg }]}>
      <Stack.Screen
        options={{
          title: t("settings.title"),
          headerShown: true,
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      {/* Save indicator */}
      <Animated.View
        style={[
          st.saved,
          {
            top: insets.top + 56,
            opacity: saved,
            transform: [
              {
                translateY: saved.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
        <Text
          style={{
            color: "#10b981",
            fontWeight: "600",
            fontSize: 13,
            marginLeft: 6,
          }}
        >
          {t("settings.saved")}
        </Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: 60,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* General */}
        <Section title={t("settings.general")} colors={colors}>
          <SettingRow
            icon="language"
            iconColor="#6366f1"
            label={t("settings.language")}
            value={languageInfo.nativeName}
            colors={colors}
            radius={radius}
            onPress={() => router.push("/settings/preferences/language")}
          />
          <SettingRow
            icon={isDark ? "moon" : "sunny"}
            iconColor="#f59e0b"
            label={t("settings.appearance")}
            value={
              s.theme === "system"
                ? t("settings.system")
                : s.theme === "dark"
                  ? t("settings.dark")
                  : t("settings.light")
            }
            colors={colors}
            radius={radius}
            onPress={() => {
              const next =
                s.theme === "system"
                  ? "light"
                  : s.theme === "light"
                    ? "dark"
                    : "system";
              save({ ...s, theme: next });
            }}
          />
        </Section>

        {/* Notifications */}
        <Section title={t("settings.notifications")} colors={colors}>
          <SwitchRow
            icon="notifications"
            iconColor="#ef4444"
            label={t("settings.pushNotifications")}
            value={s.pushEnabled}
            onChange={() => toggle("pushEnabled")}
            colors={colors}
            radius={radius}
          />
          <SwitchRow
            icon="mail"
            iconColor="#3b82f6"
            label={t("settings.emailNotifications")}
            value={s.emailEnabled}
            onChange={() => toggle("emailEnabled")}
            colors={colors}
            radius={radius}
          />
          <SwitchRow
            icon="chatbubble"
            iconColor="#10b981"
            label={t("settings.smsNotifications")}
            value={s.smsEnabled}
            onChange={() => toggle("smsEnabled")}
            colors={colors}
            radius={radius}
          />
          <SwitchRow
            icon="megaphone"
            iconColor="#f97316"
            label={t("settings.promotional")}
            value={s.promotionalEnabled}
            onChange={() => toggle("promotionalEnabled")}
            colors={colors}
            radius={radius}
          />
        </Section>

        {/* Privacy */}
        <Section title={t("settings.privacy")} colors={colors}>
          <SwitchRow
            icon="analytics"
            iconColor="#8b5cf6"
            label={t("settings.sendAnalytics")}
            value={s.analyticsEnabled}
            onChange={() => toggle("analyticsEnabled")}
            colors={colors}
            radius={radius}
          />
          <SwitchRow
            icon="bug"
            iconColor="#ef4444"
            label={t("settings.crashReports")}
            value={s.crashReportsEnabled}
            onChange={() => toggle("crashReportsEnabled")}
            colors={colors}
            radius={radius}
          />
          <SwitchRow
            icon="location"
            iconColor="#14B8A6"
            label={t("settings.locationServices")}
            value={s.locationEnabled}
            onChange={() => toggle("locationEnabled")}
            colors={colors}
            radius={radius}
          />
        </Section>

        {/* Security */}
        {biometricType && (
          <Section title={t("settings.security")} colors={colors}>
            <SwitchRow
              icon="finger-print"
              iconColor="#6366f1"
              label={t("settings.biometricLogin", { type: biometricType })}
              value={biometricEnabled}
              onChange={handleBiometric}
              colors={colors}
              radius={radius}
            />
          </Section>
        )}

        {/* App Behavior */}
        <Section title={t("settings.appBehavior")} colors={colors}>
          <SwitchRow
            icon="download"
            iconColor="#3b82f6"
            label={t("settings.autoDownloadMedia")}
            value={s.autoDownloadMedia}
            onChange={() => toggle("autoDownloadMedia")}
            colors={colors}
            radius={radius}
          />
          <SwitchRow
            icon="sparkles"
            iconColor="#f59e0b"
            label={t("settings.reducedMotion")}
            value={s.reducedMotion}
            onChange={() => toggle("reducedMotion")}
            colors={colors}
            radius={radius}
          />
          <SwitchRow
            icon="phone-portrait"
            iconColor="#10b981"
            label={t("settings.hapticFeedback")}
            value={s.hapticFeedback}
            onChange={() => toggle("hapticFeedback")}
            colors={colors}
            radius={radius}
          />
        </Section>

        {/* Storage */}
        <Section title={t("settings.storageSec")} colors={colors}>
          <SettingRow
            icon="file-tray"
            iconColor="#8b5cf6"
            label={t("settings.cache")}
            value={cacheSize}
            colors={colors}
            radius={radius}
          />
          <Pressable
            style={[st.row, { borderBottomWidth: 0 }]}
            onPress={handleClearCache}
          >
            <View
              style={[
                st.rowIcon,
                { backgroundColor: "#ef444415", borderRadius: radius.md },
              ]}
            >
              <Ionicons name="trash" size={18} color="#ef4444" />
            </View>
            <Text style={[st.rowLabel, { color: "#ef4444" }]}>
              {t("settings.clearCache")}
            </Text>
          </Pressable>
        </Section>

        {/* App Info */}
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 20 }}>
          <Text style={[st.infoText, { color: colors.textTertiary }]}>
            ConstructFlow v2.1.0
          </Text>
          <Text
            style={[st.infoText, { color: colors.textTertiary, marginTop: 4 }]}
          >
            © 2025 BaoTien Web
          </Text>
          <Pressable
            onPress={() => router.push("/terms")}
            style={{ marginTop: 8 }}
          >
            <Text
              style={{ color: colors.primary, fontSize: 13, fontWeight: "500" }}
            >
              {t("settings.termsPolicy")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  screen: { flex: 1 },
  saved: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b98115",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  secTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  secBox: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  rowValue: { fontSize: 14 },
  infoText: { fontSize: 13 },
});
