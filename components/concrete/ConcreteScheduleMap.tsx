import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path, type PathProps } from 'react-native-svg';

import { useThemeColor } from '@/hooks/use-theme-color';

type NodeId = 'n1' | 'n2' | 'n3';

export type ConcreteScheduleNode = {
  id: NodeId;
  title: string;
  subtitle?: string;
};

type NodeDraft = {
  title: string;
  subtitle: string;
};

type LayoutSize = { width: number; height: number };

type Props = {
  headerTitle?: string;
  headerSubtitle?: string;
  initialNodes?: ConcreteScheduleNode[];
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function curvePath(x1: number, y1: number, x2: number, y2: number) {
  'worklet';
  const midX = (x1 + x2) / 2;
  const dy = y2 - y1;
  const curve = clamp(Math.abs(dy) * 0.6, 40, 140);

  const c1x = midX;
  const c1y = y1 - curve;
  const c2x = midX;
  const c2y = y2 + curve;

  return `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
}

function nodeCenter(x: number, y: number, w: number, h: number) {
  'worklet';
  return { cx: x + w / 2, cy: y + h / 2 };
}

export function ConcreteScheduleMap({
  headerTitle = 'Lịch đổ bê tông',
  headerSubtitle = 'Kéo thả để sắp xếp. Chạm để chỉnh sửa.',
  initialNodes,
}: Props) {
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const overlay = useThemeColor({}, 'overlay');

  const nodes: ConcreteScheduleNode[] = useMemo(
    () =>
      initialNodes ?? [
        { id: 'n1', title: 'Công tác 1', subtitle: 'Chuẩn bị' },
        { id: 'n2', title: 'Công tác 2', subtitle: 'Thi công' },
        { id: 'n3', title: 'Công tác 3', subtitle: 'Nghiệm thu' },
      ],
    [initialNodes]
  );

  const [layout, setLayout] = useState<LayoutSize>({ width: 0, height: 0 });

  const CARD_W = 140;
  const CARD_H = 74;
  const PADDING = 16;

  const x1 = useSharedValue(0);
  const y1 = useSharedValue(0);
  const x2 = useSharedValue(0);
  const y2 = useSharedValue(0);
  const x3 = useSharedValue(0);
  const y3 = useSharedValue(0);

  const s1x = useSharedValue(0);
  const s1y = useSharedValue(0);
  const s2x = useSharedValue(0);
  const s2y = useSharedValue(0);
  const s3x = useSharedValue(0);
  const s3y = useSharedValue(0);

  const [initialized, setInitialized] = useState(false);

  const [nodeData, setNodeData] = useState<Record<NodeId, ConcreteScheduleNode>>(() => {
    const byId = nodes.reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {} as Record<NodeId, ConcreteScheduleNode>);
    return byId;
  });

  const [editingId, setEditingId] = useState<NodeId | null>(null);
  const [draft, setDraft] = useState<NodeDraft>({ title: '', subtitle: '' });

  const initPositions = (size: LayoutSize) => {
    if (initialized) return;
    if (!size.width || !size.height) return;

    const rowY = Math.max(PADDING + 90, Math.floor(size.height * 0.55));

    const gap = Math.max(12, Math.floor((size.width - PADDING * 2 - CARD_W * 3) / 2));
    const baseX = PADDING;

    x1.value = baseX;
    y1.value = rowY;

    x2.value = baseX + CARD_W + gap;
    y2.value = rowY;

    x3.value = baseX + (CARD_W + gap) * 2;
    y3.value = rowY;

    setInitialized(true);
  };

  const openEdit = (id: NodeId) => {
    const current = nodeData[id];
    setDraft({ title: current.title, subtitle: current.subtitle ?? '' });
    setEditingId(id);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setNodeData((prev) => ({
      ...prev,
      [editingId]: {
        ...prev[editingId],
        title: draft.title.trim() || prev[editingId].title,
        subtitle: draft.subtitle.trim() || undefined,
      },
    }));
    setEditingId(null);
  };

  const createDragGesture = (
    x: SharedValue<number>,
    y: SharedValue<number>,
    sx: SharedValue<number>,
    sy: SharedValue<number>
  ) => {
    return Gesture.Pan()
      .onStart(() => {
        sx.value = x.value;
        sy.value = y.value;
      })
      .onUpdate((evt) => {
        const maxX = Math.max(PADDING, layout.width - PADDING - CARD_W);
        const maxY = Math.max(PADDING, layout.height - PADDING - CARD_H);

        x.value = clamp(sx.value + evt.translationX, PADDING, maxX);
        y.value = clamp(sy.value + evt.translationY, PADDING, maxY);
      });
  };

  const gesture1 = useMemo(() => createDragGesture(x1, y1, s1x, s1y), [layout.width, layout.height]);
  const gesture2 = useMemo(() => createDragGesture(x2, y2, s2x, s2y), [layout.width, layout.height]);
  const gesture3 = useMemo(() => createDragGesture(x3, y3, s3x, s3y), [layout.width, layout.height]);

  const n1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: x1.value }, { translateY: y1.value }],
  }));

  const n2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: x2.value }, { translateY: y2.value }],
  }));

  const n3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: x3.value }, { translateY: y3.value }],
  }));

  const arrow12Props = useAnimatedProps<Partial<PathProps>>(() => {
    const a = nodeCenter(x1.value, y1.value, CARD_W, CARD_H);
    const b = nodeCenter(x2.value, y2.value, CARD_W, CARD_H);
    return { d: curvePath(a.cx, a.cy, b.cx, b.cy) };
  });

  const arrow23Props = useAnimatedProps<Partial<PathProps>>(() => {
    const a = nodeCenter(x2.value, y2.value, CARD_W, CARD_H);
    const b = nodeCenter(x3.value, y3.value, CARD_W, CARD_H);
    return { d: curvePath(a.cx, a.cy, b.cx, b.cy) };
  });

  return (
    <View
      style={[styles.root, { backgroundColor: bg }]}
      onLayout={(e) => {
        const next = {
          width: Math.floor(e.nativeEvent.layout.width),
          height: Math.floor(e.nativeEvent.layout.height),
        };
        setLayout(next);
        initPositions(next);
      }}
    >
      <View style={[styles.headerCard, { backgroundColor: surface, borderColor: border }]}>
        <Text style={[styles.headerTitle, { color: text }]}>{headerTitle}</Text>
        <Text style={[styles.headerSubtitle, { color: muted }]}>{headerSubtitle}</Text>
      </View>

      {!!layout.width && !!layout.height && (
        <View style={styles.mapArea}>
          <Svg width={layout.width} height={layout.height} style={styles.svg}>
            <AnimatedPath
              animatedProps={arrow12Props}
              stroke={primary}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
            <AnimatedPath
              animatedProps={arrow23Props}
              stroke={primary}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          </Svg>

          <GestureDetector gesture={gesture1}>
            <Animated.View style={[styles.node, { backgroundColor: surface, borderColor: border }, n1Style]}>
              <Pressable
                style={styles.nodePress}
                onPress={() => openEdit('n1')}
              >
                <Text numberOfLines={1} style={[styles.nodeTitle, { color: text }]}>
                  {nodeData.n1.title}
                </Text>
                {!!nodeData.n1.subtitle && (
                  <Text numberOfLines={1} style={[styles.nodeSubtitle, { color: muted }]}>
                    {nodeData.n1.subtitle}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </GestureDetector>

          <GestureDetector gesture={gesture2}>
            <Animated.View style={[styles.node, { backgroundColor: surface, borderColor: border }, n2Style]}>
              <Pressable
                style={styles.nodePress}
                onPress={() => openEdit('n2')}
              >
                <Text numberOfLines={1} style={[styles.nodeTitle, { color: text }]}>
                  {nodeData.n2.title}
                </Text>
                {!!nodeData.n2.subtitle && (
                  <Text numberOfLines={1} style={[styles.nodeSubtitle, { color: muted }]}>
                    {nodeData.n2.subtitle}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </GestureDetector>

          <GestureDetector gesture={gesture3}>
            <Animated.View style={[styles.node, { backgroundColor: surface, borderColor: border }, n3Style]}>
              <Pressable
                style={styles.nodePress}
                onPress={() => openEdit('n3')}
              >
                <Text numberOfLines={1} style={[styles.nodeTitle, { color: text }]}>
                  {nodeData.n3.title}
                </Text>
                {!!nodeData.n3.subtitle && (
                  <Text numberOfLines={1} style={[styles.nodeSubtitle, { color: muted }]}>
                    {nodeData.n3.subtitle}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </View>
      )}

      <Modal visible={editingId !== null} transparent animationType="fade" onRequestClose={() => setEditingId(null)}>
        <View style={[styles.modalBackdrop, { backgroundColor: overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: text }]}>Chỉnh sửa thẻ</Text>

            <Text style={[styles.label, { color: muted }]}>Tiêu đề</Text>
            <TextInput
              value={draft.title}
              onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))}
              placeholder="Nhập tiêu đề"
              placeholderTextColor={muted}
              style={[styles.input, { color: text, borderColor: border }]}
            />

            <Text style={[styles.label, { color: muted }]}>Ghi chú</Text>
            <TextInput
              value={draft.subtitle}
              onChangeText={(v) => setDraft((d) => ({ ...d, subtitle: v }))}
              placeholder="Nhập ghi chú (tuỳ chọn)"
              placeholderTextColor={muted}
              style={[styles.input, { color: text, borderColor: border }]}
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditingId(null)}
                style={[styles.button, { borderColor: border }]}
              >
                <Text style={[styles.buttonText, { color: text }]}>Huỷ</Text>
              </Pressable>
              <Pressable onPress={saveEdit} style={[styles.button, styles.primaryButton, { backgroundColor: primary }]}>
                <Text style={[styles.buttonText, { color: '#fff' }]}>Lưu</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  mapArea: {
    flex: 1,
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  node: {
    position: 'absolute',
    width: 140,
    height: 74,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  nodePress: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  nodeSubtitle: {
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
