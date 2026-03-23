/**
 * ProfileHeroCard — Avatar, name, role badge, verification
 */

import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { RoleProfileConfig, VerificationState } from "../types";

interface Props {
  name: string;
  phone?: string;
  email?: string;
  avatarUri?: string;
  config: RoleProfileConfig;
  verification: VerificationState;
  onEditPress?: () => void;
}

export default function ProfileHeroCard({
  name,
  phone,
  email,
  avatarUri,
  config,
  verification,
  onEditPress,
}: Props) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  return (
    <View style={[styles.card, { borderColor: config.accentColor + "30" }]}>
      <View style={styles.row}>
        {/* Avatar */}
        <View
          style={[
            styles.avatarWrap,
            { borderColor: config.accentColor + "50" },
          ]}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: config.accentColor + "30" },
              ]}
            >
              <Text style={[styles.avatarText, { color: config.accentColor }]}>
                {initial}
              </Text>
            </View>
          )}
          {verification.level === "full" && (
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.contact}>
            {phone || email || "Chưa cập nhật"}
          </Text>

          {/* Role Badge */}
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: config.badgeBgColor,
                borderColor: config.badgeColor + "40",
              },
            ]}
          >
            <Ionicons
              name={config.icon as any}
              size={11}
              color={config.badgeColor}
            />
            <Text style={[styles.roleBadgeText, { color: config.badgeColor }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* Edit */}
        {onEditPress && (
          <Pressable onPress={onEditPress} style={styles.editBtn} hitSlop={12}>
            <Ionicons name="create-outline" size={18} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {/* Verification Status */}
      <View style={styles.verificationRow}>
        <Ionicons
          name={
            verification.level === "full"
              ? "shield-checkmark"
              : "shield-outline"
          }
          size={14}
          color={verification.badgeColor}
        />
        <Text
          style={[styles.verificationText, { color: verification.badgeColor }]}
        >
          {verification.badgeText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(15,23,42,0.75)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
  },
  verifiedDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 1,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
  contact: {
    color: "#94A3B8",
    fontSize: 13,
  },
  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(148,163,184,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
