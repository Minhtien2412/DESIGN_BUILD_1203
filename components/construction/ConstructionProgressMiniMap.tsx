import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';
import { ProgressTask, type ProjectProgress, STATUS_CONFIG, UserRole } from '@/types/progress';
import { loadProgressMeta, setTaskPosition } from '@/utils/progressMetaStorage';

type Point = { x: number; y: number };

type Props = {
  projectId: string;
  tasks: ProgressTask[];
  stages: ProjectProgress['stages'];
  height?: number;
  actor: { id: string; name: string; role: UserRole };
  onPressTask: (task: ProgressTask) => void;
};

const PADDING = 14;
const GAP = 10;
const HEADER_H = 34;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function diffDays(start?: string, end?: string) {
  if (!start || !end) return null;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function durationLabel(task: ProgressTask) {
  const days = diffDays(task.plannedStartDate, task.plannedEndDate);
  if (!days) return '';
  if (days >= 7) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} Tuần`;
  }
  return `${days} Ngày`;
}

function formatStageIndex(i: number) {
  return String(i + 1).padStart(2, '0');
}

function stageOrderIndex(stages: ProjectProgress['stages'], stageId: string) {
  const idx = stages.findIndex((s) => s.id === stageId);
  return idx === -1 ? 999 : idx;
}

type TileProps = {
  task: ProgressTask;
  size: { width: number; height: number };
  bounds: { maxX: number; maxY: number };
  initial: Point;
  onCommit: (taskId: string, next: Point) => void;
  onPress: () => void;
};

function MiniMapTile({ task, size, bounds, initial, onCommit, onPress }: TileProps) {
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const x = useSharedValue(initial.x);
  const y = useSharedValue(initial.y);
  const sx = useSharedValue(initial.x);
  const sy = useSharedValue(initial.y);

  useEffect(() => {
    x.value = initial.x;
    y.value = initial.y;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.x, initial.y]);

  const status = STATUS_CONFIG[task.status] || {
    label: task.status || 'Unknown',
    color: '#999999',
    bgColor: '#F5F5F5',
    icon: 'ellipse-outline',
  };
  const chipBg = status.bgColor;
  const chipText = status.color;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          sx.value = x.value;
          sy.value = y.value;
        })
        .onUpdate((e) => {
          const nx = clamp(sx.value + e.translationX, 0, bounds.maxX);
          const ny = clamp(sy.value + e.translationY, 0, bounds.maxY);
          x.value = nx;
          y.value = ny;
        })
        .onEnd(() => {
          onCommit(task.id, { x: x.value, y: y.value });
        }),
    [bounds.maxX, bounds.maxY, onCommit, task.id, sx, sy, x, y]
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.tile,
          {
            width: size.width,
            height: size.height,
            backgroundColor: surface,
            borderColor: border,
          },
          animStyle,
        ]}
      >
        <Pressable onPress={onPress} style={styles.tilePress}>
          <View style={styles.tileHeader}>
            <View style={[styles.statusChip, { backgroundColor: chipBg }]}>
              <Text style={[styles.statusChipText, { color: chipText }]} numberOfLines={1}>
                {status.labelVi}
              </Text>
            </View>
            <Text style={[styles.duration, { color: muted }]}>{durationLabel(task)}</Text>
          </View>

          <Text numberOfLines={2} style={[styles.tileTitle, { color: text }]}>
            {task.title}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function ConstructionProgressMiniMap({ projectId, tasks, stages, height = 320, actor, onPressTask }: Props) {
  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const textInverse = useThemeColor({}, 'textInverse');

  const [size, setSize] = useState({ width: 0, height });
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [hydrated, setHydrated] = useState(false);

  const sortedTasks = useMemo(() => {
    const list = [...tasks];
    list.sort((a, b) => {
      const sa = stageOrderIndex(stages, a.stageId);
      const sb = stageOrderIndex(stages, b.stageId);
      if (sa !== sb) return sa - sb;
      const da = a.plannedStartDate ? new Date(a.plannedStartDate).getTime() : 0;
      const db = b.plannedStartDate ? new Date(b.plannedStartDate).getTime() : 0;
      return da - db;
    });
    return list;
  }, [stages, tasks]);

  const tileLayout = useMemo(() => {
    const innerW = Math.max(0, size.width - PADDING * 2);
    const colW = Math.max(120, Math.floor((innerW - GAP) / 2));
    const tileH = 54;
    return { tileW: colW, tileH };
  }, [size.width]);

  useEffect(() => {
    if (!size.width) return;
    if (hydrated) return;

    let cancelled = false;
    (async () => {
      try {
        const store = await loadProgressMeta(projectId);
        if (cancelled) return;
        const next: Record<string, Point> = {};
        for (const t of sortedTasks) {
          const p = store.tasks[t.id]?.position;
          if (p) next[t.id] = { x: p.x, y: p.y };
        }
        setPositions((prev) => ({ ...prev, ...next }));
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, projectId, size.width, sortedTasks]);

  useEffect(() => {
    if (!size.width) return;
    if (!hydrated) return;

    const innerH = Math.max(0, size.height - PADDING * 2 - HEADER_H);
    const maxX = Math.max(0, size.width - PADDING * 2 - tileLayout.tileW);
    const maxY = Math.max(0, innerH - tileLayout.tileH);

    setPositions((prev) => {
      const next = { ...prev };
      let changed = false;

      for (let i = 0; i < sortedTasks.length; i++) {
        const t = sortedTasks[i];
        if (next[t.id]) continue;

        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = clamp(col * (tileLayout.tileW + GAP), 0, maxX);
        const y = clamp(HEADER_H + row * (tileLayout.tileH + GAP), HEADER_H, HEADER_H + maxY);
        next[t.id] = { x, y };
        changed = true;
      }

      // Remove stale ids
      const ids = new Set(sortedTasks.map((t) => t.id));
      for (const id of Object.keys(next)) {
        if (!ids.has(id)) {
          delete next[id];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [hydrated, size.width, size.height, sortedTasks, tileLayout.tileH, tileLayout.tileW]);

  const bounds = useMemo(() => {
    const innerH = Math.max(0, size.height - PADDING * 2 - HEADER_H);
    return {
      maxX: Math.max(0, size.width - PADDING * 2 - tileLayout.tileW),
      maxY: Math.max(0, innerH - tileLayout.tileH) + HEADER_H,
    };
  }, [size.height, size.width, tileLayout.tileH, tileLayout.tileW]);

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: background, borderColor: primary, height },
      ]}
      onLayout={(e) => {
        const w = Math.floor(e.nativeEvent.layout.width);
        setSize({ width: w, height });
      }}
    >
      {/* Header markers (stage index) */}
      <View style={styles.headerRow}>
        <View style={[styles.smallTag, { backgroundColor: success }]}> 
          <Text style={[styles.smallTagText, { color: textInverse }]}>Bắt đầu</Text>
        </View>

        <View style={styles.stageDots}>
          {stages.slice(0, 6).map((_, idx) => (
            <View key={idx} style={[styles.stageDot, { backgroundColor: success }]}> 
              <Text style={[styles.stageDotText, { color: textInverse }]}>{formatStageIndex(idx)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.smallTag, { backgroundColor: success }]}> 
          <Text style={[styles.smallTagText, { color: textInverse }]}>Kết thúc</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.canvas}>
        {sortedTasks.map((t) => {
          const p = positions[t.id];
          if (!p) return null;
          return (
            <MiniMapTile
              key={t.id}
              task={t}
              initial={p}
              size={{ width: tileLayout.tileW, height: tileLayout.tileH }}
              bounds={bounds}
              onCommit={(id, next) =>
                setPositions((prev) => {
                  const from = prev[id];
                  void setTaskPosition({
                    projectId,
                    taskId: id,
                    position: next,
                    actor,
                    from,
                  });
                  return { ...prev, [id]: next };
                })
              }
              onPress={() => onPressTask(t)}
            />
          );
        })}

        {!sortedTasks.length && (
          <View style={[styles.empty, { borderColor: border }]}> 
            <Text style={[styles.emptyText, { color: text }]}>Không có công việc để hiển thị</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 2,
    borderRadius: 28,
    overflow: 'hidden',
  },
  headerRow: {
    height: HEADER_H,
    paddingHorizontal: PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  stageDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  smallTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smallTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  canvas: {
    flex: 1,
    padding: PADDING,
  },
  tile: {
    position: 'absolute',
    left: PADDING,
    top: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
  },
  tilePress: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  duration: {
    fontSize: 10,
    fontWeight: '600',
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  empty: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
