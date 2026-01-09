// CallSessionContext not implemented yet - commented out to prevent bundling errors
// import { useCallSessionOptional } from '@/context/CallSessionContext';
import React from 'react';
import { StyleSheet } from 'react-native';

export const ActiveCallMiniOverlay: React.FC = () => {
  // TODO: Implement CallSessionContext when call feature is ready
  return null;
};

/* Commented out until CallSessionContext is implemented
const ActiveCallMiniOverlayOriginal: React.FC = () => {
  const ctx = useCallSessionOptional();
  if (!ctx) return null; // provider not ready yet
  const { activeCall, endCall } = ctx;
  const scale = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (activeCall) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }) .start();
    } else {
      Animated.timing(scale, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [activeCall, scale]);

  if (!activeCall) return null;

  const durationSec = Math.floor((Date.now() - activeCall.startedAt) / 1000);
  const mm = String(Math.floor(durationSec / 60)).padStart(2,'0');
  const ss = String(durationSec % 60).padStart(2,'0');

  // Tránh đè lên bottom tab: tab cao 60, cộng thêm safe area bottom
  const BOTTOM_BAR_HEIGHT = 60;
  const bottomOffset = Math.max(insets.bottom, 0) + BOTTOM_BAR_HEIGHT + 24; // 24px margin nhìn thoáng

  return (
    <Animated.View style={[styles.wrap, { bottom: bottomOffset, transform: [{ scale }] }]}>      
      <Pressable style={styles.body} onPress={() => router.push(`/call-popup?roomId=${activeCall.roomId}&kind=${activeCall.kind}`)}>
        <View style={[styles.iconCircle, activeCall.kind === 'voice' ? styles.voice : styles.video]}>
          <MaterialCommunityIcons name={activeCall.kind === 'voice' ? 'phone' : 'video'} size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{activeCall.kind === 'voice' ? 'Cuộc gọi thoại' : 'Video call'}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{mm}:{ss} • {activeCall.participants.length} người</Text>
        </View>
        <Pressable
          style={styles.hangup}
          onPress={(e) => { e.stopPropagation?.(); endCall(); }}
          hitSlop={10}
        >
          <MaterialCommunityIcons name="phone-hangup" size={18} color="#fff" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};
*/

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 16,
    zIndex: 3000,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    minWidth: 220,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: { backgroundColor: '#0066CC' },
  voice: { backgroundColor: '#0066CC' },
  title: { color: '#fff', fontWeight: '600', fontSize: 14 },
  subtitle: { color: '#cbd5e1', fontSize: 12 },
  hangup: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ActiveCallMiniOverlay;
