import VoiceSearchModal from '@/components/voice/VoiceSearchModal';
import { PRODUCTS } from '@/data/products';
import { SERVICES } from '@/data/services';
import { get } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const initial = (params?.q as string) || '';
  const [query, setQuery] = React.useState(initial);
  const [voiceVisible, setVoiceVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const q = useDebounced(query, 300);

  const localSearch = React.useCallback((text: string) => {
    if (!text) return [];
    const t = text.toLowerCase();
    const productMatches = PRODUCTS.filter(p => p.name.toLowerCase().includes(t))
      .map(p => ({ type: 'product', id: p.id, title: p.name }));
    const serviceMatches = SERVICES.filter(s => s.name.toLowerCase().includes(t) || s.slug.includes(t))
      .map(s => ({ type: 'service', id: s.id, title: s.name, slug: s.slug }));
    return [...serviceMatches, ...productMatches];
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setError(null);
      if (!q || q.trim().length < 1) { setResults([]); return; }
      setLoading(true);
      try {
        // Try backend search first (align with thietkeresort API); fallback to local
        const data = await get<any>('/search', { q, limit: 20 }).catch(() => null);
        if (!cancelled) {
          if (data && Array.isArray(data?.results)) {
            setResults(data.results);
          } else {
            setResults(localSearch(q));
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setResults(localSearch(q));
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [q, localSearch]);

  const handleSubmit = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tìm kiếm', headerBackTitle: 'Quay lại' }} />
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.input}
            placeholder="Tìm sản phẩm, dịch vụ, dự án..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoFocus
          />
          <TouchableOpacity onPress={() => setVoiceVisible(true)} style={{ marginRight: 6 }}>
            <Ionicons name="mic-outline" size={20} color="#666" />
          </TouchableOpacity>
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        )}

        {!loading && results.length === 0 && query.length > 0 && (
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${item.type}-${item.id}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <View style={styles.resultIcon}>
                <Ionicons name={item.type === 'service' ? 'construct-outline' : 'cube-outline'} size={18} color="#555" />
              </View>
              <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
      <VoiceSearchModal
        visible={voiceVisible}
        onClose={() => setVoiceVisible(false)}
        onResult={(text) => {
          setQuery(text);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  loadingText: { color: '#666' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyText: { color: '#888' },
  resultItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  resultIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', marginRight: 8 },
  resultTitle: { flex: 1, fontSize: 14, color: '#111' },
});
