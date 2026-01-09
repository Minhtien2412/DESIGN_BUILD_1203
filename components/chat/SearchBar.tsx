import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

export type SearchBarProps = {
  value: string;
  onChangeText: (t: string) => void;
  onCompose?: () => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, onCompose, placeholder = 'Tìm kiếm' }: SearchBarProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, height: 40, marginBottom: 12 }}>
      <IconSymbol name="magnifyingglass" size={18} color="#6b7280" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        style={{ flex: 1, marginLeft: 8 }}
      />
      {onCompose ? (
        <Pressable onPress={onCompose} hitSlop={8}>
          <IconSymbol name="square.and.pencil" size={20} color="#0066CC" />
        </Pressable>
      ) : null}
    </View>
  );
}
