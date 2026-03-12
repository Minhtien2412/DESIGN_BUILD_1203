/**
 * New Conversation Screen - Facebook Style Enhanced
 * Tạo cuộc hội thoại mới với contact
 * - Tìm kiếm theo SĐT, Email, Tên như Facebook
 * - Phân loại: Tất cả, Nhân viên, Khách hàng, CSKH
 * - Gợi ý người quen, bạn bè chung
 * - Liên hệ nhanh với bộ phận CSKH
 *
 * @updated 2026-01-24
 */

import Avatar from "@/components/ui/avatar";
import { getSupportUsers, type SupportUser } from "@/data/supportUsers";
import { get } from "@/services/api";
import {
    clearSearchHistory,
    detectSearchType,
    getSearchHistory,
    isPhoneNumber,
    removeFromHistory,
    saveSearchHistory,
    searchUsers,
    type SearchHistoryItem,
    type SearchType,
    type UserSearchResult,
} from "@/services/userSearchService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#0D9488",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  border: "#E5E5E5",
  online: "#0D9488",
  support: "#0D9488",
  staff: "#666666",
  customer: "#0D9488",
};

// Filter tabs
type ContactFilter = "all" | "staff" | "customer" | "support";

const FILTER_TABS: { key: ContactFilter; label: string; icon: string }[] = [
  { key: "all", label: "Tất cả", icon: "people" },
  { key: "staff", label: "Nhân viên", icon: "briefcase" },
  { key: "customer", label: "Khách hàng", icon: "person" },
  { key: "support", label: "CSKH", icon: "headset" },
];

// Map SupportUser from data/supportUsers to Contact interface
function mapSupportToContact(su: SupportUser): Contact {
  return {
    id: su.numericId,
    name: su.displayName,
    email: su.email || `${su.name}@designbuild.vn`,
    role: `CSKH - ${su.department}`,
    avatar: su.avatar,
    online: su.isAlwaysOnline,
    isSupport: true,
    description: su.welcomeMessage,
    responseTime: su.responseTime,
  };
}

// Support team derived from centralized data
const SUPPORT_TEAM: Contact[] = getSupportUsers().map(mapSupportToContact);

// API user shape from GET /api/users
interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string | null;
  isOnline?: boolean;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar: string;
  online: boolean;
  isSupport: boolean;
  description?: string;
  responseTime?: string;
}

