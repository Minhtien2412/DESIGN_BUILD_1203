/**
 * Support Chat Widget for Home Screen
 * ====================================
 *
 * Widget nhỏ hiển thị trên home screen:
 * - Floating button để mở support chat
 * - Badge cho tin nhắn chưa đọc
 * - Quick access to support
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Colors from "@/constants/Colors";
import { getOnlineSupportUsers } from "@/data/supportUsers";

// ============================================
// TYPES
// ============================================

interface SupportFloatingButtonProps {
  /** Vị trí button */
  position?: "bottom-right" | "bottom-left";
  /** Số tin nhắn chưa đọc */
  unreadCount?: number;
  /** Ẩn/hiện button */
  visible?: boolean;
  /** Custom style */
  style?: any;
}

interface SupportBannerProps {
  /** Callback khi bấm */
  onPress?: () => void;
  /** Ẩn/hiện banner */
  visible?: boolean;
  /** Custom message */
  message?: string;
}

// ============================================
// FLOATING BUTTON
// ============================================

export function SupportFloatingButton({
  position = "bottom-right",
  unreadCount = 0,
  visible = true,
  style,
}: SupportFloatingButtonProps) {
  const router = useRouter();
  const [scale] = useState(new Animated.Value(1));
  const [isExpanded, setIsExpanded] = useState(false);

  const supportUsers = getOnlineSupportUsers();
  const onlineCount = supportUsers.length;

  // Animation
  useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/chat/support" as any);
  }, [router]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  if (!visible) return null;

  const positionStyle =
    position === "bottom-right" ? styles.positionRight : styles.positionLeft;

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        positionStyle,
        { transform: [{ scale }] },
        style,
      ]}
    >
      {/* Expanded Menu */}
      {isExpanded && (
        <View style={styles.expandedMenu}>
          <Text style={styles.expandedTitle}>Hỗ trợ trực tuyến</Text>
          <Text style={styles.expandedSubtitle}>
            {onlineCount} nhân viên đang sẵn sàng
          </Text>
          <TouchableOpacity style={styles.expandedButton} onPress={handlePress}>
            <Ionicons name="chatbubbles" size={18} color="#FFF" />
            <Text style={styles.expandedButtonText}>Bắt đầu chat</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.floatingButtonInner}>
          <Ionicons name="headset" size={26} color="#FFFFFF" />

          {/* Online Indicator */}
          <View style={styles.onlineIndicator} />
        </View>

        {/* Badge */}
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Pulse Animation */}
      <View style={styles.pulse} />
    </Animated.View>
  );
}

// ============================================
// SUPPORT BANNER
// ============================================

export function SupportBanner({
  onPress,
  visible = true,
  message,
}: SupportBannerProps) {
  const router = useRouter();
  const supportUsers = getOnlineSupportUsers();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      router.push("/chat/support" as any);
    }
  }, [onPress, router]);

  if (!visible || supportUsers.length === 0) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.bannerLeft}>
        <View style={styles.bannerIconContainer}>
          <Ionicons name="headset" size={22} color="#FFFFFF" />
          <View style={styles.bannerOnlineDot} />
        </View>
      </View>

      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>
          {message || "Cần hỗ trợ? Chúng tôi sẵn sàng giúp bạn!"}
        </Text>
        <Text style={styles.bannerSubtitle}>
          {supportUsers.length} nhân viên đang online • Phản hồi trong 5 phút
        </Text>
      </View>

      <View style={styles.bannerRight}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.light.primary}
        />
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// MINI SUPPORT CARD
// ============================================

export function MiniSupportCard({ style }: { style?: any }) {
  const router = useRouter();
  const supportUsers = getOnlineSupportUsers();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/chat/support" as any);
  }, [router]);

  return (
    <TouchableOpacity
      style={[styles.miniCard, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.miniCardHeader}>
        <View style={styles.miniCardIcon}>
          <Ionicons name="headset" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.miniCardInfo}>
          <Text style={styles.miniCardTitle}>Hỗ trợ 24/7</Text>
          <View style={styles.miniCardStatus}>
            <View style={styles.miniOnlineDot} />
            <Text style={styles.miniCardSubtitle}>
              {supportUsers.length} online
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.miniCardMessage}>Chat ngay với đội ngũ CSKH</Text>

      <View style={styles.miniCardAction}>
        <Text style={styles.miniCardActionText}>Bắt đầu chat</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.light.primary} />
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  // Floating Button
  floatingContainer: {
    position: "absolute",
    bottom: 100,
    zIndex: 1000,
  },
  positionRight: {
    right: 16,
  },
  positionLeft: {
    left: 16,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonInner: {
    position: "relative",
  },
  onlineIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.success,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pulse: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    opacity: 0.2,
    zIndex: -1,
  },

  // Expanded Menu
  expandedMenu: {
    position: "absolute",
    bottom: 70,
    right: 0,
    width: 200,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  expandedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },
  expandedSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  expandedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  expandedButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerLeft: {
    marginRight: 12,
  },
  bannerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bannerOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.success,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  bannerRight: {
    padding: 4,
  },

  // Mini Card
  miniCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  miniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  miniCardInfo: {
    marginLeft: 10,
  },
  miniCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  miniCardStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  miniOnlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.success,
    marginRight: 4,
  },
  miniCardSubtitle: {
    fontSize: 11,
    color: Colors.light.success,
  },
  miniCardMessage: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 10,
  },
  miniCardAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 4,
  },
  miniCardActionText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.primary,
  },
});

export default SupportFloatingButton;
