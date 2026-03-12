import { CATEGORIES } from '@/constants/categories';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { CategoryCard } from './CategoryCard';

export const CategoryGrid: React.FC = () => {
  return (
    <FlatList
      data={CATEGORIES}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <CategoryCard
            id={item.id}
            label={item.label}
            description={item.description}
            icon={item.icon}
            color={item.color}
            gradient={item.gradient}
            moduleCount={item.modules.length}
          />
        </View>
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Parent ScrollView handles scrolling
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  row: {
    marginBottom: 4,
  },
  itemContainer: {
    flex: 1,
  },
});
