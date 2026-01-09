/**
 * Gesture Demo Screen
 * Trang demo tất cả gesture components
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    DoubleTapZoom,
    DraggableItem,
    LongPressMenu,
    MenuItem,
    PinchZoomView,
    SwipeableCard,
} from '../../components/gestures';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function GesturesDemo() {
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const menuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: '✏️',
      onPress: () => Alert.alert('Edit', 'Edit action triggered'),
    },
    {
      label: 'Share',
      icon: '📤',
      onPress: () => Alert.alert('Share', 'Share action triggered'),
    },
    {
      label: 'Delete',
      icon: '🗑️',
      destructive: true,
      onPress: () => Alert.alert('Delete', 'Delete action triggered'),
    },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: text }]}>Gesture Demo</Text>
        </View>

        {/* Section 1: Swipeable Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>1. Swipeable Card</Text>
          <Text style={[styles.sectionDesc, { color: text, opacity: 0.7 }]}>
            Vuốt trái để xóa, vuốt phải để like
          </Text>

          <SwipeableCard
            leftAction={{
              label: '❤️ Like',
              color: '#0066CC',
              onPress: () => Alert.alert('Like', 'Item liked!'),
            }}
            rightAction={{
              label: '🗑️ Delete',
              color: '#000000',
              onPress: () => Alert.alert('Delete', 'Item deleted!'),
            }}
          >
            <View style={{ padding: 8 }}>
              <Text style={[styles.cardTitle, { color: text }]}>Product Item</Text>
              <Text style={[styles.cardDesc, { color: text, opacity: 0.6 }]}>
                Swipe left or right to trigger actions
              </Text>
            </View>
          </SwipeableCard>
        </View>

        {/* Section 2: Pinch to Zoom */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>2. Pinch to Zoom</Text>
          <Text style={[styles.sectionDesc, { color: text, opacity: 0.7 }]}>
            Dùng 2 ngón để zoom in/out
          </Text>

          <View style={[styles.zoomContainer, { backgroundColor: surface, borderColor: border }]}>
            <PinchZoomView minScale={1} maxScale={4}>
              <Image
                source={require('@/assets/images/react-logo.webp')}
                style={styles.zoomImage}
                resizeMode="contain"
              />
            </PinchZoomView>
          </View>
        </View>

        {/* Section 3: Double Tap Zoom */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>3. Double Tap Zoom</Text>
          <Text style={[styles.sectionDesc, { color: text, opacity: 0.7 }]}>
            Nhấn đúp để zoom in/out
          </Text>

          <View style={[styles.zoomContainer, { backgroundColor: surface, borderColor: border }]}>
            <DoubleTapZoom zoomScale={2.5}>
              <Image
                source={require('@/assets/images/partial-react-logo.webp')}
                style={styles.zoomImage}
                resizeMode="contain"
              />
            </DoubleTapZoom>
          </View>
        </View>

        {/* Section 4: Long Press Menu */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>4. Long Press Menu</Text>
          <Text style={[styles.sectionDesc, { color: text, opacity: 0.7 }]}>
            Nhấn giữ 0.5s để hiện menu
          </Text>

          <LongPressMenu menuItems={menuItems}>
            <View style={[styles.menuTarget, { backgroundColor: surface, borderColor: border }]}>
              <Text style={[styles.menuTargetText, { color: text }]}>
                👆 Press and hold here
              </Text>
            </View>
          </LongPressMenu>
        </View>

        {/* Section 5: Draggable Item */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>5. Draggable Item</Text>
          <Text style={[styles.sectionDesc, { color: text, opacity: 0.7 }]}>
            Kéo để di chuyển (auto reset)
          </Text>

          <DraggableItem
            onDragEnd={(x, y) => {
              setDragPosition({ x: Math.round(x), y: Math.round(y) });
            }}
          >
            <View style={[styles.draggable, { backgroundColor: primary }]}>
              <Text style={styles.draggableText}>🤚 Drag me!</Text>
            </View>
          </DraggableItem>

          <Text style={[styles.dragInfo, { color: text, opacity: 0.6 }]}>
            Last position: X={dragPosition.x}, Y={dragPosition.y}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  backBtn: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
  },
  zoomContainer: {
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  zoomImage: {
    width: '100%',
    height: '100%',
  },
  menuTarget: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  menuTargetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  draggable: {
    alignSelf: 'flex-start',
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  draggableText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dragInfo: {
    marginTop: 12,
    fontSize: 13,
  },
});
