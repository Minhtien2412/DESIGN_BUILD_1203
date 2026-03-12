/**
 * Instagram-Inspired Feed + Glassmorphic Tab Bar
 * ================================================
 * Premium social media feed with:
 * - Story carousel with animated gradient borders
 * - Double-tap to like with heart burst animation
 * - Detached floating glassmorphic tab bar with blur
 * - Expandable menu with spring physics
 * - Smooth scroll-based animations
 * - iOS-native feel throughout
 *
 * Stack: React Native • Expo • TypeScript • Reanimated • BlurView • Ionicons
 */

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");
const SPRING_CONFIG = { damping: 12, stiffness: 170, mass: 0.8 };
const SPRING_BOUNCY = { damping: 8, stiffness: 200, mass: 0.6 };

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  bg: "#FAFAFA",
  card: "#FFFFFF",
  text: "#262626",
  textMuted: "#8E8E8E",
  textLight: "#C7C7CC",
  accent: "#0D9488",
  like: "#ED4956",
  gradient1: ["#F58529", "#DD2A7B", "#8134AF", "#515BD4"] as const,
  gradient2: [
    "#405DE6",
    "#5851DB",
    "#833AB4",
    "#C13584",
    "#E1306C",
    "#FD1D1D",
    "#F77737",
  ] as const,
  storyBg: ["#F09433", "#E6683C", "#DC2743", "#CC2366", "#BC1888"] as const,
  glassBg: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.5)",
  shadow: "rgba(0,0,0,0.08)",
  overlay: "rgba(0,0,0,0.4)",
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const STORIES = [
  {
    id: "your",
    username: "Tin của bạn",
    avatar: "https://i.pravatar.cc/150?img=0",
    isYours: true,
  },
  {
    id: "1",
    username: "kts_design",
    avatar: "https://i.pravatar.cc/150?img=1",
    hasNew: true,
  },
  {
    id: "2",
    username: "noi_that_dep",
    avatar: "https://i.pravatar.cc/150?img=2",
    hasNew: true,
  },
  {
    id: "3",
    username: "xay_dung_vn",
    avatar: "https://i.pravatar.cc/150?img=3",
    hasNew: true,
  },
  {
    id: "4",
    username: "kien_truc_su",
    avatar: "https://i.pravatar.cc/150?img=4",
    hasNew: false,
  },
  {
    id: "5",
    username: "vlxd_pro",
    avatar: "https://i.pravatar.cc/150?img=5",
    hasNew: true,
  },
  {
    id: "6",
    username: "resort_vn",
    avatar: "https://i.pravatar.cc/150?img=6",
    hasNew: true,
  },
  {
    id: "7",
    username: "biet_thu_dep",
    avatar: "https://i.pravatar.cc/150?img=7",
    hasNew: false,
  },
];

const FEED_POSTS = [
  {
    id: "p1",
    user: {
      username: "kts_design",
      avatar: "https://i.pravatar.cc/80?img=1",
      verified: true,
    },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    ],
    caption:
      "Thiết kế biệt thự hiện đại 2026 ✨ Sử dụng kính cường lực và bê tông trần tạo nên không gian mở, hòa hợp với thiên nhiên 🌿 #kientruc #design",
    likes: 2847,
    comments: 184,
    timeAgo: "2 giờ",
    location: "Đà Nẵng, Việt Nam",
  },
  {
    id: "p2",
    user: {
      username: "noi_that_dep",
      avatar: "https://i.pravatar.cc/80?img=2",
      verified: false,
    },
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800",
    ],
    caption:
      "Phòng khách tối giản Scandinavian 🛋️ Tông trắng-be kết hợp gỗ tự nhiên tạo cảm giác ấm cúng, thanh lịch",
    likes: 1523,
    comments: 96,
    timeAgo: "5 giờ",
    location: "Hồ Chí Minh",
  },
  {
    id: "p3",
    user: {
      username: "xay_dung_vn",
      avatar: "https://i.pravatar.cc/80?img=3",
      verified: true,
    },
    images: ["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800"],
    caption:
      "Tiến độ dự án Resort Phú Quốc 🏗️ Hoàn thành 80% phần thô. Dự kiến bàn giao Q3/2026",
    likes: 4291,
    comments: 312,
    timeAgo: "8 giờ",
    location: "Phú Quốc, Kiên Giang",
  },
  {
    id: "p4",
    user: {
      username: "resort_vn",
      avatar: "https://i.pravatar.cc/80?img=6",
      verified: true,
    },
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
    ],
    caption:
      "Villa view biển tuyệt đẹp 🌊🏖️ Mỗi căn villa được thiết kế riêng biệt, tối ưu ánh sáng tự nhiên và tầm nhìn ra đại dương",
    likes: 6102,
    comments: 428,
    timeAgo: "1 ngày",
    location: "Nha Trang, Khánh Hòa",
  },
];

