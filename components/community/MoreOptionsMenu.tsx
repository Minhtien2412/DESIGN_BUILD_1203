/**
 * MoreOptionsMenu - Bottom Sheet for Post Options
 * ================================================
 *
 * Facebook/Instagram style options menu for posts.
 * Features:
 * - Save/Unsave post
 * - Hide post
 * - Report post
 * - Copy link
 * - Turn on/off notifications
 * - Block user
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
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
    Modal,
    Pressable,
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

// ============================================
// Types
// ============================================
export interface MoreOptionsItem {
  id: string;
  type: "post" | "video" | "news" | "comment";
  authorId?: string;
  authorName?: string;
  isSaved?: boolean;
  isNotificationOn?: boolean;
}

export interface MoreOptionsSheetOptions {
  item: MoreOptionsItem;
  onSave?: (saved: boolean) => void;
  onHide?: () => void;
  onReport?: () => void;
  onCopyLink?: () => void;
  onNotificationToggle?: (enabled: boolean) => void;
  onBlockUser?: () => void;
}

interface MoreOptionsContextType {
  open: (options: MoreOptionsSheetOptions) => void;
  close: () => void;
  isOpen: boolean;
}

// ============================================
// Menu Options Configuration
// ============================================
interface MenuOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive?: keyof typeof Ionicons.glyphMap;
  color: string;
  description?: string;
  destructive?: boolean;
  requiresAuth?: boolean;
}

const getMenuOptions = (item: MoreOptionsItem): MenuOption[] => {
  const options: MenuOption[] = [
    {
      id: "save",
      label: item.isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết",
      icon: item.isSaved ? "bookmark" : "bookmark-outline",
      color: "#1C1E21",
      description: item.isSaved
        ? "Xóa khỏi mục đã lưu"
        : "Thêm vào mục đã lưu để xem sau",
    },
    {
      id: "notification",
      label: item.isNotificationOn
        ? "Tắt thông báo về bài viết này"
        : "Bật thông báo về bài viết này",
      icon: item.isNotificationOn
        ? "notifications-off-outline"
        : "notifications-outline",
      color: "#1C1E21",
    },
    {
      id: "copy_link",
      label: "Sao chép liên kết",
      icon: "link-outline",
      color: "#1C1E21",
    },
    {
      id: "hide",
      label: "Ẩn bài viết",
      icon: "eye-off-outline",
      color: "#1C1E21",
      description: "Ẩn bài viết này khỏi bảng tin của bạn",
    },
  ];

  // Add author-specific options
  if (item.authorId && item.authorName) {
    options.push(
      {
        id: "unfollow",
        label: `Bỏ theo dõi ${item.authorName}`,
        icon: "person-remove-outline",
        color: "#1C1E21",
        description: "Ngừng xem bài viết nhưng vẫn là bạn bè",
      },
      {
        id: "block",
        label: `Chặn ${item.authorName}`,
        icon: "ban-outline",
        color: "#FA383E",
        destructive: true,
      },
    );
  }

  // Add report option
  options.push({
    id: "report",
    label: "Báo cáo bài viết",
    icon: "flag-outline",
    color: "#FA383E",
    description: "Tôi lo ngại về bài viết này",
    destructive: true,
  });

  return options;
};

// ============================================
// Context
// ============================================
const MoreOptionsContext = createContext<MoreOptionsContextType | null>(null);

export const useMoreOptions = () => {
  const context = useContext(MoreOptionsContext);
  if (!context) {
    throw new Error("useMoreOptions must be used within a MoreOptionsProvider");
  }
  return context;
};

// ============================================
// Menu Option Item
// ============================================
interface MenuOptionItemProps {
  option: MenuOption;
  onPress: () => void;
  isLast?: boolean;
}

const MenuOptionItem = memo(
  ({ option, onPress, isLast }: MenuOptionItemProps) => {
    return (
      <TouchableOpacity
        style={[styles.menuItem, isLast && styles.menuItemLast]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.menuIconContainer,
            option.destructive && styles.menuIconDestructive,
          ]}
        >
          <Ionicons
            name={option.icon}
            size={22}
            color={option.destructive ? "#FA383E" : "#1C1E21"}
          />
        </View>
        <View style={styles.menuTextContainer}>
          <Text
            style={[
              styles.menuLabel,
              option.destructive && styles.menuLabelDestructive,
            ]}
          >
            {option.label}
          </Text>
          {option.description && (
            <Text style={styles.menuDescription}>{option.description}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

MenuOptionItem.displayName = "MenuOptionItem";

// ============================================
// Provider Component
// ============================================
export function MoreOptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<MoreOptionsSheetOptions | null>(null);
  const [localSaved, setLocalSaved] = useState(false);
  const [localNotification, setLocalNotification] = useState(false);
  const insets = useSafeAreaInsets();

  const open = useCallback((opts: MoreOptionsSheetOptions) => {
    setOptions(opts);
    setLocalSaved(opts.item.isSaved || false);
    setLocalNotification(opts.item.isNotificationOn || false);
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
    if (!options) return "";
    return `https://thietkeresort.com.vn/share/${options.item.type}/${options.item.id}`;
  }, [options]);

  // Handle menu actions
  const handleAction = useCallback(
    async (actionId: string) => {
      if (!options) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      switch (actionId) {
        case "save":
          const newSaved = !localSaved;
          setLocalSaved(newSaved);
          options.onSave?.(newSaved);
          Alert.alert(
            newSaved ? "Đã lưu" : "Đã bỏ lưu",
            newSaved
              ? "Bài viết đã được lưu vào mục Đã lưu"
              : "Đã xóa bài viết khỏi mục Đã lưu",
          );
          close();
          break;

        case "notification":
          const newNotification = !localNotification;
          setLocalNotification(newNotification);
          options.onNotificationToggle?.(newNotification);
          Alert.alert(
            newNotification ? "Đã bật thông báo" : "Đã tắt thông báo",
            newNotification
              ? "Bạn sẽ nhận thông báo về bài viết này"
              : "Bạn sẽ không nhận thông báo về bài viết này nữa",
          );
          close();
          break;

        case "copy_link":
          await Clipboard.setStringAsync(getShareUrl());
          options.onCopyLink?.();
          Alert.alert("Đã sao chép", "Liên kết đã được sao chép vào clipboard");
          close();
          break;

        case "hide":
          Alert.alert(
            "Ẩn bài viết",
            "Bạn có chắc muốn ẩn bài viết này khỏi bảng tin?",
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Ẩn",
                onPress: () => {
                  options.onHide?.();
                  close();
                },
              },
            ],
          );
          break;

        case "unfollow":
          Alert.alert(
            `Bỏ theo dõi ${options.item.authorName}`,
            "Bạn sẽ không thấy bài viết của họ trong bảng tin nữa",
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Bỏ theo dõi",
                onPress: () => {
                  // TODO: Implement unfollow
                  close();
                },
              },
            ],
          );
          break;

        case "block":
          Alert.alert(
            `Chặn ${options.item.authorName}?`,
            "Họ sẽ không thể thấy bài viết của bạn hoặc liên hệ với bạn trên ứng dụng này.",
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Chặn",
                style: "destructive",
                onPress: () => {
                  options.onBlockUser?.();
                  close();
                },
              },
            ],
          );
          break;

        case "report":
          Alert.alert("Báo cáo bài viết", "Chọn lý do báo cáo:", [
            { text: "Hủy", style: "cancel" },
            {
              text: "Spam",
              onPress: () => {
                options.onReport?.();
                Alert.alert(
                  "Cảm ơn bạn",
                  "Chúng tôi sẽ xem xét báo cáo của bạn",
                );
                close();
              },
            },
            {
              text: "Nội dung không phù hợp",
              onPress: () => {
                options.onReport?.();
                Alert.alert(
                  "Cảm ơn bạn",
                  "Chúng tôi sẽ xem xét báo cáo của bạn",
                );
                close();
              },
            },
            {
              text: "Thông tin sai lệch",
              onPress: () => {
                options.onReport?.();
                Alert.alert(
                  "Cảm ơn bạn",
                  "Chúng tôi sẽ xem xét báo cáo của bạn",
                );
                close();
              },
            },
          ]);
          break;
      }
    },
    [options, localSaved, localNotification, getShareUrl, close],
  );

  // Get menu options with current state
  const menuOptions = useMemo(() => {
    if (!options) return [];
    return getMenuOptions({
      ...options.item,
      isSaved: localSaved,
      isNotificationOn: localNotification,
    });
  }, [options, localSaved, localNotification]);

  return (
    <MoreOptionsContext.Provider value={value}>
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

          {/* Menu Options */}
          <View style={styles.menuContainer}>
            {menuOptions.map((option, index) => (
              <MenuOptionItem
                key={option.id}
                option={option}
                onPress={() => handleAction(option.id)}
                isLast={index === menuOptions.length - 1}
              />
            ))}
          </View>
        </Animated.View>
      </Modal>
    </MoreOptionsContext.Provider>
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
    maxHeight: "80%",
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
  menuContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuItemLast: {
    marginBottom: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuIconDestructive: {
    backgroundColor: "#FEE2E2",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1E21",
  },
  menuLabelDestructive: {
    color: "#FA383E",
  },
  menuDescription: {
    fontSize: 13,
    color: "#65676B",
    marginTop: 2,
  },
});

export default MoreOptionsProvider;
