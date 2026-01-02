/**
 * TikTok Search Screen
 * Search for users, videos, hashtags, music
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { TikTokUserCard } from '@/components/tiktok';
import * as tiktokService from '@/services/tiktokService';
import { HashtagResult, SearchResult, TikTokUser, TikTokVideo } from '@/types/tiktok';
import { formatCompactNumber } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_SIZE = (SCREEN_WIDTH - 4) / 3;

type SearchType = 'top' | 'users' | 'videos' | 'sounds' | 'hashtags';

const SEARCH_TABS: { type: SearchType; label: string }[] = [
  { type: 'top', label: 'Top' },
  { type: 'users', label: 'Users' },
  { type: 'videos', label: 'Videos' },
  { type: 'sounds', label: 'Sounds' },
  { type: 'hashtags', label: 'Hashtags' },
];

export default function TikTokSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchType>('top');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Search
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({});
      return;
    }

    setIsSearching(true);
    Keyboard.dismiss();

    try {
      const response = await tiktokService.search(searchQuery);
      if (response.success) {
        setResults(response.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Get suggestions
  const handleQueryChange = useCallback(async (text: string) => {
    setQuery(text);
    
    if (text.length > 1) {
      const suggestions = await tiktokService.getSearchSuggestions(text);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, []);

  // Handle suggestion press
  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    handleSearch(suggestion);
  };

  // Navigate to video
  const handleVideoPress = (video: TikTokVideo) => {
    router.push(`./video/${video.id}` as any);
  };

  // Navigate to user
  const handleUserPress = (user: TikTokUser) => {
    router.push(`./profile/${user.id}` as any);
  };

  // Navigate to hashtag
  const handleHashtagPress = (hashtag: HashtagResult) => {
    router.push(`../tiktok?hashtag=${hashtag.name}` as any);
  };

  // Render video grid item
  const renderVideoItem = useCallback(
    ({ item }: { item: TikTokVideo }) => (
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => handleVideoPress(item)}
      >
        <Image
          source={{ uri: item.thumbnailUrl || item.videoUrl }}
          style={styles.videoThumbnail}
        />
        <View style={styles.videoOverlay}>
          <Ionicons name="play" size={12} color="white" />
          <Text style={styles.videoViews}>
            {formatCompactNumber(item.viewsCount)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  // Render user item
  const renderUserItem = useCallback(
    ({ item }: { item: TikTokUser }) => (
      <TikTokUserCard
        user={item}
        isFollowing={item.isFollowing || false}
        onPress={() => handleUserPress(item)}
        compact
      />
    ),
    []
  );

  // Render hashtag item
  const renderHashtagItem = useCallback(
    ({ item }: { item: HashtagResult }) => (
      <TouchableOpacity
        style={styles.hashtagItem}
        onPress={() => handleHashtagPress(item)}
      >
        <View style={styles.hashtagIcon}>
          <Text style={styles.hashtagSymbol}>#</Text>
        </View>
        <View style={styles.hashtagInfo}>
          <Text style={styles.hashtagName}>{item.name}</Text>
          <Text style={styles.hashtagStats}>
            {formatCompactNumber(item.viewsCount)} views · {formatCompactNumber(item.videosCount)} videos
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  // Get current data based on tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'users':
        return results.users || [];
      case 'videos':
        return results.videos || [];
      case 'hashtags':
        return results.hashtags || [];
      default:
        return results.videos || [];
    }
  };

  // Get render item based on tab
  const getRenderItem = () => {
    switch (activeTab) {
      case 'users':
        return renderUserItem;
      case 'hashtags':
        return renderHashtagItem;
      default:
        return renderVideoItem;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          header: () => (
            <View style={[styles.header, { paddingTop: insets.top }]}>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.searchInputWrapper}>
                  <Ionicons name="search" size={20} color="#888" />
                  <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#888"
                    value={query}
                    onChangeText={handleQueryChange}
                    onSubmitEditing={() => handleSearch(query)}
                    returnKeyType="search"
                    autoFocus
                  />
                  {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Tabs */}
              {query.length > 0 && (
                <View style={styles.tabs}>
                  {SEARCH_TABS.map((tab) => (
                    <TouchableOpacity
                      key={tab.type}
                      style={[styles.tab, activeTab === tab.type && styles.activeTab]}
                      onPress={() => setActiveTab(tab.type)}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === tab.type && styles.activeTabText,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* Suggestions */}
      {suggestions.length > 0 && query.length > 0 && !isSearching && (
        <View style={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Ionicons name="search" size={18} color="#888" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Loading */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FE2C55" />
        </View>
      )}

      {/* Results */}
      {!isSearching && query.length > 0 && (
        <FlatList
          data={getCurrentData() as any[]}
          renderItem={getRenderItem() as any}
          keyExtractor={(item: any) => item.id}
          numColumns={activeTab === 'videos' || activeTab === 'top' ? 3 : 1}
          key={activeTab} // Force re-render when tab changes
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      )}

      {/* Discover (no search) */}
      {!query && (
        <View style={styles.discoverContainer}>
          <Text style={styles.discoverTitle}>Discover</Text>
          <View style={styles.trendingTags}>
            {['#trending', '#viral', '#foryou', '#dance', '#comedy', '#food'].map(
              (tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.trendingTag}
                  onPress={() => {
                    setQuery(tag);
                    handleSearch(tag);
                  }}
                >
                  <Text style={styles.trendingTagText}>{tag}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  suggestions: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    paddingTop: 2,
  },
  videoItem: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE * 1.3,
    margin: 0.5,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoViews: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  hashtagIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  hashtagStats: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  discoverContainer: {
    flex: 1,
    padding: 16,
  },
  discoverTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trendingTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  trendingTagText: {
    fontSize: 14,
    color: '#333',
  },
});
