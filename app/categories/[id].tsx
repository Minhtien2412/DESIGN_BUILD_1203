import { getCategoryById } from '@/constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const category = getCategoryById(id || '');

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.errorText}>Danh mục không tồn tại</Text>
        <Pressable onPress={() => router.back()} style={styles.errorBtn}>
          <Text style={styles.errorBtnText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const gradient = category.gradient || [category.color, category.color + 'CC'];

  return (
    <View style={styles.wrapper}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={category.color} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 8 }]}
        >
          {/* Nav Row */}
          <View style={styles.heroNav}>
            <Pressable onPress={() => router.back()} style={styles.heroNavBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <Pressable onPress={() => router.push('/unified-search' as any)} style={styles.heroNavBtn}>
              <Ionicons name="search-outline" size={22} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Ionicons name={category.icon as any} size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>{category.label}</Text>
            <Text style={styles.heroDescription}>{category.description}</Text>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroPill}>
              <Ionicons name="apps" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroPillText}>{category.modules.length} chức năng</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="star" size={14} color="#FFAB40" />
              <Text style={styles.heroPillText}>Phổ biến</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Modules Grid */}
        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tất cả chức năng</Text>
            <Text style={styles.sectionCount}>{category.modules.length}</Text>
          </View>
          <View style={styles.modulesGrid}>
            {category.modules.map((module, index) => (
              <Pressable
                key={module.id}
                onPress={() => router.push(module.route as any)}
                style={({ pressed }) => [
                  styles.moduleCard,
                  pressed && styles.moduleCardPressed,
                ]}
              >
                <View style={styles.moduleCardInner}>
                  <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.moduleIconBg}
                  >
                    <Ionicons name={module.icon as any} size={22} color="#fff" />
                  </LinearGradient>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName} numberOfLines={1}>
                      {module.label}
                    </Text>
                    {module.description ? (
                      <Text style={styles.moduleDescription} numberOfLines={2}>
                        {module.description}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  errorBtn: {
    marginTop: 8,
    backgroundColor: '#4338CA',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  errorBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  hero: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  modulesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4338CA',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modulesGrid: {
    gap: 10,
  },
  moduleCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  moduleCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  moduleCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  moduleIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});
