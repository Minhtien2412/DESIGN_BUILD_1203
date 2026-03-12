/**
 * Modern Search Bar - Shopee/Grab Style
 * Created: 12/12/2025
 * 
 * Features:
 * - Voice search icon
 * - Camera search icon (QR/Barcode)
 * - Clear button
 * - Search suggestions dropdown
 * - Light gray background
 * - Smooth animations
 * 
 * Usage:
 * <ModernSearchBar 
 *   placeholder="Tìm kiếm sản phẩm..."
 *   onSearch={handleSearch}
 *   showSuggestions={true}
 * />
 */

import {
    MODERN_COLORS,
    MODERN_DIMENSIONS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from '@/constants/modern-theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchSuggestion {
  id: string;
  keyword: string;
  isPopular?: boolean;
}

interface ModernSearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showVoice?: boolean;
  showCamera?: boolean;
  showSuggestions?: boolean;
  suggestions?: SearchSuggestion[];
  autoFocus?: boolean;
}

export default function ModernSearchBar({
  placeholder = 'Tìm kiếm...',
  value,
  onChangeText,
  onSearch,
  onFocus,
  onBlur,
  showVoice = true,
  showCamera = true,
  showSuggestions = false,
  suggestions = [],
  autoFocus = false,
}: ModernSearchBarProps) {
  const [searchText, setSearchText] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Handle text change
  const handleChangeText = (text: string) => {
    setSearchText(text);
    onChangeText?.(text);
  };

  // Handle clear
  const handleClear = () => {
    setSearchText('');
    onChangeText?.('');
  };

  // Handle submit
  const handleSubmit = () => {
    onSearch?.(searchText);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    // Animate suggestions
    if (showSuggestions && suggestions.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    
    // Hide suggestions
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Handle suggestion click
  const handleSuggestionClick = (keyword: string) => {
    setSearchText(keyword);
    onChangeText?.(keyword);
    onSearch?.(keyword);
    handleBlur();
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchBar,
        isFocused && styles.searchBarFocused,
      ]}>
        <Ionicons name="search" size={20} color={MODERN_COLORS.textSecondary} />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={MODERN_COLORS.textDisabled}
          value={searchText}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Clear Button */}
        {searchText.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={MODERN_COLORS.textDisabled} />
          </TouchableOpacity>
        )}
        
        {/* Voice Search */}
        {showVoice && searchText.length === 0 && (
          <TouchableOpacity 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="mic-outline" size={20} color={MODERN_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        
        {/* Camera Search */}
        {showCamera && (
          <TouchableOpacity 
            style={styles.cameraButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="camera-outline" size={20} color={MODERN_COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && isFocused && suggestions.length > 0 && (
        <Animated.View 
          style={[
            styles.suggestions,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.suggestionsTitle}>Tìm kiếm phổ biến</Text>
          {suggestions.slice(0, 5).map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionClick(item.keyword)}
            >
              <Ionicons 
                name={item.isPopular ? "trending-up" : "search"} 
                size={16} 
                color={item.isPopular ? MODERN_COLORS.secondary : MODERN_COLORS.textSecondary} 
              />
              <Text style={styles.suggestionText}>{item.keyword}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
  },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.sm,
    height: MODERN_DIMENSIONS.searchBarHeight,
    gap: MODERN_SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.surface,
  },
  
  // Input
  input: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular,
    paddingVertical: 0, // Remove default padding
  },
  
  // Camera Button
  cameraButton: {
    marginLeft: MODERN_SPACING.xxs,
  },
  
  // Suggestions Dropdown
  suggestions: {
    position: 'absolute',
    top: MODERN_DIMENSIONS.searchBarHeight + MODERN_SPACING.sm + MODERN_SPACING.sm,
    left: MODERN_SPACING.md,
    right: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.lg,
    zIndex: 1000,
  },
  suggestionsTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  suggestionText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.regular,
    flex: 1,
  },
});
