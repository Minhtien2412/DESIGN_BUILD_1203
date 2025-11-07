import VideoPlayer from '@/components/ui/VideoPlayer';
import { usePlayer } from '@/context/PlayerContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MiniPlayerPortal() {
  const { state, minimize, expand, close } = usePlayer();
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');

  if (!state.active || !state.source) return null;

  const isInline = state.mode === 'inline';
  const isFloating = state.mode === 'floating';
  const containerStyle = isInline
    ? [styles.fullOverlay]
    : [
        styles.floating,
        {
          right: Math.max(insets.right, 12),
          bottom: Math.max(insets.bottom, 12),
        },
      ];

  const uri = state.source.type === 'uri' ? state.source.uri : `https://www.youtube.com/watch?v=${state.source.videoId}`;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={containerStyle as any}>
        {/* Header bar */}
        <View style={[styles.headerBar, { backgroundColor: bg, borderColor: border }]}> 
          <Text style={[styles.title, { color: text }]} numberOfLines={1}>
            {state.source.title || (state.source.type === 'youtube' ? 'YouTube' : 'Video')}
          </Text>
          <View style={styles.headerActions}>
            {isInline ? (
              <Pressable onPress={minimize} style={styles.headerBtn}><Text style={[styles.headerBtnText, { color: text }]}>Thu nhỏ</Text></Pressable>
            ) : (
              <Pressable onPress={expand} style={styles.headerBtn}><Text style={[styles.headerBtnText, { color: text }]}>Mở rộng</Text></Pressable>
            )}
            <Pressable onPress={close} style={styles.headerBtn}><Text style={[styles.headerBtnText, { color: text }]}>Đóng</Text></Pressable>
          </View>
        </View>

        {/* Video area */}
        <View style={isInline ? styles.inlineVideo : styles.floatingVideo}>
          <VideoPlayer uri={uri} autoPlay loop muted={state.muted} style={StyleSheet.absoluteFill} />
        </View>
        {isFloating ? (
          <Pressable onPress={expand} style={styles.tapCatcher}>
            <Text style={styles.srOnly}>expand</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9998,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 16 : 0,
  },
  floating: {
    position: 'absolute',
    width: 180,
    height: 320, // ~9:16 ratio
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 9999,
    backgroundColor: '#000',
  },
  headerBar: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(127,127,127,0.12)'
  },
  headerBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inlineVideo: {
    width: '100%',
    maxWidth: 460,
    aspectRatio: 9/16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  floatingVideo: {
    flex: 1,
    backgroundColor: '#000',
  },
  tapCatcher: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  }
});

export default MiniPlayerPortal;
