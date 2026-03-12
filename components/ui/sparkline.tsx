import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  values: number[];
  height?: number;
};

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export function Sparkline({ values, height = 44 }: Props) {
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');

  const points = useMemo(() => {
    const safe = values.length ? values : [0];
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const span = max - min || 1;

    const w = 220; // fixed internal width; container scales with viewBox
    const h = height;

    const step = safe.length <= 1 ? w : w / (safe.length - 1);

    return safe
      .map((v, i) => {
        const x = i * step;
        const y = h - (clamp(v, 0, 100) - min) * (h / span);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [height, values]);

  return (
    <View style={[styles.wrap, { borderColor: border, backgroundColor: background }]}
    >
      <Svg width="100%" height={height} viewBox={`0 0 220 ${height}`}>
        <Polyline points={points} fill="none" stroke={primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
