/**
 * TikTok Feed Header
 * Tab navigation for For You / Following feeds
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { FEED_TABS, FeedType } from '@/types/tiktok';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TikTokFeedHeaderProps {
  currentTab: FeedType;
  onTabChange: (tab: FeedType) => void;
  onSearch?: () => void;
  onLive?: () => void;
}

export const TikTokFeedHeader = memo(function TikTokFeedHeader({
  currentTab,
  onTabChange,
  onSearch,
  onLive,
}: TikTokFeedHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top || StatusBar.currentHeight || 0 }]}>
      {/* Live Button */}
      <TouchableOpacity style={styles.sideButton} onPress={onLive}>
        <View style={styles.liveButton}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {FEED_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.type}
            style={styles.tab}
            onPress={() => onTabChange(tab.type)}
          >
            <Text style={[
              styles.tabText,
              currentTab === tab.type && styles.activeTabText,
            ]}>
              {tab.label}
            </Text>
            {currentTab === tab.type && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Button */}
      <TouchableOpacity style={styles.sideButton} onPress={onSearch}>
        <Ionicons name="search" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 100,
  },
  sideButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 17,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 1.5,
  },
});

export default TikTokFeedHeader;
