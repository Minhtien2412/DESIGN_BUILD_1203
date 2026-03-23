/**
 * Services Hub — Dịch vụ
 * Route: /services
 * Refactored: full DS design system (useDS tokens, no StyleSheet.create).
 * AI section uses a local purple palette (not in DS — brand accent for AI features).
 */

import { DSModuleScreen } from "@/components/ds/layouts";
import { AI_SERVICES, SERVICES } from "@/data/home-sections";
import { useDS } from "@/hooks/useDS";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** AI section branding — purple palette not in DS (AI-specific accent) */
const AI_PURPLE = {
  gradient: ["#7C3AED", "#A855F7"] as const,
  title: "#6D28D9",
  bg: "#FAF5FF",
  border: "#E9D5FF",
};

// ── AI Service Card ────────────────────────────────────────────────────
function AIServiceCard({ item }: { item: (typeof AI_SERVICES)[0] }) {
  const { colors, spacing, radius, font } = useDS();
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = () =>
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  const onOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => router.push(item.route as Href)}
      onPressIn={onIn}
      onPressOut={onOut}
    >
      <Animated.View
        style={{
          width: 68,
          alignItems: "center",
          padding: spacing.sm,
          borderWidth: 1,
          position: "relative",
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          transform: [{ scale }],
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xs,
            backgroundColor: item.color + "15",
            borderRadius: radius.md,
          }}
        >
          <Text style={{ fontSize: font.size.lg }}>{item.icon}</Text>
        </View>
        <Text
          style={{
            fontSize: font.size.xxs,
            fontWeight: font.weight.bold,
            textAlign: "center",
            lineHeight: 13,
            color: colors.text,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        {item.isNew && (
          <View
            style={{
              position: "absolute",
              top: spacing.xs,
              right: spacing.xs,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: item.color,
            }}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Service Card ───────────────────────────────────────────────────────
function ServiceCard({ item }: { item: (typeof SERVICES)[0] }) {
  const { colors, spacing, radius, shadow, font } = useDS();
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = () =>
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  const onOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();

  return (
    <TouchableOpacity
      style={{ width: "31%" as any, aspectRatio: 1 }}
      activeOpacity={1}
      onPress={() => router.push(item.route as Href)}
      onPressIn={onIn}
      onPressOut={onOut}
    >
      <Animated.View
        style={[
          shadow.xs,
          {
            flex: 1,
            padding: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            backgroundColor: colors.bgSurface,
            borderColor: colors.border,
            borderRadius: radius.xl,
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={{
            width: 52,
            height: 52,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: spacing.sm,
            backgroundColor: colors.primaryLight,
            borderRadius: radius.lg,
          }}
        >
          <Image
            source={item.icon}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            fontSize: font.size.xs,
            fontWeight: font.weight.bold,
            textAlign: "center",
            lineHeight: 16,
            color: colors.text,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export default function ServicesHubScreen() {
  const { colors, spacing, radius, shadow, font } = useDS();

  return (
    <DSModuleScreen
      title="Dịch vụ"
      gradientHeader
      headerRight={
        <Pressable
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.full,
            backgroundColor: "rgba(255,255,255,0.12)",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.push("/search" as any)}
          hitSlop={8}
        >
          <Ionicons
            name="search-outline"
            size={22}
            color={colors.textInverse}
          />
        </Pressable>
      }
    >
      {/* AI Services Banner */}
      <View
        style={{
          backgroundColor: AI_PURPLE.bg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: AI_PURPLE.border,
          borderRadius: radius.xl,
          marginHorizontal: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.xs,
          }}
        >
          <LinearGradient
            colors={[AI_PURPLE.gradient[0], AI_PURPLE.gradient[1]]}
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.md,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="robot-happy"
              size={18}
              color={colors.textInverse}
            />
          </LinearGradient>
          <Text
            style={{
              fontSize: font.size.md,
              fontWeight: font.weight.heavy,
              color: AI_PURPLE.title,
            }}
          >
            Tư vấn AI
          </Text>
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
              borderRadius: radius.md,
              backgroundColor: colors.primary,
            }}
          >
            <Text
              style={{
                color: colors.textInverse,
                fontSize: font.size.xxs,
                fontWeight: font.weight.heavy,
              }}
            >
              MỚI
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: font.size.sm,
            color: colors.textSecondary,
            marginBottom: spacing.md,
          }}
        >
          Trợ lý AI thông minh tư vấn mọi vấn đề về xây dựng
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
          }}
        >
          {AI_SERVICES.map((svc) => (
            <AIServiceCard key={svc.id} item={svc} />
          ))}
        </View>
      </View>

      {/* Marketplace Banner */}
      <Pressable
        style={[
          {
            overflow: "hidden",
            marginHorizontal: spacing.md,
            marginTop: spacing.md,
            borderRadius: radius.xl,
          },
          Platform.select({
            ios: {
              shadowColor: colors.primaryDark,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
            },
            android: { elevation: 4 },
          }),
        ]}
        onPress={() => router.push("/services/marketplace" as Href)}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: spacing.xl,
            borderRadius: radius.xl,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.lg,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="storefront"
                size={24}
                color={colors.textInverse}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: font.size.md,
                  fontWeight: font.weight.heavy,
                  color: colors.textInverse,
                  marginBottom: 2,
                }}
              >
                Services Marketplace
              </Text>
              <Text
                style={{
                  fontSize: font.size.xs,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Tìm & đặt dịch vụ chuyên nghiệp
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textInverse}
            />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Section Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: spacing.xs,
          paddingHorizontal: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: font.size.lg,
            fontWeight: font.weight.heavy,
            letterSpacing: -0.3,
            color: colors.text,
          }}
        >
          Tất cả dịch vụ
        </Text>
        <Text
          style={{
            fontSize: font.size.sm,
            fontWeight: font.weight.bold,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            overflow: "hidden",
            color: colors.primary,
            backgroundColor: colors.primaryLight,
            borderRadius: radius.sm,
          }}
        >
          {SERVICES.length}
        </Text>
      </View>

      {/* Services Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          padding: spacing.sm,
          gap: spacing.sm,
        }}
      >
        {SERVICES.map((svc) => (
          <ServiceCard key={svc.id} item={svc} />
        ))}
      </View>

      <View style={{ height: 80 }} />
    </DSModuleScreen>
  );
}
