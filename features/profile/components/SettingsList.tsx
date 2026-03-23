/**
 * SettingsList — Role-aware settings sections
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { SettingsSection } from "../types";

interface Props {
  sections: SettingsSection[];
  onLogout: () => void;
}

export default function SettingsList({ sections, onLogout }: Props) {
  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, idx) => (
              <Pressable
                key={item.id}
                style={[styles.item, idx > 0 && styles.itemBorder]}
                onPress={() => {
                  if (item.action) item.action();
                  else if (item.route) router.push(item.route as any);
                }}
                disabled={!!item.showSwitch}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: item.iconColor + "18" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={17}
                    color={item.iconColor}
                  />
                </View>
                <Text
                  style={[
                    styles.itemTitle,
                    item.destructive && styles.destructiveText,
                  ]}
                >
                  {item.title}
                </Text>
                {item.showSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{ false: "#334155", true: "#34D39940" }}
                    thumbColor={item.switchValue ? "#34D399" : "#94A3B8"}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="#475569" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#FCA5A5" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: "rgba(15,23,42,0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    borderRadius: 16,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.08)",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
  },
  destructiveText: {
    color: "#FCA5A5",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.10)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.20)",
  },
  logoutText: {
    color: "#FCA5A5",
    fontWeight: "700",
    fontSize: 14,
  },
});
