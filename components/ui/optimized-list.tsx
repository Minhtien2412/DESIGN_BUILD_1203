/**
 * Optimized List Components
 * Tối ưu hiệu suất cho FlatList và ScrollView
 */

import { Image } from "expo-image";
import { memo, useCallback, useMemo } from "react";
import {
    FlatList,
    ListRenderItem,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

// =================
// OPTIMIZED FLATLIST
// =================

interface OptimizedFlatListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  numColumns?: number;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

export const OptimizedFlatList = memo(
  <T,>({
    data,
    renderItem,
    keyExtractor,
    refreshing = false,
    onRefresh,
    onEndReached,
    style,
    contentContainerStyle,
    numColumns = 1,
    horizontal = false,
    showsVerticalScrollIndicator = false,
    showsHorizontalScrollIndicator = false,
  }: OptimizedFlatListProps<T>) => {
    // Memoize render item để tránh re-render không cần thiết
    const memoizedRenderItem = useCallback<ListRenderItem<T>>(
      (props) => {
        return renderItem(props);
      },
      [renderItem],
    );

    // Optimized refresh control
    const refreshControl = useMemo(() => {
      if (!onRefresh) return undefined;
      return (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#0066CC"
          colors={["#0066CC"]}
        />
      );
    }, [refreshing, onRefresh]);

    return (
      <FlatList
        data={data}
        renderItem={memoizedRenderItem}
        keyExtractor={keyExtractor}
        refreshControl={refreshControl}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        style={style}
        contentContainerStyle={contentContainerStyle}
        numColumns={numColumns}
        horizontal={horizontal}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={undefined} // Tự động tính toán, có thể override nếu biết chính xác kích thước
        // Memory optimizations
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
      />
    );
  },
);

OptimizedFlatList.displayName = "OptimizedFlatList";

// =================
// OPTIMIZED IMAGE COMPONENT
// =================

interface OptimizedImageProps {
  source: any;
  style?: any;
  placeholder?: string;
  contentFit?: "cover" | "contain" | "fill";
  transition?: number;
  cachePolicy?: "memory-disk" | "memory" | "disk" | "none";
}

export const OptimizedImage = memo(
  ({
    source,
    style,
    placeholder = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300&h=200&q=10",
    contentFit = "cover",
    transition = 300,
    cachePolicy = "memory-disk",
  }: OptimizedImageProps) => {
    return (
      <Image
        source={source}
        style={style}
        placeholder={placeholder}
        contentFit={contentFit}
        transition={transition}
        cachePolicy={cachePolicy}
        // Performance optimizations
        priority="normal"
        allowDownscaling={true}
      />
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

// =================
// MEMOIZED ITEM COMPONENTS
// =================

export interface ProductItemProps {
  id: string;
  name: string;
  price: number;
  image: any;
  onPress: (id: string) => void;
}

export const MemoizedProductItem = memo(
  ({ id, name, price, image, onPress }: ProductItemProps) => {
    const handlePress = useCallback(() => {
      onPress(id);
    }, [id, onPress]);

    return (
      <TouchableOpacity style={styles.productItem} onPress={handlePress}>
        <OptimizedImage
          source={image}
          style={styles.productImage}
          contentFit="cover"
        />
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.productPrice}>
          {new Intl.NumberFormat("vi-VN").format(price)} VNĐ
        </Text>
      </TouchableOpacity>
    );
  },
);

MemoizedProductItem.displayName = "MemoizedProductItem";

const styles = StyleSheet.create({
  productItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    margin: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066CC",
  },
});
