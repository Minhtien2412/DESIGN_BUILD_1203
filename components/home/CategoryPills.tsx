/**
 * Category Pills - Modern horizontal scrollable chips
 * Western minimalist design
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'villa', name: 'Villas', icon: 'home-outline' },
  { id: 'interior', name: 'Interiors', icon: 'color-palette-outline' },
  { id: 'construction', name: 'Construction', icon: 'hammer-outline' },
  { id: 'consult', name: 'Consulting', icon: 'chatbubbles-outline' },
  { id: 'modern', name: 'Modern', icon: 'cube-outline' },
  { id: 'classic', name: 'Classic', icon: 'rose-outline' },
];

export function CategoryPills() {
  const [selected, setSelected] = useState('all');

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => {
              setSelected(cat.id);
              // Filter logic here
            }}
            style={[
              styles.pill,
              selected === cat.id && styles.pillActive,
            ]}
            android_ripple={{ color: 'rgba(10,104,71,0.15)' }}
          >
            <Ionicons
              name={cat.icon as any}
              size={18}
              color={selected === cat.id ? '#FFF' : '#5A5A5A'}
            />
            <Text
              style={[
                styles.pillText,
                selected === cat.id && styles.pillTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pillActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
    letterSpacing: 0.2,
  },
  pillTextActive: {
    color: '#FFF',
  },
});