// Support Contact Item - Special UI
function SupportContactItem({
  contact,
  onPress,
}: {
  contact: Contact;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.supportItem} onPress={onPress}>
      <View style={styles.supportIconWrapper}>
        <Ionicons name="headset" size={24} color={COLORS.support} />
      </View>

      <View style={styles.supportInfo}>
        <Text style={styles.supportName}>{contact.name}</Text>
        <Text style={styles.supportDesc}>{contact.description}</Text>
        {contact.responseTime && (
          <Text style={styles.supportResponseTime}>
            ⏱ {contact.responseTime}
          </Text>
        )}
      </View>

      <View style={styles.supportActions}>
        {contact.online && (
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>Online</Text>
          </View>
        )}
        <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

// Regular Contact Item
function ContactItem({
  contact,
  onPress,
}: {
  contact: Contact;
  onPress: () => void;
}) {
  const isStaff = contact.email.includes("@thietkeresort.vn");

  // Only pass avatar/userId when there's a real photo URL (not pravatar, not empty)
  const hasRealAvatar =
    !!contact.avatar &&
    !contact.avatar.includes("pravatar.cc") &&
    contact.avatar.length > 0;

  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <View style={styles.avatarWrapper}>
        <Avatar
          avatar={hasRealAvatar ? contact.avatar : undefined}
          name={contact.name}
          pixelSize={48}
        />
        {contact.online && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactNameRow}>
          <Text style={styles.contactName}>{contact.name}</Text>
          {isStaff && (
            <View style={styles.staffBadge}>
              <Ionicons name="briefcase" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.contactRole}>{contact.role}</Text>
        <Text style={styles.contactEmail}>{contact.email}</Text>
      </View>

      <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
    </TouchableOpacity>
  );
}

export default function NewConversationScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ContactFilter>("all");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [detectedType, setDetectedType] = useState<SearchType>("name");
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real contacts from API
  const [staffContacts, setStaffContacts] = useState<Contact[]>([]);
  const [customerContacts, setCustomerContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Map API user to Contact interface
  const mapApiUser = useCallback(
    (user: ApiUser, roleLabel: string): Contact => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || roleLabel,
      avatar: user.avatar || "",
      online: user.isOnline ?? false,
      isSupport: false,
    }),
    [],
  );

  // Fetch contacts from API
  const fetchContacts = useCallback(async () => {
    try {
      const response = await get<ApiUser[]>("/api/users");
      const users = Array.isArray(response) ? response : [];
      const staff: Contact[] = [];
      const customers: Contact[] = [];

      for (const u of users) {
        const roleLower = (u.role || "").toLowerCase();
        if (
          roleLower === "admin" ||
          roleLower === "staff" ||
          roleLower === "manager" ||
          roleLower.includes("nhân viên")
        ) {
          staff.push(mapApiUser(u, "Nhân viên"));
        } else {
          customers.push(mapApiUser(u, "Khách hàng"));
        }
      }

      setStaffContacts(staff);
      setCustomerContacts(customers);
    } catch (error) {
      console.warn("[Contacts] API fetch failed, keeping current data:", error);
    } finally {
      setContactsLoading(false);
      setRefreshing(false);
    }
  }, [mapApiUser]);

  // Load contacts and search history on mount
  useEffect(() => {
    loadSearchHistory();
    fetchContacts();
  }, [fetchContacts]);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContacts();
  }, [fetchContacts]);

  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  // All contacts combined
  const allContacts = useMemo(
    () => [...SUPPORT_TEAM, ...staffContacts, ...customerContacts],
    [staffContacts, customerContacts],
  );

  // Detect search type as user types
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const type = detectSearchType(searchQuery);
      setDetectedType(type);
    }
  }, [searchQuery]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      setSearchError(null);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await searchUsers(searchQuery, { limit: 20 });
          setSearchResults(response.users);
        } catch (error) {
          console.error("[Search] Error:", error);
          setSearchError("Không thể tìm kiếm. Kiểm tra kết nối mạng.");
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Filter local contacts (fallback when no API results)
  const filteredContacts = useMemo(() => {
    // If we have search results from API, don't use local filter
    if (searchResults.length > 0 || isSearching) return [];

    let result: Contact[] = [];

    // Filter by tab
    switch (activeFilter) {
      case "support":
        result = SUPPORT_TEAM;
        break;
      case "staff":
        result = staffContacts;
        break;
      case "customer":
        result = customerContacts;
        break;
      default:
        result = allContacts;
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query) ||
          c.phone?.includes(query.replace(/\D/g, "")),
      );
    }

    return result;
  }, [
    allContacts,
    staffContacts,
    customerContacts,
    activeFilter,
    searchQuery,
    searchResults.length,
    isSearching,
  ]);

  // Handle contact press - create conversation
  const handleContactPress = useCallback((contact: Contact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to chat with userId - consistent routing
    router.push(`/messages/${contact.id}`);
  }, []);

  // Handle search result press
  const handleSearchResultPress = useCallback(
    async (user: UserSearchResult) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Keyboard.dismiss();

      // Save to search history
      await saveSearchHistory(searchQuery, detectedType, user);

      // Navigate to chat with userId - consistent routing
      router.push(`/messages/${user.id}`);
    },
    [searchQuery, detectedType],
  );

  // Handle history item press
  const handleHistoryPress = useCallback(
    (item: SearchHistoryItem) => {
      setSearchQuery(item.query);
      if (item.result) {
        handleSearchResultPress(item.result);
      }
    },
    [handleSearchResultPress],
  );

  // Handle clear history
  const handleClearHistory = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearSearchHistory();
    setSearchHistory([]);
  }, []);

  // Handle remove single history item
  const handleRemoveHistoryItem = useCallback(async (query: string) => {
    await removeFromHistory(query);
    setSearchHistory((prev) => prev.filter((h) => h.query !== query));
  }, []);

  // Handle quick call to support
  const handleCallSupport = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const hotline = "tel:19001234";
    Linking.canOpenURL(hotline).then((supported) => {
      if (supported) {
        Linking.openURL(hotline);
      } else {
        Alert.alert("Hotline", "Gọi: 1900 1234", [{ text: "OK" }]);
      }
    });
  }, []);

  // Get search type hint text
  const getSearchTypeHint = (): string => {
    if (searchQuery.length === 1) return "Nhập thêm ký tự để tìm kiếm...";
    if (searchQuery.length < 2) return "";
    switch (detectedType) {
      case "phone":
        return "📱 Tìm theo số điện thoại";
      case "email":
        return "📧 Tìm theo email";
      case "username":
        return "👤 Tìm theo username";
      default:
        return "🔍 Tìm theo tên";
    }
  };

  // Render search result item (Facebook style)
  const renderSearchResult = useCallback(
    ({ item }: { item: UserSearchResult }) => (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => handleSearchResultPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarWrapper}>
          <Avatar
            avatar={
              item.avatar && !item.avatar.includes("pravatar.cc")
                ? item.avatar
                : undefined
            }
            name={item.name}
            pixelSize={50}
          />
          {item.online && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.searchResultInfo}>
          <View style={styles.searchResultNameRow}>
            <Text style={styles.searchResultName}>{item.name}</Text>
            {item.verified && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.primary}
                style={{ marginLeft: 4 }}
              />
            )}
            {item.isFriend && (
              <View style={styles.friendBadge}>
                <Text style={styles.friendBadgeText}>Bạn bè</Text>
              </View>
            )}
          </View>

          {/* Show match info based on search type */}
          {item.matchType === "phone" && item.phone && (
            <Text style={styles.searchResultSubtext}>📱 {item.phone}</Text>
          )}
          {item.matchType === "email" && (
            <Text style={styles.searchResultSubtext}>📧 {item.email}</Text>
          )}
          {item.matchType === "name" && item.role && (
            <Text style={styles.searchResultSubtext}>
              {item.role}
              {item.company ? ` • ${item.company}` : ""}
            </Text>
          )}

          {/* Mutual friends */}
          {item.mutualFriends && item.mutualFriends > 0 && (
            <Text style={styles.mutualFriendsText}>
              👥 {item.mutualFriends} bạn chung
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleSearchResultPress],
  );

  // Render search history section
  const renderSearchHistory = () => {
    if (searchQuery.length > 0 || searchHistory.length === 0) return null;

    return (
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Tìm kiếm gần đây</Text>
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearHistoryText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>

        {searchHistory.slice(0, 5).map((item, index) => (
          <TouchableOpacity
            key={`${item.query}-${index}`}
            style={styles.historyItem}
            onPress={() => handleHistoryPress(item)}
          >
            <View style={styles.historyIconWrapper}>
              <Ionicons
                name={
                  item.type === "phone"
                    ? "call"
                    : item.type === "email"
                      ? "mail"
                      : "time"
                }
                size={18}
                color={COLORS.textSecondary}
              />
            </View>

            <View style={styles.historyItemContent}>
              <Text style={styles.historyQuery}>{item.query}</Text>
              {item.result && (
                <Text style={styles.historyResultName}>{item.result.name}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => handleRemoveHistoryItem(item.query)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render support section
  const renderSupportSection = () => {
    if (activeFilter !== "all" && activeFilter !== "support") return null;

    return (
      <View style={styles.supportSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="headset" size={18} color={COLORS.support} />
          <Text style={styles.sectionTitleSupport}>HỖ TRỢ KHÁCH HÀNG</Text>
          <TouchableOpacity
            style={styles.callHotline}
            onPress={handleCallSupport}
          >
            <Ionicons name="call" size={16} color={COLORS.primary} />
            <Text style={styles.callHotlineText}>Gọi hotline</Text>
          </TouchableOpacity>
        </View>

        {activeFilter === "all" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.supportScroll}
          >
            {SUPPORT_TEAM.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.supportCard}
                onPress={() => handleContactPress(contact)}
              >
                <View style={styles.supportCardIcon}>
                  <Ionicons name="headset" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.supportCardName} numberOfLines={1}>
                  {contact.name}
                </Text>
                {contact.online && <View style={styles.supportCardDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          SUPPORT_TEAM.map((contact) => (
            <SupportContactItem
              key={contact.id}
              contact={contact}
              onPress={() => handleContactPress(contact)}
            />
          ))
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn mới</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Tìm theo tên, SĐT, email..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            keyboardType={isPhoneNumber(searchQuery) ? "phone-pad" : "default"}
          />
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginRight: 8 }}
            />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Search type hint */}
        {searchQuery.length >= 1 && (
          <Text style={styles.searchTypeHint}>{getSearchTypeHint()}</Text>
        )}
      </View>

      {/* Search Error */}
      {searchError && (
        <View style={styles.searchErrorBar}>
          <Ionicons name="warning" size={16} color="#DC2626" />
          <Text style={styles.searchErrorText}>{searchError}</Text>
        </View>
      )}

      {/* Search Results from API */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.searchResultsList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Empty search results */}
      {searchQuery.trim().length >= 2 &&
        !isSearching &&
        searchResults.length === 0 &&
        !searchError && (
          <View style={styles.emptySearchState}>
            <Ionicons
              name="search-outline"
              size={40}
              color={COLORS.textTertiary}
            />
            <Text style={styles.emptySearchTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptySearchSubtext}>
              Thử tìm bằng số điện thoại, email hoặc tên khác
            </Text>
          </View>
        )}

      {/* Search History */}
      {searchQuery.length === 0 && renderSearchHistory()}

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                activeFilter === tab.key && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={
                  activeFilter === tab.key ? "#FFFFFF" : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push("/messages/create-group")}
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: COLORS.primary },
            ]}
          >
            <Ionicons name="people" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Tạo nhóm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/messages/add-contact");
          }}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: COLORS.online }]}
          >
            <Ionicons name="person-add" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Thêm liên hệ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/utilities/qr-scanner");
          }}
        >
          <View
            style={[
              styles.quickActionIcon,
              { backgroundColor: COLORS.support },
            ]}
          >
            <Ionicons name="scan" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Quét QR</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      {renderSupportSection()}

      {/* Contacts Section Header */}
      {(activeFilter === "all" ||
        activeFilter === "staff" ||
        activeFilter === "customer") &&
        filteredContacts.filter((c) => !c.isSupport).length > 0 && (
          <View style={styles.sectionHeader}>
            <Ionicons
              name={activeFilter === "customer" ? "person" : "people"}
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={styles.sectionTitle}>
              {activeFilter === "staff"
                ? "NHÂN VIÊN"
                : activeFilter === "customer"
                  ? "KHÁCH HÀNG"
                  : "LIÊN HỆ GẦN ĐÂY"}
            </Text>
            <Text style={styles.sectionCount}>
              ({filteredContacts.filter((c) => !c.isSupport).length})
            </Text>
          </View>
        )}

      {/* Contacts List */}
      <FlatList
        data={
          activeFilter === "support"
            ? []
            : filteredContacts.filter((c) => !c.isSupport)
        }
        renderItem={({ item }) => (
          <ContactItem
            contact={item}
            onPress={() => handleContactPress(item)}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          contactsLoading && !refreshing ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải liên hệ...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons
              name={activeFilter === "support" ? "headset" : "person-outline"}
              size={48}
              color={COLORS.textTertiary}
            />
            <Text style={styles.emptyText}>
              {activeFilter === "support"
                ? "Xem danh sách CSKH ở trên"
                : searchQuery
                  ? "Không tìm thấy liên hệ"
                  : contactsLoading
                    ? ""
                    : "Chưa có liên hệ nào"}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },

  // Filter Tabs
  filterTabs: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickAction: {
    alignItems: "center",
    marginRight: 24,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
  },

  // Support Section
  supportSection: {
    backgroundColor: "#FEF7ED",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  supportScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  supportCard: {
    alignItems: "center",
    width: 80,
    marginRight: 12,
  },
  supportCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.support,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  supportCardName: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.text,
    textAlign: "center",
  },
  supportCardDot: {
    position: "absolute",
    top: 2,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: "#FEF7ED",
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FEF7ED",
  },
  supportIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FDE68A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  supportDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  supportResponseTime: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
  },
  supportActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineBadge: {
    backgroundColor: COLORS.online,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 12,
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  callHotline: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
  },
  callHotlineText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.primary,
    marginLeft: 4,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  sectionTitleSupport: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.support,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 4,
  },

  // Contact Item
  listContent: {
    paddingBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 76,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  staffBadge: {
    backgroundColor: COLORS.staff,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  contactRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  contactEmail: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },

  // Search Type Hint
  searchTypeHint: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
    marginLeft: 4,
  },

  // Search Results (Facebook Style)
  searchResultsList: {
    paddingHorizontal: 0,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  searchResultSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mutualFriendsText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  friendBadge: {
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  friendBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.primary,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },

  // Search History
  historySection: {
    paddingTop: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  clearHistoryText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  historyItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  historyQuery: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  historyResultName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Loading State
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  // Search Error
  searchErrorBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FEF2F2",
  },
  searchErrorText: {
    fontSize: 13,
    color: "#DC2626",
    marginLeft: 6,
  },

  // Empty Search State
  emptySearchState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  emptySearchSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