// ═══════════════════════════════════════════════════════════════
// STORY ITEM WITH GRADIENT BORDER
// ═══════════════════════════════════════════════════════════════
const StoryItem = React.memo(
  ({ story, index }: { story: (typeof STORIES)[0]; index: number }) => {
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
      scale.value = withSpring(0.92, SPRING_BOUNCY);
    };
    const onPressOut = () => {
      scale.value = withSpring(1, SPRING_BOUNCY);
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 60).springify()}
        style={styles.storyWrapper}
      >
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View style={animStyle}>
            {story.hasNew || story.isYours ? (
              <LinearGradient
                colors={story.isYours ? ["#C7C7CC", "#E0E0E0"] : [...C.storyBg]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.storyGradientBorder}
              >
                <View style={styles.storyInnerBorder}>
                  <Image
                    source={{ uri: story.avatar }}
                    style={styles.storyAvatar}
                    contentFit="cover"
                  />
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.storyNoBorder}>
                <Image
                  source={{ uri: story.avatar }}
                  style={styles.storyAvatar}
                  contentFit="cover"
                />
              </View>
            )}
            {story.isYours && (
              <View style={styles.storyAddBtn}>
                <Ionicons name="add" size={14} color="#FFF" />
              </View>
            )}
          </Animated.View>
          <Text style={styles.storyUsername} numberOfLines={1}>
            {story.isYours ? "Tin của bạn" : story.username}
          </Text>
        </Pressable>
      </Animated.View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════
