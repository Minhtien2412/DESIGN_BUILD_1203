import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import {
    Image,
    ImageSourcePropType,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface DetailLayoutProps {
  // Header image
  headerImage?: ImageSourcePropType | string;
  headerGradient?: [string, string];

  // Title section
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    color?: string;
  };

  // Meta info (displayed below title)
  metaInfo?: Array<{
    icon: string;
    label: string;
    value: string;
  }>;

  // Content sections
  sections: Array<{
    title?: string;
    content: ReactNode;
  }>;

  // Actions
  actions?: Array<{
    label: string;
    icon: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "outline";
  }>;

  // Navigation
  showBackButton?: boolean;
  onBackPress?: () => void;
  headerRight?: ReactNode;
}

export function DetailLayout({
  headerImage,
  headerGradient,
  title,
  subtitle,
  badge,
  metaInfo,
  sections,
  actions,
  showBackButton = true,
  onBackPress,
  headerRight,
}: DetailLayoutProps) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const imageSource =
    typeof headerImage === "string" ? { uri: headerImage } : headerImage;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Image/Gradient */}
      <View style={styles.headerContainer}>
        {headerImage && (
          <Image source={imageSource} style={styles.headerImage} resizeMode="cover" />
        )}
        <View style={styles.headerOverlay}>
          <View style={styles.headerTop}>
            {showBackButton && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <View style={styles.backButtonCircle}>
                  <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </View>
              </TouchableOpacity>
            )}
            {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleHeader}>
            <View style={styles.titleLeft}>
              <Text style={styles.title}>{title}</Text>
              {badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badge.color || Colors.light.primary },
                  ]}
                >
                  <Text style={styles.badgeText}>{badge.label}</Text>
                </View>
              )}
            </View>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {/* Meta Info */}
          {metaInfo && metaInfo.length > 0 && (
            <View style={styles.metaContainer}>
              {metaInfo.map((meta, index) => (
                <View key={index} style={styles.metaItem}>
                  <Ionicons
                    name={meta.icon as any}
                    size={18}
                    color={Colors.light.primary}
                  />
                  <View style={styles.metaText}>
                    <Text style={styles.metaLabel}>{meta.label}</Text>
                    <Text style={styles.metaValue}>{meta.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => {
                const variant = action.variant || "primary";
                const buttonStyle =
                  variant === "primary"
                    ? styles.actionButtonPrimary
                    : variant === "outline"
                    ? styles.actionButtonOutline
                    : styles.actionButtonSecondary;

                const textStyle =
                  variant === "secondary"
                    ? styles.actionButtonTextSecondary
                    : variant === "outline"
                    ? styles.actionButtonTextOutline
                    : styles.actionButtonTextPrimary;

                const iconColor =
                  variant === "secondary" || variant === "outline"
                    ? Colors.light.primary
                    : "#fff";

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.actionButton, buttonStyle]}
                    onPress={action.onPress}
                  >
                    <Ionicons name={action.icon as any} size={20} color={iconColor} />
                    <Text style={textStyle}>{action.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Content Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
            <View style={styles.sectionContent}>{section.content}</View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    height: 240,
    backgroundColor: Colors.light.primary,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRight: {
    marginLeft: "auto",
  },
  scrollView: {
    flex: 1,
    marginTop: -40,
  },
  titleCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  titleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaText: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  actionButtonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  actionButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  actionButtonTextSecondary: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  actionButtonTextOutline: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  sectionContent: {
    // Content will be rendered here
  },
});
