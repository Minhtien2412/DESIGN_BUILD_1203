import { Path } from 'react-native-svg';
import { EdgeData, NodeData, toCubicBezier } from '../../types/diagram';

export type EdgePathProps = {
  edge: EdgeData;
  nodesById: Record<string, NodeData>;
};

export default function EdgePath({ edge, nodesById }: EdgePathProps) {
  const from = nodesById[edge.from];
  const to = nodesById[edge.to];
  if (!from || !to) return null;

  const fromPoint = { x: from.position.x + from.size.width, y: from.position.y + from.size.height / 2 };
  const toPoint = { x: to.position.x, y: to.position.y + to.size.height / 2 };
  const d = toCubicBezier(fromPoint, toPoint);

  return (
    <Path d={d} stroke={edge.color ?? '#7B8794'} strokeWidth={edge.width ?? 1.5} fill="none" strokeDasharray={edge.dasharray} />
  );
}
