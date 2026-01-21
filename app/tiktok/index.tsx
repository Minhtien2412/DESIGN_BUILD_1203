/**
 * TikTok Feed Screen
 * Main TikTok-style vertical video feed
 * 
 * Features:
 * - Fullscreen vertical video scroll
 * - For You / Following tabs
 * - Like, comment, share, save
 * - Double tap to like with heart animation
 * - User profiles
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import {
    TikTokCommentsSheet,
    TikTokFeedHeader,
    TikTokShareSheet,
    TikTokVideoCard,
} from '@/components/tiktok';
import { TikTokProvider, useTikTok } from '@/context/TikTokContext';
import { FeedType, TikTokVideo } from '@/types/tiktok';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    View,
    ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function TikTokFeedContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [viewableIndex, setViewableIndex] = useState(0);

  const {
    state,
    setFeedType,
    setCurrentIndex,
    refreshFeed,
    loadMoreFeed,
    closeComments,
    getCurrentFeed,
    getCurrentVideo,
  } = useTikTok();

  const feed = getCurrentFeed();
  const currentVideo = getCurrentVideo();

  // Track viewable items - use useRef to avoid "Changing onViewableItemsChanged on the fly" error
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index ?? 0;
        setViewableIndex(index);
        setCurrentIndex(index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Handle tab change
  const handleTabChange = useCallback((tab: FeedType) => {
    setFeedType(tab);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [setFeedType]);

  // Navigate to user profile
  const handleUserPress = useCallback((userId: string) => {
    router.push(`./profile/${userId}` as any);
  }, [router]);

  // Navigate to search
  const handleSearch = useCallback(() => {
    router.push('/tiktok/search');
  }, [router]);

  // Navigate to live
  const handleLive = useCallback(() => {
    router.push('./live' as any);
  }, [router]);

  // Render video item
  const renderItem = useCallback(
    ({ item, index }: { item: TikTokVideo; index: number }) => (
      <TikTokVideoCard
        video={item}
        isActive={index === viewableIndex}
        onUserPress={handleUserPress}
      />
    ),
    [viewableIndex, handleUserPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: TikTokVideo) => item.id, []);

  // Get item layout for better performance
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  // Loading state
  if (state.isLoadingFeed && feed.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE2C55" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Video Feed */}
      <FlatList
        ref={flatListRef}
        data={feed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        onEndReached={loadMoreFeed}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={refreshFeed}
            tintColor="white"
            colors={['#FE2C55']}
          />
        }
        ListFooterComponent={
          state.isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color="#FE2C55" />
            </View>
          ) : null
        }
      />

      {/* Feed Header */}
      <TikTokFeedHeader
        currentTab={state.currentFeedType}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
        onLive={handleLive}
      />

      {/* Comments Sheet */}
      <TikTokCommentsSheet
        visible={state.isCommentsOpen}
        videoId={state.currentCommentsVideoId || ''}
        onClose={closeComments}
      />

      {/* Share Sheet */}
      <TikTokShareSheet
        visible={state.isShareSheetOpen}
        video={currentVideo}
        onClose={() => {}}
      />
    </View>
  );
}

export default function TikTokFeedScreen() {
  return (
    <TikTokProvider>
      <TikTokFeedContent />
    </TikTokProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
