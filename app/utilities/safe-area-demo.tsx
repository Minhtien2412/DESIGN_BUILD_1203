import { ThemedView } from '@/components/themed-view';
import { SafeScrollView, SafeView, useTabBarHeight } from '@/components/ui/safe-area';
import { useHideTabBar } from '@/hooks/useTabBar';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeAreaDemoScreen() {
  const [hideTabBar, setHideTabBar] = useState(false);
  const [showScrollExample, setShowScrollExample] = useState(true);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  
  // Demo: Hide tab bar when toggled
  useHideTabBar(hideTabBar);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{ 
          title: 'Safe Area Demo',
          headerBackTitle: 'Quay lại',
        }} 
      />
      
      {showScrollExample ? (
        /* Example 1: SafeScrollView with Tab Bar */
        <SafeScrollView 
          hasTabBar={!hideTabBar}
          extraPadding={20}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Ionicons name="information-circle" size={48} color="#0891B2" />
              <Text style={styles.title}>Safe Area Components</Text>
              <Text style={styles.subtitle}>Demo các component xử lý safe area</Text>
            </View>

            {/* Info Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📱 Thông tin Safe Area</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Top Inset:</Text>
                <Text style={styles.infoValue}>{insets.top}px</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bottom Inset:</Text>
                <Text style={styles.infoValue}>{insets.bottom}px</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tab Bar Height:</Text>
                <Text style={styles.infoValue}>{tabBarHeight}px</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform:</Text>
                <Text style={styles.infoValue}>{Platform.OS}</Text>
              </View>
            </View>

            {/* Example 1 */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✅ Example 1: SafeScrollView</Text>
              <Text style={styles.cardText}>
                Component này tự động thêm padding bottom để tránh bị tab bar che.
              </Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  {`<SafeScrollView
  hasTabBar={true}
  extraPadding={20}
>
  {/* Your content */}
</SafeScrollView>`}
                </Text>
              </View>
            </View>

            {/* Example 2 */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✅ Example 2: SafeView</Text>
              <Text style={styles.cardText}>
                Dùng cho màn hình không scroll (static layout).
              </Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  {`<SafeView hasTabBar={true}>
  {/* Your static content */}
</SafeView>`}
                </Text>
              </View>
            </View>

            {/* Example 3 */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✅ Example 3: useHideTabBar</Text>
              <Text style={styles.cardText}>
                Hook để ẩn tab bar trong màn hình chi tiết.
              </Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  {`// Trong product detail, video player...
useHideTabBar(true);`}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setHideTabBar(!hideTabBar)}
              >
                <Ionicons 
                  name={hideTabBar ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.toggleButtonText}>
                  {hideTabBar ? 'Hiện Tab Bar' : 'Ẩn Tab Bar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Example 4 */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✅ Example 4: useTabBarHeight</Text>
              <Text style={styles.cardText}>
                Hook lấy chiều cao tab bar (bao gồm safe area).
              </Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  {`const tabBarHeight = useTabBarHeight();
// iOS: 60 + insets.bottom
// Android: 60`}
                </Text>
              </View>
            </View>

            {/* Switch View Example */}
            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setShowScrollExample(false)}
            >
              <Ionicons name="swap-horizontal" size={20} color="#0891B2" />
              <Text style={styles.switchButtonText}>
                Xem Example với SafeView
              </Text>
            </TouchableOpacity>

            {/* Content to demonstrate scrolling */}
            <View style={styles.demoContent}>
              <Text style={styles.demoTitle}>📝 Demo Scroll Content</Text>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.demoItem}>
                  <Ionicons name="document-text-outline" size={24} color="#6B7280" />
                  <Text style={styles.demoItemText}>Demo Item {i}</Text>
                </View>
              ))}
            </View>

            {/* Bottom indicator */}
            <View style={styles.bottomIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.bottomText}>
                ✅ Content này không bị tab bar che!
              </Text>
            </View>
          </View>
        </SafeScrollView>
      ) : (
        /* Example 2: SafeView (no scrolling) */
        <SafeView hasTabBar={!hideTabBar}>
          <View style={styles.staticContainer}>
            <View style={styles.header}>
              <Ionicons name="apps" size={48} color="#8B5CF6" />
              <Text style={styles.title}>SafeView Example</Text>
              <Text style={styles.subtitle}>Static layout (không scroll)</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 SafeView Use Case</Text>
              <Text style={styles.cardText}>
                Dùng SafeView khi màn hình có layout cố định (fixed), không cần scroll.
              </Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  {`<SafeView hasTabBar={true}>
  <View style={{ flex: 1 }}>
    {/* Fixed layout content */}
  </View>
</SafeView>`}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setShowScrollExample(true)}
            >
              <Ionicons name="swap-horizontal" size={20} color="#0891B2" />
              <Text style={styles.switchButtonText}>
                Quay lại ScrollView Example
              </Text>
            </TouchableOpacity>

            {/* Fixed bottom content */}
            <View style={styles.fixedBottom}>
              <Ionicons name="information-circle" size={20} color="#6B7280" />
              <Text style={styles.fixedBottomText}>
                Content này luôn ở đáy màn hình và không bị tab bar che
              </Text>
            </View>
          </View>
        </SafeView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  staticContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891B2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#0891B2',
  },
  switchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0891B2',
  },
  demoContent: {
    marginTop: 16,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  demoItemText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  bottomIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    gap: 10,
  },
  bottomText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
  },
  fixedBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 'auto',
  },
  fixedBottomText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
});
