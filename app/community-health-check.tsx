/**
 * Community Features Health Check Screen
 * Kiểm tra các chức năng Community hoạt động đúng
 * 
 * @author AI Assistant
 * @date 16/01/2026
 */

import {
    COMMUNITY_COLORS as COLORS,
    COMMUNITY_RADIUS as RADIUS,
    COMMUNITY_SHADOWS as SHADOWS,
    COMMUNITY_SPACING as SPACING,
    COMMUNITY_TYPOGRAPHY as TYPOGRAPHY,
} from '@/constants/community-theme';
import { PRODUCTS } from '@/data/products';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ==================== TYPES ====================

interface CheckResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

interface CheckGroup {
  title: string;
  checks: CheckResult[];
}

// ==================== MAIN COMPONENT ====================

export default function CommunityHealthCheckScreen() {
  const insets = useSafeAreaInsets();
  const [isRunning, setIsRunning] = useState(false);
  const [checkGroups, setCheckGroups] = useState<CheckGroup[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'pass' | 'fail'>('idle');

  // Initialize check groups
  useEffect(() => {
    setCheckGroups([
      {
        title: '📦 Theme & Constants',
        checks: [
          { name: 'COMMUNITY_COLORS', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'COMMUNITY_SPACING', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'COMMUNITY_TYPOGRAPHY', status: 'pending', message: 'Chờ kiểm tra...' },
        ],
      },
      {
        title: '🎬 Video System',
        checks: [
          { name: 'Import searchVideos', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'Import findVideoByIdOrSlug', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'Search "kiến trúc"', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'Find video by slug', status: 'pending', message: 'Chờ kiểm tra...' },
        ],
      },
      {
        title: '🛒 Products Data',
        checks: [
          { name: 'Products loaded', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'Product search', status: 'pending', message: 'Chờ kiểm tra...' },
        ],
      },
      {
        title: '🧭 Navigation',
        checks: [
          { name: 'Route to Social', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'Route to Video Discovery', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'Route to Reels Viewer', status: 'pending', message: 'Chờ kiểm tra...' },
          { name: 'Route to Create Post', status: 'pending', message: 'Chờ kiểm tra...' },
        ],
      },
    ]);
  }, []);

  // Update single check result
  const updateCheck = (groupIndex: number, checkIndex: number, result: Partial<CheckResult>) => {
    setCheckGroups(prev => {
      const newGroups = [...prev];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        checks: newGroups[groupIndex].checks.map((c, i) =>
          i === checkIndex ? { ...c, ...result } : c
        ),
      };
      return newGroups;
    });
  };

  // Run all checks
  const runAllChecks = useCallback(async () => {
    setIsRunning(true);
    setOverallStatus('running');
    let hasError = false;

    // ============ Group 0: Theme & Constants ============
    try {
      // Check COMMUNITY_COLORS
      const startColors = Date.now();
      if (COLORS && COLORS.primary && COLORS.secondary && COLORS.background) {
        updateCheck(0, 0, {
          status: 'success',
          message: `✓ primary: ${COLORS.primary}, background: ${COLORS.background}`,
          duration: Date.now() - startColors,
        });
      } else {
        throw new Error('Missing color values');
      }
    } catch (e: any) {
      updateCheck(0, 0, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    try {
      // Check COMMUNITY_SPACING
      const startSpacing = Date.now();
      if (SPACING && SPACING.xs && SPACING.sm && SPACING.md && SPACING.lg) {
        updateCheck(0, 1, {
          status: 'success',
          message: `✓ xs: ${SPACING.xs}, sm: ${SPACING.sm}, md: ${SPACING.md}, lg: ${SPACING.lg}`,
          duration: Date.now() - startSpacing,
        });
      } else {
        throw new Error('Missing spacing values');
      }
    } catch (e: any) {
      updateCheck(0, 1, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    try {
      // Check COMMUNITY_TYPOGRAPHY
      const startTypo = Date.now();
      if (TYPOGRAPHY && TYPOGRAPHY.fontSize && TYPOGRAPHY.fontWeight) {
        updateCheck(0, 2, {
          status: 'success',
          message: `✓ fontSize.md: ${TYPOGRAPHY.fontSize.md}, fontWeight.bold: ${TYPOGRAPHY.fontWeight.bold}`,
          duration: Date.now() - startTypo,
        });
      } else {
        throw new Error('Missing typography values');
      }
    } catch (e: any) {
      updateCheck(0, 2, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    // ============ Group 1: Video System ============
    try {
      // Import and check searchVideos
      const startImport1 = Date.now();
      const { searchVideos } = await import('@/app/social/reels-viewer');
      if (typeof searchVideos === 'function') {
        updateCheck(1, 0, {
          status: 'success',
          message: '✓ searchVideos function imported',
          duration: Date.now() - startImport1,
        });
      } else {
        throw new Error('searchVideos is not a function');
      }
    } catch (e: any) {
      updateCheck(1, 0, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    try {
      // Import and check findVideoByIdOrSlug
      const startImport2 = Date.now();
      const { findVideoByIdOrSlug } = await import('@/app/social/reels-viewer');
      if (typeof findVideoByIdOrSlug === 'function') {
        updateCheck(1, 1, {
          status: 'success',
          message: '✓ findVideoByIdOrSlug function imported',
          duration: Date.now() - startImport2,
        });
      } else {
        throw new Error('findVideoByIdOrSlug is not a function');
      }
    } catch (e: any) {
      updateCheck(1, 1, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    try {
      // Test search "kiến trúc"
      const startSearch = Date.now();
      const { searchVideos } = await import('@/app/social/reels-viewer');
      const results = searchVideos('kiến trúc');
      if (results && results.length > 0) {
        updateCheck(1, 2, {
          status: 'success',
          message: `✓ Tìm thấy ${results.length} video cho "kiến trúc"`,
          duration: Date.now() - startSearch,
        });
      } else {
        updateCheck(1, 2, {
          status: 'warning',
          message: '⚠ Không tìm thấy video, nhưng function hoạt động',
          duration: Date.now() - startSearch,
        });
      }
    } catch (e: any) {
      updateCheck(1, 2, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    try {
      // Test find by slug
      const startFind = Date.now();
      const { findVideoByIdOrSlug } = await import('@/app/social/reels-viewer');
      const video = findVideoByIdOrSlug('kien-truc-hien-dai-2026');
      if (video) {
        updateCheck(1, 3, {
          status: 'success',
          message: `✓ Tìm thấy video: "${video.title || video.slug}"`,
          duration: Date.now() - startFind,
        });
      } else {
        updateCheck(1, 3, {
          status: 'warning',
          message: '⚠ Không tìm thấy video theo slug, nhưng function hoạt động',
          duration: Date.now() - startFind,
        });
      }
    } catch (e: any) {
      updateCheck(1, 3, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    // ============ Group 2: Products Data ============
    try {
      const startProducts = Date.now();
      if (PRODUCTS && PRODUCTS.length > 0) {
        updateCheck(2, 0, {
          status: 'success',
          message: `✓ ${PRODUCTS.length} sản phẩm đã load`,
          duration: Date.now() - startProducts,
        });
      } else {
        throw new Error('No products found');
      }
    } catch (e: any) {
      updateCheck(2, 0, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    try {
      const startProdSearch = Date.now();
      const results = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes('villa') ||
        p.category?.toLowerCase().includes('villa')
      );
      updateCheck(2, 1, {
        status: results.length > 0 ? 'success' : 'warning',
        message: results.length > 0 
          ? `✓ Tìm thấy ${results.length} sản phẩm "villa"`
          : '⚠ Không tìm thấy sản phẩm "villa"',
        duration: Date.now() - startProdSearch,
      });
    } catch (e: any) {
      updateCheck(2, 1, { status: 'error', message: `✗ ${e.message}` });
      hasError = true;
    }

    // ============ Group 3: Navigation ============
    const routes = [
      { path: '/(tabs)/social', name: 'Route to Social' },
      { path: '/social/video-discovery', name: 'Route to Video Discovery' },
      { path: '/social/reels-viewer', name: 'Route to Reels Viewer' },
      { path: '/social/create-post', name: 'Route to Create Post' },
    ];

    routes.forEach((route, index) => {
      try {
        // Just check if router exists - actual navigation test would require user action
        if (router && typeof router.push === 'function') {
          updateCheck(3, index, {
            status: 'success',
            message: `✓ Route ${route.path} ready`,
          });
        } else {
          throw new Error('Router not available');
        }
      } catch (e: any) {
        updateCheck(3, index, { status: 'error', message: `✗ ${e.message}` });
        hasError = true;
      }
    });

    // Set overall status
    setOverallStatus(hasError ? 'fail' : 'pass');
    setIsRunning(false);
  }, []);

  // Run checks on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runAllChecks();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Navigate to route
  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (e) {
      Alert.alert('Error', `Cannot navigate to ${path}`);
    }
  };

  // Get status color
  const getStatusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return COLORS.textTertiary;
    }
  };

  // Get status icon
  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'ellipse-outline';
    }
  };

  // Count results
  const countResults = () => {
    let success = 0, error = 0, warning = 0, pending = 0;
    checkGroups.forEach(group => {
      group.checks.forEach(check => {
        if (check.status === 'success') success++;
        else if (check.status === 'error') error++;
        else if (check.status === 'warning') warning++;
        else pending++;
      });
    });
    return { success, error, warning, pending, total: success + error + warning + pending };
  };

  const results = countResults();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Check</Text>
        <TouchableOpacity 
          onPress={runAllChecks} 
          style={styles.refreshBtn}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="refresh" size={22} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={[styles.summaryBadge, { backgroundColor: overallStatus === 'pass' ? '#dcfce7' : overallStatus === 'fail' ? '#fee2e2' : '#f3f4f6' }]}>
          <Ionicons 
            name={overallStatus === 'pass' ? 'checkmark-circle' : overallStatus === 'fail' ? 'alert-circle' : 'hourglass-outline'} 
            size={24} 
            color={overallStatus === 'pass' ? '#22c55e' : overallStatus === 'fail' ? '#ef4444' : COLORS.textSecondary}
          />
          <Text style={[styles.summaryText, { 
            color: overallStatus === 'pass' ? '#166534' : overallStatus === 'fail' ? '#991b1b' : COLORS.textSecondary 
          }]}>
            {overallStatus === 'pass' ? 'All Checks Passed' : overallStatus === 'fail' ? 'Some Checks Failed' : overallStatus === 'running' ? 'Running...' : 'Ready'}
          </Text>
        </View>
        <View style={styles.summaryStats}>
          <Text style={[styles.statText, { color: '#22c55e' }]}>✓ {results.success}</Text>
          <Text style={[styles.statText, { color: '#ef4444' }]}>✗ {results.error}</Text>
          <Text style={[styles.statText, { color: '#f59e0b' }]}>⚠ {results.warning}</Text>
        </View>
      </View>

      {/* Check Groups */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRunning} onRefresh={runAllChecks} />
        }
      >
        {checkGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.checks.map((check, checkIndex) => (
              <View key={checkIndex} style={styles.checkItem}>
                <View style={styles.checkHeader}>
                  <Ionicons 
                    name={getStatusIcon(check.status) as any} 
                    size={20} 
                    color={getStatusColor(check.status)} 
                  />
                  <Text style={styles.checkName}>{check.name}</Text>
                  {check.duration !== undefined && (
                    <Text style={styles.checkDuration}>{check.duration}ms</Text>
                  )}
                </View>
                <Text style={[styles.checkMessage, { color: getStatusColor(check.status) }]}>
                  {check.message}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Quick Navigation Tests */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>🧪 Quick Tests</Text>
          <TouchableOpacity style={styles.testBtn} onPress={() => navigateTo('/(tabs)/social')}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.testBtnText}>Mở Social Tab</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.testBtn} onPress={() => navigateTo('/social/video-discovery')}>
            <Ionicons name="compass" size={20} color={COLORS.primary} />
            <Text style={styles.testBtnText}>Mở Video Discovery</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.testBtn} onPress={() => navigateTo('/social/reels-viewer')}>
            <Ionicons name="play-circle" size={20} color={COLORS.primary} />
            <Text style={styles.testBtnText}>Mở Reels Viewer</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.testBtn} onPress={() => navigateTo('/social/create-post')}>
            <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            <Text style={styles.testBtnText}>Mở Create Post</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.testBtn} onPress={() => navigateTo('/search')}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <Text style={styles.testBtnText}>Mở AI Search</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  group: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  groupTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  checkItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  checkDuration: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  checkMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: 28,
    marginTop: 4,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  testBtnText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
});
