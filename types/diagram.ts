export type VectorPoint = { x: number; y: number };

export type NodeSize = { width: number; height: number };

export type NodeData = {
  id: string;
  label?: string;
  position: VectorPoint; // canvas coordinates
  size: NodeSize;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number; // corner radius
};

export type EdgeData = {
  id: string;
  from: string; // node id
  to: string;   // node id
  color?: string;
  width?: number;
  dasharray?: string;
};

export type Diagram = {
  nodes: NodeData[];
  edges: EdgeData[];
  // optional viewport state
  viewport?: { x: number; y: number; scale: number };
};

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const distance = (a: VectorPoint, b: VectorPoint) => Math.hypot(a.x - b.x, a.y - b.y);

export const toCubicBezier = (from: VectorPoint, to: VectorPoint) => {
  const dx = (to.x - from.x) * 0.3;
  const c1 = { x: from.x + dx, y: from.y };
  const c2 = { x: to.x - dx, y: to.y };
  return `M ${from.x},${from.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
};
