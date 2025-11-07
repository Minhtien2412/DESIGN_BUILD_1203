import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

export type InputBarProps = {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  placeholder?: string;
};

export default function InputBar({ value, onChangeText, onSend, placeholder = 'Tin nhắn' }: InputBarProps) {
  const disabled = !value.trim();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 12 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          style={{ flex: 1, height: 40 }}
        />
        <Pressable onPress={onSend} hitSlop={8} disabled={disabled}>
          <IconSymbol name="paperplane.fill" size={18} color={disabled ? '#9ca3af' : '#2563eb'} />
        </Pressable>
      </View>
    </View>
  );
}
