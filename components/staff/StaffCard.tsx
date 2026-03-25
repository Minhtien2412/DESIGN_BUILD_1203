/**
 * StaffCard — Card component for staff list items
 */

import RoleBadge from "@/components/staff/RoleBadge";
import StatusBadge from "@/components/staff/StatusBadge";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { StaffMemberFull } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StaffCardProps {
  staff: StaffMemberFull;
  onPress: () => void;
}

export default function StaffCard({ staff, onPress }: StaffCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const initials = (staff.first_name?.[0] ?? "") + (staff.last_name?.[0] ?? "");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {/* Avatar */}
        {staff.avatar ? (
          <Image source={{ uri: staff.avatar }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {initials.toUpperCase() || "?"}
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {staff.full_name}
          </Text>

          {staff.job_title ? (
            <Text
              style={[styles.subtitle, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {staff.job_title}
            </Text>
          ) : null}

          <Text
            style={[styles.meta, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {staff.email}
          </Text>

          {/* Badges */}
          <View style={styles.badges}>
            <RoleBadge role={staff.role} size="sm" />
            <StatusBadge status={staff.status} size="sm" />
          </View>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      {/* Bottom meta row */}
      <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
        {staff.department?.name ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text
              style={[styles.metaText, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {staff.department.name}
            </Text>
          </View>
        ) : null}

        {staff.team?.name ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="people-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text
              style={[styles.metaText, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {staff.team.name}
            </Text>
          </View>
        ) : null}

        {staff.staff_code ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="barcode-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {staff.staff_code}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  meta: {
    fontSize: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
    flexWrap: "wrap",
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
});
