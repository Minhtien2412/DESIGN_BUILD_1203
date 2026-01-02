import { getCategoryById } from '@/constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const category = getCategoryById(id || '');

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Danh mục không tồn tại</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: category.label,
          headerStyle: { backgroundColor: category.color },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />
      <StatusBar barStyle="light-content" backgroundColor={category.color} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={category.gradient || [category.color, category.color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIconContainer}>
            <Ionicons name={category.icon as any} size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>{category.label}</Text>
          <Text style={styles.heroDescription}>{category.description}</Text>
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{category.modules.length}</Text>
              <Text style={styles.statLabel}>Chức năng</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Modules Grid */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Tất cả chức năng</Text>
          <View style={styles.modulesGrid}>
            {category.modules.map((module) => (
              <Pressable
                key={module.id}
                onPress={() => router.push(module.route as any)}
                style={({ pressed }) => [
                  styles.moduleCard,
                  pressed && styles.moduleCardPressed,
                ]}
              >
                <View style={[styles.moduleIconBg, { backgroundColor: category.color + '20' }]}>
                  <Ionicons name={module.icon as any} size={28} color={category.color} />
                </View>
                <Text style={styles.moduleName} numberOfLines={2}>
                  {module.label}
                </Text>
                {module.description && (
                  <Text style={styles.moduleDescription} numberOfLines={2}>
                    {module.description}
                  </Text>
                )}
                <View style={styles.moduleArrow}>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  hero: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  modulesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  moduleCard: {
    width: '50%',
    padding: 6,
  },
  moduleCardPressed: {
    opacity: 0.7,
  },
  moduleIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  moduleArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
