import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatTimeAgo } from '@/utils/time';
import React from 'react';
import { View } from 'react-native';

export type MessageBubbleProps = {
  text: string;
  mine?: boolean;
  at?: number;
  showTime?: boolean;
  read?: boolean; // for read receipts
};

export default function MessageBubble({ text, mine, at, showTime, read }: MessageBubbleProps) {
  const bgMine = useThemeColor({}, 'tint');
  const bgOther = useThemeColor({}, 'background');
  const textMine = useThemeColor({}, 'background');
  const textOther = useThemeColor({}, 'text');
  const subtle = useThemeColor({}, 'icon');
  return (
    <View style={{ flexDirection: 'row', justifyContent: mine ? 'flex-end' : 'flex-start', paddingVertical: 6, paddingHorizontal: 2 }}>
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: mine ? bgMine : '#f2f4f7',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 16,
          borderTopLeftRadius: mine ? 16 : 12,
          borderTopRightRadius: mine ? 12 : 16,
          borderBottomLeftRadius: mine ? 16 : 6,
          borderBottomRightRadius: mine ? 6 : 16,
        }}
      >
        <ThemedText style={{ color: mine ? textMine : textOther }}>{text}</ThemedText>
        {(showTime && at) || (mine && read !== undefined) ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
            {showTime && at ? (
              <ThemedText style={{ opacity: 0.7, fontSize: 11, color: mine ? textMine : subtle }}>
                Đã gửi {formatTimeAgo(at)}
              </ThemedText>
            ) : null}
            {mine && read !== undefined ? (
              <ThemedText style={{ opacity: 0.7, fontSize: 11, color: mine ? textMine : subtle }}>
                {read ? 'Đã đọc' : 'Đã gửi'}
              </ThemedText>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
