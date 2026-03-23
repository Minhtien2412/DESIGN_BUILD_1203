/**
 * CompletionChecklist — Worker/professional mandatory profile completion
 * Shows progress bar, missing items, and blocked state warning
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CompletionState } from "../types";

interface Props {
  completion: CompletionState;
  accentColor: string;
}

export default function CompletionChecklist({
  completion,
  accentColor,
}: Props) {
  if (completion.total === 0) return null;

  const isComplete = completion.percentage >= 100;

  return (
    <View style={[styles.card, completion.isBlocked && styles.blockedCard]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={isComplete ? "checkmark-circle" : "alert-circle"}
            size={20}
            color={isComplete ? "#34D399" : "#FBBF24"}
          />
          <Text style={styles.headerTitle}>
            {isComplete ? "Hồ sơ hoàn thiện" : "Hoàn thiện hồ sơ"}
          </Text>
        </View>
        <Text
          style={[
            styles.percentText,
            { color: isComplete ? "#34D399" : accentColor },
          ]}
        >
          {completion.percentage}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(completion.percentage, 100)}%` as any,
              backgroundColor: isComplete ? "#34D399" : accentColor,
            },
          ]}
        />
      </View>

      {/* Blocked Warning */}
      {completion.isBlocked && completion.blockedMessage && (
        <View style={styles.warningRow}>
          <Ionicons name="warning-outline" size={14} color="#FBBF24" />
          <Text style={styles.warningText}>{completion.blockedMessage}</Text>
        </View>
      )}

      {/* Missing Items (only show incomplete) */}
      {!isComplete && (
        <View style={styles.itemsList}>
          {completion.items
            .filter((item) => !item.completed)
            .slice(0, 5)
            .map((item) => (
              <Pressable
                key={item.id}
                style={styles.itemRow}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View
                  style={[
                    styles.itemIcon,
                    {
                      backgroundColor: item.required
                        ? "rgba(251,191,36,0.15)"
                        : "rgba(148,163,184,0.10)",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={14}
                    color={item.required ? "#FBBF24" : "#94A3B8"}
                  />
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemLabel}>
                    {item.label}
                    {item.required && (
                      <Text style={styles.requiredMark}> *</Text>
                    )}
                  </Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#475569" />
              </Pressable>
            ))}
        </View>
      )}

      {/* CTA */}
      {!isComplete && (
        <Pressable
          style={[styles.ctaBtn, { backgroundColor: accentColor }]}
          onPress={() => router.push("/profile/info" as any)}
        >
          <Ionicons name="create-outline" size={16} color="#FFF" />
          <Text style={styles.ctaText}>Hoàn thiện hồ sơ</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(15,23,42,0.75)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  blockedCard: {
    borderColor: "rgba(251,191,36,0.35)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "700",
  },
  percentText: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(148,163,184,0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(251,191,36,0.10)",
    borderRadius: 10,
    padding: 10,
  },
  warningText: {
    flex: 1,
    color: "#FDE68A",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  itemsList: {
    gap: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(30,41,59,0.65)",
    borderRadius: 12,
    padding: 10,
  },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    gap: 1,
  },
  itemLabel: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
  },
  requiredMark: {
    color: "#F87171",
    fontWeight: "800",
  },
  itemDesc: {
    color: "#64748B",
    fontSize: 11,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 2,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
