/**
 * QuickActionsRow — 4-item shortcut row
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { QuickAction } from "../types";

interface Props {
  actions: QuickAction[];
}

export default function QuickActionsRow({ actions }: Props) {
  if (actions.length === 0) return null;

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          style={styles.item}
          onPress={() => router.push(action.route as any)}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: action.color + "18" },
            ]}
          >
            <Ionicons
              name={action.icon as any}
              size={22}
              color={action.color}
            />
            {action.badge != null && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{action.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {action.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "rgba(15,23,42,0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    borderRadius: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeDot: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
  },
  label: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
