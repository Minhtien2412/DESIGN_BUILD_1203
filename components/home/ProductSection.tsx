/**
 * ProductSection — Horizontal scrollable product card list with async support
 */
import { memo } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ProductCard, ProductCardItem } from "./ProductCard";

const PAD = 16;

export const FURNITURE_PRODUCTS: ProductCardItem[] = [
  {
    id: 1,
    name: "Bàn làm việc gỗ tự nhiên",
    price: "2,500,000₫",
    image: "https://picsum.photos/300/250?random=20",
    discount: "-15%",
    route: "/categories/furniture",
  },
  {
    id: 2,
    name: "Ghế văn phòng ergonomic",
    price: "3,200,000₫",
    image: "https://picsum.photos/300/250?random=21",
    discount: "-20%",
    route: "/categories/furniture",
  },
  {
    id: 3,
    name: "Tủ quần áo 3 cánh",
    price: "4,800,000₫",
    image: "https://picsum.photos/300/250?random=22",
    route: "/categories/furniture",
  },
  {
    id: 4,
    name: "Kệ sách trang trí",
    price: "1,800,000₫",
    image: "https://picsum.photos/300/250?random=23",
    discount: "-10%",
    route: "/categories/furniture",
  },
  {
    id: 5,
    name: "Sofa góc chữ L",
    price: "8,900,000₫",
    image: "https://picsum.photos/300/250?random=24",
    discount: "-25%",
    route: "/categories/furniture",
  },
  {
    id: 6,
    name: "Bàn ăn 6 ghế",
    price: "5,500,000₫",
    image: "https://picsum.photos/300/250?random=25",
    route: "/categories/furniture",
  },
];

interface ProductSectionProps {
  products?: ProductCardItem[];
  isLoading?: boolean;
  error?: string | null;
}

export const ProductSection = memo<ProductSectionProps>(
  ({ products, isLoading, error }) => {
    const data =
      products && products.length > 0 ? products : FURNITURE_PRODUCTS;

    if (isLoading) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#0D9488" />
        </View>
      );
    }

    if (error && data.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>Không thể tải sản phẩm</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </ScrollView>
    );
  },
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: PAD,
    gap: 10,
  },
  statusContainer: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: PAD,
  },
  errorText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
