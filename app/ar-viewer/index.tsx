import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const products = [
  {
    id: "1",
    name: "Gạch Granite 60x60cm",
    image:
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=300&q=80",
    model3d: "granite_tile.glb",
    variants: ["Xám", "Trắng", "Đen", "Vân gỗ"],
  },
  {
    id: "2",
    name: "Bồn cầu TOTO",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&q=80",
    model3d: "toto_toilet.glb",
    variants: ["Trắng", "Kem"],
  },
  {
    id: "3",
    name: "Lavabo Caesar",
    image:
      "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&q=80",
    model3d: "caesar_lavabo.glb",
    variants: ["Trắng", "Đen matt"],
  },
];

export default function ARViewerScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isARMode, setIsARMode] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
    ).start();
  };

  React.useEffect(() => {
    startRotation();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "AR Viewer", headerShown: true }} />

      {/* AR View / 3D Preview */}
      <View style={styles.arViewer}>
        {isARMode ? (
          // Camera/AR Placeholder
          <View style={styles.arCameraPlaceholder}>
            <View style={styles.arOverlay}>
              <View style={styles.arCrosshair}>
                <View style={[styles.arCrosshairLine, styles.arCrosshairH]} />
                <View style={[styles.arCrosshairLine, styles.arCrosshairV]} />
              </View>
              <Text style={styles.arInstructions}>
                Di chuyển điện thoại để quét mặt phẳng
              </Text>
            </View>
            <View style={styles.arBadge}>
              <Ionicons name="scan-outline" size={16} color="#fff" />
              <Text style={styles.arBadgeText}>AR Mode</Text>
            </View>
          </View>
        ) : (
          // 3D Model Preview Placeholder
          <View style={styles.modelViewer}>
            <Animated.View
              style={[styles.modelContainer, { transform: [{ rotate: spin }] }]}
            >
              <View style={styles.modelPlaceholder}>
                <Ionicons name="cube" size={80} color="#FF6B35" />
                <Text style={styles.modelName}>{selectedProduct.name}</Text>
              </View>
            </Animated.View>

            {/* Controls */}
            <View style={styles.viewerControls}>
              <TouchableOpacity style={styles.controlBtn}>
                <Ionicons name="refresh-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn}>
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn}>
                <Ionicons name="remove" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* AR Toggle */}
        <TouchableOpacity
          style={[styles.arToggle, isARMode && styles.arToggleActive]}
          onPress={() => setIsARMode(!isARMode)}
        >
          <Ionicons
            name={isARMode ? "cube-outline" : "camera-outline"}
            size={24}
            color="#fff"
          />
          <Text style={styles.arToggleText}>
            {isARMode ? "Xem 3D" : "Xem AR"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={[styles.productInfo, { backgroundColor: cardBg }]}>
        <Text style={[styles.productName, { color: textColor }]}>
          {selectedProduct.name}
        </Text>

        {/* Variants */}
        <View style={styles.variantsSection}>
          <Text style={styles.variantLabel}>Màu sắc / Loại:</Text>
          <View style={styles.variantOptions}>
            {selectedProduct.variants.map((variant, index) => (
              <TouchableOpacity
                key={variant}
                style={[
                  styles.variantBtn,
                  selectedVariant === index && styles.variantBtnActive,
                ]}
                onPress={() => setSelectedVariant(index)}
              >
                <Text
                  style={[
                    styles.variantBtnText,
                    selectedVariant === index && styles.variantBtnTextActive,
                  ]}
                >
                  {variant}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gestures Guide */}
        <View style={styles.gesturesGuide}>
          <View style={styles.gestureItem}>
            <Ionicons name="finger-print-outline" size={20} color="#666" />
            <Text style={styles.gestureText}>Chạm để chọn</Text>
          </View>
          <View style={styles.gestureItem}>
            <Ionicons name="sync-outline" size={20} color="#666" />
            <Text style={styles.gestureText}>Xoay để quay</Text>
          </View>
          <View style={styles.gestureItem}>
            <Ionicons name="resize-outline" size={20} color="#666" />
            <Text style={styles.gestureText}>Kéo để phóng</Text>
          </View>
        </View>
      </View>

      {/* Product Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productSelector}
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.productThumb,
              selectedProduct.id === product.id && styles.productThumbActive,
            ]}
            onPress={() => {
              setSelectedProduct(product);
              setSelectedVariant(0);
            }}
          >
            <View style={styles.thumbImage}>
              <Ionicons
                name="cube-outline"
                size={28}
                color={selectedProduct.id === product.id ? "#FF6B35" : "#999"}
              />
            </View>
            <Text
              style={[
                styles.thumbName,
                selectedProduct.id === product.id && { color: "#FF6B35" },
              ]}
              numberOfLines={1}
            >
              {product.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actionsBar, { backgroundColor: cardBg }]}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartBtn}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  arViewer: {
    height: height * 0.45,
    backgroundColor: "#1a1a2e",
    position: "relative",
  },
  modelViewer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modelContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  modelPlaceholder: {
    alignItems: "center",
  },
  modelName: { color: "#fff", fontSize: 14, marginTop: 12, opacity: 0.8 },
  viewerControls: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -60 }],
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arCameraPlaceholder: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    justifyContent: "center",
    alignItems: "center",
  },
  arOverlay: { alignItems: "center" },
  arCrosshair: {
    width: 80,
    height: 80,
    position: "relative",
  },
  arCrosshairLine: {
    position: "absolute",
    backgroundColor: "#FF6B35",
  },
  arCrosshairH: {
    width: 80,
    height: 2,
    top: 39,
  },
  arCrosshairV: {
    width: 2,
    height: 80,
    left: 39,
  },
  arInstructions: { color: "#aaa", marginTop: 24, fontSize: 13 },
  arBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  arBadgeText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  arToggle: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -60 }],
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  arToggleActive: { backgroundColor: "#FF6B35" },
  arToggleText: { color: "#fff", fontWeight: "500" },
  productInfo: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  productName: { fontSize: 20, fontWeight: "bold" },
  variantsSection: { marginTop: 16 },
  variantLabel: { color: "#666", fontSize: 13, marginBottom: 10 },
  variantOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  variantBtnActive: { backgroundColor: "#FF6B35" },
  variantBtnText: { color: "#666", fontSize: 13 },
  variantBtnTextActive: { color: "#fff" },
  gesturesGuide: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  gestureItem: { alignItems: "center" },
  gestureText: { color: "#666", fontSize: 11, marginTop: 4 },
  productSelector: { maxHeight: 90, paddingHorizontal: 16 },
  productThumb: {
    alignItems: "center",
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  productThumbActive: { borderWidth: 2, borderColor: "#FF6B35" },
  thumbImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbName: { color: "#666", fontSize: 11, marginTop: 4, maxWidth: 70 },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
