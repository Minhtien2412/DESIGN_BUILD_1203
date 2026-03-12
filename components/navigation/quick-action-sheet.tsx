/**
 * Quick Action Bottom Sheet - Clean Balanced Design
 * Opens from center FAB with quick actions: Call, Messages, Live, plus utilities
 * @redesigned 2026-03-03
 */
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface QuickActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onActionPress?: (action: string) => void;
}

// Primary communication actions
const PRIMARY_ACTION_KEYS = [
  {
    id: "call",
    labelKey: "quickAction.call",
    icon: "call",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "messages",
    labelKey: "quickAction.messages",
    icon: "chatbubbles",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "live",
    labelKey: "quickAction.livestream",
    icon: "videocam",
    color: "#EF4444",
    bgColor: "#FEF2F2",
  },
  {
    id: "contacts",
    labelKey: "quickAction.contacts",
    icon: "people",
    color: "#6B7280",
    bgColor: "#F9FAFB",
  },
];

// Secondary utility actions
const SECONDARY_ACTION_KEYS = [
  {
    id: "projects",
    labelKey: "quickAction.projects",
    icon: "briefcase",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "cost-estimator",
    labelKey: "quickAction.costEstimator",
    icon: "calculator",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "store-locator",
    labelKey: "quickAction.storeLocator",
    icon: "location",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "schedule",
    labelKey: "quickAction.schedule",
    icon: "calendar",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "quote-request",
    labelKey: "quickAction.quoteRequest",
    icon: "document-text",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
];

export function QuickActionSheet({
  visible,
  onClose,
  onActionPress,
}: QuickActionSheetProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { t } = useI18n();

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 16,
          bounciness: 6,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 16,
          bounciness: 6,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleActionPress = (actionId: string) => {
    onClose();

    // Handle navigation based on action
    switch (actionId) {
      case "call":
        router.push("/call/history");
        break;
      case "messages":
        router.push("/messages");
        break;
      case "live":
        router.push("/live");
        break;
      case "contacts":
        router.push("/communication");
        break;
      case "projects":
        router.push("/(tabs)/projects");
        break;
      case "cost-estimator":
        router.push("/utilities/cost-estimator");
        break;
      case "store-locator":
        router.push("/utilities/store-locator");
        break;
      case "schedule":
        router.push("/utilities/schedule");
        break;
      case "quote-request":
        router.push("/utilities/quote-request");
        break;
      default:
        onActionPress?.(actionId);
    }
  };

  const renderActionButton = (action: (typeof PRIMARY_ACTION_KEYS)[0]) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionButton}
      activeOpacity={0.7}
      onPress={() => handleActionPress(action.id)}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
        <Ionicons name={action.icon as any} size={28} color={action.color} />
      </View>
      <Text style={styles.actionLabel}>{t(action.labelKey)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                { translateY: sheetTranslateY },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Primary Actions - Communication */}
            <Text style={styles.sectionTitle}>
              {t("quickAction.communication")}
            </Text>
            <View style={styles.actionsGrid}>
              {PRIMARY_ACTION_KEYS.map(renderActionButton)}
            </View>

            {/* Secondary Actions - Utilities */}
            <Text style={styles.sectionTitle}>
              {t("quickAction.utilities")}
            </Text>
            <View style={styles.actionsGrid}>
              {SECONDARY_ACTION_KEYS.map(renderActionButton)}
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>{t("common.close")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: -0.1,
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
});
