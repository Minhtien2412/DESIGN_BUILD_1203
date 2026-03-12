import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfile } from '@/services/profile';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

type Suggestion = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
};

export function ProfileSuggestions() {
  const { user } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const textMuted = useThemeColor({}, 'textMuted');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [user]);

  const generateSuggestions = async () => {
    try {
      const profile = await getProfile(user?.id || 'guest');

      const allSuggestions: Suggestion[] = [
        {
          id: 'complete-profile',
          title: 'Hoàn thiện thông tin cá nhân',
          description: 'Thêm tên, email và giới thiệu để hồ sơ chuyên nghiệp hơn',
          icon: <Ionicons name="person-add-outline" size={20} color={tintColor} />,
          action: () => router.push('/profile/info'),
          priority: 'high',
          completed: !!(profile?.name && profile?.email),
        },
        {
          id: 'add-avatar',
          title: 'Thêm ảnh đại diện',
          description: 'Ảnh đại diện giúp hồ sơ của bạn nổi bật hơn',
          icon: <Ionicons name="camera-outline" size={20} color={tintColor} />,
          action: () => router.push('/profile/info'),
          priority: 'medium',
          completed: !!profile?.avatar,
        },
        {
          id: 'add-bio',
          title: 'Viết giới thiệu bản thân',
          description: 'Kể về kinh nghiệm và sở thích để kết nối tốt hơn',
          icon: <Ionicons name="document-text-outline" size={20} color={tintColor} />,
          action: () => router.push('/profile/info'),
          priority: 'medium',
          completed: !!(profile?.bio && profile.bio.length > 10),
        },
        {
          id: 'verify-email',
          title: 'Xác thực email',
          description: 'Xác thực email để nhận thông báo quan trọng',
          icon: <Ionicons name="mail-outline" size={20} color={tintColor} />,
          action: () => Alert.alert('Thông báo', 'Tính năng xác thực email đang phát triển'),
          priority: 'high',
          completed: false, // This would need backend verification
        },
        {
          id: 'add-capability',
          title: 'Thêm hồ sơ năng lực',
          description: 'Cho thấy kỹ năng và kinh nghiệm của bạn',
          icon: <Feather name="briefcase" size={20} color={tintColor} />,
          action: () => router.push('/profile/portfolio'),
          priority: 'low',
          completed: false, // This would need to check if capability profile exists
        },
        {
          id: 'upload-videos',
          title: 'Tải lên video giới thiệu',
          description: 'Video giúp khách hàng hiểu rõ hơn về dịch vụ',
          icon: <Feather name="video" size={20} color={tintColor} />,
          action: () => router.push('/profile/portfolio'),
          priority: 'low',
          completed: false, // This would need to check if videos exist
        },
      ];

      // Filter out completed suggestions and sort by priority
      const activeSuggestions = allSuggestions
        .filter(suggestion => !suggestion.completed)
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 3); // Show only top 3 suggestions

      setSuggestions(activeSuggestions);
    } catch (error) {
      console.log('Failed to generate suggestions:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return error;
      case 'medium': return warning;
      case 'low': return success;
      default: return tintColor;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '⚠️';
      case 'medium': return 'ℹ️';
      case 'low': return '💡';
      default: return '💡';
    }
  };

  if (suggestions.length === 0) {
    return null; // Hide if no suggestions
  }

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="bulb-outline" size={20} color={tintColor} />
          <ThemedText style={styles.headerTitle}>Gợi ý cải thiện hồ sơ</ThemedText>
        </View>
        <View style={styles.headerRight}>
          <ThemedText style={[styles.suggestionCount, { color: textMuted }]}>
            {suggestions.length} gợi ý
          </ThemedText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={textMuted}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.suggestionsList, { borderTopColor: border }]}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={suggestion.id}
              style={[
                styles.suggestionItem,
                index < suggestions.length - 1 && [styles.suggestionItemBorder, { borderBottomColor: border }],
              ]}
              onPress={suggestion.action}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionLeft}>
                {suggestion.icon}
                <View style={styles.suggestionContent}>
                  <View style={styles.suggestionHeader}>
                    <ThemedText style={styles.suggestionTitle}>
                      {suggestion.title}
                    </ThemedText>
                    <ThemedText style={[
                      styles.priorityIndicator,
                      { color: getPriorityColor(suggestion.priority) }
                    ]}>
                      {getPriorityIcon(suggestion.priority)}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.suggestionDescription, { color: textMuted }]}>
                    {suggestion.description}
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  suggestionsList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  suggestionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  priorityIndicator: {
    fontSize: 14,
    marginLeft: 8,
  },
  suggestionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
