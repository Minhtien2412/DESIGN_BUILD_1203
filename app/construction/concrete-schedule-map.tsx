import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConcreteScheduleMap } from '@/components/concrete/ConcreteScheduleMap';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ConcreteScheduleMapScreen() {
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.root, { backgroundColor: bg }]}> 
      <View style={[styles.topBar, { borderColor: border }]}> 
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="chevron-back" size={22} color={text} />
        </Pressable>

        <Text style={[styles.title, { color: text }]} numberOfLines={1}>
          Lịch đổ bê tông
        </Text>

        <View style={styles.iconButton} />
      </View>

      <ConcreteScheduleMap />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
