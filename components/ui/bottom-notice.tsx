import { useNotifications } from '@/features/notifications';
import { pushRoute, type AppKnownRoute } from '@/services/nav';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function BottomNotice() {
  const { notifications } = useNotifications();
  const [visible, setVisible] = React.useState(true);
  const newest = React.useMemo(() => notifications.find(i => !i.read), [notifications]);
  if (!newest || !visible) return null;
  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={styles.pill}>
        <Pressable style={{ flex: 1 }} onPress={() => setVisible(false)}>
          <Text style={styles.title} numberOfLines={1}>{newest.title}</Text>
          {newest.message ? <Text style={styles.body} numberOfLines={1}>{newest.message}</Text> : null}
        </Pressable>
        {newest.data?.route ? (
          <Pressable style={styles.btn} onPress={() => { setVisible(false); pushRoute(newest.data.route as AppKnownRoute, newest.data.params as any); }}>
            <Text style={styles.btnText}>Xem</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#111', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, maxWidth: '94%' },
  title: { color: '#fff', fontWeight: '800' },
  body: { color: '#ddd' },
  btn: { marginLeft: 8, backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  btnText: { color: '#fff', fontWeight: '700' },
});

export default BottomNotice;
