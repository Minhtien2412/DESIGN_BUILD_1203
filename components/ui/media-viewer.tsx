import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MediaType = 'image' | 'video' | 'doc';

export type MediaItem = {
  type: MediaType;
  source: number | { uri: string };
  title?: string;
};

type Ctx = {
  open: (item: MediaItem) => void;
  close: () => void;
};

const MediaViewerContext = createContext<Ctx | null>(null);

export function useMediaViewer() {
  const ctx = useContext(MediaViewerContext);
  if (!ctx) throw new Error('useMediaViewer must be used within MediaViewerProvider');
  return ctx;
}

export function MediaViewerProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<MediaItem | null>(null);
  const open = useCallback((i: MediaItem) => setItem(i), []);
  const close = useCallback(() => setItem(null), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <MediaViewerContext.Provider value={value}>
      {children}
      <Modal visible={!!item} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          {item ? <ViewerBody item={item} /> : null}
        </View>
      </Modal>
    </MediaViewerContext.Provider>
  );
}

function ViewerBody({ item }: { item: MediaItem }) {
  if (item.type === 'image') {
    return (
      <View style={styles.body}>
        <Image
          source={item.source}
          style={styles.media}
          contentFit="contain"
          // basic zoom via contentFit + pinchGestureEnabled on Expo Image (web: no pinch)
          // For advanced pinch/zoom, integrate react-native-gesture-handler + reanimated later
        />
      </View>
    );
  }
  if (item.type === 'video') {
    // Use separate component to avoid conditional hook call
    return <VideoViewerBody item={item} />;
  }
  // Simple doc placeholder (Word/Excel/PDF): instruct user to open externally for now
  return (
    <View style={styles.body}>
      <View style={styles.docBox}>
        <Text style={styles.docText}>Định dạng này không xem trực tiếp được.
          {"\n"}Bạn có thể mở bằng trình duyệt hoặc ứng dụng ngoài.</Text>
        {typeof (item.source as any)?.uri === 'string' ? (
          <TouchableOpacity
            style={styles.docBtn}
            onPress={() => WebBrowser.openBrowserAsync((item.source as any).uri)}
          >
            <Text style={styles.docBtnText}>Mở trong trình duyệt</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

// Separate component for video to avoid conditional hook call
function VideoViewerBody({ item }: { item: MediaItem }) {
  const player = useVideoPlayer(item.source as any, (p) => { p.loop = false; });
  return (
    <View style={styles.body}>
      <VideoView
        style={styles.media}
        player={player}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: Platform.OS !== 'web' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  docBox: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  docText: { color: '#fff', textAlign: 'center' },
  docBtn: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  docBtnText: { color: '#fff', fontWeight: '700' },
});

// no default export to avoid expo-router typedRoutes treating this as a page
