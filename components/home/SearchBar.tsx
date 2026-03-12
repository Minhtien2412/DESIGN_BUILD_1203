import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  style?: any;
}

export const SearchBar = memo(function SearchBar({ 
  placeholder = "Tìm kiếm...", 
  onSearch,
  style 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch?.(text);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch?.('');
  };

  return (
    <View style={[styles.searchWrap, style]}>
      <Ionicons name="search" size={18} color="#666" style={{ marginRight: 8 }} />
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder={placeholder}
        placeholderTextColor="#888"
        style={styles.searchInput}
        returnKeyType="search"
      />
      {!!query && (
        <TouchableOpacity onPress={clearSearch} style={{ paddingHorizontal: 6 }}>
          <Ionicons name="close-circle" size={18} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});
