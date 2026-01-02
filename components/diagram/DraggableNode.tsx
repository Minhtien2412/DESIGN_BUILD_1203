import { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { G, Rect, Text as SvgText } from 'react-native-svg';
import { NodeData } from '../../types/diagram';

export type DraggableNodeProps = {
  node: NodeData;
  selected?: boolean;
  onChange: (next: NodeData) => void;
  grid?: number; // snap size
};

export default function DraggableNode({ node, selected, onChange, grid = 4 }: DraggableNodeProps) {
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      sx.value = node.position.x;
      sy.value = node.position.y;
    })
    .onUpdate(e => {
      const nx = sx.value + e.translationX;
      const ny = sy.value + e.translationY;
      const snappedX = Math.round(nx / grid) * grid;
      const snappedY = Math.round(ny / grid) * grid;
      onChange({ ...node, position: { x: snappedX, y: snappedY } });
    });

  const onPress = useCallback(() => {
    // selection is managed by parent; here we could emit a callback if needed
  }, []);

  const { position, size, radius = 4 } = node;

  return (
    <GestureDetector gesture={pan}>
      <G x={position.x} y={position.y}>
        <Rect
          x={0}
          y={0}
          rx={radius}
          ry={radius}
          width={size.width}
          height={size.height}
          stroke={selected ? '#00B14F' : node.stroke ?? '#D39878'}
          strokeWidth={selected ? 2 : node.strokeWidth ?? 1}
          fill={node.fill ?? '#fff'}
          onPress={onPress as any}
        />
        {node.label ? (
          <SvgText
            x={size.width / 2}
            y={size.height / 2}
            fill="#000"
            fontSize={12}
            fontWeight="600"
            alignmentBaseline="middle"
            textAnchor="middle"
          >
            {node.label}
          </SvgText>
        ) : null}
      </G>
    </GestureDetector>
  );
}