// DOUBLE-TAP HEART ANIMATION
// ═══════════════════════════════════════════════════════════════
const HeartOverlay = ({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone: () => void;
}) => {
  if (!visible) return null;
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(6)}
      exiting={ZoomOut.delay(600).duration(300)}
      style={styles.heartOverlay}
      onLayout={() => setTimeout(onDone, 1000)}
    >
      <Ionicons
        name="heart"
        size={90}
        color="#FFF"
        style={styles.heartShadow}
      />
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// FEED POST CARD
// ═══════════════════════════════════════════════════════════════
const FeedPost = React.memo(
  ({ post, index }: { post: (typeof FEED_POSTS)[0]; index: number }) => {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const lastTap = useRef(0);
    const likeScale = useSharedValue(1);

    const likeAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));

    const handleDoubleTap = useCallback(() => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double tap detected
        if (!liked) {
          setLiked(true);
          setLikeCount((c) => c + 1);
        }
        setShowHeart(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        likeScale.value = withSequence(
          withSpring(1.3, SPRING_BOUNCY),
          withSpring(1, SPRING_CONFIG),
        );
      }
      lastTap.current = now;
    }, [liked, likeScale]);

    const toggleLike = useCallback(() => {
      setLiked((prev) => {
        setLikeCount((c) => (prev ? c - 1 : c + 1));
        return !prev;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      likeScale.value = withSequence(
        withSpring(1.4, SPRING_BOUNCY),
        withSpring(1, SPRING_CONFIG),
      );
    }, [likeScale]);

    const formatCount = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
      return n.toString();
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).springify()}
        style={styles.postCard}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <LinearGradient
              colors={[...C.storyBg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.postAvatarGradient}
            >
              <View style={styles.postAvatarInner}>
                <Image
                  source={{ uri: post.user.avatar }}
                  style={styles.postAvatar}
                  contentFit="cover"
                />
              </View>
            </LinearGradient>
            <View>
              <View style={styles.usernameRow}>
                <Text style={styles.postUsername}>{post.user.username}</Text>
                {post.user.verified && (
                  <Ionicons name="checkmark-circle" size={14} color="#3897F0" />
                )}
              </View>
              {post.location && (
                <Text style={styles.postLocation}>{post.location}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity hitSlop={12}>
            <Ionicons name="ellipsis-horizontal" size={20} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* Image (Double-tap to like) */}
        <Pressable onPress={handleDoubleTap} style={styles.postImageContainer}>
          <Image
            source={{ uri: post.images[0] }}
            style={styles.postImage}
            contentFit="cover"
            transition={300}
          />
          <HeartOverlay
            visible={showHeart}
            onDone={() => setShowHeart(false)}
          />
          {post.images.length > 1 && (
            <View style={styles.multipleIndicator}>
              <Ionicons name="copy-outline" size={16} color="#FFF" />
            </View>
          )}
        </Pressable>

        {/* Actions */}
        <View style={styles.postActions}>
          <View style={styles.postActionsLeft}>
            <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
              <Animated.View style={likeAnimStyle}>
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={26}
                  color={liked ? C.like : C.text}
                />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={24} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="paper-plane-outline" size={24} color={C.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSaved(!saved);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={C.text}
            />
          </TouchableOpacity>
        </View>

        {/* Likes & Caption */}
        <View style={styles.postContent}>
          <Text style={styles.likesText}>
            {formatCount(likeCount)} lượt thích
          </Text>
          <Text style={styles.captionText} numberOfLines={3}>
            <Text style={styles.captionUsername}>{post.user.username} </Text>
            {post.caption}
          </Text>
          <TouchableOpacity>
            <Text style={styles.viewComments}>
              Xem tất cả {post.comments} bình luận
            </Text>
          </TouchableOpacity>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
      </Animated.View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════
// GLASSMORPHIC FLOATING TAB BAR
// ═══════════════════════════════════════════════════════════════
const TABS = [
  {
    icon: "home" as const,
    iconOutline: "home-outline" as const,
    label: "Trang chủ",
  },
  {
    icon: "search" as const,
    iconOutline: "search-outline" as const,
    label: "Tìm kiếm",
  },
  {
    icon: "add-circle" as const,
    iconOutline: "add-circle-outline" as const,
    label: "Đăng",
  },
  {
    icon: "heart" as const,
    iconOutline: "heart-outline" as const,
    label: "Hoạt động",
  },
  {
    icon: "person" as const,
    iconOutline: "person-outline" as const,
    label: "Cá nhân",
  },
];

const GlassmorphicTabBar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const toggleMenu = (idx: number) => {
    if (idx === 2) {
      // Center button → expand menu
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const next = !menuOpen;
      setMenuOpen(next);
      menuAnim.value = withSpring(next ? 1 : 0, SPRING_CONFIG);
    } else {
      setActiveTab(idx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (menuOpen) {
        setMenuOpen(false);
        menuAnim.value = withSpring(0, SPRING_CONFIG);
      }
    }
  };

  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuAnim.value,
    transform: [
      { translateY: interpolate(menuAnim.value, [0, 1], [40, 0]) },
      { scale: interpolate(menuAnim.value, [0, 1], [0.8, 1]) },
    ],
  }));

  const centerBtnStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(menuAnim.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  const MENU_ACTIONS = [
    { icon: "camera-outline" as const, label: "Chụp ảnh", color: "#E1306C" },
    {
      icon: "videocam-outline" as const,
      label: "Quay video",
      color: "#833AB4",
    },
    { icon: "text-outline" as const, label: "Bài viết", color: "#405DE6" },
    { icon: "location-outline" as const, label: "Check in", color: "#FD1D1D" },
  ];

  return (
    <>
      {/* Expanded menu overlay */}
      {menuOpen && (
        <Animated.View style={[styles.menuOverlay, menuStyle]}>
          <BlurView intensity={40} tint="light" style={styles.menuBlur}>
            <View style={styles.menuGrid}>
              {MENU_ACTIONS.map((action, i) => (
                <Animated.View
                  key={action.label}
                  entering={FadeInUp.delay(i * 50).springify()}
                >
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuOpen(false);
                      menuAnim.value = withSpring(0, SPRING_CONFIG);
                    }}
                  >
                    <View
                      style={[
                        styles.menuIconBg,
                        { backgroundColor: action.color + "18" },
                      ]}
                    >
                      <Ionicons
                        name={action.icon}
                        size={24}
                        color={action.color}
                      />
                    </View>
                    <Text style={styles.menuLabel}>{action.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Floating glassmorphic tab bar */}
      <View
        style={[
          styles.tabBarOuter,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <BlurView intensity={80} tint="light" style={styles.tabBarBlur}>
          <View style={styles.tabBarInner}>
            {TABS.map((tab, idx) => {
              const isActive = idx === activeTab;
              const isCenter = idx === 2;

              if (isCenter) {
                return (
                  <TouchableOpacity
                    key={tab.label}
                    onPress={() => toggleMenu(idx)}
                    style={styles.tabItem}
                    activeOpacity={0.7}
                  >
                    <Animated.View style={centerBtnStyle}>
                      <LinearGradient
                        colors={["#833AB4", "#E1306C", "#F77737"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.centerBtn}
                      >
                        <Ionicons name="add" size={28} color="#FFF" />
                      </LinearGradient>
                    </Animated.View>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={tab.label}
                  onPress={() => toggleMenu(idx)}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isActive ? tab.icon : tab.iconOutline}
                    size={24}
                    color={isActive ? C.text : C.textMuted}
                  />
                  {isActive && <View style={styles.tabDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
export default function InstagramFeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 60], [1, 0.9]),
    transform: [
      { translateY: interpolate(scrollY.value, [0, 100], [0, -10], "clamp") },
    ],
  }));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Stories */}
        <View style={styles.storiesContainer}>
          <FlatList
            data={STORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(s) => s.id}
            contentContainerStyle={styles.storiesList}
            renderItem={({ item, index }) => (
              <StoryItem story={item} index={index} />
            )}
          />
        </View>
        <View style={styles.storiesDivider} />
      </View>
    ),
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.logo}>BaoTienWeb</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/(tabs)/notifications" as never)}
          >
            <Ionicons name="heart-outline" size={26} color={C.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/chat" as never)}
          >
            <Ionicons name="paper-plane-outline" size={24} color={C.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Feed */}
      <Animated.FlatList
        data={FEED_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <FeedPost post={item} index={index} />}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.accent}
          />
        }
      />

      {/* Glassmorphic Tab Bar */}
      <GlassmorphicTabBar />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.bg,
  },
  logo: {
    fontSize: 26,
    fontWeight: "700",
    color: C.text,
    fontStyle: "italic",
    letterSpacing: -0.5,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerBtn: { position: "relative" },
  notifDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.like,
  },

  // Stories
  storiesContainer: { backgroundColor: C.bg },
  storiesList: { paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  storyWrapper: { alignItems: "center", width: 76 },
  storyGradientBorder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  storyInnerBorder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  storyNoBorder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.textLight,
  },
  storyAvatar: { width: 58, height: 58, borderRadius: 29 },
  storyUsername: {
    fontSize: 11,
    color: C.text,
    marginTop: 4,
    textAlign: "center",
    width: 70,
  },
  storyAddBtn: {
    position: "absolute",
    bottom: 18,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3897F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.bg,
  },
  storiesDivider: {
    height: 0.5,
    backgroundColor: "#DBDBDB",
  },

  // Post
  postCard: { backgroundColor: C.card, marginBottom: 8 },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  postAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatarInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatar: { width: 30, height: 30, borderRadius: 15 },
  usernameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  postUsername: { fontSize: 13, fontWeight: "600", color: C.text },
  postLocation: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  // Image
  postImageContainer: { width: SW, height: SW, position: "relative" },
  postImage: { width: "100%", height: "100%" },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heartShadow: {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  multipleIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 6,
  },

  // Actions
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  postActionsLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  actionBtn: { padding: 2 },

  // Content
  postContent: { paddingHorizontal: 12, paddingBottom: 12, gap: 4 },
  likesText: { fontSize: 13, fontWeight: "600", color: C.text },
  captionText: { fontSize: 13, color: C.text, lineHeight: 18 },
  captionUsername: { fontWeight: "600" },
  viewComments: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  timeAgo: {
    fontSize: 10,
    color: C.textMuted,
    textTransform: "uppercase",
    marginTop: 4,
  },

  // Tab Bar
  tabBarOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  tabBarBlur: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: C.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  tabBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 40,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.text,
    marginTop: 4,
  },
  centerBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // Menu overlay
  menuOverlay: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  menuBlur: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: C.glassBorder,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 16,
  },
  menuItem: { alignItems: "center", width: 70 },
  menuIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  menuLabel: { fontSize: 11, color: C.text, fontWeight: "500" },
});
