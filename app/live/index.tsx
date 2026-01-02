import { LivePlayer } from '@/components/live/LivePlayer';
import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLiveStreams } from '@/hooks/useLiveStreams';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function LiveListScreen() {
  const { streams, loading, refreshing, error, refresh, liveCount } = useLiveStreams({
    liveOnly: true,
    autoRefreshInterval: 30000, // Refresh every 30 seconds
  });

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const renderItem = ({ item }: { item: typeof streams[0] }) => {
    return (
      <Pressable style={[styles.card, { borderColor }]} onPress={() => router.push(`/live/${item.id}`)}>
        <View style={styles.cardHeader}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={styles.viewerBadge}>
            <Ionicons name="eye" size={14} color="#fff" />
            <Text style={styles.viewerText}>{item.viewerCountDisplay}</Text>
          </View>
        </View>

        <LivePlayer source={item.thumbnailUrl || ''} autoPlay={false} />

        <View style={styles.meta}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.host} numberOfLines={1}>Host: {item.hostName || 'Unknown'}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Container>
      <Stack.Screen options={{ title: `Live ${liveCount > 0 ? `(${liveCount})` : ''}`, headerShown: true }} />

      {loading ? (
        <View style={styles.center}>
          <Loader />
          <Text style={{ color: textColor }}>Loading live streams...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={{ color: textColor, marginTop: 8 }}>{error}</Text>
          <Pressable style={styles.retry} onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={streams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="videocam-off" size={64} color="#9CA3AF" />
              <Text style={{ color: textColor, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
                Livestream Coming Soon
              </Text>
              <Text style={{ color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
                Livestream module is being deployed. Check back soon!
              </Text>
            </View>
          }
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 16,
    paddingVertical: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  cardHeader: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  viewerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  meta: {
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  host: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  retry: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  createButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
