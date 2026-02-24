import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Card variant types
export type CardVariant = "info" | "action" | "media" | "stat" | "feature";

// Base card props
interface BaseCardProps {
  variant: CardVariant;
  onPress?: () => void;
  style?: any;
}

// Info card - display information with icon
interface InfoCardProps extends BaseCardProps {
  variant: "info";
  icon: string;
  iconColor?: string;
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
}

// Action card - clickable card with gradient
interface ActionCardProps extends BaseCardProps {
  variant: "action";
  icon: string;
  title: string;
  subtitle?: string;
  gradient?: [string, string];
  rightIcon?: string;
}

// Media card - card with image
interface MediaCardProps extends BaseCardProps {
  variant: "media";
  image: ImageSourcePropType | string;
  title: string;
  description?: string;
  tags?: string[];
  footer?: React.ReactNode;
}

// Stat card - display statistics
interface StatCardProps extends BaseCardProps {
  variant: "stat";
  icon: string;
  iconColor?: string;
  value: string | number;
  label: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  gradient?: [string, string];
}

// Feature card - highlight features
interface FeatureCardProps extends BaseCardProps {
  variant: "feature";
  icon: string;
  title: string;
  description: string;
  badge?: string;
  color?: string;
}

export type UniversalCardProps =
  | InfoCardProps
  | ActionCardProps
  | MediaCardProps
  | StatCardProps
  | FeatureCardProps;

export function UniversalCard(props: UniversalCardProps) {
  const { variant, onPress, style } = props;

  const renderContent = () => {
    switch (variant) {
      case "info":
        return renderInfoCard(props);
      case "action":
        return renderActionCard(props);
      case "media":
        return renderMediaCard(props);
      case "stat":
        return renderStatCard(props);
      case "feature":
        return renderFeatureCard(props);
      default:
        return null;
    }
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {renderContent()}
    </Wrapper>
  );
}

// Info Card
function renderInfoCard(props: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View
        style={[
          styles.infoIconContainer,
          { backgroundColor: props.iconColor || Colors.light.primary },
        ]}
      >
        <Ionicons name={props.icon as any} size={24} color="#fff" />
      </View>
      <View style={styles.infoContent}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle} numberOfLines={1}>
            {props.title}
          </Text>
          {props.badge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: props.badgeColor || "#FEF3C7" },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: props.badgeColor ? "#fff" : "#92400E" },
                ]}
              >
                {props.badge}
              </Text>
            </View>
          )}
        </View>
        {props.description && (
          <Text style={styles.infoDescription} numberOfLines={2}>
            {props.description}
          </Text>
        )}
      </View>
    </View>
  );
}

// Action Card
function renderActionCard(props: ActionCardProps) {
  const gradient = props.gradient || [Colors.light.primary, "#4A90E2"];

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.actionCard}
    >
      <View style={styles.actionIconContainer}>
        <Ionicons name={props.icon as any} size={28} color="#fff" />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle} numberOfLines={1}>
          {props.title}
        </Text>
        {props.subtitle && (
          <Text style={styles.actionSubtitle} numberOfLines={1}>
            {props.subtitle}
          </Text>
        )}
      </View>
      <Ionicons
        name={(props.rightIcon as any) || "chevron-forward"}
        size={20}
        color="#fff"
      />
    </LinearGradient>
  );
}

// Media Card
function renderMediaCard(props: MediaCardProps) {
  const imageSource =
    typeof props.image === "string" ? { uri: props.image } : props.image;

  return (
    <View style={styles.mediaCard}>
      <Image source={imageSource} style={styles.mediaImage} resizeMode="cover" />
      <View style={styles.mediaContent}>
        <Text style={styles.mediaTitle} numberOfLines={2}>
          {props.title}
        </Text>
        {props.description && (
          <Text style={styles.mediaDescription} numberOfLines={2}>
            {props.description}
          </Text>
        )}
        {props.tags && props.tags.length > 0 && (
          <View style={styles.mediaTags}>
            {props.tags.map((tag, index) => (
              <View key={index} style={styles.mediaTag}>
                <Text style={styles.mediaTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {props.footer && <View style={styles.mediaFooter}>{props.footer}</View>}
      </View>
    </View>
  );
}

// Stat Card
function renderStatCard(props: StatCardProps) {
  if (props.gradient) {
    return (
      <LinearGradient
        colors={props.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCardGradient}
      >
        {renderStatContent(props, true)}
      </LinearGradient>
    );
  }

  return <View style={styles.statCard}>{renderStatContent(props, false)}</View>;
}

function renderStatContent(props: StatCardProps, isGradient: boolean) {
  const textColor = isGradient ? "#fff" : "#1F2937";
  const labelColor = isGradient ? "#f0f9ff" : "#6B7280";

  return (
    <>
      <View
        style={[
          styles.statIconContainer,
          {
            backgroundColor: isGradient
              ? "rgba(255, 255, 255, 0.2)"
              : props.iconColor || Colors.light.primary + "20",
          },
        ]}
      >
        <Ionicons
          name={props.icon as any}
          size={24}
          color={isGradient ? "#fff" : props.iconColor || Colors.light.primary}
        />
      </View>
      <Text style={[styles.statValue, { color: textColor }]}>{props.value}</Text>
      <Text style={[styles.statLabel, { color: labelColor }]}>{props.label}</Text>
      {props.trend && (
        <View style={styles.statTrend}>
          <Ionicons
            name={
              props.trend.direction === "up"
                ? "trending-up"
                : "trending-down"
            }
            size={16}
            color={
              props.trend.direction === "up"
                ? isGradient
                  ? "#fff"
                  : "#0D9488"
                : isGradient
                ? "#fff"
                : "#000000"
            }
          />
          <Text
            style={[
              styles.statTrendText,
              {
                color:
                  props.trend.direction === "up"
                    ? isGradient
                      ? "#fff"
                      : "#0D9488"
                    : isGradient
                    ? "#fff"
                    : "#000000",
              },
            ]}
          >
            {props.trend.value}
          </Text>
        </View>
      )}
    </>
  );
}

// Feature Card
function renderFeatureCard(props: FeatureCardProps) {
  const color = props.color || Colors.light.primary;

  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={props.icon as any} size={32} color={color} />
      </View>
      <View style={styles.featureContent}>
        <View style={styles.featureHeader}>
          <Text style={styles.featureTitle}>{props.title}</Text>
          {props.badge && (
            <View style={[styles.featureBadge, { backgroundColor: color }]}>
              <Text style={styles.featureBadgeText}>{props.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{props.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  infoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  infoDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Action Card
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#f0f9ff",
  },

  // Media Card
  mediaCard: {
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
  },
  mediaContent: {
    padding: 16,
  },
  mediaTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  mediaDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  mediaTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  mediaTagText: {
    fontSize: 12,
    color: "#6B7280",
  },
  mediaFooter: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  // Stat Card
  statCard: {
    padding: 20,
    alignItems: "center",
  },
  statCardGradient: {
    padding: 20,
    alignItems: "center",
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  statTrendText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Feature Card
  featureCard: {
    padding: 20,
    alignItems: "center",
  },
  featureIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureContent: {
    width: "100%",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "center",
  },
});
