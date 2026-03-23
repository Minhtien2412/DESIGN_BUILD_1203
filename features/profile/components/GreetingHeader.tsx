/**
 * GreetingHeader — Time + role-aware greeting
 */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { GreetingData } from "../types";

interface Props {
  greeting: GreetingData;
}

export default function GreetingHeader({ greeting }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.timeGreeting}>{greeting.timeGreeting} 👋</Text>
      <Text style={styles.userName}>{greeting.userName}</Text>
      <View style={styles.subtitleRow}>
        <Ionicons
          name={greeting.roleBadgeIcon as any}
          size={14}
          color={greeting.roleBadgeColor}
        />
        <Text style={[styles.subtitle, { color: greeting.roleBadgeColor }]}>
          {greeting.roleSubtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingBottom: 4,
    gap: 2,
  },
  timeGreeting: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  userName: {
    color: "#F8FAFC",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
});
