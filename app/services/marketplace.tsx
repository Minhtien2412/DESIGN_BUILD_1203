/**
 * Services Marketplace Screen
 * Shows list of services with filtering and search
 * Backend: GET /services (PUBLIC API - no auth required!)
 */

import { DSCard } from "@/components/ds";
import ErrorMessage from "@/components/ui/error-message";
import { SafeScrollView } from "@/components/ui/safe-area";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useDS } from "@/hooks/useDS";
import { useServices } from "@/hooks/useServices";
import { Service } from "@/services/servicesApi";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ServicesMarketplaceScreen() {
  const { colors, spacing, radius, text: textStyles } = useDS();
  const {
    services,
    categories,
    loading,
    error,
    retrying,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    refreshServices,
  } = useServices();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshServices();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMuted }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xl,
          paddingBottom: spacing.lg,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[textStyles.h3, { color: colors.text }]}>
          Services Marketplace
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          margin: spacing.xl,
          marginBottom: spacing.sm,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textTertiary}
          style={{ marginRight: spacing.sm }}
        />
        <TextInput
          style={{ flex: 1, height: 44, fontSize: 15, color: colors.text }}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textTertiary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.lg,
            gap: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <TouchableOpacity
            style={{
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.sm,
              borderRadius: radius.full,
              backgroundColor: !selectedCategory ? colors.primary : colors.card,
              borderWidth: 1,
              borderColor: !selectedCategory ? colors.primary : colors.border,
            }}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                textStyles.smallBold,
                {
                  color: !selectedCategory
                    ? colors.textInverse
                    : colors.textSecondary,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={{
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.sm,
                borderRadius: radius.full,
                backgroundColor:
                  selectedCategory === String(cat.id)
                    ? colors.primary
                    : colors.card,
                borderWidth: 1,
                borderColor:
                  selectedCategory === String(cat.id)
                    ? colors.primary
                    : colors.border,
              }}
              onPress={() => setSelectedCategory(String(cat.id))}
            >
              <Text
                style={[
                  textStyles.smallBold,
                  {
                    color:
                      selectedCategory === String(cat.id)
                        ? colors.textInverse
                        : colors.textSecondary,
                  },
                ]}
              >
                {cat.name} ({cat.serviceCount ?? 0})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Services List */}
      <SafeScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && services.length === 0 ? (
          <View style={{ padding: spacing.xl }}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} style={{ marginBottom: spacing.xl }} />
            ))}
          </View>
        ) : retrying ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                textStyles.body,
                { marginTop: spacing.lg, color: colors.textSecondary },
              ]}
            >
              Retrying...
            </Text>
          </View>
        ) : error ? (
          <ErrorMessage error={error} onRetry={refreshServices} />
        ) : services.length === 0 ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
              paddingHorizontal: spacing.xxl,
            }}
          >
            <Ionicons
              name="briefcase-outline"
              size={64}
              color={colors.border}
            />
            <Text
              style={[
                textStyles.bodySemibold,
                { marginTop: spacing.xl, color: colors.textSecondary },
              ]}
            >
              {searchQuery ? "No services found" : "No services available"}
            </Text>
            {searchQuery && (
              <Text
                style={[
                  textStyles.body,
                  { marginTop: spacing.sm, color: colors.textTertiary },
                ]}
              >
                Try different search keywords
              </Text>
            )}
          </View>
        ) : (
          <View style={{ padding: spacing.xl, gap: spacing.xl }}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </View>
        )}
      </SafeScrollView>
    </View>
  );
}

// ==================== SERVICE CARD COMPONENT ====================

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  const { colors, spacing, radius, text: textStyles, shadow } = useDS();
  const handlePress = () => {
    router.push(`/services/${service.id}` as Href);
  };

  return (
    <DSCard variant="elevated" onPress={handlePress} padding={0}>
      {/* Service Image */}
      {service.images?.[0] ? (
        <Image
          source={{ uri: service.images[0] }}
          style={{
            width: "100%",
            height: 180,
            backgroundColor: colors.bgMuted,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 180,
            backgroundColor: colors.bgMuted,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="briefcase" size={32} color={colors.border} />
        </View>
      )}

      {/* Service Info */}
      <View style={{ padding: spacing.xl }}>
        <Text
          style={[
            textStyles.h4,
            { color: colors.text, marginBottom: spacing.xs },
          ]}
          numberOfLines={2}
        >
          {service.name}
        </Text>
        <Text
          style={[
            textStyles.body,
            {
              color: colors.textSecondary,
              lineHeight: 20,
              marginBottom: spacing.lg,
            },
          ]}
          numberOfLines={2}
        >
          {service.description}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
        >
          <View
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              backgroundColor: colors.primaryBg,
              borderRadius: radius.sm,
            }}
          >
            <Text style={[textStyles.smallBold, { color: colors.primary }]}>
              {service.category}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={[textStyles.bodySemibold, { color: colors.text }]}>
              {service.rating != null ? service.rating.toFixed(1) : "N/A"}
            </Text>
            <Text style={[textStyles.small, { color: colors.textTertiary }]}>
              ({service.reviewCount || 0})
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={{ fontSize: 20, fontWeight: "700", color: colors.primary }}
          >
            {service.price}đ
          </Text>
          <Text
            style={[
              textStyles.body,
              { color: colors.textSecondary, marginLeft: spacing.xs },
            ]}
          >
            /{service.unit}
          </Text>
        </View>

        {service.creator && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}
          >
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[
                textStyles.small,
                { color: colors.textSecondary, flex: 1 },
              ]}
              numberOfLines={1}
            >
              {service.creator.name}
            </Text>
          </View>
        )}

        {service.status === "ACTIVE" ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              backgroundColor: colors.successBg,
              borderRadius: radius.sm,
              gap: spacing.xs,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.primary,
              }}
            />
            <Text
              style={{ fontSize: 11, fontWeight: "600", color: colors.primary }}
            >
              Available
            </Text>
          </View>
        ) : (
          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              backgroundColor: colors.bgMuted,
              borderRadius: radius.sm,
            }}
          >
            <Text
              style={{ fontSize: 11, fontWeight: "600", color: colors.text }}
            >
              Unavailable
            </Text>
          </View>
        )}
      </View>
    </DSCard>
  );
}
