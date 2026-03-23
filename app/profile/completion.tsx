/**
 * Profile Completion Checklist — Standalone Screen
 *
 * Deep-link target for workers/professionals to finish their profile.
 * Shows all completion items (required + optional) with direct navigation.
 *
 * @route /profile/completion
 */

import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import {
    buildCompletionState,
    resolveEffectiveRole,
    ROLE_CONFIGS,
} from "@/features/profile/profileConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function CompletionScreen() {
  const { user } = useAuth();
  const { role: appRole } = useRole();

  const effectiveRole = useMemo(
    () => resolveEffectiveRole(user, appRole),
    [user, appRole],
  );
  const config = ROLE_CONFIGS[effectiveRole];
  const completion = useMemo(
    () => buildCompletionState(effectiveRole, user, null),
    [effectiveRole, user],
  );

  const requiredItems = completion.items.filter((i) => i.required);
  const optionalItems = completion.items.filter((i) => !i.required);
  const requiredDone = requiredItems.filter((i) => i.completed).length;
  const optionalDone = optionalItems.filter((i) => i.completed).length;

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
        colors={[config.gradient[0], config.gradient[1]]}
        style={styles.header}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Hoàn thiện hồ sơ</Text>
        <View style={styles.backBtn} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressPercent}>{completion.percentage}%</Text>
            <Text style={styles.progressLabel}>hoàn thành</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${completion.percentage}%`,
                  backgroundColor: completion.isBlocked
                    ? "#F59E0B"
                    : config.accentColor,
                },
              ]}
            />
          </View>
          {completion.isBlocked && (
            <View style={styles.blockedBanner}>
              <Ionicons name="warning-outline" size={16} color="#F59E0B" />
              <Text style={styles.blockedText}>
                {completion.blockedMessage}
              </Text>
            </View>
          )}
        </View>

        {/* Required Items */}
        <Text style={styles.sectionTitle}>
          Bắt buộc ({requiredDone}/{requiredItems.length})
        </Text>
        <View style={styles.sectionCard}>
          {requiredItems.map((item, idx) => (
            <Pressable
              key={item.id}
              style={[styles.checkItem, idx > 0 && styles.checkItemBorder]}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View
                style={[
                  styles.checkCircle,
                  item.completed && {
                    backgroundColor: config.accentColor,
                    borderColor: config.accentColor,
                  },
                ]}
              >
                {item.completed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <View style={styles.checkContent}>
                <Text
                  style={[
                    styles.checkTitle,
                    item.completed && styles.checkTitleDone,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.checkDesc}>{item.description}</Text>
              </View>
              {!item.completed && item.route && (
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Optional Items */}
        {optionalItems.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Tùy chọn ({optionalDone}/{optionalItems.length})
            </Text>
            <View style={styles.sectionCard}>
              {optionalItems.map((item, idx) => (
                <Pressable
                  key={item.id}
                  style={[styles.checkItem, idx > 0 && styles.checkItemBorder]}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View
                    style={[
                      styles.checkCircle,
                      styles.checkCircleOptional,
                      item.completed && {
                        backgroundColor: "#34D399",
                        borderColor: "#34D399",
                      },
                    ]}
                  >
                    {item.completed && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <View style={styles.checkContent}>
                    <Text
                      style={[
                        styles.checkTitle,
                        item.completed && styles.checkTitleDone,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.checkDesc}>{item.description}</Text>
                  </View>
                  {!item.completed && item.route && (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    paddingTop: (StatusBar.currentHeight ?? 44) + 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: "rgba(15,23,42,0.75)",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    gap: 12,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  progressPercent: {
    color: "#F8FAFC",
    fontSize: 32,
    fontWeight: "800",
  },
  progressLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(148,163,184,0.15)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderRadius: 10,
    padding: 10,
  },
  blockedText: {
    color: "#FCD34D",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: "rgba(15,23,42,0.68)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    overflow: "hidden",
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  checkItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.08)",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleOptional: {
    borderColor: "#334155",
    borderStyle: "dashed" as any,
  },
  checkContent: {
    flex: 1,
    gap: 2,
  },
  checkTitle: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
  },
  checkTitleDone: {
    color: "#64748B",
    textDecorationLine: "line-through",
  },
  checkDesc: {
    color: "#64748B",
    fontSize: 12,
  },
});
