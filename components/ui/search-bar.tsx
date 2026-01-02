import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface SearchSuggestion {
  id: string;
  text: string;
  type?: 'history' | 'suggestion' | 'product';
  icon?: string;
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  onSuggestionPress?: (suggestion: SearchSuggestion) => void;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder = 'Tìm kiếm...',
  suggestions = [],
  showSuggestions = false,
  onSuggestionPress,
  onClear,
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (value.trim()) {
      onSearch?.(value.trim());
      Keyboard.dismiss();
    }
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    onChangeText(suggestion.text);
    onSuggestionPress?.(suggestion);
    Keyboard.dismiss();
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons
        name={
          item.type === 'history'
            ? 'time-outline'
            : item.type === 'product'
            ? 'cube-outline'
            : 'search-outline'
        }
        size={18}
        color="#666"
      />
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item.text}
      </Text>
      <Ionicons name="arrow-forward" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
        {value.length > 0 && (
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Tìm</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete suggestions */}
      {showSuggestions && isFocused && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBarFocused: {
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 4,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  searchBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsList: {
    borderRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});
