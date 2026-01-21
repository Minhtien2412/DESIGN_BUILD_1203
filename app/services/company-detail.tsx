import { useUnifiedMessaging } from "@/hooks/crm/useUnifiedMessaging";
import {
    getCompanyById,
    type CompanyProfile,
} from "@/services/company.service";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const TABS = [
  { id: "about", name: "Giới thiệu", icon: "information-circle-outline" },
  { id: "services", name: "Dịch vụ", icon: "briefcase-outline" },
  { id: "portfolio", name: "Dự án", icon: "images-outline" },
  { id: "reviews", name: "Đánh giá", icon: "star-outline" },
];

export default function CompanyDetailScreen() {
  const params = useLocalSearchParams<{ id?: string; slug?: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultingServiceId, setConsultingServiceId] = useState<number | null>(
    null
  );
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
        `/messages/chat/${conversationId}` as `/messages/chat/${string}`
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsConsulting(false);
      setConsultingServiceId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
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
            color="#0066CC"
          />
        ))}
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Đang tải thông tin công ty...</Text>
      </View>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>
          {error || "Không tìm thấy thông tin công ty"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCompanyData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Về chúng tôi</Text>
        <Text style={styles.description}>{company.description}</Text>
      </View>

      {/* Specialties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chuyên môn</Text>
        <View style={styles.specialtyGrid}>
          {company.specialties.map((specialty, idx) => (
            <View key={idx} style={styles.specialtyChip}>
              <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
              <Text style={styles.specialtyChipText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

        <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{company.phone}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#ccc"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{company.email}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#ccc"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{company.address}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#ccc"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} onPress={handleWebsite}>
          <Ionicons name="globe-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{company.website}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#ccc"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bảng giá dịch vụ</Text>
        {company.services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.serviceButton}
              onPress={() => handleConsult(service.id, service.name)}
              disabled={consultingServiceId === service.id}
            >
              {consultingServiceId === service.id ? (
                <ActivityIndicator size="small" color="#0066CC" />
              ) : (
                <Text style={styles.serviceButtonText}>Tư vấn</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      {company.portfolio.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>Chưa có dự án nào</Text>
        </View>
      ) : (
        <View style={styles.portfolioGrid}>
          {company.portfolio.map((project) => (
            <TouchableOpacity key={project.id} style={styles.portfolioCard}>
              <Image
                source={{ uri: project.image }}
                style={styles.portfolioImage}
              />
              <View style={styles.portfolioInfo}>
                <Text style={styles.portfolioTitle} numberOfLines={2}>
                  {project.title}
                </Text>
                <View style={styles.portfolioMeta}>
                  <Ionicons name="location" size={12} color="#999" />
                  <Text style={styles.portfolioMetaText}>
                    {project.location}
                  </Text>
                </View>
                <View style={styles.portfolioMeta}>
                  <Ionicons name="resize" size={12} color="#999" />
                  <Text style={styles.portfolioMetaText}>{project.area}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      {/* Rating Summary */}
      <View style={styles.ratingSummary}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingNumber}>{company.rating}</Text>
          {renderStars(company.rating)}
          <Text style={styles.ratingCount}>{company.reviewCount} đánh giá</Text>
        </View>
        <TouchableOpacity style={styles.writeReviewButton}>
          <Ionicons name="create-outline" size={18} color="#0066CC" />
          <Text style={styles.writeReviewText}>Viết đánh giá</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {company.reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>Chưa có đánh giá nào</Text>
        </View>
      ) : (
        <View style={styles.section}>
          {company.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.userAvatar }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewUserInfo}>
                  <Text style={styles.reviewUser}>{review.userName}</Text>
                  <View style={styles.reviewMeta}>
                    {renderStars(review.rating)}
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
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
          headerStyle: { backgroundColor: "#0066CC" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Cover Image */}
          <Image
            source={{ uri: company.coverImage }}
            style={styles.coverImage}
            defaultSource={require("@/assets/images/react-logo.webp")}
          />

          {/* Company Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: company.logo }}
              style={styles.logo}
              defaultSource={require("@/assets/images/icon-dich-vu/thiet-ke-nha.webp")}
            />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.companyName}>{company.name}</Text>
                {company.verified && (
                  <Ionicons name="checkmark-circle" size={18} color="#0066CC" />
                )}
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#0066CC" />
                  <Text style={styles.statText}>{company.rating}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Ionicons name="briefcase-outline" size={16} color="#666" />
                  <Text style={styles.statText}>
                    {company.projectCount} dự án
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{company.establishedYear}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={18}
                    color={activeTab === tab.id ? "#0066CC" : "#999"}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.tabTextActive,
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
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={handleCall}
          >
            <Ionicons name="call" size={20} color="#0066CC" />
            <Text style={styles.actionButtonSecondaryText}>Gọi điện</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => handleConsult()}
            disabled={isConsulting}
          >
            {isConsulting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                <Text style={styles.actionButtonPrimaryText}>Liên hệ ngay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#0066CC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 12,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  coverImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  tabs: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#0066CC",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
    marginLeft: 6,
  },
  tabTextActive: {
    color: "#0066CC",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },
  specialtyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f0",
    borderWidth: 1,
    borderColor: "#0066CC",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specialtyChipText: {
    fontSize: 13,
    color: "#0066CC",
    fontWeight: "600",
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0066CC",
  },
  serviceButton: {
    backgroundColor: "#fff5f0",
    borderWidth: 1,
    borderColor: "#0066CC",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  serviceButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0066CC",
  },
  portfolioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  portfolioCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  portfolioImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f0f0f0",
  },
  portfolioInfo: {
    padding: 10,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  portfolioMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  portfolioMetaText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  ratingSummary: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingLeft: {
    alignItems: "center",
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0066CC",
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#999",
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f0",
    borderWidth: 1,
    borderColor: "#0066CC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0066CC",
    marginLeft: 6,
  },
  reviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  reviewUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0066CC",
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0066CC",
    marginLeft: 6,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
});
