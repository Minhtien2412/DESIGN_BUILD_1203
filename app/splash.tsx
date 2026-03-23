/**
 * SplashScreen — Animated brand splash
 *
 * Displays logo + tagline, then auto-navigates based on:
 * - onboardingSeen → false → /onboarding
 * - onboardingSeen + no role → /role-select
 * - onboardingSeen + role → /(tabs)
 *
 * @created 2026-03-21
 */

import { ROLE_THEME } from "@/constants/roleTheme";
import { useRole } from "@/context/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");

export default function SplashScreen() {
  const { initialized, onboardingSeen, role } = useRole();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Navigate after initialization
  useEffect(() => {
    if (!initialized) return;

    const timer = setTimeout(() => {
      if (!onboardingSeen) {
        router.replace("/onboarding");
      } else if (!role) {
        router.replace("/role-select");
      } else {
        router.replace("/(tabs)");
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [initialized, onboardingSeen, role]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROLE_THEME.bg} />

      <Animated.View
        style={[
          s.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={s.iconCircle}>
          <Ionicons name="construct" size={48} color="#FFFFFF" />
        </View>
        <Text style={s.brand}>XÂY DỰNG</Text>
        <Text style={s.brandSub}>PRO</Text>
      </Animated.View>

      <Animated.View
        style={[
          s.taglineContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={s.tagline}>Nền tảng xây dựng & thiết kế số 1</Text>
        <View style={s.dots}>
          <View style={[s.dot, s.dotActive]} />
          <View style={s.dot} />
          <View style={s.dot} />
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROLE_THEME.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: ROLE_THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: ROLE_THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  brand: {
    fontSize: 32,
    fontWeight: "800",
    color: ROLE_THEME.textPrimary,
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 18,
    fontWeight: "600",
    color: ROLE_THEME.primary,
    letterSpacing: 8,
    marginTop: 2,
  },
  taglineContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  tagline: {
    fontSize: 14,
    color: ROLE_THEME.textSecondary,
    marginBottom: 20,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ROLE_THEME.border,
  },
  dotActive: {
    backgroundColor: ROLE_THEME.primary,
    width: 24,
  },
});
