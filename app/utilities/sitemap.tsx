/**
 * Site Map Screen
 * Complete navigation map of all app features
 */

import {
    ALL_ROUTES,
    CATEGORY_NAMES,
    getAllCategories,
    getRoutesByCategory,
    RouteCategory,
    VISIBLE_ROUTES
} from '@/constants/app-routes';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SiteMapScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RouteCategory | 'all'>('all');
  const categories = getAllCategories();

  // Filter routes based on search and category
  const filteredRoutes = ALL_ROUTES.filter(route => {
    if (route.hidden) return false;
    
    const matchesSearch = search === '' || 
      route.title.toLowerCase().includes(search.toLowerCase()) ||
      route.path.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || route.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleRoutePress = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Sơ đồ trang web</Text>
          <Text style={styles.headerSubtitle}>{VISIBLE_ROUTES} trang</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm trang..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
            Tất cả ({VISIBLE_ROUTES})
          </Text>
        </TouchableOpacity>
        {categories.map(cat => {
          const count = getRoutesByCategory(cat).length;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {CATEGORY_NAMES[cat]} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Routes List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Group by category */}
        {selectedCategory === 'all' ? (
          categories.map(category => {
            const categoryRoutes = filteredRoutes.filter(r => r.category === category);
            if (categoryRoutes.length === 0) return null;

            return (
              <View key={category} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{CATEGORY_NAMES[category]}</Text>
                  <Text style={styles.sectionCount}>{categoryRoutes.length}</Text>
                </View>
                <View style={styles.routeList}>
                  {categoryRoutes.map((route, index) => (
                    <TouchableOpacity
                      key={route.path}
                      style={[
                        styles.routeCard,
                        index === categoryRoutes.length - 1 && styles.routeCardLast
                      ]}
                      onPress={() => handleRoutePress(route.path)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.routeIcon}>
                        {route.icon ? (
                          <Ionicons name={route.icon as any} size={20} color="#0D9488" />
                        ) : (
                          <Ionicons name="link" size={20} color="#9ca3af" />
                        )}
                      </View>
                      <View style={styles.routeInfo}>
                        <Text style={styles.routeTitle}>{route.title}</Text>
                        <Text style={styles.routePath}>{route.path}</Text>
                        {route.description && (
                          <Text style={styles.routeDescription}>{route.description}</Text>
                        )}
                        {route.requiresAuth && (
                          <View style={styles.badge}>
                            <Ionicons name="lock-closed" size={10} color="#0D9488" />
                            <Text style={styles.badgeText}>Yêu cầu đăng nhập</Text>
                          </View>
                        )}
                        {route.requiresProject && (
                          <View style={styles.badge}>
                            <Ionicons name="folder-open" size={10} color="#666666" />
                            <Text style={styles.badgeText}>Yêu cầu dự án</Text>
                          </View>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.section}>
            <View style={styles.routeList}>
              {filteredRoutes.map((route, index) => (
                <TouchableOpacity
                  key={route.path}
                  style={[
                    styles.routeCard,
                    index === filteredRoutes.length - 1 && styles.routeCardLast
                  ]}
                  onPress={() => handleRoutePress(route.path)}
                  activeOpacity={0.7}
                >
                  <View style={styles.routeIcon}>
                    {route.icon ? (
                      <Ionicons name={route.icon as any} size={20} color="#0D9488" />
                    ) : (
                      <Ionicons name="link" size={20} color="#9ca3af" />
                    )}
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeTitle}>{route.title}</Text>
                    <Text style={styles.routePath}>{route.path}</Text>
                    {route.description && (
                      <Text style={styles.routeDescription}>{route.description}</Text>
                    )}
                    {route.requiresAuth && (
                      <View style={styles.badge}>
                        <Ionicons name="lock-closed" size={10} color="#0D9488" />
                        <Text style={styles.badgeText}>Yêu cầu đăng nhập</Text>
                      </View>
                    )}
                    {route.requiresProject && (
                      <View style={styles.badge}>
                        <Ionicons name="folder-open" size={10} color="#666666" />
                        <Text style={styles.badgeText}>Yêu cầu dự án</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {filteredRoutes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyStateText}>
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    padding: 0,
  },
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#0D9488',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  routeList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  routeCardLast: {
    borderBottomWidth: 0,
  },
  routeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  routePath: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  routeDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D9488',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
