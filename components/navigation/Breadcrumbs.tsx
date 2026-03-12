import { Breadcrumb } from '@/utils/categoryNavigation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface BreadcrumbsProps {
  items: Breadcrumb[];
  color?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, color = '#666' }) => {
  const router = useRouter();

  const handlePress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item, index) => (
        <View key={index} style={styles.breadcrumbItem}>
          {item.route ? (
            <Pressable
              onPress={() => handlePress(item.route)}
              style={({ pressed }) => [
                styles.breadcrumbLink,
                pressed && styles.breadcrumbLinkPressed,
              ]}
            >
              <Text style={[styles.breadcrumbText, { color }]}>{item.label}</Text>
            </Pressable>
          ) : (
            <Text style={[styles.breadcrumbText, styles.breadcrumbCurrent, { color }]}>
              {item.label}
            </Text>
          )}
          {index < items.length - 1 && (
            <Ionicons
              name="chevron-forward"
              size={14}
              color={color}
              style={styles.separator}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbLink: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  breadcrumbLinkPressed: {
    opacity: 0.6,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '500',
  },
  breadcrumbCurrent: {
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  separator: {
    marginHorizontal: 6,
  },
});
