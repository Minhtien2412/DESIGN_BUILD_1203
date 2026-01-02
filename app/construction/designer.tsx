import { Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Dimensions, SafeAreaView, StyleSheet, View } from 'react-native';
import DiagramCanvas from '../../components/diagram/DiagramCanvas';
import DraggableNode from '../../components/diagram/DraggableNode';
import EdgePath from '../../components/diagram/EdgePath';
import { Button } from '../../components/ui/button';
import { Container } from '../../components/ui/container';
import { Section } from '../../components/ui/section';
import { useThemeColor } from '../../hooks/use-theme-color';
import { Diagram, NodeData } from '../../types/diagram';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function ConstructionDesignerScreen() {
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const initial: Diagram = useMemo(
    () => ({
      nodes: [
        { id: 'n1', label: 'Khởi tạo', position: { x: 40, y: 80 }, size: { width: 120, height: 48 }, fill: '#fff' },
        { id: 'n2', label: 'Thi công', position: { x: 260, y: 80 }, size: { width: 120, height: 48 }, fill: '#fff' },
        { id: 'n3', label: 'Nghiệm thu', position: { x: 480, y: 80 }, size: { width: 120, height: 48 }, fill: '#fff' },
      ],
      edges: [
        { id: 'e1', from: 'n1', to: 'n2', color: '#7B8794', width: 2 },
        { id: 'e2', from: 'n2', to: 'n3', color: '#7B8794', width: 2 },
      ],
      viewport: { x: 0, y: 0, scale: 1 },
    }),
    []
  );

  const [diagram, setDiagram] = useState<Diagram>(initial);
  const nodesById = useMemo(() => Object.fromEntries(diagram.nodes.map(n => [n.id, n])), [diagram.nodes]);

  const updateNode = useCallback((next: NodeData) => {
    setDiagram(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === next.id ? next : n)),
    }));
  }, []);

  const resetViewport = useCallback(() => {
    setDiagram(prev => ({ ...prev, viewport: { x: 0, y: 0, scale: 1 } }));
  }, []);

  const exportJson = useCallback(() => {
    try {
      const payload = JSON.stringify(diagram, null, 2);
      // For now just alert; can integrate Share API next
      Alert.alert('Sơ đồ (JSON)', payload.substring(0, 700));
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể xuất sơ đồ');
    }
  }, [diagram]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }] }>
      <Stack.Screen options={{ title: 'Thiết kế sơ đồ' }} />
      <Container scroll={false} style={{ flex: 1 }}>
        <Section>
          <View style={[styles.toolbar, { backgroundColor: surface }] }>
            <Button title="Reset" size="sm" variant="secondary" onPress={resetViewport} />
            <View style={{ width: 8 }} />
            <Button title="Export JSON" size="sm" variant="outline" onPress={exportJson} />
          </View>
        </Section>
        <View style={styles.canvasWrap}>
          <DiagramCanvas
            width={SCREEN_W}
            height={SCREEN_H - 200}
            initial={diagram.viewport}
            onViewportChange={(v) => setDiagram(prev => ({ ...prev, viewport: v }))}
            backgroundColor={surface}
          >
            {/* Edges first so they appear below nodes */}
            {diagram.edges.map(e => (
              <EdgePath key={e.id} edge={e} nodesById={nodesById} />
            ))}
            {/* Nodes */}
            {diagram.nodes.map(n => (
              <DraggableNode key={n.id} node={n} onChange={updateNode} />
            ))}
          </DiagramCanvas>
        </View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center' },
  canvasWrap: { flex: 1, borderRadius: 12, overflow: 'hidden' },
});
