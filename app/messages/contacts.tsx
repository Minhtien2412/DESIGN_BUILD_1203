/**
 * Contacts Screen - Danh bạ liên hệ
 * ==================================
 *
 * Hiển thị danh sách liên hệ với:
 * - Tìm kiếm nhanh
 * - Nhóm theo chữ cái đầu
 * - Trạng thái online/offline
 * - Nhanh chóng gọi/nhắn tin
 * - Thêm liên hệ mới
 *
 * @author ThietKeResort Team
 * @created 2026-02-03
 */

import { MessagesListHeader } from "@/components/navigation/ChatHeader";
import Avatar from "@/components/ui/avatar";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    RefreshControl,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// TYPES
// ============================================================================

interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
  isFavorite?: boolean;
  role?: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

const DEMO_CONTACTS: Contact[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an@email.com",
    phone: "0901234567",
    isOnline: true,
    isFavorite: true,
    role: "Kiến trúc sư",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh@email.com",
    phone: "0902345678",
    isOnline: false,
    lastSeen: "2 giờ trước",
    role: "Kỹ sư xây dựng",
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    email: "cuong@email.com",
    phone: "0903456789",
    isOnline: true,
    role: "Chủ đầu tư",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    email: "dung@email.com",
    phone: "0904567890",
    isOnline: false,
    lastSeen: "Hôm qua",
    isFavorite: true,
    role: "Nhà thiết kế nội thất",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    email: "em@email.com",
    phone: "0905678901",
    isOnline: true,
    role: "Quản lý dự án",
  },
  {
    id: 6,
    name: "Ngô Thị Giang",
    email: "giang@email.com",
    phone: "0906789012",
    isOnline: false,
    lastSeen: "3 ngày trước",
    role: "Kế toán",
  },
  {
    id: 7,
    name: "Đặng Văn Hải",
    email: "hai@email.com",
    phone: "0907890123",
    isOnline: true,
    role: "Thợ điện",
  },
  {
    id: 8,
    name: "Vũ Thị Hương",
    email: "huong@email.com",
    phone: "0908901234",
    isOnline: false,
    role: "Thư ký",
  },
  {
    id: 9,
    name: "Bùi Văn Khoa",
    email: "khoa@email.com",
    phone: "0909012345",
    isOnline: true,
    isFavorite: true,
    role: "Giám sát công trình",
  },
  {
    id: 10,
    name: "Lý Thị Lan",
    email: "lan@email.com",
    phone: "0910123456",
    isOnline: false,
    lastSeen: "1 tuần trước",
    role: "Khách hàng",
  },
  {
    id: 11,
    name: "Hỗ trợ kỹ thuật",
    email: "support@baotienweb.cloud",
    phone: "1900123456",
    isOnline: true,
    role: "Hỗ trợ 24/7",
  },
  {
    id: 12,
    name: "Tư vấn thiết kế",
    email: "design@baotienweb.cloud",
    phone: "1900123457",
    isOnline: true,
    role: "Tư vấn viên",
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [contacts] = useState<Contact[]>(DEMO_CONTACTS);

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query) ||
        c.role?.toLowerCase().includes(query),
    );
  }, [contacts, searchQuery]);

  // Favorite contacts
  const favoriteContacts = useMemo(() => {
    return filteredContacts.filter((c) => c.isFavorite);
  }, [filteredContacts]);

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const grouped: { [key: string]: Contact[] } = {};

    filteredContacts
      .filter((c) => !c.isFavorite)
      .forEach((contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!grouped[firstLetter]) {
          grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(contact);
      });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b, "vi"))
      .map(([title, data]) => ({ title, data }));
  }, [filteredContacts]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch contacts from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Contact press
  const handleContactPress = useCallback((contact: Contact) => {
    router.push(`/messages/${contact.id}`);
  }, []);

  // Call handler
  const handleCall = useCallback(
    (contact: Contact, type: "voice" | "video") => {
      router.push(`/call/${contact.id}?type=${type}` as any);
    },
    [],
  );

  // Render contact item
  const renderContact = useCallback(
    ({ item }: { item: Contact }) => (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleContactPress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            avatar={item.avatar}
            userId={String(item.id)}
            name={item.name}
            pixelSize={52}
            showBadge={false}
          />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        {/* Info */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
            {item.isFavorite && " ⭐"}
          </Text>
          <Text style={styles.contactRole} numberOfLines={1}>
            {item.role || item.email}
          </Text>
          <Text
            style={[
              styles.contactStatus,
              item.isOnline && styles.contactStatusOnline,
            ]}
          >
            {item.isOnline
              ? "● Đang hoạt động"
              : item.lastSeen
                ? `Hoạt động ${item.lastSeen}`
                : "Offline"}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleContactPress(item)}
          >
            <Ionicons
              name="chatbubble"
              size={20}
              color={MODERN_COLORS.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCall(item, "voice")}
          >
            <Ionicons name="call" size={20} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [handleContactPress, handleCall],
  );

  // Render section header
  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    ),
    [],
  );

  // Render favorites
  const renderFavorites = useCallback(() => {
    if (favoriteContacts.length === 0) return null;

    return (
      <View style={styles.favoritesSection}>
        <Text style={styles.sectionLabel}>⭐ Yêu thích</Text>
        <FlatList
          horizontal
          data={favoriteContacts}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.favoritesScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.favoriteItem}
              onPress={() => handleContactPress(item)}
            >
              <View style={styles.favoriteAvatarContainer}>
                <Avatar
                  avatar={item.avatar}
                  userId={String(item.id)}
                  name={item.name}
                  pixelSize={60}
                  showBadge={false}
                />
                {item.isOnline && <View style={styles.favoriteOnline} />}
              </View>
              <Text style={styles.favoriteName} numberOfLines={1}>
                {item.name.split(" ").pop()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }, [favoriteContacts, handleContactPress]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D9488"
        translucent
      />

      {/* Header */}
      <MessagesListHeader
        title="Danh bạ"
        onNewConversation={() => router.push("/messages/new-conversation")}
        onSearchPress={() => {
          // Focus search input
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={MODERN_COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          placeholderTextColor={MODERN_COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={MODERN_COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Contact Button */}
      <TouchableOpacity
        style={styles.addContactButton}
        onPress={() => router.push("/messages/new-conversation")}
      >
        <View style={styles.addContactIcon}>
          <Ionicons name="person-add" size={24} color="#fff" />
        </View>
        <View style={styles.addContactInfo}>
          <Text style={styles.addContactTitle}>Thêm liên hệ mới</Text>
          <Text style={styles.addContactSubtitle}>
            Tìm theo email hoặc số điện thoại
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={MODERN_COLORS.textSecondary}
        />
      </TouchableOpacity>

      {/* Favorites */}
      {renderFavorites()}

      {/* Contacts List */}
      <SectionList
        sections={groupedContacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderContact}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[MODERN_COLORS.primary]}
            tintColor={MODERN_COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={64}
              color={MODERN_COLORS.textSecondary}
            />
            <Text style={styles.emptyTitle}>Không tìm thấy liên hệ</Text>
            <Text style={styles.emptySubtitle}>
              Thử tìm kiếm với từ khóa khác
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginHorizontal: MODERN_SPACING.md,
    marginVertical: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  searchInput: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },

  // Add Contact
  addContactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  addContactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: MODERN_SPACING.md,
  },
  addContactInfo: {
    flex: 1,
  },
  addContactTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  addContactSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  // Favorites
  favoritesSection: {
    marginBottom: MODERN_SPACING.md,
  },
  sectionLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  favoritesScroll: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
  },
  favoriteItem: {
    alignItems: "center",
    width: 72,
  },
  favoriteAvatarContainer: {
    position: "relative",
  },
  favoriteOnline: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  favoriteName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.xs,
    textAlign: "center",
  },

  // Section Header
  sectionHeader: {
    backgroundColor: MODERN_COLORS.background,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },

  // Contact Item
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  avatarContainer: {
    position: "relative",
    marginRight: MODERN_SPACING.md,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  contactRole: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  contactStatus: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textTertiary,
    marginTop: 2,
  },
  contactStatusOnline: {
    color: "#22C55E",
  },
  contactActions: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  // List
  listContent: {
    flexGrow: 1,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
  },
});
