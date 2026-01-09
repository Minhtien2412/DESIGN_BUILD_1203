import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCart } from '../../../context/cart-context';
import { PRODUCTS } from '../../../data/products';
import { useThemeColor } from '../../../hooks/use-theme-color';

// Import new UI components
import {
    AlertProvider,
    Avatar,
    Badge,
    Button,
    Card,
    CardContent,
    ChipGroup,
    ListItem,
    SectionHeader,
    TabPanel,
    Tabs,
    useAlert,
} from '../../../components/ui';

import { Shadows } from '../../../constants/shadows';
import { Layout, SpacingSemantic } from '../../../constants/spacing';
import { TextVariants } from '../../../constants/typography';

// ============================================
// PRODUCT DETAIL PAGE - Week 2 Feature
// ============================================

const ProductDetailContent = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();
  const { addToCart } = useCart();
  
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  // Find product
  const product = PRODUCTS.find((p) => p.id === id);

  // State
  const [activeTab, setActiveTab] = useState('details');
  const [selectedSize, setSelectedSize] = useState<string[]>(['M']);
  const [selectedColor, setSelectedColor] = useState<string[]>(['blue']);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <Text style={[TextVariants.h2, { color: text }]}>Product not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize[0], selectedColor[0]);
    showAlert({
      type: 'success',
      message: `Added ${quantity}x ${product.name} to cart`,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize[0], selectedColor[0]);
    router.push('/shopping/cart' as any); // Navigate to cart screen
  };

  // Mock data for variants
  const sizeOptions = [
    { key: 'S', label: 'S' },
    { key: 'M', label: 'M' },
    { key: 'L', label: 'L' },
    { key: 'XL', label: 'XL' },
  ];

  const colorOptions = [
    { key: 'blue', label: 'Blue' },
    { key: 'red', label: 'Red' },
    { key: 'black', label: 'Black' },
    { key: 'white', label: 'White' },
  ];

  // Mock reviews
  const reviews = [
    {
      id: '1',
      user: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Sản phẩm rất tốt, đúng như mô tả!',
      date: '2 days ago',
    },
    {
      id: '2',
      user: 'Trần Thị B',
      rating: 4,
      comment: 'Chất lượng ổn, giao hàng nhanh.',
      date: '1 week ago',
    },
    {
      id: '3',
      user: 'Lê Văn C',
      rating: 5,
      comment: 'Rất hài lòng, sẽ mua lại!',
      date: '2 weeks ago',
    },
  ];

  // Mock specifications
  const specifications = [
    { label: 'Brand', value: 'Premium Brand' },
    { label: 'Material', value: '100% Cotton' },
    { label: 'Weight', value: '500g' },
    { label: 'Dimensions', value: '30 x 20 x 10 cm' },
    { label: 'Origin', value: 'Vietnam' },
    { label: 'Warranty', value: '12 months' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <Pressable
          onPress={() => setIsFavorite(!isFavorite)}
          style={[styles.iconButton, { backgroundColor: background, ...Shadows.button }]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#000000' : text}
          />
        </Pressable>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.productImage} resizeMode="contain" />
        {product.flashSale && (
          <View style={styles.badgeContainer}>
            <Badge variant="error">Flash Sale</Badge>
          </View>
        )}
      </View>

      {/* Product Info Card */}
      <View style={styles.content}>
        <Card variant="elevated">
          <CardContent>
            {/* Title & Price */}
            <View style={styles.titleRow}>
              <Text style={[TextVariants.h2, { color: text, flex: 1 }]}>{product.name}</Text>
              <Text style={[TextVariants.h2, { color: primary }]}>{product.price}</Text>
            </View>

            {/* Rating & Stock */}
            <View style={styles.infoRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={[TextVariants.body2, { color: text, marginLeft: 4 }]}>
                  4.5 (24 reviews)
                </Text>
              </View>
              <Badge variant="success">In Stock</Badge>
            </View>

            {/* Description */}
            <Text style={[TextVariants.body2, { color: textMuted, marginTop: SpacingSemantic.md }]}>
              {product.description ||
                'High-quality product with excellent features. Perfect for daily use with durable materials and modern design.'}
            </Text>
          </CardContent>
        </Card>

        {/* Size Selector */}
        <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
          <CardContent>
            <Text style={[TextVariants.h3, { color: text, marginBottom: SpacingSemantic.sm }]}>
              Select Size
            </Text>
            <ChipGroup
              chips={sizeOptions}
              selected={selectedSize}
              onChange={setSelectedSize}
              multiSelect={false}
            />
          </CardContent>
        </Card>

        {/* Color Selector */}
        <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
          <CardContent>
            <Text style={[TextVariants.h3, { color: text, marginBottom: SpacingSemantic.sm }]}>
              Select Color
            </Text>
            <ChipGroup
              chips={colorOptions}
              selected={selectedColor}
              onChange={setSelectedColor}
              multiSelect={false}
            />
          </CardContent>
        </Card>

        {/* Quantity Selector */}
        <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
          <CardContent>
            <View style={styles.quantityRow}>
              <Text style={[TextVariants.h3, { color: text }]}>Quantity</Text>
              <View style={styles.quantityControls}>
                <Pressable
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={[styles.quantityButton, { borderColor: border }]}
                >
                  <Ionicons name="remove" size={20} color={text} />
                </Pressable>
                <Text style={[TextVariants.h3, { color: text, marginHorizontal: 16 }]}>
                  {quantity}
                </Text>
                <Pressable
                  onPress={() => setQuantity(quantity + 1)}
                  style={[styles.quantityButton, { borderColor: border }]}
                >
                  <Ionicons name="add" size={20} color={text} />
                </Pressable>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Tabs for Details/Reviews/Specs */}
        <View style={{ marginTop: SpacingSemantic.lg }}>
          <Tabs
            tabs={[
              { key: 'details', label: 'Details' },
              { key: 'reviews', label: 'Reviews', badge: reviews.length },
              { key: 'specs', label: 'Specifications' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="line"
          />

          {/* Details Tab */}
          <TabPanel activeTab={activeTab} tabKey="details">
            <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
              <CardContent>
                <Text style={[TextVariants.h3, { color: text, marginBottom: SpacingSemantic.sm }]}>
                  Product Details
                </Text>
                <Text style={[TextVariants.body2, { color: textMuted, lineHeight: 24 }]}>
                  This premium product is crafted with attention to detail and quality. Made from
                  sustainable materials, it offers both durability and style. Perfect for everyday
                  use, it combines functionality with modern design aesthetics.
                  {'\n\n'}
                  Features include:
                  {'\n'}• High-quality construction
                  {'\n'}• Durable materials
                  {'\n'}• Modern design
                  {'\n'}• Easy to maintain
                  {'\n'}• Eco-friendly packaging
                </Text>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Reviews Tab */}
          <TabPanel activeTab={activeTab} tabKey="reviews">
            <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
              <CardContent>
                <SectionHeader title={`Reviews (${reviews.length})`} />
                {reviews.map((review, index) => (
                  <View key={review.id}>
                    <ListItem
                      title={review.user}
                      subtitle={review.comment}
                      leading={<Avatar name={review.user} size="md" />}
                      trailing={
                        <View style={styles.reviewRating}>
                          <Ionicons name="star" size={16} color="#FBBF24" />
                          <Text style={[TextVariants.caption, { color: text, marginLeft: 4 }]}>
                            {review.rating}
                          </Text>
                        </View>
                      }
                    />
                    {index < reviews.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: border }]} />
                    )}
                  </View>
                ))}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Specifications Tab */}
          <TabPanel activeTab={activeTab} tabKey="specs">
            <Card variant="outlined" style={{ marginTop: SpacingSemantic.md }}>
              <CardContent>
                <SectionHeader title="Specifications" />
                {specifications.map((spec, index) => (
                  <View key={spec.label}>
                    <View style={styles.specRow}>
                      <Text style={[TextVariants.body2, { color: textMuted, flex: 1 }]}>
                        {spec.label}
                      </Text>
                      <Text style={[TextVariants.body2, { color: text, fontWeight: '600' }]}>
                        {spec.value}
                      </Text>
                    </View>
                    {index < specifications.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: border }]} />
                    )}
                  </View>
                ))}
              </CardContent>
            </Card>
          </TabPanel>
        </View>

        {/* Seller Info */}
        <Card variant="outlined" style={{ marginTop: SpacingSemantic.lg }}>
          <CardContent>
            <SectionHeader title="Seller Information" />
            <ListItem
              title="Premium Store"
              subtitle="Verified Seller • 98% Positive Ratings"
              leading={<Avatar name="Premium Store" size="lg" />}
              trailing={<Badge variant="success">Verified</Badge>}
            />
          </CardContent>
        </Card>
      </View>

      {/* Bottom spacing for fixed buttons */}
      <View style={{ height: 100 }} />

      {/* Fixed Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: background, borderTopColor: border }]}>
        <View style={styles.actionButtons}>
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button title="Buy Now" onPress={handleBuyNow} style={{ flex: 1 }} />
        </View>
      </View>
    </ScrollView>
  );
};

// Wrap with AlertProvider
export default function ProductDetail() {
  return (
    <AlertProvider>
      <Stack.Screen
        options={{
          title: 'Product Details',
          headerShown: true,
        }}
      />
      <ProductDetailContent />
    </AlertProvider>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  content: {
    padding: Layout.screenPadding.horizontal,
    paddingTop: SpacingSemantic.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SpacingSemantic.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SpacingSemantic.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: SpacingSemantic.sm,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SpacingSemantic.xs,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.screenPadding.horizontal,
    paddingBottom: SpacingSemantic.lg,
    borderTopWidth: 1,
    ...Shadows.card,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SpacingSemantic.sm,
  },
});
