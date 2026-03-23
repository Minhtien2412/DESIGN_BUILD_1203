/**
 * SearchHeaderBar — Role switch (Khách / Thợ) + search bar + cart/notif/menu
 */
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const PAD = 16;

export interface SearchHeaderBarProps {
  isCustomer: boolean;
  onToggleRole: () => void;
  cartCount?: number;
  notifCount?: number;
  workerLabel?: string;
  customerLabel?: string;
  searchPlaceholder?: string;
}

export const SearchHeaderBar = memo<SearchHeaderBarProps>(
  ({
    isCustomer,
    onToggleRole,
    cartCount = 0,
    notifCount = 0,
    workerLabel = "Thợ",
    customerLabel = "Khách",
    searchPlaceholder = "Tìm kiếm sản phẩm, dịch vụ...",
  }) => (
    <View style={styles.wrapper}>
      {/* Role Switch Row */}
      <View style={styles.roleRow}>
        <Text style={[styles.roleLabel, !isCustomer && styles.roleLabelActive]}>
          {workerLabel}
        </Text>
        <Switch
          value={isCustomer}
          onValueChange={onToggleRole}
          trackColor={{ false: "#4DA8DA", true: "#0D9488" }}
          thumbColor="#fff"
          style={styles.switch}
        />
        <Text style={[styles.roleLabel, isCustomer && styles.roleLabelActive]}>
          {customerLabel}
        </Text>
      </View>

      {/* Search Bar Row */}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/search" as Href)}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <Text style={styles.placeholder}>{searchPlaceholder}</Text>
        </TouchableOpacity>

        {/* Cart */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/cart" as Href)}
        >
          <Ionicons name="cart-outline" size={22} color="#444" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/notification-center" as Href)}
        >
          <Ionicons name="notifications-outline" size={22} color="#444" />
          {notifCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notifCount > 99 ? "99+" : notifCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Menu */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => router.push("/(tabs)/menu" as Href)}
        >
          <Ionicons name="grid-outline" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  ),
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.3,
  },
  roleLabelActive: {
    color: "#0D9488",
    fontWeight: "700",
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PAD,
    paddingVertical: 8,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  placeholder: { fontSize: 13, color: "#9CA3AF" },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  },
  badge: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
});
