/**
 * Company Detail Screen — thông tin chi tiết công ty
 * Tabs: about, services, portfolio, reviews
 * Real API via getCompanyById, messaging via useUnifiedMessaging
 * Refactored: DS tokens (useDS). All logic, API, tabs preserved.
 * @updated 2026-03-18
 */

import { DSCard, DSEmptyState } from "@/components/ds";
import OfflineDataBanner from "@/components/ui/OfflineDataBanner";
import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import { useDS } from "@/hooks/useDS";
import {
  getCompanyById,
  type CompanyProfile,
} from "@/services/company.service";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TABS = [
  { id: "about", name: "Giới thiệu", icon: "information-circle-outline" },
  { id: "services", name: "Dịch vụ", icon: "briefcase-outline" },
  { id: "portfolio", name: "Dự án", icon: "images-outline" },
  { id: "reviews", name: "Đánh giá", icon: "star-outline" },
];

export default function CompanyDetailScreen() {
  const { colors, spacing, radius, text: textStyles, screen } = useDS();
  const CARD_WIDTH = (screen.width - spacing.xl * 2 - spacing.lg) / 2;
  const params = useLocalSearchParams<{ id?: string; slug?: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultingServiceId, setConsultingServiceId] = useState<number | null>(
    null,
  );
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const { getOrCreateConversation } = useUnifiedMessaging();

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    try {
      setError(null);
      const companyId = params.id || params.slug || "1";
      console.log("[CompanyDetail] Fetching company:", companyId);
      const response = await getCompanyById(companyId);

      if (response.success && response.data) {
        setCompany(response.data);
        setIsOffline(response.offline === true);
      } else {
        setError(response.message || "Không thể tải thông tin công ty");
      }
    } catch (err: any) {
      console.error("[CompanyDetail] Error:", err);
      setError("Đã xảy ra lỗi khi tải thông tin công ty");
    } finally {
      setLoading(false);
    }
  }, [params.id, params.slug]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCompanyData();
    setRefreshing(false);
  };

  const handleCall = () => {
    if (company?.phone) {
      Linking.openURL(`tel:${company.phone}`);
    }
  };

  const handleEmail = () => {
    if (company?.email) {
      Linking.openURL(`mailto:${company.email}`);
    }
  };

  const handleWebsite = () => {
    if (company?.website) {
      Linking.openURL(company.website);
    }
  };

  // Handle consult button - navigate to chat
  const handleConsult = async (serviceId?: number, serviceName?: string) => {
    if (!company) return;

    try {
      if (serviceId) {
        setConsultingServiceId(serviceId);
      } else {
        setIsConsulting(true);
      }
      const conversationId = await getOrCreateConversation({
        userId:
          typeof company.id === "number" ? company.id : Number(company.id),
        userName: company.name,
        userRole: serviceName
          ? `DESIGN_${serviceName.toUpperCase()}`
          : "DESIGN_COMPANY",
      });
      router.push(
        `/messages/chat/${conversationId}` as `/messages/chat/${string}`,
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsConsulting(false);
      setConsultingServiceId(null);
    }
  };

  const renderStars = (rating: number) => (
    <View style={{ flexDirection: "row", marginBottom: spacing.xs }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={
            star <= rating
              ? "star"
              : star - 0.5 <= rating
                ? "star-half"
                : "star-outline"
          }
          size={16}
          color={colors.primary}
        />
      ))}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            textStyles.body,
            { color: colors.textSecondary, marginTop: spacing.lg },
          ]}
        >
          Đang tải thông tin công ty...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
          padding: spacing.xxl,
        }}
      >
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text
          style={[
            textStyles.body,
            {
              color: colors.textSecondary,
              textAlign: "center",
              marginTop: spacing.lg,
            },
          ]}
        >
          {error || "Không tìm thấy thông tin công ty"}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: spacing.xl,
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.xxl,
            paddingVertical: spacing.lg,
            borderRadius: radius.md,
          }}
          onPress={fetchCompanyData}
        >
          <Text style={[textStyles.buttonSmall, { color: colors.textInverse }]}>
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAboutTab = () => (
    <View>
      {/* Description */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          padding: spacing.xl,
          marginTop: spacing.lg,
        }}
      >
        <Text
          style={[
            textStyles.h4,
            { color: colors.text, marginBottom: spacing.lg },
          ]}
        >
          Về chúng tôi
        </Text>
        <Text
          style={[
            textStyles.body,
            { color: colors.textSecondary, lineHeight: 22 },
          ]}
        >
          {company.description}
        </Text>
      </View>

      {/* Specialties */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          padding: spacing.xl,
          marginTop: spacing.lg,
        }}
      >
        <Text
          style={[
            textStyles.h4,
            { color: colors.text, marginBottom: spacing.lg },
          ]}
        >
          Chuyên môn
        </Text>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
        >
          {company.specialties.map((specialty, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primaryBg,
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: radius.full,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.primary}
              />
              <Text
                style={[
                  textStyles.smallBold,
                  { color: colors.primary, marginLeft: spacing.sm },
                ]}
              >
                {specialty}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact Info */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          padding: spacing.xl,
          marginTop: spacing.lg,
        }}
      >
        <Text
          style={[
            textStyles.h4,
            { color: colors.text, marginBottom: spacing.lg },
          ]}
        >
          Thông tin liên hệ
        </Text>
        {[
          {
            icon: "call-outline" as const,
            text: company.phone,
            onPress: handleCall,
          },
          {
            icon: "mail-outline" as const,
            text: company.email,
            onPress: handleEmail,
          },
          {
            icon: "location-outline" as const,
            text: company.address,
            onPress: undefined,
          },
          {
            icon: "globe-outline" as const,
            text: company.website,
            onPress: handleWebsite,
          },
        ].map((row, i) => (
          <TouchableOpacity
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.bgMuted,
            }}
            onPress={row.onPress}
            disabled={!row.onPress}
          >
            <Ionicons name={row.icon} size={20} color={colors.textSecondary} />
            <Text
              style={[
                textStyles.body,
                { color: colors.text, marginLeft: spacing.lg, flex: 1 },
              ]}
            >
              {row.text}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderServicesTab = () => (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        padding: spacing.xl,
        marginTop: spacing.lg,
      }}
    >
      <Text
        style={[
          textStyles.h4,
          { color: colors.text, marginBottom: spacing.lg },
        ]}
      >
        Bảng giá dịch vụ
      </Text>
      {company.services.map((service) => (
        <View
          key={service.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.bgMuted,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                textStyles.bodySemibold,
                { color: colors.text, marginBottom: spacing.xs },
              ]}
            >
              {service.name}
            </Text>
            <Text
              style={[
                textStyles.body,
                { color: colors.primary, fontWeight: "700" },
              ]}
            >
              {service.price}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primaryBg,
              borderWidth: 1,
              borderColor: colors.primary,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.sm,
              borderRadius: radius.sm,
            }}
            onPress={() => handleConsult(service.id, service.name)}
            disabled={consultingServiceId === service.id}
          >
            {consultingServiceId === service.id ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[textStyles.buttonSmall, { color: colors.primary }]}>
                Tư vấn
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderPortfolioTab = () => (
    <View>
      {company.portfolio.length === 0 ? (
        <DSEmptyState icon="images-outline" title="Chưa có dự án nào" />
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            padding: spacing.lg,
            gap: spacing.lg,
          }}
        >
          {company.portfolio.map((project) => (
            <DSCard
              key={project.id}
              variant="elevated"
              padding={0}
              style={{ width: CARD_WIDTH, overflow: "hidden" }}
            >
              <Image
                source={{ uri: project.image }}
                style={{
                  width: "100%",
                  height: 140,
                  backgroundColor: colors.bgMuted,
                }}
              />
              <View style={{ padding: spacing.md }}>
                <Text
                  style={[
                    textStyles.smallBold,
                    { color: colors.text, marginBottom: spacing.sm },
                  ]}
                  numberOfLines={2}
                >
                  {project.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: spacing.xs,
                  }}
                >
                  <Ionicons
                    name="location"
                    size={12}
                    color={colors.textTertiary}
                  />
                  <Text
                    style={[
                      textStyles.caption,
                      { color: colors.textTertiary, marginLeft: spacing.xs },
                    ]}
                  >
                    {project.location}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: spacing.xs,
                  }}
                >
                  <Ionicons
                    name="resize"
                    size={12}
                    color={colors.textTertiary}
                  />
                  <Text
                    style={[
                      textStyles.caption,
                      { color: colors.textTertiary, marginLeft: spacing.xs },
                    ]}
                  >
                    {project.area}
                  </Text>
                </View>
              </View>
            </DSCard>
          ))}
        </View>
      )}
    </View>
  );

  const renderReviewsTab = () => (
    <View>
      {/* Rating Summary */}
      <View
        style={{
          backgroundColor: colors.bgSurface,
          padding: spacing.xl,
          marginTop: spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={[
              textStyles.h1,
              { color: colors.primary, marginBottom: spacing.xs },
            ]}
          >
            {company.rating}
          </Text>
          {renderStars(company.rating)}
          <Text style={[textStyles.caption, { color: colors.textTertiary }]}>
            {company.reviewCount} đánh giá
          </Text>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primaryBg,
            borderWidth: 1,
            borderColor: colors.primary,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderRadius: radius.md,
          }}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text
            style={[
              textStyles.buttonSmall,
              { color: colors.primary, marginLeft: spacing.sm },
            ]}
          >
            Viết đánh giá
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {company.reviews.length === 0 ? (
        <DSEmptyState icon="chatbubbles-outline" title="Chưa có đánh giá nào" />
      ) : (
        <View
          style={{
            backgroundColor: colors.bgSurface,
            padding: spacing.xl,
            marginTop: spacing.lg,
          }}
        >
          {company.reviews.map((review) => (
            <View
              key={review.id}
              style={{
                paddingVertical: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.bgMuted,
              }}
            >
              <View style={{ flexDirection: "row", marginBottom: spacing.sm }}>
                <Image
                  source={{ uri: review.userAvatar }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.bgMuted,
                  }}
                />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text
                    style={[
                      textStyles.bodySemibold,
                      { color: colors.text, marginBottom: spacing.xs },
                    ]}
                  >
                    {review.userName}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {renderStars(review.rating)}
                    <Text
                      style={[
                        textStyles.caption,
                        { color: colors.textTertiary, marginLeft: spacing.sm },
                      ]}
                    >
                      {review.date}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  textStyles.body,
                  { color: colors.textSecondary, lineHeight: 20 },
                ]}
              >
                {review.comment}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: company.name,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Offline Banner */}
        <OfflineDataBanner visible={isOffline} onRetry={fetchCompanyData} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Cover Image */}
          <Image
            source={{ uri: company.coverImage }}
            style={{
              width: "100%",
              height: 200,
              backgroundColor: colors.bgMuted,
            }}
            defaultSource={require("@/assets/images/react-logo.webp")}
          />

          {/* Company Header */}
          <View
            style={{
              backgroundColor: colors.bgSurface,
              padding: spacing.xl,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <Image
              source={{ uri: company.logo }}
              style={{
                width: 60,
                height: 60,
                borderRadius: radius.lg,
                backgroundColor: colors.bgMuted,
              }}
              defaultSource={require("@/assets/images/icon-dich-vu/thiet-ke-nha.webp")}
            />
            <View style={{ flex: 1, marginLeft: spacing.lg }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={[textStyles.h3, { color: colors.text }]}>
                  {company.name}
                </Text>
                {company.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.primary}
                  />
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="star" size={16} color={colors.primary} />
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginLeft: spacing.xs },
                    ]}
                  >
                    {company.rating}
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    height: 12,
                    backgroundColor: colors.divider,
                    marginHorizontal: spacing.md,
                  }}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="briefcase-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginLeft: spacing.xs },
                    ]}
                  >
                    {company.projectCount} dự án
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    height: 12,
                    backgroundColor: colors.divider,
                    marginHorizontal: spacing.md,
                  }}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginLeft: spacing.xs },
                    ]}
                  >
                    {company.establishedYear}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View
            style={{
              backgroundColor: colors.bgSurface,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
              paddingHorizontal: spacing.lg,
            }}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.lg,
                    marginRight: spacing.sm,
                    borderBottomWidth: 2,
                    borderBottomColor:
                      activeTab === tab.id ? colors.primary : "transparent",
                  }}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={18}
                    color={
                      activeTab === tab.id
                        ? colors.primary
                        : colors.textTertiary
                    }
                  />
                  <Text
                    style={[
                      activeTab === tab.id
                        ? textStyles.smallBold
                        : textStyles.small,
                      {
                        color:
                          activeTab === tab.id
                            ? colors.primary
                            : colors.textTertiary,
                        marginLeft: spacing.sm,
                      },
                    ]}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content */}
          {activeTab === "about" && renderAboutTab()}
          {activeTab === "services" && renderServicesTab()}
          {activeTab === "portfolio" && renderPortfolioTab()}
          {activeTab === "reviews" && renderReviewsTab()}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            backgroundColor: colors.bgSurface,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            gap: spacing.lg,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.bgSurface,
              borderWidth: 1,
              borderColor: colors.primary,
              paddingVertical: spacing.lg,
              borderRadius: radius.md,
            }}
            onPress={handleCall}
          >
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text
              style={[
                textStyles.buttonSmall,
                { color: colors.primary, marginLeft: spacing.sm },
              ]}
            >
              Gọi điện
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              paddingVertical: spacing.lg,
              borderRadius: radius.md,
            }}
            onPress={() => handleConsult()}
            disabled={isConsulting}
          >
            {isConsulting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color={colors.textInverse}
                />
                <Text
                  style={[
                    textStyles.buttonSmall,
                    { color: colors.textInverse, marginLeft: spacing.sm },
                  ]}
                >
                  Liên hệ ngay
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
