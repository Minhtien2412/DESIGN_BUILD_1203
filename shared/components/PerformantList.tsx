/**
 * High Performance List Component
 * Sử dụng @shopify/flash-list cho danh sách hiệu suất cao
 */

import { FlashList, FlashListProps, ListRenderItem } from "@shopify/flash-list";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useThemeColor } from "../../hooks/use-theme-color";

// ============================================
// TYPES
// ============================================

export interface PerformantListProps<T> extends Omit<
  FlashListProps<T>,
  "renderItem" | "estimatedItemSize"
> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;

  // Loading states
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;

  // Pagination
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  hasMore?: boolean;
  loadingMore?: boolean;

  // Empty state
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Customization
  itemHeight?: number;
  numColumns?: number;
  showsVerticalScrollIndicator?: boolean;

  // Header/Footer
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

function EmptyState({ title, message, icon }: EmptyStateProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.emptyContainer}>
      {icon || (
        <Text style={[styles.emptyIcon, { color: textColor + "40" }]}>📭</Text>
      )}
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        {title || "Không có dữ liệu"}
      </Text>
      {message && (
        <Text style={[styles.emptyMessage, { color: textColor + "60" }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

// ============================================
// LOADING MORE COMPONENT
// ============================================

function LoadingMore() {
  const tintColor = useThemeColor({}, "tint");

  return (
    <View style={styles.loadingMoreContainer}>
      <ActivityIndicator size="small" color={tintColor} />
      <Text style={[styles.loadingMoreText, { color: tintColor }]}>
        Đang tải thêm...
      </Text>
    </View>
  );
}

// ============================================
// PERFORMANT LIST COMPONENT
// ============================================

function PerformantListInner<T>(
  props: PerformantListProps<T>,
  ref: React.Ref<any>,
) {
  const {
    data,
    renderItem,
    keyExtractor,
    loading = false,
    refreshing = false,
    onRefresh,
    onEndReached,
    onEndReachedThreshold = 0.5,
    hasMore = false,
    loadingMore = false,
    emptyTitle,
    emptyMessage,
    emptyIcon,
    itemHeight,
    numColumns = 1,
    showsVerticalScrollIndicator = false,
    ListHeaderComponent,
    ListFooterComponent,
    ...restProps
  } = props;

  const tintColor = useThemeColor({}, "tint");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Memoize empty component
  const ListEmptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      );
    }
    return (
      <EmptyState title={emptyTitle} message={emptyMessage} icon={emptyIcon} />
    );
  }, [loading, tintColor, emptyTitle, emptyMessage, emptyIcon]);

  // Memoize footer component
  const FooterComponent = useMemo(() => {
    if (loadingMore && hasMore) {
      return <LoadingMore />;
    }
    if (ListFooterComponent) {
      return typeof ListFooterComponent === "function" ? (
        <ListFooterComponent />
      ) : (
        ListFooterComponent
      );
    }
    return null;
  }, [loadingMore, hasMore, ListFooterComponent]);

  // Estimate item size for FlashList (optional in v2)
  const estimatedSize = itemHeight || 80;

  return (
    <FlashList
      ref={ref}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onEndReached={hasMore ? onEndReached : undefined}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={FooterComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        ) : undefined
      }
      {...restProps}
    />
  );
}

// Forward ref to support FlashList methods
export const PerformantList = React.forwardRef(PerformantListInner) as <T>(
  props: PerformantListProps<T> & { ref?: React.Ref<any> },
) => React.ReactElement;

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minHeight: 300,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
  },
});

// ============================================
// EXPORTS
// ============================================

export default PerformantList;
