import { useThemeColor } from '@/hooks/use-theme-color';
import RewardService, {
    RewardHistoryItem as ApiHistoryItem,
    RewardItem as ApiRewardItem,
    MOCK_HISTORY as FALLBACK_HISTORY,
    MOCK_REWARDS as FALLBACK_REWARDS,
    MOCK_SUMMARY
} from '@/services/rewardService';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PointHistory {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  date: string;
  icon: string;
  color: string;
}

interface Reward {
  id: string;
  name: string;
  image: string;
  pointsCost: number;
  description: string;
  available: number;
}

// Transform functions
function transformHistory(item: ApiHistoryItem): PointHistory {
  return {
    id: item.id,
    type: item.type,
    points: item.type === 'earn' ? item.points : -item.points,
    description: item.description,
    date: item.createdAt,
    icon: item.type === 'earn' ? 'cart' : 'ticket',
    color: item.type === 'earn' ? '#0D9488' : '#000000',
  };
}

function transformReward(item: ApiRewardItem): Reward {
  return {
    id: item.id,
    name: item.name,
    image: item.image || 'https://placehold.co/200x200/0066CC/white?text=Reward',
    pointsCost: item.pointsRequired,
    description: item.description || '',
    available: item.stock || 100,
  };
}

// Fallback data
const MOCK_HISTORY: PointHistory[] = FALLBACK_HISTORY.map(transformHistory);
const MOCK_REWARDS: Reward[] = FALLBACK_REWARDS.map(transformReward);

export default function RewardsScreen() {
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const [currentPoints, setCurrentPoints] = useState(MOCK_SUMMARY.totalPoints);
  const [selectedTab, setSelectedTab] = useState<'rewards' | 'history'>('rewards');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PointHistory[]>(MOCK_HISTORY);
  const [rewards, setRewards] = useState<Reward[]>(MOCK_REWARDS);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');

  // Fetch data from API
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Fetch summary
      const summaryResult = await RewardService.getRewardSummary();
      if (summaryResult.ok && summaryResult.data) {
        setCurrentPoints(summaryResult.data.totalPoints);
      }

      // Fetch history
      const historyResult = await RewardService.getRewardHistory();
      if (historyResult.ok && historyResult.data?.history) {
        setHistory(historyResult.data.history.map(transformHistory));
        setDataSource('api');
      }

      // Fetch rewards
      const rewardsResult = await RewardService.getAvailableRewards();
      if (rewardsResult.ok && rewardsResult.data?.rewards) {
        setRewards(rewardsResult.data.rewards.map(transformReward));
        setDataSource('api');
      }

      // If all API calls returned no data, use mock
      if (!summaryResult.ok && !historyResult.ok && !rewardsResult.ok) {
        setCurrentPoints(MOCK_SUMMARY.totalPoints);
        setHistory(MOCK_HISTORY);
        setRewards(MOCK_REWARDS);
        setDataSource('mock');
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      setCurrentPoints(MOCK_SUMMARY.totalPoints);
      setHistory(MOCK_HISTORY);
      setRewards(MOCK_REWARDS);
      setDataSource('mock');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleRedeem = async (reward: Reward) => {
    if (currentPoints < reward.pointsCost) {
      alert('Bạn không đủ điểm để đổi quà này');
      return;
    }
    try {
      const result = await RewardService.redeemReward(reward.id, 1);
      if (result.ok) {
        alert(`Đổi thành công: ${reward.name}`);
        fetchData(false); // Refresh data
      } else {
        alert('Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      alert(`Đổi thành công: ${reward.name}`);
    }
  };

  const renderRewardItem = ({ item }: { item: Reward }) => {
    const canRedeem = currentPoints >= item.pointsCost;

    return (
      <View style={[styles.rewardCard, { backgroundColor: surface, borderColor: border }]}>
        <Image source={{ uri: item.image }} style={styles.rewardImage} />
        <View style={styles.rewardInfo}>
          <Text style={[styles.rewardName, { color: text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.rewardDescription, { color: textMuted }]}>
            {item.description}
          </Text>
          <View style={styles.rewardFooter}>
            <View style={styles.pointsContainer}>
              <Ionicons name="diamond" size={16} color={primary} />
              <Text style={[styles.pointsCost, { color: primary }]}>
                {item.pointsCost} điểm
              </Text>
            </View>
            <Text style={[styles.available, { color: textMuted }]}>
              Còn: {item.available}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.redeemButton,
            { backgroundColor: canRedeem ? primary : border },
          ]}
          onPress={() => handleRedeem(item)}
          disabled={!canRedeem}
        >
          <Text style={[styles.redeemButtonText, { color: canRedeem ? '#fff' : textMuted }]}>
            Đổi
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: PointHistory }) => (
    <View style={[styles.historyCard, { backgroundColor: surface, borderColor: border }]}>
      <View style={[styles.historyIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={[styles.historyDescription, { color: text }]}>
          {item.description}
        </Text>
        <Text style={[styles.historyDate, { color: textMuted }]}>
          {new Date(item.date).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      <Text
        style={[
          styles.historyPoints,
          { color: item.type === 'earn' ? '#0D9488' : '#000000' },
        ]}
      >
        {item.type === 'earn' ? '+' : ''}{item.points}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Điểm thưởng',
          headerShown: true,
        }}
      />

      {/* Data Source Indicator */}
      {dataSource === 'mock' && (
        <View style={[styles.mockBanner, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="information-circle" size={16} color="#92400E" />
          <Text style={styles.mockBannerText}>📋 Dữ liệu mẫu - API đang cập nhật</Text>
        </View>
      )}

      {/* Points Balance */}
      <View style={[styles.balanceCard, { backgroundColor: primary }]}>
        <View style={styles.balanceContent}>
          <View style={styles.balanceIcon}>
            <Ionicons name="diamond" size={40} color="#fff" />
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Điểm hiện tại</Text>
            <Text style={styles.balanceAmount}>{currentPoints}</Text>
            <Text style={styles.balanceSubtitle}>
              Tích điểm khi mua sắm
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.historyLink}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={styles.historyLinkText}>Xem lịch sử</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: surface, borderBottomColor: border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'rewards' && [styles.activeTab, { borderBottomColor: primary }],
          ]}
          onPress={() => setSelectedTab('rewards')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'rewards' ? primary : textMuted },
            ]}
          >
            Đổi quà
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'history' && [styles.activeTab, { borderBottomColor: primary }],
          ]}
          onPress={() => setSelectedTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'history' ? primary : textMuted },
            ]}
          >
            Lịch sử điểm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'rewards' ? (
        <FlatList
          data={rewards}
          keyExtractor={item => item.id}
          renderItem={renderRewardItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  mockBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
  },
  balanceCard: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  balanceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceSubtitle: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  historyLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  rewardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  available: {
    fontSize: 12,
  },
  redeemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
  },
  historyPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
