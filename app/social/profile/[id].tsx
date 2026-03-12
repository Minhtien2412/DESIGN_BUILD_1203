/**
 * User Profile Screen
 * Facebook-style profile with timeline
 *
 * @author AI Assistant
 * @date 23/12/2025
 */

import { PostCard } from "@/components/social";
import { useAuth } from "@/context/AuthContext";
import { SocialProvider, useSocial } from "@/context/SocialContext";
import { Post, SocialUser } from "@/types/social";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COVER_HEIGHT = 200;

interface ProfileHeaderProps {
  profile: SocialUser;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

// Profile Header Component
function ProfileHeader({
  profile,
  isOwnProfile,
  onEditProfile,
  onFollow,
  onMessage,
}: ProfileHeaderProps) {
  return (
    <View style={styles.profileHeader}>
      {/* Cover Photo */}
      <View style={styles.coverContainer}>
        <Image
          source={{
            uri:
              profile.coverPhoto ||
              "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=200&q=80",
          }}
          style={styles.coverPhoto}
        />
        {isOwnProfile && (
          <TouchableOpacity style={styles.editCoverButton}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri:
              profile.avatar ||
              "https://ui-avatars.com/api/?name=User&size=168&background=FF6B35&color=fff",
          }}
          style={styles.avatar}
        />
        {isOwnProfile && (
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#050505" />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Text style={styles.displayName}>{profile.displayName}</Text>

        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followersCount || 0}</Text>
            <Text style={styles.statLabel}>người theo dõi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followingCount || 0}</Text>
            <Text style={styles.statLabel}>đang theo dõi</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={onEditProfile}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Thêm vào tin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onEditProfile}
              >
                <Ionicons name="pencil" size={16} color="#050505" />
                <Text style={styles.secondaryButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  profile.isFollowing
                    ? styles.secondaryButton
                    : styles.primaryButton,
                ]}
                onPress={onFollow}
              >
                <Ionicons
                  name={profile.isFollowing ? "checkmark" : "person-add"}
                  size={16}
                  color={profile.isFollowing ? "#050505" : "#FFFFFF"}
                />
                <Text
                  style={
                    profile.isFollowing
                      ? styles.secondaryButtonText
                      : styles.primaryButtonText
                  }
                >
                  {profile.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onMessage}
              >
                <Ionicons name="chatbubble" size={16} color="#050505" />
                <Text style={styles.secondaryButtonText}>Nhắn tin</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#050505" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Bài viết</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Giới thiệu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Ảnh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Profile Content
function ProfileContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { state, loadProfile, loadFeed, refreshFeed } = useSocial();

  const [isLoading, setIsLoading] = useState(true);
  const profile = state.profiles[id || ""];
  // Get posts from profile feed (news_feed for now - later add profile-specific feed)
  const currentTimeline = state.feeds["news_feed"];
  const posts = currentTimeline?.posts?.filter((p) => p.authorId === id) || [];
  const isOwnProfile = user?.id === id;

  // Load profile data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadProfile(id || "");
      await loadFeed();
      setIsLoading(false);
    };
    load();
  }, [id]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([loadProfile(id || ""), refreshFeed()]);
  }, [id, loadProfile, refreshFeed]);

  // Edit profile
  const handleEditProfile = useCallback(() => {
    router.push("/profile/edit" as any);
  }, []);

  // Follow user
  const handleFollow = useCallback(() => {
    // TODO: Implement follow/unfollow
    console.log("Follow/unfollow:", id);
  }, [id]);

  // Message user
  const handleMessage = useCallback(() => {
    router.push(`/messages/${id}` as any);
  }, [id]);

  // Render post
  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onPress={() => router.push(`/social/post/${item.id}` as any)}
      />
    ),
    [],
  );

  // Render header
  const renderHeader = useCallback(() => {
    if (!profile) return null;
    return (
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditProfile={handleEditProfile}
        onFollow={handleFollow}
        onMessage={handleMessage}
      />
    );
  }, [profile, isOwnProfile, handleEditProfile, handleFollow, handleMessage]);

  // Loading state
  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  // Error state
  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={64} color="#BCC0C4" />
        <Text style={styles.errorTitle}>Không tìm thấy người dùng</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      refreshControl={
        <RefreshControl
          refreshing={state.isRefreshing}
          onRefresh={handleRefresh}
          colors={["#1877F2"]}
          tintColor="#1877F2"
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      ListEmptyComponent={
        <View style={styles.emptyPosts}>
          <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
        </View>
      }
    />
  );
}

// Main Screen
export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SocialProvider>
        <View style={styles.container}>
          <ProfileContent />
        </View>
      </SocialProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#050505",
    marginTop: 16,
  },
  errorButton: {
    marginTop: 20,
    backgroundColor: "#1877F2",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Profile Header
  profileHeader: {
    backgroundColor: "#FFFFFF",
  },
  coverContainer: {
    height: COVER_HEIGHT,
    backgroundColor: "#1877F2",
    position: "relative",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editCoverButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: "absolute",
    top: COVER_HEIGHT - 60,
    left: 16,
    zIndex: 10,
  },
  avatar: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E4E6EB",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    marginTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#050505",
  },
  bio: {
    fontSize: 15,
    color: "#65676B",
    marginTop: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#050505",
  },
  statLabel: {
    fontSize: 15,
    color: "#65676B",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: "#1877F2",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#E4E6EB",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#050505",
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#E4E6EB",
    alignItems: "center",
    justifyContent: "center",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E4E6EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#1877F2",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#65676B",
  },
  activeTabText: {
    color: "#1877F2",
  },

  // Posts
  divider: {
    height: 8,
    backgroundColor: "#F0F2F5",
  },
  emptyPosts: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  emptyText: {
    fontSize: 15,
    color: "#65676B",
  },
});
