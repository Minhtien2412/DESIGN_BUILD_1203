/**
 * StatCardsGrid — 2-column role-based KPI cards
 */

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StatCardItem } from "../types";

interface Props {
  stats: StatCardItem[];
}

export default function StatCardsGrid({ stats }: Props) {
  if (stats.length === 0) return null;

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <Pressable
          key={stat.id}
          style={styles.card}
          onPress={stat.onPress}
          disabled={!stat.onPress}
        >
          <View
            style={[styles.iconWrap, { backgroundColor: stat.color + "18" }]}
          >
            <Ionicons name={stat.icon as any} size={18} color={stat.color} />
          </View>
          <Text style={styles.value} numberOfLines={1}>
            {stat.value}
            {stat.suffix ? (
              <Text style={styles.suffix}>{stat.suffix}</Text>
            ) : null}
          </Text>
          <Text style={styles.label} numberOfLines={1}>
            {stat.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "47.5%" as any,
    backgroundColor: "rgba(15,23,42,0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    borderRadius: 16,
    padding: 14,
    gap: 6,
    flexGrow: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  suffix: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  label: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
});
