import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

/**
 * Smart Grid Layout Component
 * Tự động thêm "Xem thêm" placeholder khi số item không chia hết cho itemsPerRow
 */

interface SmartGridProps {
  data: any[];
  renderItem: (item: any) => React.ReactNode;
  itemsPerRow?: number;
  showPlaceholder?: boolean;
  placeholderTitle?: string;
  onPlaceholderPress?: () => void;
}

export function SmartGrid({
  data,
  renderItem,
  itemsPerRow = 4,
  showPlaceholder = true,
  placeholderTitle = 'Xem thêm',
  onPlaceholderPress
}: SmartGridProps) {
  // Calculate if we need placeholder
  const remainder = data.length % itemsPerRow;
  const needsPlaceholder = showPlaceholder && remainder !== 0 && remainder < itemsPerRow;
  
  // Create placeholder items
  const placeholdersNeeded = needsPlaceholder ? itemsPerRow - remainder : 0;
  const placeholders = Array(placeholdersNeeded).fill(null).map((_, idx) => ({
    id: `placeholder-${idx}`,
    isPlaceholder: true,
    title: idx === 0 ? placeholderTitle : '',
  }));

  const displayData = [...data, ...placeholders];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {displayData.map((item, index) => {
        // Check if this is our generated placeholder
        if (item.isPlaceholder === true) {
          // Only show content for first placeholder
          if (index === data.length) {
            return (
              <TouchableOpacity
                key={item.id}
                style={{ width: '23%', alignItems: 'center', marginBottom: 16, opacity: 0.6 }}
                activeOpacity={0.7}
                onPress={onPlaceholderPress}
              >
                <View style={{
                  width: 64,
                  height: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 32,
                  borderWidth: 2,
                  borderColor: '#e0e0e0',
                  borderStyle: 'dashed',
                }}>
                  <Text style={{ fontSize: 24, color: '#ccc' }}>+</Text>
                </View>
                <Text style={{
                  fontSize: 10,
                  textAlign: 'center',
                  marginTop: 6,
                  lineHeight: 13,
                  color: '#999',
                  fontWeight: '500'
                }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          } else {
            // Empty placeholder to maintain grid
            return <View key={item.id} style={{ width: '23%', marginBottom: 16 }} />;
          }
        }
        // Render actual item
        return <React.Fragment key={item.id || index}>{renderItem(item)}</React.Fragment>;
      })}
    </View>
  );
}

/**
 * Alternative: Icon-based placeholder
 */
export function SmartGridWithIcon({
  data,
  renderItem,
  itemsPerRow = 4,
  showPlaceholder = true,
  placeholderIcon,
  placeholderTitle = 'Xem thêm',
  onPlaceholderPress
}: SmartGridProps & { placeholderIcon?: any }) {
  const remainder = data.length % itemsPerRow;
  const needsPlaceholder = showPlaceholder && remainder !== 0;
  const placeholdersNeeded = needsPlaceholder ? itemsPerRow - remainder : 0;
  
  const placeholders = Array(placeholdersNeeded).fill(null).map((_, idx) => ({
    id: `placeholder-${idx}`,
    isPlaceholder: true,
  }));

  const displayData = [...data, ...placeholders];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {displayData.map((item, index) => {
        if (item.isPlaceholder) {
          if (index === data.length && placeholderIcon) {
            return (
              <TouchableOpacity
                key={item.id}
                style={{ width: '23%', alignItems: 'center', marginBottom: 16, opacity: 0.7 }}
                activeOpacity={0.7}
                onPress={onPlaceholderPress}
              >
                <View style={{
                  width: 64,
                  height: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Image source={placeholderIcon} style={{ width: 56, height: 56, opacity: 0.5 }} resizeMode="contain" />
                </View>
                <Text style={{
                  fontSize: 10,
                  textAlign: 'center',
                  marginTop: 6,
                  lineHeight: 13,
                  color: '#999',
                  fontWeight: '500'
                }}>
                  {placeholderTitle}
                </Text>
              </TouchableOpacity>
            );
          } else {
            return <View key={item.id} style={{ width: '23%', marginBottom: 16 }} />;
          }
        }
        return <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>;
      })}
    </View>
  );
}
