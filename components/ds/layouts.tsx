/**
 * Screen Layout Templates - Built on DS
 * Reusable layout wrappers for all major screen types across the app.
 * Import these in any screen to get consistent headers, scrolling, forms, etc.
 *
 * Layouts:
 * - DSModuleScreen: List/grid screens with header + search + FAB
 * - DSDetailScreen: Detail view with hero image + scrollable content
 * - DSFormScreen: Form input screens with sticky submit button
 * - DSListScreen: Simple scrolling list with header + empty state
 * - DSDashboardScreen: Stats grid + sections
 */
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, ReactNode } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════════════════
// SHARED HEADER
// ═══════════════════════════════════════════════════════════════════════
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: ReactNode;
  gradient?: boolean;
}

export const ScreenHeader = memo(function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightActions,
  gradient = false,
}: ScreenHeaderProps) {
  const { colors, spacing } = useDS();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = onBack || (() => router.back());

  const content = (
    <View style={[s.headerContent, { paddingTop: insets.top + 8 }]}>
      <View style={s.headerLeft}>
        {showBack && (
          <Pressable onPress={handleBack} style={s.backBtn} hitSlop={8}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={gradient ? "#FFF" : colors.text}
            />
          </Pressable>
        )}
        <View style={s.headerTitleWrap}>
          <Text
            style={[s.headerTitle, { color: gradient ? "#FFF" : colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                s.headerSubtitle,
                {
                  color: gradient
                    ? "rgba(255,255,255,0.7)"
                    : colors.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightActions && <View style={s.headerRight}>{rightActions}</View>}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={
          colors.tabBarGradient as unknown as [string, string, ...string[]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.headerGradient}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        s.headerFlat,
        {
          backgroundColor: colors.bgSurface,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      {content}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// 1. MODULE SCREEN (list/grid with search + optional FAB)
// ═══════════════════════════════════════════════════════════════════════
interface DSModuleScreenProps {
  title: string;
  subtitle?: string;
  gradientHeader?: boolean;
  children: ReactNode;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  fab?: {
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  headerRight?: ReactNode;
  style?: ViewStyle;
}

export const DSModuleScreen = memo(function DSModuleScreen({
  title,
  subtitle,
  gradientHeader = false,
  children,
  loading = false,
  refreshing = false,
  onRefresh,
  fab,
  headerRight,
  style,
}: DSModuleScreenProps) {
  const { colors, isDark } = useDS();

  return (
    <View style={[s.screen, { backgroundColor: colors.bg }, style]}>
      <StatusBar
        barStyle={gradientHeader || isDark ? "light-content" : "dark-content"}
      />
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        gradient={gradientHeader}
        rightActions={headerRight}
      />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={s.flex}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      )}

      {fab && (
        <Pressable
          style={[s.fab, { backgroundColor: colors.primary }]}
          onPress={fab.onPress}
        >
          <Ionicons name={fab.icon || "add"} size={28} color={colors.white} />
        </Pressable>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// 2. DETAIL SCREEN (scrollable content with optional hero)
// ═══════════════════════════════════════════════════════════════════════
interface DSDetailScreenProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  heroContent?: ReactNode;
  headerRight?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  style?: ViewStyle;
}

export const DSDetailScreen = memo(function DSDetailScreen({
  title,
  subtitle,
  children,
  heroContent,
  headerRight,
  footer,
  loading = false,
  style,
}: DSDetailScreenProps) {
  const { colors, isDark } = useDS();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.screen, { backgroundColor: colors.bg }, style]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        rightActions={headerRight}
      />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={s.flex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: footer ? 80 : insets.bottom + 16,
          }}
        >
          {heroContent}
          <View style={s.detailContent}>{children}</View>
        </ScrollView>
      )}

      {footer && (
        <View
          style={[
            s.stickyFooter,
            {
              backgroundColor: colors.bgSurface,
              paddingBottom: insets.bottom || 12,
              borderTopColor: colors.divider,
            },
          ]}
        >
          {footer}
        </View>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// 3. FORM SCREEN (inputs + sticky submit)
// ═══════════════════════════════════════════════════════════════════════
interface DSFormScreenProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  submitLabel?: string;
  onSubmit: () => void;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  headerRight?: ReactNode;
  style?: ViewStyle;
}

export const DSFormScreen = memo(function DSFormScreen({
  title,
  subtitle,
  children,
  submitLabel = "Lưu",
  onSubmit,
  submitDisabled = false,
  submitLoading = false,
  headerRight,
  style,
}: DSFormScreenProps) {
  const { colors, radius, isDark } = useDS();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.screen, { backgroundColor: colors.bg }, style]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        rightActions={headerRight}
      />

      <ScrollView
        style={s.flex}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {children}
      </ScrollView>

      <View
        style={[
          s.stickyFooter,
          {
            backgroundColor: colors.bgSurface,
            paddingBottom: insets.bottom || 12,
            borderTopColor: colors.divider,
          },
        ]}
      >
        <Pressable
          onPress={onSubmit}
          disabled={submitDisabled || submitLoading}
          style={[
            s.submitBtn,
            {
              backgroundColor: submitDisabled ? colors.bgMuted : colors.primary,
              borderRadius: radius.md,
            },
          ]}
        >
          {submitLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={[s.submitText, { color: colors.white }]}>
              {submitLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// 4. LIST SCREEN (FlatList with header + empty state)
// ═══════════════════════════════════════════════════════════════════════
interface DSListScreenProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  renderItem: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  emptyTitle?: string;
  emptyMessage?: string;
  headerRight?: ReactNode;
  ListHeaderComponent?: ReactNode;
  numColumns?: number;
  fab?: { icon?: keyof typeof Ionicons.glyphMap; onPress: () => void };
  gradientHeader?: boolean;
  style?: ViewStyle;
}

export function DSListScreen<T>({
  title,
  subtitle,
  data,
  renderItem,
  keyExtractor,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  emptyIcon = "folder-open-outline",
  emptyTitle = "Không có dữ liệu",
  emptyMessage = "Chưa có mục nào",
  headerRight,
  ListHeaderComponent,
  numColumns,
  fab,
  gradientHeader = false,
  style,
}: DSListScreenProps<T>) {
  const { colors, isDark } = useDS();

  return (
    <View style={[s.screen, { backgroundColor: colors.bg }, style]}>
      <StatusBar
        barStyle={gradientHeader || isDark ? "light-content" : "dark-content"}
      />
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        gradient={gradientHeader}
        rightActions={headerRight}
      />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          ListHeaderComponent={ListHeaderComponent as any}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons
                name={emptyIcon}
                size={64}
                color={colors.textTertiary}
              />
              <Text style={[s.emptyTitle, { color: colors.text }]}>
                {emptyTitle}
              </Text>
              <Text style={[s.emptyMsg, { color: colors.textSecondary }]}>
                {emptyMessage}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ) : undefined
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        />
      )}

      {fab && (
        <Pressable
          style={[s.fab, { backgroundColor: colors.primary }]}
          onPress={fab.onPress}
        >
          <Ionicons name={fab.icon || "add"} size={28} color={colors.white} />
        </Pressable>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 5. DASHBOARD SCREEN (stats on top + sections)
// ═══════════════════════════════════════════════════════════════════════
interface DSDashboardScreenProps {
  title: string;
  subtitle?: string;
  gradientHeader?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: keyof typeof Ionicons.glyphMap;
    color?: string;
  }>;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  headerRight?: ReactNode;
}

export const DSDashboardScreen = memo(function DSDashboardScreen({
  title,
  subtitle,
  gradientHeader = true,
  stats,
  children,
  refreshing = false,
  onRefresh,
  headerRight,
}: DSDashboardScreenProps) {
  const { colors, radius, shadow, isDark } = useDS();

  return (
    <View style={[s.screen, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={gradientHeader || isDark ? "light-content" : "dark-content"}
      />
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        gradient={gradientHeader}
        rightActions={headerRight}
      />

      <ScrollView
        style={s.flex}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
      >
        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <View style={s.statsGrid}>
            {stats.map((stat, i) => (
              <View
                key={i}
                style={[
                  s.statCard,
                  {
                    backgroundColor: colors.bgSurface,
                    borderRadius: radius.md,
                    ...shadow.sm,
                  },
                ]}
              >
                {stat.icon && (
                  <View
                    style={[
                      s.statIcon,
                      {
                        backgroundColor: (stat.color || colors.primary) + "15",
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <Ionicons
                      name={stat.icon}
                      size={20}
                      color={stat.color || colors.primary}
                    />
                  </View>
                )}
                <Text style={[s.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {children}
      </ScrollView>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  headerGradient: {},
  headerFlat: { borderBottomWidth: 1 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },

  // Detail
  detailContent: { padding: 16 },

  // Form
  submitBtn: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: { fontSize: 16, fontWeight: "600" },

  // Sticky Footer
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  // Empty
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptyMsg: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },

  // Dashboard Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 4 },
});
