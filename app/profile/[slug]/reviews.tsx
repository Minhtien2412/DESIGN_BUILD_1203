/**
 * User Reviews Page
 * List all reviews for a user profile
 * @route /profile/[slug]/reviews
 */

import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    RatingItem,
    RatingSummaryCard
} from "@/components/ui/StarRating";
import { useProfile } from "@/context/ProfileContext";
import type { Rating } from "@/types/profile";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "highest", label: "Cao nhất" },
  { value: "lowest", label: "Thấp nhất" },
];

const FILTER_OPTIONS = [
  { value: 0, label: "Tất cả" },
  { value: 5, label: "5 sao" },
  { value: 4, label: "4 sao" },
  { value: 3, label: "3 sao" },
  { value: 2, label: "2 sao" },
  { value: 1, label: "1 sao" },
];

export default function UserReviewsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    profile,
    ratings,
    ratingSummary,
    ratingsLoading,
    theme,
    loadProfileBySlug,
    loadRatings,
  } = useProfile();

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterScore, setFilterScore] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (slug && !profile) {
      loadProfileBySlug(slug);
    }
  }, [slug, profile, loadProfileBySlug]);

  useEffect(() => {
    if (profile) {
      loadRatings({ page: 1, sortBy });
      setPage(1);
      setHasMore(true);
    }
  }, [profile, sortBy, filterScore, loadRatings]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRatings({ page: 1, sortBy });
    setPage(1);
    setHasMore(true);
    setRefreshing(false);
  }, [loadRatings, sortBy]);

  const handleLoadMore = useCallback(() => {
    if (ratingsLoading || !hasMore) return;

    const nextPage = page + 1;
    loadRatings({ page: nextPage, sortBy });
    setPage(nextPage);

    // Simple pagination check
    if (ratings.length < 10 * nextPage) {
      setHasMore(false);
    }
  }, [ratingsLoading, hasMore, page, ratings.length, loadRatings, sortBy]);

  const filteredRatings =
    filterScore > 0 ? ratings.filter((r) => r.score === filterScore) : ratings;

  const renderRating = ({ item }: { item: Rating }) => (
    <RatingItem
      rating={{
        ...item,
        userName: "Người dùng",
      }}
      primaryColor={theme.primary}
    />
  );

  const ListHeader = () => (
    <View>
      {/* Summary Card */}
      {ratingSummary && (
        <View style={styles.summaryContainer}>
          <RatingSummaryCard
            summary={ratingSummary}
            primaryColor={theme.primary}
          />
        </View>
      )}

      {/* Sort & Filter */}
      <View style={styles.filterContainer}>
        {/* Sort Options */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sắp xếp</Text>
          <View style={styles.filterRow}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  sortBy === option.value && { backgroundColor: theme.primary },
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sortBy === option.value && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Score Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Lọc theo sao</Text>
          <View style={styles.filterRow}>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  filterScore === option.value && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => setFilterScore(option.value)}
              >
                {option.value > 0 && (
                  <Ionicons
                    name="star"
                    size={12}
                    color={filterScore === option.value ? "#FFFFFF" : "#FFB800"}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    filterScore === option.value && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredRatings.length} đánh giá
        </Text>
      </View>
    </View>
  );

  const ListFooter = () => {
    if (!ratingsLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={64} color="#D1D1D6" />
      <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Đánh giá",
          headerBackTitle: "Quay lại",
        }}
      />

      <FlatList
        data={filteredRatings}
        renderItem={renderRating}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContent: {
    paddingBottom: 20,
  },
  summaryContainer: {
    paddingTop: 16,
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 13,
    color: "#1A1A1A",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: "#757575",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#757575",
  },
});
