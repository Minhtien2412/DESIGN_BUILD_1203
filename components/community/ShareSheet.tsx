/**
 * ShareSheet - Bottom Sheet for Sharing Content
 * ==============================================
 *
 * Facebook/Instagram style share sheet with multiple sharing options.
 * Features:
 * - Copy link
 * - Share to Facebook, Zalo, Messenger
 * - Save to device
 * - Send via SMS/Email
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import React, {
    createContext,
    memo,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import {
    Alert,
    Dimensions,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// Types
// ============================================
export interface ShareItem {
  id: string;
  type: "post" | "video" | "image" | "news" | "product";
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export interface ShareSheetOptions {
  item: ShareItem;
  onShare?: (platform: string) => void;
  onCopyLink?: () => void;
}

interface ShareSheetContextType {
  open: (options: ShareSheetOptions) => void;
  close: () => void;
  isOpen: boolean;
}

// ============================================
// Share Options Configuration
// ============================================
interface ShareOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    id: "copy_link",
    label: "Sao chép liên kết",
    icon: "link-outline",
    color: "#1C1E21",
    bgColor: "#E4E6EB",
  },
  {
    id: "share_system",
    label: "Chia sẻ...",
    icon: "share-outline",
    color: "#FFFFFF",
    bgColor: "#1877F2",
  },
  {
    id: "messenger",
    label: "Messenger",
    icon: "chatbubble-ellipses",
    color: "#FFFFFF",
    bgColor: "#0084FF",
  },
  {
    id: "zalo",
    label: "Zalo",
    icon: "chatbubbles",
    color: "#FFFFFF",
    bgColor: "#0068FF",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "logo-facebook",
    color: "#FFFFFF",
    bgColor: "#1877F2",
  },
  {
    id: "sms",
    label: "Tin nhắn",
    icon: "chatbox-outline",
    color: "#FFFFFF",
    bgColor: "#34C759",
  },
  {
    id: "email",
    label: "Email",
    icon: "mail-outline",
    color: "#FFFFFF",
    bgColor: "#FF9500",
  },
  {
    id: "save_image",
    label: "Lưu ảnh",
    icon: "download-outline",
    color: "#1C1E21",
    bgColor: "#E4E6EB",
  },
];

// ============================================
// Context
// ============================================
const ShareSheetContext = createContext<ShareSheetContextType | null>(null);

// Noop fallback when provider is not available
const noopShareSheet: ShareSheetContextType = {
  open: () => console.warn("[ShareSheet] Provider not available"),
  close: () => {},
  isOpen: false,
};

export const useShareSheet = (): ShareSheetContextType => {
  const context = useContext(ShareSheetContext);
  // Return noop fallback instead of throwing to prevent crashes during hydration
  if (!context) {
    if (__DEV__) {
      console.warn(
        "[ShareSheet] useShareSheet called outside of ShareSheetProvider",
      );
    }
    return noopShareSheet;
  }
  return context;
};

// ============================================
// Share Option Button
// ============================================
interface ShareOptionButtonProps {
  option: ShareOption;
  onPress: () => void;
}

const ShareOptionButton = memo(
  ({ option, onPress }: ShareOptionButtonProps) => {
    return (
      <TouchableOpacity style={styles.optionButton} onPress={onPress}>
        <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
          <Ionicons name={option.icon} size={24} color={option.color} />
        </View>
        <Text style={styles.optionLabel} numberOfLines={1}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  },
);

ShareOptionButton.displayName = "ShareOptionButton";

// ============================================
// Provider Component
// ============================================
export function ShareSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<ShareSheetOptions | null>(null);
  const insets = useSafeAreaInsets();

  const open = useCallback((opts: ShareSheetOptions) => {
    setOptions(opts);
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setOptions(null), 300);
  }, []);

  const value = useMemo(
    () => ({ open, close, isOpen: isVisible }),
    [open, close, isVisible],
  );

  // Generate share URL
  const getShareUrl = useCallback(() => {
    if (options?.item.url) return options.item.url;
    // Generate app deep link
    return `https://thietkeresort.com.vn/share/${options?.item.type}/${options?.item.id}`;
  }, [options]);

  // Handle share actions
  const handleShare = useCallback(
    async (optionId: string) => {
      if (!options) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const shareUrl = getShareUrl();
      const shareText = `${options.item.title}${options.item.description ? `\n\n${options.item.description}` : ""}`;

      try {
        switch (optionId) {
          case "copy_link":
            await Clipboard.setStringAsync(shareUrl);
            options.onCopyLink?.();
            Alert.alert(
              "Đã sao chép",
              "Liên kết đã được sao chép vào clipboard",
            );
            close();
            break;

          case "share_system":
            const result = await Share.share({
              message: `${shareText}\n\n${shareUrl}`,
              url: shareUrl,
              title: options.item.title,
            });
            if (result.action === Share.sharedAction) {
              options.onShare?.("system");
            }
            close();
            break;

          case "messenger":
            const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`;
            const canOpenMessenger = await Linking.canOpenURL(messengerUrl);
            if (canOpenMessenger) {
              await Linking.openURL(messengerUrl);
            } else {
              // Fallback to web messenger
              await Linking.openURL(
                `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_APP_ID`,
              );
            }
            options.onShare?.("messenger");
            close();
            break;

          case "zalo":
            // Zalo share URL scheme
            const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`;
            await Linking.openURL(zaloUrl);
            options.onShare?.("zalo");
            close();
            break;

          case "facebook":
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            await Linking.openURL(fbUrl);
            options.onShare?.("facebook");
            close();
            break;

          case "sms":
            const smsUrl =
              Platform.OS === "ios"
                ? `sms:&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
                : `sms:?body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
            await Linking.openURL(smsUrl);
            options.onShare?.("sms");
            close();
            break;

          case "email":
            const emailUrl = `mailto:?subject=${encodeURIComponent(options.item.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
            await Linking.openURL(emailUrl);
            options.onShare?.("email");
            close();
            break;

          case "save_image":
            if (options.item.imageUrl) {
              // Check if sharing is available
              const isAvailable = await Sharing.isAvailableAsync();
              if (isAvailable) {
                // Would need to download image first, then share
                Alert.alert("Thông báo", "Chức năng lưu ảnh sẽ được cập nhật");
              }
            }
            close();
            break;
        }
      } catch (error) {
        console.error("Share error:", error);
        Alert.alert("Lỗi", "Không thể chia sẻ. Vui lòng thử lại.");
      }
    },
    [options, getShareUrl, close],
  );

  // Filter options based on item type
  const filteredOptions = useMemo(() => {
    if (!options) return SHARE_OPTIONS;

    return SHARE_OPTIONS.filter((opt) => {
      // Always show these
      if (
        ["copy_link", "share_system", "messenger", "zalo", "facebook"].includes(
          opt.id,
        )
      ) {
        return true;
      }
      // Show save_image only for images/videos
      if (opt.id === "save_image") {
        return (
          options.item.imageUrl &&
          ["image", "video", "photo"].includes(options.item.type)
        );
      }
      return true;
    });
  }, [options]);

  return (
    <ShareSheetContext.Provider value={value}>
      {children}

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={close}>
          <Animated.View
            style={styles.backdropInner}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          />
        </Pressable>

        {/* Sheet */}
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chia sẻ</Text>
            <TouchableOpacity style={styles.closeButton} onPress={close}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Item Preview */}
          {options && (
            <View style={styles.previewContainer}>
              <Ionicons
                name={
                  options.item.type === "video"
                    ? "videocam"
                    : options.item.type === "image"
                      ? "image"
                      : "document-text"
                }
                size={20}
                color="#65676B"
              />
              <Text style={styles.previewTitle} numberOfLines={1}>
                {options.item.title}
              </Text>
            </View>
          )}

          {/* Share Options Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {filteredOptions.map((option) => (
              <ShareOptionButton
                key={option.id}
                option={option}
                onPress={() => handleShare(option.id)}
              />
            ))}
          </ScrollView>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleShare("copy_link")}
            >
              <Ionicons name="link-outline" size={20} color="#1877F2" />
              <Text style={styles.quickActionText}>Sao chép liên kết</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </ShareSheetContext.Provider>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1E21",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#F0F2F5",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  previewTitle: {
    flex: 1,
    fontSize: 14,
    color: "#1C1E21",
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  optionButton: {
    alignItems: "center",
    width: 72,
    marginRight: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: "#1C1E21",
    textAlign: "center",
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#E7F3FF",
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1877F2",
  },
});

export default ShareSheetProvider;
