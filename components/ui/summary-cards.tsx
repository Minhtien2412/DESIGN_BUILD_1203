import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export interface SummaryItem {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

interface SummaryCardsProps {
  items: SummaryItem[];
  columns?: 2 | 3 | 4;
}

export default function SummaryCards({ items, columns = 2 }: SummaryCardsProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  
  const cardWidth = columns === 2 ? '48%' : columns === 3 ? '31%' : '23%';

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const iconColor = item.color || '#3B82F6';
        
        return (
          <View
            key={index}
            style={[
              styles.card,
              { width: cardWidth, borderColor: borderColor },
            ]}
          >
            {item.icon && (
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name={item.icon as any} size={24} color={iconColor} />
              </View>
            )}
            
            <View style={styles.content}>
              <Text style={[styles.value, { color: textColor }]}>
                {item.value}
              </Text>
              <Text style={styles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
