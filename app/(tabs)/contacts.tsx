import { CallHistoryList } from "@/components/call";
import { ContactActionCard } from "@/components/communication";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useAuth } from "@/context/AuthContext";
import { useCommunicationHub } from "@/context/CommunicationHubContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import phoneContactSyncService, {
    MatchedFriend,
} from "@/services/phoneContactSyncService";
import { Contact } from "@/services/unifiedContacts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ContactsScreen() {
  const { user } = useAuth();
  const {
    contacts,
    favoriteContacts,
    onlineContacts,
    groups,
    refreshContacts,
    connected,
  } = useCommunicationHub();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Phone contacts sync state
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [matchedFriends, setMatchedFriends] = useState<MatchedFriend[]>([]);
  const [syncSettings, setSyncSettings] = useState(
    phoneContactSyncService.getSettings(),
  );

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "card");
  const backgroundColor = useThemeColor({}, "background");

  // Load matched friends on mount
  useEffect(() => {
    const loadSyncData = async () => {
      const settings = phoneContactSyncService.getSettings();
      setSyncSettings(settings);
      setMatchedFriends(phoneContactSyncService.getMatchedFriends());

      // Check if should show sync prompt
      const dismissed = await phoneContactSyncService.wasSyncDismissed();
      if (
        !dismissed &&
        !settings.hasPermission &&
        matchedFriends.length === 0
      ) {
        setShowSyncPrompt(true);
      }
    };
    loadSyncData();
  }, []);

  // Handle phone contacts sync
  const handleSyncContacts = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await phoneContactSyncService.syncContacts();
      if (result.success) {
        setMatchedFriends(result.friends);
        setSyncSettings(phoneContactSyncService.getSettings());
        Alert.alert(
          "✅ Đồng bộ thành công",
          `Tìm thấy ${result.matchedCount} bạn bè đang dùng ứng dụng!`,
        );
      } else {
        Alert.alert("Lỗi", result.error || "Không thể đồng bộ danh bạ");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đồng bộ thất bại");
    } finally {
      setIsSyncing(false);
      setShowSyncPrompt(false);
    }
  }, []);

  // Show sync dialog
  const handleShowSyncDialog = useCallback(() => {
    phoneContactSyncService.showSyncRequestDialog(handleSyncContacts, () =>
      setShowSyncPrompt(false),
    );
  }, [handleSyncContacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshContacts();
    // Also refresh matched friends if synced before
    if (syncSettings.hasPermission) {
      await phoneContactSyncService.syncContacts();
      setMatchedFriends(phoneContactSyncService.getMatchedFriends());
    }
    setRefreshing(false);
  };

  const filteredContacts = searchQuery.trim()
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone?.includes(searchQuery),
      )
    : contacts;

  // Filter matched friends by search
  const filteredMatchedFriends = searchQuery.trim()
    ? matchedFriends.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.phone.includes(searchQuery),
      )
    : matchedFriends;

  const handleOpenCommunicationHub = () => {
    router.push("/communication");
  };

  // Navigate to chat with matched friend
  const handleChatWithFriend = (friend: MatchedFriend) => {
    router.push(`/chat/${friend.id}`);
  };

  // Navigate to call with matched friend
  const handleCallFriend = (friend: MatchedFriend, type: "audio" | "video") => {
    const userId = encodeURIComponent(String(friend.id));
    const callType = encodeURIComponent(type);
    router.push(`/call/${userId}?type=${callType}`);
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <ContactActionCard contact={item} showActions={true} />
  );

  // Render matched friend item (Zalo-style)
  const renderMatchedFriend = (friend: MatchedFriend) => (
    <View
      key={friend.id}
      style={[styles.friendCard, { backgroundColor: cardBg }]}
    >
      <View style={styles.friendAvatarContainer}>
        {friend.avatar ? (
          <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
        ) : (
          <View
            style={[
              styles.friendAvatarPlaceholder,
              { backgroundColor: tintColor + "20" },
            ]}
          >
            <Text style={[styles.friendAvatarText, { color: tintColor }]}>
              {friend.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                friend.status === "online"
                  ? "#22C55E"
                  : friend.status === "away"
                    ? "#F59E0B"
                    : "#9CA3AF",
            },
          ]}
        />
      </View>

      <View style={styles.friendInfo}>
        <Text
          style={[styles.friendName, { color: textColor }]}
          numberOfLines={1}
        >
          {friend.name}
        </Text>
        <Text
          style={[styles.friendContactName, { color: textColor + "70" }]}
          numberOfLines={1}
        >
          📱 {friend.contactName}
        </Text>
        <Text style={[styles.friendPhone, { color: textColor + "50" }]}>
          {friend.phoneMasked}
        </Text>
      </View>

      <View style={styles.friendActions}>
        <TouchableOpacity
          style={[
            styles.friendActionBtn,
            { backgroundColor: tintColor + "15" },
          ]}
          onPress={() => handleChatWithFriend(friend)}
        >
          <Ionicons name="chatbubble" size={18} color={tintColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.friendActionBtn, { backgroundColor: "#22C55E15" }]}
          onPress={() => handleCallFriend(friend, "audio")}
        >
          <Ionicons name="call" size={18} color="#22C55E" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.friendActionBtn, { backgroundColor: "#0D948815" }]}
          onPress={() => handleCallFriend(friend, "video")}
        >
          <Ionicons name="videocam" size={18} color="#0D9488" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: textColor }]}>
              📞 Danh bạ & Liên hệ
            </Text>
            <Text style={[styles.subtitle, { color: textColor + "80" }]}>
              Gọi video/audio trực tiếp với đồng nghiệp
            </Text>
          </View>
          {/* Connection status */}
          <View
            style={[
              styles.connectionBadge,
              { backgroundColor: connected ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: connected ? "#0D9488" : "#000000" },
              ]}
            />
            <Text
              style={[
                styles.connectionText,
                { color: connected ? "#0D9488" : "#000000" },
              ]}
            >
              {connected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
          <Ionicons name="search" size={20} color={textColor + "50"} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm kiếm liên hệ..."
            placeholderTextColor={textColor + "50"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={textColor + "50"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Open Full Communication Hub */}
        <TouchableOpacity
          style={[styles.hubButton, { backgroundColor: tintColor }]}
          onPress={handleOpenCommunicationHub}
        >
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.hubButtonText}>
            Mở trung tâm liên lạc (Tin nhắn, Cuộc gọi, Live)
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Phone Contacts Sync Prompt (Zalo-style) */}
        {showSyncPrompt && !syncSettings.hasPermission && (
          <View
            style={[
              styles.syncPromptCard,
              {
                backgroundColor: tintColor + "10",
                borderColor: tintColor + "30",
              },
            ]}
          >
            <View style={styles.syncPromptHeader}>
              <Ionicons name="people-circle" size={40} color={tintColor} />
              <View style={styles.syncPromptContent}>
                <Text style={[styles.syncPromptTitle, { color: textColor }]}>
                  🔍 Tìm bạn bè trên App
                </Text>
                <Text
                  style={[styles.syncPromptDesc, { color: textColor + "70" }]}
                >
                  Đồng bộ danh bạ để tìm bạn bè đang dùng ứng dụng
                </Text>
              </View>
            </View>
            <View style={styles.syncPromptActions}>
              <TouchableOpacity
                style={[styles.syncDeclineBtn]}
                onPress={async () => {
                  await phoneContactSyncService.dismissSyncPrompt();
                  setShowSyncPrompt(false);
                }}
              >
                <Text
                  style={[styles.syncDeclineText, { color: textColor + "60" }]}
                >
                  Để sau
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.syncAcceptBtn, { backgroundColor: tintColor }]}
                onPress={handleShowSyncDialog}
              >
                <Ionicons name="sync" size={16} color="#fff" />
                <Text style={styles.syncAcceptText}>Đồng bộ ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sync Button (if already has permission but no recent sync) */}
        {syncSettings.hasPermission &&
          matchedFriends.length === 0 &&
          !isSyncing && (
            <TouchableOpacity
              style={[
                styles.syncRefreshBtn,
                {
                  backgroundColor: tintColor + "10",
                  borderColor: tintColor + "30",
                },
              ]}
              onPress={handleSyncContacts}
            >
              <Ionicons name="sync-circle" size={24} color={tintColor} />
              <Text style={[styles.syncRefreshText, { color: tintColor }]}>
                Đồng bộ danh bạ để tìm bạn bè
              </Text>
            </TouchableOpacity>
          )}

        {/* Syncing Indicator */}
        {isSyncing && (
          <View style={[styles.syncingCard, { backgroundColor: cardBg }]}>
            <ActivityIndicator size="small" color={tintColor} />
            <Text style={[styles.syncingText, { color: textColor }]}>
              Đang tìm kiếm bạn bè...
            </Text>
          </View>
        )}

        {/* Matched Friends from Phone Contacts (Zalo-style) */}
        {matchedFriends.length > 0 && (
          <Section
            title={`📱 Bạn bè trên App (${filteredMatchedFriends.length})`}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionSubtitle, { color: textColor + "60" }]}
              >
                Từ danh bạ điện thoại của bạn
              </Text>
              <TouchableOpacity
                onPress={handleSyncContacts}
                disabled={isSyncing}
              >
                <Ionicons name="refresh" size={20} color={tintColor} />
              </TouchableOpacity>
            </View>
            {filteredMatchedFriends.map(renderMatchedFriend)}
            {syncSettings.lastSyncAt && (
              <Text style={[styles.lastSyncText, { color: textColor + "40" }]}>
                Cập nhật lần cuối:{" "}
                {new Date(syncSettings.lastSyncAt).toLocaleString("vi-VN")}
              </Text>
            )}
          </Section>
        )}

        {/* Online Now */}
        {onlineContacts.length > 0 && (
          <Section title={`🟢 Đang hoạt động (${onlineContacts.length})`}>
            <FlatList
              horizontal
              data={onlineContacts}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ContactActionCard contact={item} compact />
              )}
            />
          </Section>
        )}

        {/* Favorites */}
        {favoriteContacts.length > 0 && (
          <Section title="⭐ Yêu thích">
            {favoriteContacts.map((contact) => (
              <ContactActionCard
                key={contact.id}
                contact={contact}
                showActions
              />
            ))}
          </Section>
        )}

        {/* All Contacts */}
        <Section title={`👥 Tất cả liên hệ (${filteredContacts.length})`}>
          {filteredContacts.map((contact) => (
            <ContactActionCard key={contact.id} contact={contact} showActions />
          ))}
        </Section>

        {/* Call History */}
        <CallHistoryList />

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: tintColor + "10" }]}>
          <Ionicons name="information-circle" size={20} color={tintColor} />
          <Text style={[styles.infoText, { color: textColor + "80" }]}>
            Nhấn vào biểu tượng video/audio để bắt đầu cuộc gọi. Đảm bảo bạn đã
            cấp quyền truy cập camera và microphone.
          </Text>
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  connectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  hubButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  hubButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  // Phone Contacts Sync Styles (Zalo-style)
  syncPromptCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  syncPromptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  syncPromptContent: {
    flex: 1,
  },
  syncPromptTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  syncPromptDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  syncPromptActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  syncDeclineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  syncDeclineText: {
    fontSize: 14,
    fontWeight: "500",
  },
  syncAcceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  syncAcceptText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  syncRefreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  syncRefreshText: {
    fontSize: 14,
    fontWeight: "500",
  },
  syncingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  syncingText: {
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    flex: 1,
  },
  lastSyncText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
  },
  // Matched Friend Card Styles
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  friendAvatarContainer: {
    position: "relative",
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarText: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  friendContactName: {
    fontSize: 13,
    marginBottom: 2,
  },
  friendPhone: {
    fontSize: 12,
  },
  friendActions: {
    flexDirection: "row",
    gap: 8,
  },
  friendActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
