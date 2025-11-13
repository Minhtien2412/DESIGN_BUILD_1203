import { COMPANIES } from '@/data/companies';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  slug: string;
  title: string;
  description?: string;
};

export function FinishPage({ slug, title, description }: Props) {
  const background = useThemeColor({}, 'background');
  const suggested = React.useMemo(() => COMPANIES.filter((c) => c.categories?.includes('hoan-thien')), []);

  const renderHeader = () => (
    <View style={{ paddingTop: 8, paddingBottom: 6, paddingHorizontal: 16 }}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      <TouchableOpacity style={styles.cta} onPress={() => router.push('/bids' as any)} accessibilityLabel="Đăng yêu cầu báo giá">
        <Ionicons name="flash" size={16} color="#fff" />
        <Text style={styles.ctaText}>Đăng yêu cầu báo giá</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
      <Text style={styles.sectionTitle}>Đơn vị gợi ý</Text>
    </View>
  );

  return (
    <View style={[styles.safe, { backgroundColor: background }]}>
      <FlatList
        data={suggested}
        keyExtractor={(it) => it.slug}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSectionHeader()}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { marginHorizontal: 16 }]} onPress={() => router.push(`/company/${item.slug}` as any)}>
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              {item.description ? <Text style={styles.cardSub} numberOfLines={2}>{item.description}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { marginHorizontal: 16 }]}>Đang cập nhật đơn vị phù hợp…</Text>}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 4 },
  desc: { color: '#555', marginBottom: 8 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0a7ea4', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
  ctaText: { color: '#fff', fontWeight: '800' },
  sectionTitle: { fontWeight: '700', color: '#1f2937', fontSize: 13, marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, backgroundColor: '#fff' },
  avatar: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f3f4f6' },
  cardTitle: { fontWeight: '700', color: '#111' },
  cardSub: { color: '#666', fontSize: 11 },
  emptyText: { textAlign: 'center', color: '#666' },
});

export default FinishPage;
