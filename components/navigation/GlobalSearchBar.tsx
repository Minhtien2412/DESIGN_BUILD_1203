import { useAnalytics } from '@/hooks/useAnalytics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const GlobalSearchBar: React.FC = () => {
  const router = useRouter();
  const { trackNavigation } = useAnalytics();

  const handlePress = () => {
    trackNavigation('link', '/search');
    router.push('/search' as any);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.icon} />
        <Text style={styles.placeholder}>Tìm kiếm tính năng...</Text>
        <Ionicons name="options-outline" size={20} color="#666" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  icon: {
    marginRight: 12,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    color: '#999',
  },
});
