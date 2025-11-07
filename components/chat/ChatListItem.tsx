import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { Pressable, View } from 'react-native';

export type ChatListItemProps = {
  title: string;
  subtitle?: string;
  unread?: number;
  onPress?: () => void;
};

export default function ChatListItem({ title, subtitle, unread = 0, onPress }: ChatListItemProps) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText style={{ fontWeight: '700' }}>{(title || '?').charAt(0)}</ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemedText style={{ fontWeight: '700' }}>{title}</ThemedText>
          {unread > 0 ? (
            <View style={{ minWidth: 20, paddingHorizontal: 6, height: 20, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
              <ThemedText style={{ color: '#fff', fontSize: 12 }}>{unread}</ThemedText>
            </View>
          ) : null}
        </View>
        {subtitle ? <ThemedText style={{ opacity: 0.7 }} numberOfLines={1}>{subtitle}</ThemedText> : null}
      </View>
    </Pressable>
  );
}
