/**
 * Modern Minimal UI Components
 * Các component UI hiện đại tối giản
 */

import {
    MODERN_COLORS,
    MODERN_FONT_SIZE,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_STYLES,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";

// ============ SEARCH BAR ============
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
}

export const ModernSearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Tìm kiếm...",
  onFocus,
  onBlur,
  style,
}) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[MODERN_STYLES.searchContainer, style]}>
      <View
        style={[
          MODERN_STYLES.searchBar,
          focused && MODERN_STYLES.searchBarFocused,
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={focused ? MODERN_COLORS.primary : MODERN_COLORS.textTertiary}
          style={MODERN_STYLES.searchIcon}
        />
        <TextInput
          style={MODERN_STYLES.searchInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={MODERN_COLORS.textTertiary}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={MODERN_STYLES.searchClear}
            onPress={() => onChangeText("")}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={MODERN_COLORS.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============ FILTER CHIP ============
interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
}

export const ModernFilterChip: React.FC<FilterChipProps> = ({
  label,
  active = false,
  onPress,
  icon,
  count,
}) => {
  return (
    <TouchableOpacity
      style={[
        MODERN_STYLES.filterChip,
        active && MODERN_STYLES.filterChipActive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={
            active ? MODERN_COLORS.textInverse : MODERN_COLORS.textSecondary
          }
        />
      )}
      <Text
        style={[
          MODERN_STYLES.filterChipText,
          active && MODERN_STYLES.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
      {typeof count === "number" && (
        <View
          style={[chipStyles.countBadge, active && chipStyles.countBadgeActive]}
        >
          <Text
            style={[chipStyles.countText, active && chipStyles.countTextActive]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const chipStyles = StyleSheet.create({
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: MODERN_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  countBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  countText: {
    fontSize: 10,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  countTextActive: {
    color: MODERN_COLORS.textInverse,
  },
});

// ============ FILTER BAR ============
interface FilterBarProps {
  filters: {
    key: string;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
  }[];
  selected: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
}

export const ModernFilterBar: React.FC<FilterBarProps> = ({
  filters,
  selected,
  onSelect,
  style,
}) => {
  return (
    <View style={[MODERN_STYLES.filterBar, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={MODERN_STYLES.filterScrollContent}
      >
        {filters.map((filter) => (
          <ModernFilterChip
            key={filter.key}
            label={filter.label}
            active={selected === filter.key}
            onPress={() => onSelect(filter.key)}
            icon={filter.icon}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ============ WORKER CARD ============
interface WorkerCardProps {
  name: string;
  avatar?: string | ImageSourcePropType;
  rating: number;
  reviewCount: number;
  location: string;
  experience: number;
  specialties: string[];
  price: string;
  priceUnit?: string;
  completedProjects?: number;
  availability?: "available" | "busy" | "unavailable";
  featured?: boolean;
  onPress?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  onBook?: () => void;
}

export const ModernWorkerCard: React.FC<WorkerCardProps> = ({
  name,
  avatar,
  rating,
  reviewCount,
  location,
  experience,
  specialties,
  price,
  priceUnit = "",
  completedProjects,
  availability = "available",
  featured = false,
  onPress,
  onCall,
  onMessage,
  onBook,
}) => {
  const getAvailabilityStyle = () => {
    switch (availability) {
      case "available":
        return {
          bg: MODERN_STYLES.availableBackground,
          dot: MODERN_STYLES.availableDot,
          text: MODERN_STYLES.availableText,
          label: "Sẵn sàng",
        };
      case "busy":
        return {
          bg: MODERN_STYLES.busyBackground,
          dot: MODERN_STYLES.busyDot,
          text: MODERN_STYLES.busyText,
          label: "Đang bận",
        };
      default:
        return {
          bg: { backgroundColor: MODERN_COLORS.background },
          dot: { backgroundColor: MODERN_COLORS.textTertiary },
          text: { color: MODERN_COLORS.textTertiary },
          label: "Không KD",
        };
    }
  };

  const availStyle = getAvailabilityStyle();

  return (
    <TouchableOpacity
      style={workerStyles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {featured && (
        <View style={workerStyles.featuredBadge}>
          <Ionicons name="star" size={10} color="#fff" />
          <Text style={workerStyles.featuredText}>Đề xuất</Text>
        </View>
      )}

      {/* Header */}
      <View style={workerStyles.header}>
        {typeof avatar === "string" ? (
          <Image source={{ uri: avatar }} style={workerStyles.avatar} />
        ) : avatar ? (
          <Image source={avatar} style={workerStyles.avatar} />
        ) : (
          <View
            style={[
              workerStyles.avatar,
              {
                backgroundColor: MODERN_COLORS.primaryLight,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Ionicons name="person" size={28} color={MODERN_COLORS.primary} />
          </View>
        )}

        <View style={workerStyles.info}>
          <Text style={workerStyles.name} numberOfLines={1}>
            {name}
          </Text>

          <View style={workerStyles.ratingRow}>
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text style={workerStyles.rating}>{rating.toFixed(1)}</Text>
            <Text style={workerStyles.reviews}>({reviewCount})</Text>

            <View
              style={[
                MODERN_STYLES.availabilityBadge,
                availStyle.bg,
                { marginLeft: 8 },
              ]}
            >
              <View style={[MODERN_STYLES.availabilityDot, availStyle.dot]} />
              <Text style={availStyle.text}>{availStyle.label}</Text>
            </View>
          </View>

          <View style={workerStyles.locationRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={MODERN_COLORS.textTertiary}
            />
            <Text style={workerStyles.locationText}>{location}</Text>
            <View style={MODERN_STYLES.metaDivider} />
            <Ionicons
              name="briefcase-outline"
              size={12}
              color={MODERN_COLORS.textTertiary}
            />
            <Text style={workerStyles.locationText}>{experience} năm KN</Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      <View style={workerStyles.body}>
        <View style={workerStyles.tags}>
          {specialties.slice(0, 4).map((specialty, index) => (
            <View key={index} style={workerStyles.tag}>
              <Text style={workerStyles.tagText}>{specialty}</Text>
            </View>
          ))}
          {specialties.length > 4 && (
            <View
              style={[
                workerStyles.tag,
                { backgroundColor: MODERN_COLORS.background },
              ]}
            >
              <Text
                style={[
                  workerStyles.tagText,
                  { color: MODERN_COLORS.textSecondary },
                ]}
              >
                +{specialties.length - 4}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      {completedProjects !== undefined && (
        <View style={workerStyles.statsRow}>
          <View style={workerStyles.statItem}>
            <Text style={workerStyles.statValue}>{completedProjects}+</Text>
            <Text style={workerStyles.statLabel}>Dự án</Text>
          </View>
          <View style={MODERN_STYLES.statDivider} />
          <View style={workerStyles.statItem}>
            <Text style={workerStyles.statValue}>{experience}</Text>
            <Text style={workerStyles.statLabel}>Năm KN</Text>
          </View>
          <View style={MODERN_STYLES.statDivider} />
          <View style={workerStyles.statItem}>
            <Text style={workerStyles.statValue}>{rating.toFixed(1)}</Text>
            <Text style={workerStyles.statLabel}>Đánh giá</Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={workerStyles.footer}>
        <View style={workerStyles.priceContainer}>
          <Text style={workerStyles.priceLabel}>Giá từ</Text>
          <Text style={workerStyles.price}>
            {price}
            {priceUnit && (
              <Text style={workerStyles.priceUnit}>{priceUnit}</Text>
            )}
          </Text>
        </View>

        <View style={workerStyles.actions}>
          {onCall && (
            <TouchableOpacity style={workerStyles.actionBtn} onPress={onCall}>
              <Ionicons
                name="call-outline"
                size={18}
                color={MODERN_COLORS.textPrimary}
              />
            </TouchableOpacity>
          )}
          {onMessage && (
            <TouchableOpacity
              style={workerStyles.actionBtn}
              onPress={onMessage}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={MODERN_COLORS.textPrimary}
              />
            </TouchableOpacity>
          )}
          {onBook && (
            <TouchableOpacity style={workerStyles.bookBtn} onPress={onBook}>
              <Text style={workerStyles.bookBtnText}>Đặt lịch</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const workerStyles = StyleSheet.create({
  container: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    marginHorizontal: MODERN_SPACING.lg,
    marginVertical: MODERN_SPACING.sm,
    overflow: "hidden",
    ...MODERN_SHADOWS.md,
  },
  header: {
    flexDirection: "row",
    padding: MODERN_SPACING.lg,
    paddingBottom: MODERN_SPACING.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },
  info: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },
  name: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  reviews: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
  },
  body: {
    paddingHorizontal: MODERN_SPACING.lg,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: MODERN_COLORS.primaryLight,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
  },
  tagText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "500",
    color: MODERN_COLORS.primary,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  statLabel: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.sm,
  },
  priceContainer: {},
  priceLabel: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
    marginBottom: 2,
  },
  price: {
    fontSize: MODERN_FONT_SIZE.xl,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  priceUnit: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "400",
    color: MODERN_COLORS.textTertiary,
  },
  actions: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm + 2,
    borderRadius: MODERN_RADIUS.md,
    gap: 6,
  },
  bookBtnText: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.textInverse,
  },
  featuredBadge: {
    position: "absolute",
    top: MODERN_SPACING.md,
    right: MODERN_SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
    gap: 4,
    zIndex: 1,
  },
  featuredText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: "#fff",
  },
});

// ============ SECTION HEADER ============
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const ModernSectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  onAction,
  style,
}) => {
  return (
    <View style={[MODERN_STYLES.sectionHeader, style]}>
      <View>
        <Text style={MODERN_STYLES.sectionTitle}>{title}</Text>
        {subtitle && (
          <Text style={MODERN_STYLES.sectionSubtitle}>{subtitle}</Text>
        )}
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={MODERN_STYLES.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============ EMPTY STATE ============
interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ModernEmptyState: React.FC<EmptyStateProps> = ({
  icon = "search-outline",
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={MODERN_STYLES.emptyState}>
      <View style={MODERN_STYLES.emptyStateIcon}>
        <Ionicons name={icon} size={32} color={MODERN_COLORS.textTertiary} />
      </View>
      <Text style={MODERN_STYLES.emptyStateTitle}>{title}</Text>
      {message && <Text style={MODERN_STYLES.emptyStateText}>{message}</Text>}
      {actionLabel && (
        <TouchableOpacity
          style={MODERN_STYLES.emptyStateButton}
          onPress={onAction}
        >
          <Text style={MODERN_STYLES.emptyStateButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============ LOADING STATE ============
export const ModernLoadingState: React.FC<{ message?: string }> = ({
  message = "Đang tải...",
}) => {
  return (
    <View style={MODERN_STYLES.loadingContainer}>
      <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
      <Text style={MODERN_STYLES.loadingText}>{message}</Text>
    </View>
  );
};

// ============ BUTTON ============
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const ModernButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  loading = false,
  style,
}) => {
  const getStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          btn: MODERN_STYLES.buttonSecondary,
          text: MODERN_STYLES.buttonSecondaryText,
          iconColor: MODERN_COLORS.textPrimary,
        };
      case "outline":
        return {
          btn: [
            MODERN_STYLES.buttonSecondary,
            { backgroundColor: "transparent" },
          ],
          text: [
            MODERN_STYLES.buttonSecondaryText,
            { color: MODERN_COLORS.primary },
          ],
          iconColor: MODERN_COLORS.primary,
        };
      default:
        return {
          btn: MODERN_STYLES.buttonPrimary,
          text: MODERN_STYLES.buttonPrimaryText,
          iconColor: MODERN_COLORS.textInverse,
        };
    }
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      style={[styles.btn, disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.iconColor} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={styles.iconColor} />}
          <Text style={styles.text}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ============ INFO BANNER ============
interface InfoBannerProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  type?: "info" | "success" | "warning" | "error";
  onPress?: () => void;
}

export const ModernInfoBanner: React.FC<InfoBannerProps> = ({
  message,
  icon = "information-circle-outline",
  type = "info",
  onPress,
}) => {
  const getColors = () => {
    switch (type) {
      case "success":
        return { bg: MODERN_COLORS.accentLight, text: MODERN_COLORS.accent };
      case "warning":
        return { bg: MODERN_COLORS.warningLight, text: MODERN_COLORS.warning };
      case "error":
        return { bg: MODERN_COLORS.errorLight, text: MODERN_COLORS.error };
      default:
        return { bg: MODERN_COLORS.primaryLight, text: MODERN_COLORS.primary };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      style={[MODERN_STYLES.infoBanner, { backgroundColor: colors.bg }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={[MODERN_STYLES.infoBannerText, { color: colors.text }]}>
        {message}
      </Text>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={colors.text} />
      )}
    </TouchableOpacity>
  );
};

// ============ RESULTS BAR ============
interface ResultsBarProps {
  count: number;
  label?: string;
  sortOptions?: { key: string; label: string }[];
  selectedSort?: string;
  onSortChange?: (key: string) => void;
}

export const ModernResultsBar: React.FC<ResultsBarProps> = ({
  count,
  label = "kết quả",
  sortOptions,
  selectedSort,
  onSortChange,
}) => {
  return (
    <View style={MODERN_STYLES.resultsBar}>
      <Text style={MODERN_STYLES.resultsText}>
        <Text style={MODERN_STYLES.resultsCount}>{count}</Text> {label}
      </Text>
      {sortOptions && (
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          onPress={() => {
            // Simple cycle through options
            const currentIndex = sortOptions.findIndex(
              (o) => o.key === selectedSort
            );
            const nextIndex = (currentIndex + 1) % sortOptions.length;
            onSortChange?.(sortOptions[nextIndex].key);
          }}
        >
          <Ionicons
            name="swap-vertical"
            size={14}
            color={MODERN_COLORS.textSecondary}
          />
          <Text style={{ fontSize: 12, color: MODERN_COLORS.textSecondary }}>
            {sortOptions.find((o) => o.key === selectedSort)?.label ||
              "Sắp xếp"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Export all
export {
    MODERN_COLORS, MODERN_FONT_SIZE, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING, MODERN_STYLES
};

