import { Colors } from "@/constants/theme";
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// List item render function type
export type RenderItem<T> = (item: T, index: number) => React.ReactElement;

// Filter function type
export type FilterFunction<T> = (item: T, query: string) => boolean;

// Sort function type
export type SortFunction<T> = (a: T, b: T) => number;

// List configuration
export interface ListConfig<T> {
  // Data
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: RenderItem<T>;

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  filterFunction?: FilterFunction<T>;

  // Sorting
  sortOptions?: {
    label: string;
    value: string;
    sortFunction: SortFunction<T>;
  }[];

  // Loading & refresh
  loading?: boolean;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;

  // Pagination
  paginated?: boolean;
  itemsPerPage?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;

  // Layout
  numColumns?: number;
  horizontal?: boolean;

  // Empty state
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onPress: () => void;
  };

  // Header & Footer
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;

  // Styling
  contentContainerStyle?: any;
  columnWrapperStyle?: any;
}

interface UniversalListProps<T> {
  config: ListConfig<T>;
}

export function UniversalList<T>({ config }: UniversalListProps<T>) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState(
    config.sortOptions?.[0]?.value || "",
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!config.searchable || !searchQuery.trim()) {
      return config.data;
    }

    if (config.filterFunction) {
      return config.data.filter((item) =>
        config.filterFunction!(item, searchQuery),
      );
    }

    // Default filter: search in all string properties
    return config.data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return Object.values(item as any).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchLower),
      );
    });
  }, [config.data, searchQuery, config.searchable, config.filterFunction]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!config.sortOptions || !selectedSort) {
      return filteredData;
    }

    const sortOption = config.sortOptions.find(
      (opt) => opt.value === selectedSort,
    );
    if (!sortOption) {
      return filteredData;
    }

    return [...filteredData].sort(sortOption.sortFunction);
  }, [filteredData, selectedSort, config.sortOptions]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!config.paginated || !config.itemsPerPage) {
      return sortedData;
    }

    return sortedData.slice(0, currentPage * config.itemsPerPage);
  }, [sortedData, currentPage, config.paginated, config.itemsPerPage]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (
      config.paginated &&
      config.itemsPerPage &&
      paginatedData.length < sortedData.length
    ) {
      setCurrentPage((prev) => prev + 1);
    }
    config.onEndReached?.();
  }, [config, paginatedData.length, sortedData.length]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setCurrentPage(1);
    setSearchQuery("");
    await config.onRefresh?.();
  }, [config.onRefresh]);

  // Render search bar
  const renderSearchBar = () => {
    if (!config.searchable) return null;

    return (
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={config.searchPlaceholder || "Tìm kiếm..."}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render sort options
  const renderSortOptions = () => {
    if (!config.sortOptions || config.sortOptions.length === 0) return null;

    return (
      <View style={styles.sortContainer}>
        <Ionicons name="swap-vertical" size={18} color="#6B7280" />
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <View style={styles.sortOptions}>
          {config.sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                selectedSort === option.value && styles.sortOptionActive,
              ]}
              onPress={() => setSelectedSort(option.value)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  selectedSort === option.value && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (config.loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={(config.emptyIcon as any) || "folder-open-outline"}
          size={64}
          color="#D1D5DB"
        />
        <Text style={styles.emptyTitle}>
          {config.emptyTitle || t("universalList.noData")}
        </Text>
        <Text style={styles.emptyMessage}>
          {config.emptyMessage ||
            (searchQuery
              ? t("universalList.noSearchResults").replace(
                  "{query}",
                  searchQuery,
                )
              : t("universalList.noItems"))}
        </Text>
        {config.emptyAction && (
          <TouchableOpacity
            style={styles.emptyAction}
            onPress={config.emptyAction.onPress}
          >
            <Text style={styles.emptyActionText}>
              {config.emptyAction.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render loading
  const renderLoading = () => {
    if (!config.loading) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>{t("universalList.loading")}</Text>
      </View>
    );
  };

  // Render list header
  const renderListHeader = () => {
    return (
      <>
        {renderSearchBar()}
        {renderSortOptions()}
        {config.ListHeaderComponent}
      </>
    );
  };

  // Render list footer
  const renderListFooter = () => {
    return (
      <>
        {config.paginated && paginatedData.length < sortedData.length && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>
              {t("universalList.loadMore")}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.light.primary}
            />
          </TouchableOpacity>
        )}
        {config.ListFooterComponent}
      </>
    );
  };

  if (config.loading && paginatedData.length === 0) {
    return renderLoading();
  }

  return (
    <FlatList
      data={paginatedData}
      keyExtractor={config.keyExtractor}
      renderItem={({ item, index }) => config.renderItem(item, index)}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
      ListEmptyComponent={renderEmpty}
      numColumns={config.numColumns}
      horizontal={config.horizontal}
      columnWrapperStyle={
        config.numColumns && config.numColumns > 1
          ? config.columnWrapperStyle || styles.columnWrapper
          : undefined
      }
      contentContainerStyle={[
        styles.contentContainer,
        config.contentContainerStyle,
      ]}
      refreshControl={
        config.onRefresh ? (
          <RefreshControl
            refreshing={config.refreshing || false}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]}
          />
        ) : undefined
      }
      onEndReached={config.onEndReached ? handleLoadMore : undefined}
      onEndReachedThreshold={config.onEndReachedThreshold || 0.5}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    marginRight: 12,
  },
  sortOptions: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sortOptionText: {
    fontSize: 13,
    color: "#6B7280",
  },
  sortOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  columnWrapper: {
    gap: 12,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 12,
    marginHorizontal: 16,
    gap: 6,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.primary,
  },
});
