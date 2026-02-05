/**
 * Livestream Room Screen
 * Live streaming with chat, gifts, reactions
 * TikTok Live / Shopee Live style interface
 *
 * @route /livestream/[streamId]
 */

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";

const { width, height } = Dimensions.get("window");

// Types
interface StreamHost {
  id: string;
  name: string;
  avatar?: string;
  followers: number;
  isVerified: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  type: "text" | "gift" | "join" | "follow";
  giftName?: string;
  giftIcon?: string;
  giftValue?: number;
  timestamp: Date;
}

interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  sold: number;
}

export default function LivestreamRoomScreen() {
  const { streamId } = useLocalSearchParams<{ streamId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Theme
  const primary = useThemeColor({}, "primary");
  const danger = "#FF3B5C";

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(12847);
  const [likeCount, setLikeCount] = useState(45678);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [duration, setDuration] = useState(1847); // 30 mins

  // Mock host
  const [host] = useState<StreamHost>({
    id: "1",
    name: "Shop DESIGN BUILD",
    avatar: "https://i.pravatar.cc/150?img=10",
    followers: 125000,
    isVerified: true,
  });

  // Mock chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "sys",
      username: "",
      content: "Chào mừng đến livestream!",
      type: "join",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: "2",
      userId: "2",
      username: "user_2",
      avatar: "https://i.pravatar.cc/150?img=2",
      content: "Sản phẩm này còn size L không shop?",
      type: "text",
      timestamp: new Date(Date.now() - 45000),
    },
    {
      id: "3",
      userId: "3",
      username: "user_3",
      content: "",
      type: "gift",
      giftName: "Rose",
      giftIcon: "🌹",
      giftValue: 10,
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: "4",
      userId: "4",
      username: "vip_member",
      avatar: "https://i.pravatar.cc/150?img=4",
      content: "Shop có freeship không ạ?",
      type: "text",
      timestamp: new Date(Date.now() - 15000),
    },
  ]);

  // Mock products
  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Áo thun unisex cotton cao cấp",
      image: "https://picsum.photos/200/200?random=1",
      price: 199000,
      originalPrice: 299000,
      sold: 1234,
    },
    {
      id: "2",
      name: "Quần jean skinny fit",
      image: "https://picsum.photos/200/200?random=2",
      price: 399000,
      originalPrice: 599000,
      sold: 856,
    },
    {
      id: "3",
      name: "Giày sneaker trắng",
      image: "https://picsum.photos/200/200?random=3",
      price: 599000,
      sold: 423,
    },
  ]);

  // Mock gifts
  const gifts: Gift[] = [
    { id: "1", name: "Rose", icon: "🌹", price: 1 },
    { id: "2", name: "Heart", icon: "❤️", price: 5 },
    { id: "3", name: "Star", icon: "⭐", price: 10 },
    { id: "4", name: "Diamond", icon: "💎", price: 50 },
    { id: "5", name: "Crown", icon: "👑", price: 100 },
    { id: "6", name: "Rocket", icon: "🚀", price: 500 },
  ];

  // Animation
  const floatingHearts = useRef<Animated.Value[]>([]);
  const chatListRef = useRef<FlatList>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate new messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTypes = ["join", "text", "gift", "follow"] as const;
      const type = randomTypes[Math.floor(Math.random() * randomTypes.length)];

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: Math.random().toString(),
        username: `user_${Math.floor(Math.random() * 1000)}`,
        content:
          type === "text"
            ? ["Đẹp quá!", "Muốn mua quá", "Còn hàng không shop?", "❤️❤️❤️"][
                Math.floor(Math.random() * 4)
              ]
            : "",
        type,
        giftName:
          type === "gift"
            ? gifts[Math.floor(Math.random() * gifts.length)].name
            : undefined,
        giftIcon:
          type === "gift"
            ? gifts[Math.floor(Math.random() * gifts.length)].icon
            : undefined,
        giftValue:
          type === "gift"
            ? gifts[Math.floor(Math.random() * gifts.length)].price
            : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev.slice(-50), newMessage]);
      setViewerCount((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format duration
  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id?.toString() || "0",
      username: user?.name || "You",
      content: chatInput.trim(),
      type: "text",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle send gift
  const handleSendGift = (gift: Gift) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id?.toString() || "0",
      username: user?.name || "You",
      content: "",
      type: "gift",
      giftName: gift.name,
      giftIcon: gift.icon,
      giftValue: gift.price,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setShowGifts(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Handle like
  const handleLike = () => {
    setLikeCount((prev) => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Animate floating heart
  };

  // Render chat message
  const renderChatMessage = ({ item }: { item: ChatMessage }) => {
    if (item.type === "join") {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemText}>
            <Text style={styles.username}>{item.username || "Ai đó"}</Text> đã
            tham gia
          </Text>
        </View>
      );
    }

    if (item.type === "follow") {
      return (
        <View
          style={[
            styles.systemMessage,
            { backgroundColor: "rgba(255,59,92,0.2)" },
          ]}
        >
          <Ionicons name="heart" size={12} color={danger} />
          <Text style={styles.systemText}>
            <Text style={styles.username}>{item.username}</Text> đã theo dõi
          </Text>
        </View>
      );
    }

    if (item.type === "gift") {
      return (
        <View
          style={[
            styles.giftMessage,
            { backgroundColor: "rgba(255,215,0,0.2)" },
          ]}
        >
          <Text style={styles.giftText}>
            <Text style={styles.username}>{item.username}</Text> tặng{" "}
            {item.giftIcon} {item.giftName}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chatMessage}>
        <Text style={styles.chatText}>
          <Text style={styles.username}>{item.username}</Text>{" "}
          <Text style={styles.messageContent}>{item.content}</Text>
        </Text>
      </View>
    );
  };

  // Render product
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatPrice(item.originalPrice)}
            </Text>
          )}
        </View>
        <Text style={styles.soldText}>Đã bán {formatNumber(item.sold)}</Text>
      </View>
      <TouchableOpacity style={[styles.buyButton, { backgroundColor: danger }]}>
        <Text style={styles.buyButtonText}>Mua</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContent}>
          <View
            style={[styles.loadingIcon, { backgroundColor: `${danger}20` }]}
          >
            <Ionicons name="radio" size={48} color={danger} />
          </View>
          <Text style={styles.loadingText}>Đang kết nối...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Video Background */}
      <View style={styles.videoBackground}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam" size={64} color="#333" />
          <Text style={styles.videoPlaceholderText}>LIVE</Text>
        </View>
      </View>

      {/* Top Controls */}
      <View style={[styles.topControls, { paddingTop: insets.top + 8 }]}>
        {/* Host Info */}
        <View style={styles.hostCard}>
          <Avatar
            name={host.name}
            source={host.avatar ? { uri: host.avatar } : undefined}
            pixelSize={40}
          />
          <View style={styles.hostInfo}>
            <View style={styles.hostNameRow}>
              <Text style={styles.hostName} numberOfLines={1}>
                {host.name}
              </Text>
              {host.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#00A3FF" />
              )}
            </View>
            <Text style={styles.followerCount}>
              {formatNumber(host.followers)} followers
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.followButton,
              { backgroundColor: isFollowing ? "#333" : danger },
            ]}
            onPress={() => {
              setIsFollowing((prev) => !prev);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Live Badge */}
          <View style={[styles.liveBadge, { backgroundColor: danger }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>

          {/* Viewer Count */}
          <View style={styles.statBadge}>
            <Ionicons name="eye" size={14} color="#fff" />
            <Text style={styles.statText}>{formatNumber(viewerCount)}</Text>
          </View>

          {/* Duration */}
          <View style={styles.statBadge}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={styles.statText}>{formatDuration(duration)}</Text>
          </View>

          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        <FlatList
          ref={chatListRef}
          data={messages}
          renderItem={renderChatMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => chatListRef.current?.scrollToEnd()}
          inverted={false}
        />
      </View>

      {/* Right Side Actions */}
      <View style={[styles.sideActions, { bottom: 160 + insets.bottom }]}>
        {/* Like */}
        <TouchableOpacity style={styles.sideButton} onPress={handleLike}>
          <Ionicons name="heart" size={28} color={danger} />
          <Text style={styles.sideButtonText}>{formatNumber(likeCount)}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          style={styles.sideButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="share-social" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Products */}
        <TouchableOpacity
          style={[
            styles.sideButton,
            showProducts && { backgroundColor: "rgba(255,59,92,0.3)" },
          ]}
          onPress={() => {
            setShowProducts((prev) => !prev);
            setShowGifts(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name="bag" size={28} color="#fff" />
          <View style={[styles.productBadge, { backgroundColor: danger }]}>
            <Text style={styles.productBadgeText}>{products.length}</Text>
          </View>
        </TouchableOpacity>

        {/* Gift */}
        <TouchableOpacity
          style={[styles.sideButton, styles.giftButton]}
          onPress={() => {
            setShowGifts((prev) => !prev);
            setShowProducts(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={{ fontSize: 28 }}>🎁</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.bottomInput, { paddingBottom: insets.bottom + 8 }]}
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Gửi tin nhắn..."
            placeholderTextColor="#888"
            value={chatInput}
            onChangeText={setChatInput}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: danger }]}
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Products Panel */}
      {showProducts && (
        <Animated.View
          style={[styles.productsPanel, { bottom: 80 + insets.bottom }]}
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Sản phẩm ({products.length})</Text>
            <Pressable onPress={() => setShowProducts(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          />
        </Animated.View>
      )}

      {/* Gifts Panel */}
      {showGifts && (
        <Animated.View
          style={[styles.giftsPanel, { bottom: 80 + insets.bottom }]}
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Gửi quà tặng</Text>
            <Pressable onPress={() => setShowGifts(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.giftsGrid}>
            {gifts.map((gift) => (
              <TouchableOpacity
                key={gift.id}
                style={styles.giftItem}
                onPress={() => handleSendGift(gift)}
              >
                <Text style={styles.giftIcon}>{gift.icon}</Text>
                <Text style={styles.giftName}>{gift.name}</Text>
                <View style={styles.giftPriceRow}>
                  <Ionicons name="diamond" size={12} color="#FFD700" />
                  <Text style={styles.giftPrice}>{gift.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    alignItems: "center",
  },
  videoPlaceholderText: {
    color: "#444",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 24,
    padding: 8,
    paddingRight: 12,
    alignSelf: "flex-start",
  },
  hostInfo: {
    marginLeft: 8,
    marginRight: 12,
  },
  hostNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hostName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: 100,
  },
  followerCount: {
    color: "#aaa",
    fontSize: 11,
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    position: "absolute",
    left: 16,
    right: 80,
    bottom: 160,
    maxHeight: height * 0.35,
  },
  chatList: {
    gap: 4,
  },
  systemMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    gap: 4,
  },
  systemText: {
    color: "#888",
    fontSize: 12,
  },
  giftMessage: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  giftText: {
    color: "#FFD700",
    fontSize: 12,
  },
  chatMessage: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    maxWidth: "90%",
  },
  chatText: {
    fontSize: 13,
  },
  username: {
    color: "#00A3FF",
    fontWeight: "600",
  },
  messageContent: {
    color: "#fff",
  },
  sideActions: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    gap: 16,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  sideButtonText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
  },
  giftButton: {
    backgroundColor: "rgba(255,215,0,0.2)",
  },
  productBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  productBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  bottomInput: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  productsPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    maxHeight: height * 0.4,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  giftsPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    color: "#FF3B5C",
    fontSize: 14,
    fontWeight: "700",
  },
  originalPrice: {
    color: "#888",
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  soldText: {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
  },
  buyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  giftsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  giftItem: {
    width: (width - 80) / 4,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
  },
  giftIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  giftName: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 2,
  },
  giftPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  giftPrice: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "600",
  },
});
