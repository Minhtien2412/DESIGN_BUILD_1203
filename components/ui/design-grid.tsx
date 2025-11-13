import type { Design } from '@/data/designs';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { DesignCard } from './design-card';

export function DesignGrid({ designs }: { designs: Design[] }) {
  return (
    <View style={styles.wrap}>
      {designs.map(d => (
        <Link key={d.id} href={`/design/${d.id}` as any} asChild>
          <Pressable>
            <DesignCard title={d.title} image={d.images[0]} subtitle={d.author} />
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
