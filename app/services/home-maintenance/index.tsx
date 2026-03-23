/**
 * Home Maintenance Services Screen
 * Màn hình dịch vụ bảo trì nhà - Facebook/Grab style
 *
 * @author AI Assistant
 * @date 05/01/2026
 */

import {
    ServiceCategoryItem,
    ServiceWorkerItem,
    SupportChat,
} from "@/components/home-maintenance";
import {
    SERVICE_CATEGORIES,
    SERVICE_WORKERS,
    ServiceCategory,
    ServiceWorker,
} from "@/services/api/homeMaintenanceApi";
import { mediumImpact } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    Image,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { DSCard } from "@/components/ds";
import { DSModuleScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";

export default function HomeMaintenanceScreen() {
  const { colors, spacing, radius, font, text: textStyles, screen } = useDS();
  const [refreshing, setRefreshing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleCategoryPress = useCallback((category: ServiceCategory) => {
    mediumImpact();
    setSelectedCategory(category.id);
    router.push(`/services/home-maintenance/category/${category.id}` as any);
  }, []);

  const handleWorkerPress = useCallback((worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/services/home-maintenance/worker/${worker.id}` as any);
  }, []);

  const handleWorkerCall = useCallback((worker: ServiceWorker) => {
    mediumImpact();
    if (worker.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    }
  }, []);

  const handleWorkerMessage = useCallback((worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/messages/${worker.id}`);
  }, []);

  const openChat = useCallback(() => {
    mediumImpact();
    setIsChatOpen(true);
  }, []);

  return (
    <>
      <DSModuleScreen
        title="Dịch Vụ Bảo Trì Nhà"
        gradientHeader
        refreshing={refreshing}
        onRefresh={handleRefresh}
        headerRight={
          <TouchableOpacity style={{ padding: spacing.xs }}>
            <Ionicons name="search" size={24} color={colors.textInverse} />
          </TouchableOpacity>
        }
      >
        {/* Hero Banner */}
        <View
          style={{
            height: 200,
            marginHorizontal: spacing.lg,
            marginTop: spacing.lg,
            borderRadius: radius.xl,
            overflow: "hidden",
          }}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800",
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.4,
            }}
            resizeMode="cover"
          />
          <View
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              padding: spacing.xl,
              justifyContent: "center",
            }}
          >
            <Text
              style={[
                textStyles.h1,
                { color: colors.textInverse, marginBottom: spacing.sm },
              ]}
            >
              Mạng lưới thợ{"\n"}chuyên nghiệp
            </Text>
            <Text
              style={[
                textStyles.body,
                { color: "rgba(255,255,255,0.9)", marginBottom: spacing.lg },
              ]}
            >
              Hơn 1000+ thợ đã được xác minh
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                alignSelf: "flex-start",
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radius.full,
                gap: spacing.sm,
              }}
            >
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.textInverse, fontSize: font.size.sm },
                ]}
              >
                Khám phá ngay
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.textInverse}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <DSCard
          variant="elevated"
          padding={spacing.lg}
          style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Ionicons name="people" size={24} color={colors.info} />
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginTop: spacing.sm },
                ]}
              >
                1000+
              </Text>
              <Text
                style={[
                  textStyles.badge,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Thợ xác minh
              </Text>
            </View>
            <View
              style={{ width: 1, backgroundColor: colors.divider, height: 40 }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Ionicons name="star" size={24} color={colors.warning} />
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginTop: spacing.sm },
                ]}
              >
                4.8
              </Text>
              <Text
                style={[
                  textStyles.badge,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Đánh giá TB
              </Text>
            </View>
            <View
              style={{ width: 1, backgroundColor: colors.divider, height: 40 }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.success}
              />
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginTop: spacing.sm },
                ]}
              >
                10K+
              </Text>
              <Text
                style={[
                  textStyles.badge,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Hoàn thành
              </Text>
            </View>
          </View>
        </DSCard>

        {/* Categories Section */}
        <View style={{ marginTop: spacing.xxl }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <Text style={[textStyles.sectionTitle, { color: colors.text }]}>
              Danh mục dịch vụ
            </Text>
            <TouchableOpacity>
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.primary, fontSize: font.size.sm },
                ]}
              >
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.md }}
          >
            {SERVICE_CATEGORIES.map((cat) => (
              <ServiceCategoryItem
                key={cat.id}
                category={cat}
                onPress={handleCategoryPress}
              />
            ))}
          </ScrollView>
        </View>

        {/* Featured Workers */}
        <View style={{ marginTop: spacing.xxl }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <Text style={[textStyles.sectionTitle, { color: colors.text }]}>
              Thợ nổi bật
            </Text>
            <TouchableOpacity>
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.primary, fontSize: font.size.sm },
                ]}
              >
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          {SERVICE_WORKERS.map((worker) => (
            <ServiceWorkerItem
              key={worker.id}
              worker={worker}
              onPress={handleWorkerPress}
              onCall={handleWorkerCall}
              onMessage={handleWorkerMessage}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{ marginTop: spacing.xxl, paddingHorizontal: spacing.lg }}>
          <Text style={[textStyles.sectionTitle, { color: colors.text }]}>
            Hành động nhanh
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginTop: spacing.md,
              gap: spacing.md,
            }}
          >
            {[
              {
                icon: "time-outline" as const,
                label: "Đặt lịch\nhẹn",
                bg: colors.infoBg,
                color: colors.info,
              },
              {
                icon: "receipt-outline" as const,
                label: "Báo giá\ndịch vụ",
                bg: colors.warningBg,
                color: colors.warning,
              },
              {
                icon: "location-outline" as const,
                label: "Thợ gần\nbạn",
                bg: colors.successBg,
                color: colors.success,
              },
              {
                icon: "chatbubbles-outline" as const,
                label: "Tư vấn\nAI",
                bg: colors.errorBg,
                color: colors.accent,
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={{
                  width: (screen.width - spacing.lg * 2 - spacing.md * 3) / 4,
                  alignItems: "center",
                }}
                onPress={
                  item.icon === "chatbubbles-outline" ? openChat : undefined
                }
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: radius.lg,
                    backgroundColor: item.bg,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: spacing.sm,
                  }}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text
                  style={[
                    textStyles.badge,
                    {
                      color: colors.textSecondary,
                      textAlign: "center",
                      lineHeight: 14,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </DSModuleScreen>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 90,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            elevation: 6,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          onPress={openChat}
          activeOpacity={0.85}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={26}
            color={colors.textInverse}
          />
        </TouchableOpacity>
      )}

      {isChatOpen && <SupportChat onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
