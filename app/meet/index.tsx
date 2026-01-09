/**
 * Meeting Home Screen - Minimal Monochrome Design
 * Clean black & white premium experience
 */

import {
    createInstantMeeting,
    getMeetingShareText,
    getScheduledMeetings,
} from '@/services/scheduled-meeting.service';
import type { ScheduledMeeting, ScheduledMeetingStatus } from '@/types/scheduled-meeting';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MeetingListScreen() {
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingInstant, setCreatingInstant] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Monochrome colors
  const colors = {
    bg: isDark ? '#000000' : '#FFFFFF',
    card: isDark ? '#111111' : '#F8F8F8',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#999999' : '#666666',
    textMuted: isDark ? '#666666' : '#999999',
    border: isDark ? '#222222' : '#E5E5E5',
    accent: isDark ? '#FFFFFF' : '#000000',
    accentSoft: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    live: '#FF3B30',
  };

  const loadMeetings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await getScheduledMeetings();
      setMeetings(response.meetings);
    } catch (error) {
      console.error('[MeetList] Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadMeetings(); }, [loadMeetings]);

  const handleCreateInstant = async () => {
    try {
      setCreatingInstant(true);
      const response = await createInstantMeeting();
      router.push(`/meet/${response.meeting.meetingCode}`);
    } catch { Alert.alert('Error', 'Unable to create meeting.'); }
    finally { setCreatingInstant(false); }
  };

  const handleJoinMeeting = () => router.push('/meet/join');
  const handleScheduleMeeting = () => router.push('/meet/create');
  const handleMeetingPress = (m: ScheduledMeeting) => router.push(`/meet/${m.meetingCode}`);

  const handleShareMeeting = async (m: ScheduledMeeting) => {
    try { await Share.share({ message: getMeetingShareText(m) }); }
    catch { await Clipboard.setStringAsync(m.meetingLink); Alert.alert('Copied'); }
  };

  const isLive = (s: ScheduledMeetingStatus) => s === 'IN_PROGRESS' || s === 'STARTED';

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + `, ${timeStr}`;
  };

  const ActionButton = ({ icon, label, onPress, loading: btnLoading, primary = false, delay = 0 }: any) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
      <Animated.View entering={FadeInUp.delay(delay).springify()}>
        <AnimatedPressable
          style={[styles.actionCard, { backgroundColor: primary ? colors.accent : colors.card, borderColor: colors.border }, animStyle]}
          onPress={onPress}
          onPressIn={() => { scale.value = withSpring(0.96); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          disabled={btnLoading}
        >
          {btnLoading ? <ActivityIndicator color={primary ? colors.bg : colors.accent} size="small" />
            : <Ionicons name={icon} size={24} color={primary ? colors.bg : colors.accent} />}
          <Text style={[styles.actionLabel, { color: primary ? colors.bg : colors.text }]}>{label}</Text>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  const MeetingCard = ({ item, index }: { item: ScheduledMeeting; index: number }) => {
    const live = isLive(item.status);
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
      <Animated.View entering={FadeInUp.delay(100 + index * 50).springify()}>
        <AnimatedPressable
          style={[styles.meetingCard, { backgroundColor: colors.card, borderColor: live ? colors.live : colors.border, borderWidth: live ? 1.5 : 1 }, animStyle]}
          onPress={() => handleMeetingPress(item)}
          onPressIn={() => { scale.value = withSpring(0.98); }}
          onPressOut={() => { scale.value = withSpring(1); }}
        >
          <View style={styles.cardContent}>
            <View style={[styles.meetingIcon, { backgroundColor: live ? colors.live : colors.accentSoft }]}>
              <Ionicons name="videocam" size={20} color={live ? '#fff' : colors.accent} />
            </View>
            <View style={styles.meetingInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.meetingTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                {live && <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>}
              </View>
              <Text style={[styles.meetingTime, { color: colors.textSecondary }]}>{formatDateTime(item.scheduledStartTime)} · {item.duration} min</Text>
              <View style={styles.metaRow}>
                <View style={styles.participantsPreview}>
                  {item.participants.slice(0, 3).map((p, i) => (
                    <View key={p.id} style={[styles.avatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i, backgroundColor: colors.accentSoft, borderColor: colors.card }]}>
                      {p.avatar ? <Image source={{ uri: p.avatar }} style={styles.avatarImage} /> : <Text style={[styles.avatarText, { color: colors.textSecondary }]}>{p.name[0]}</Text>}
                    </View>
                  ))}
                  {item.participants.length > 3 && <View style={[styles.avatar, styles.avatarMore, { marginLeft: -8, backgroundColor: colors.accentSoft, borderColor: colors.card }]}><Text style={[styles.avatarMoreText, { color: colors.textMuted }]}>+{item.participants.length - 3}</Text></View>}
                </View>
                <Text style={[styles.participantCount, { color: colors.textMuted }]}>{item.participants.length} people</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Pressable style={[styles.iconBtn, { backgroundColor: colors.accentSoft }]} onPress={() => handleShareMeeting(item)}><Ionicons name="share-outline" size={18} color={colors.textSecondary} /></Pressable>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </View>
          <View style={[styles.codeBar, { borderTopColor: colors.border }]}>
            <Text style={[styles.codeLabel, { color: colors.textMuted }]}>Meeting ID</Text>
            <Text style={[styles.codeText, { color: colors.textSecondary }]}>{item.meetingCode}</Text>
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}><Ionicons name="arrow-back" size={24} color={colors.text} /></Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meetings</Text>
        <Pressable style={styles.settingsBtn} hitSlop={8}><Ionicons name="ellipsis-horizontal" size={24} color={colors.text} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadMeetings(true)} tintColor={colors.textMuted} />}>
        <Animated.View entering={FadeInDown.springify()} style={styles.statsSection}>
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statItem}><Text style={[styles.statNumber, { color: colors.text }]}>{meetings.length}</Text><Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text></View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}><Text style={[styles.statNumber, { color: colors.live }]}>{meetings.filter(m => isLive(m.status)).length}</Text><Text style={[styles.statLabel, { color: colors.textMuted }]}>Live</Text></View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}><Text style={[styles.statNumber, { color: colors.text }]}>{meetings.filter(m => m.status === 'SCHEDULED').length}</Text><Text style={[styles.statLabel, { color: colors.textMuted }]}>Upcoming</Text></View>
          </View>
        </Animated.View>

        <View style={styles.actionsSection}>
          <View style={styles.actionsRow}>
            <ActionButton icon="videocam" label="New Meeting" onPress={handleCreateInstant} loading={creatingInstant} primary delay={0} />
            <ActionButton icon="enter-outline" label="Join" onPress={handleJoinMeeting} delay={50} />
            <ActionButton icon="calendar-outline" label="Schedule" onPress={handleScheduleMeeting} delay={100} />
          </View>
        </View>

        <View style={styles.meetingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Meetings</Text>
            {meetings.length > 0 && <Pressable><Text style={[styles.seeAllText, { color: colors.textSecondary }]}>See all</Text></Pressable>}
          </View>
          {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="small" color={colors.textMuted} /><Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text></View>
            : meetings.length === 0 ? (
              <Animated.View entering={FadeInUp.springify()} style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}><Ionicons name="calendar-outline" size={32} color={colors.textMuted} /></View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No meetings yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Create a new meeting or join one with a code</Text>
                <Pressable style={[styles.emptyBtn, { backgroundColor: colors.accent }]} onPress={handleScheduleMeeting}><Text style={[styles.emptyBtnText, { color: colors.bg }]}>Schedule Meeting</Text></Pressable>
              </Animated.View>
            ) : <View style={styles.meetingsList}>{meetings.map((m, i) => <MeetingCard key={m.id} item={m} index={i} />)}</View>}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.fab}>
        <Pressable style={[styles.fabButton, { backgroundColor: colors.accent }]} onPress={handleCreateInstant} disabled={creatingInstant}>
          {creatingInstant ? <ActivityIndicator color={colors.bg} size="small" /> : <Ionicons name="add" size={28} color={colors.bg} />}
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3 },
  settingsBtn: { width: 40, alignItems: 'flex-end' },
  scrollContent: { paddingTop: 20 },
  statsSection: { paddingHorizontal: 20, marginBottom: 24 },
  statsCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', letterSpacing: -1 },
  statLabel: { fontSize: 12, fontWeight: '500', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, marginHorizontal: 16 },
  actionsSection: { paddingHorizontal: 20, marginBottom: 32 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, gap: 10 },
  actionLabel: { fontSize: 13, fontWeight: '600', letterSpacing: -0.2 },
  meetingsSection: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  seeAllText: { fontSize: 14, fontWeight: '500' },
  meetingsList: { gap: 12 },
  meetingCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  meetingIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  meetingInfo: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meetingTitle: { fontSize: 16, fontWeight: '600', letterSpacing: -0.3, flex: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 59, 48, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B30' },
  liveText: { color: '#FF3B30', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  meetingTime: { fontSize: 13, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  participantsPreview: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 10, fontWeight: '600' },
  avatarMore: { alignItems: 'center', justifyContent: 'center' },
  avatarMoreText: { fontSize: 9, fontWeight: '600' },
  participantCount: { fontSize: 12, fontWeight: '500' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  codeBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  codeLabel: { fontSize: 12, fontWeight: '500' },
  codeText: { fontSize: 13, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 0.5 },
  loadingContainer: { padding: 60, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '500' },
  emptyState: { borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 1 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20, paddingHorizontal: 20 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  emptyBtnText: { fontSize: 15, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 30, right: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }, android: { elevation: 6 } }) },
  fabButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
