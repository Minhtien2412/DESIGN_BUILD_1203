/**
 * Category Detail Screen
 * Chi tiết danh mục dịch vụ bảo trì nhà
 */

import { DSModuleScreen } from "@/components/ds/layouts";
import { ServiceWorkerItem } from "@/components/home-maintenance";
import { useDS } from "@/hooks/useDS";
import {
    SERVICE_CATEGORIES,
    SERVICE_WORKERS,
    ServiceWorker,
} from "@/services/api/homeMaintenanceApi";
import { mediumImpact } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, font, text: textStyles } = useDS();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "price">(
    "rating",
  );

  const category = useMemo(
    () => SERVICE_CATEGORIES.find((c) => c.id === id),
    [id],
  );

  const workers = useMemo(() => {
    let sorted = [...SERVICE_WORKERS];
    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case "price":
        sorted.sort((a, b) => (a.price?.min || 0) - (b.price?.min || 0));
        break;
    }
    return sorted;
  }, [sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleWorkerPress = (worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/services/home-maintenance/worker/${worker.id}` as any);
  };

  const handleWorkerCall = (worker: ServiceWorker) => {
    mediumImpact();
    if (worker.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    }
  };

  const handleWorkerMessage = (worker: ServiceWorker) => {
    mediumImpact();
    router.push(`/messages/${worker.id}`);
  };

  const renderSortButton = (
    key: "rating" | "reviews" | "price",
    label: string,
  ) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: sortBy === key ? colors.primaryBg : colors.bgMuted,
      }}
      onPress={() => setSortBy(key)}
    >
      <Text
        style={[
          textStyles.badge,
          {
            color: sortBy === key ? colors.primary : colors.textSecondary,
            fontWeight: sortBy === key ? "600" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <DSModuleScreen
      title={category?.name?.replace("\n", " ") || "Dịch vụ"}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      headerRight={
        <TouchableOpacity style={{ padding: spacing.xs }}>
          <Ionicons
            name="filter-outline"
            size={24}
            color={colors.textInverse}
          />
        </TouchableOpacity>
      }
    >
      {/* Category Info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          padding: spacing.lg,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.lg,
            justifyContent: "center",
            alignItems: "center",
            marginRight: spacing.lg,
            backgroundColor: category?.color || colors.primary,
          }}
        >
          <Ionicons
            name={(category?.iconName || "construct-outline") as any}
            size={32}
            color={colors.textInverse}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              textStyles.h2,
              { color: colors.text, marginBottom: spacing.xs },
            ]}
          >
            {category?.name?.replace("\n", " ") || "Danh mục"}
          </Text>
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            {category?.description || ""}
          </Text>
        </View>
      </View>

      {/* Sort Options */}
      <View
        style={{
          backgroundColor: colors.card,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          marginBottom: spacing.sm,
        }}
      >
        <Text
          style={[
            textStyles.badge,
            { color: colors.textSecondary, marginBottom: spacing.sm },
          ]}
        >
          Sắp xếp theo:
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {renderSortButton("rating", "Đánh giá")}
          {renderSortButton("reviews", "Phổ biến")}
          {renderSortButton("price", "Giá")}
        </View>
      </View>

      {/* Results count */}
      <Text
        style={[
          textStyles.badge,
          {
            color: colors.textSecondary,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        {workers.length} thợ có thể phục vụ
      </Text>

      {/* Workers List */}
      {workers.map((worker) => (
        <ServiceWorkerItem
          key={worker.id}
          worker={worker}
          variant="card"
          onPress={handleWorkerPress}
          onCall={handleWorkerCall}
          onMessage={handleWorkerMessage}
        />
      ))}

      <View style={{ height: 40 }} />
    </DSModuleScreen>
  );
}
