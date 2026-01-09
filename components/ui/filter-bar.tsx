import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface FilterBarProps {
  title?: string;
  options: FilterOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  showCount?: boolean;
  counts?: Record<string, number>;
}

export default function FilterBar({
  title,
  options,
  selectedId,
  onSelect,
  showCount = false,
  counts = {},
}: FilterBarProps) {
  const primaryColor = '#0066CC';
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      )}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map(option => {
          const isSelected = option.id === selectedId;
          const count = counts[option.id];
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                { borderColor: isSelected ? primaryColor : borderColor },
                isSelected && { backgroundColor: primaryColor + '15' },
              ]}
              onPress={() => onSelect(option.id)}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon as any}
                  size={18}
                  color={isSelected ? primaryColor : textColor}
                  style={styles.chipIcon}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? primaryColor : textColor },
                ]}
              >
                {option.label}
              </Text>
              {showCount && count !== undefined && (
                <View style={[styles.badge, { backgroundColor: primaryColor }]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
