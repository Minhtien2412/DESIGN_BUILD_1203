import { DSModuleScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";
import MaterialsCatalogService, {
    Material,
    MATERIAL_CATEGORIES,
    MOCK_MATERIALS,
} from "@/services/materialsCatalogService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function MaterialsCatalogScreen() {
  const { colors, spacing, radius, text, shadow, screen } = useDS();
  const CARD_WIDTH = (screen.width - 36) / 2;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [sortBy, setSortBy] = useState("popular");
  const [showARPreview, setShowARPreview] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Load materials from API
  const loadMaterials = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(false);

      const data = await MaterialsCatalogService.getMaterials(
        selectedCategory as any,
        searchQuery || undefined,
      );
      setMaterials(data);
    } catch (err) {
      console.error("Materials load error:", err);
      setError(true);
      setMaterials(MOCK_MATERIALS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMaterials(true);
  };

  const handleSearch = () => {
    loadMaterials();
  };

  const filteredMaterials = materials.filter((material) => {
    const matchCategory =
      selectedCategory === "all" || material.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (
          parseFloat(a.price.replace(/\./g, "")) -
          parseFloat(b.price.replace(/\./g, ""))
        );
      case "price-high":
        return (
          parseFloat(b.price.replace(/\./g, "")) -
          parseFloat(a.price.replace(/\./g, ""))
        );
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <>
      <DSModuleScreen
        title="Catalog Váº­t Liá»‡u"
        gradientHeader
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: 70,
          }}
        >
          {error && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: spacing.md,
                paddingVertical: 6,
                borderRadius: 20,
                marginBottom: spacing.md,
                alignSelf: "flex-start",
                gap: 6,
              }}
            >
              <Ionicons
                name="alert-circle"
                size={18}
                color={colors.textInverse}
              />
              <Text style={[text.caption, { color: colors.textInverse }]}>
                Server khÃ´ng kháº£ dá»¥ng - DÃ¹ng dá»¯ liá»‡u demo
              </Text>
            </View>
          )}

          <Text
            style={[text.h2, { color: colors.textInverse, marginBottom: 6 }]}
          >
            KhÃ¡m phÃ¡ váº­t liá»‡u xÃ¢y dá»±ng
          </Text>
          <Text
            style={[
              text.caption,
              { color: "rgba(255,255,255,0.9)", marginBottom: spacing.xl },
            ]}
          >
            HÆ¡n 10,000+ sáº£n pháº©m cháº¥t lÆ°á»£ng
          </Text>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.lg,
              height: 48,
              ...shadow.sm,
              marginTop: spacing.xl,
            }}
          >
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={[
                text.body,
                { flex: 1, marginLeft: spacing.md, color: colors.text },
              ]}
              placeholder="TÃ¬m váº­t liá»‡u, thÆ°Æ¡ng hiá»‡u..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {loading && !materials.length ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 100,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                text.body,
                { marginTop: spacing.md, color: colors.textSecondary },
              ]}
            >
              Äang táº£i váº­t liá»‡u...
            </Text>
          </View>
        ) : (
          <>
            {/* Categories */}
            <View
              style={{
                backgroundColor: colors.card,
                paddingVertical: spacing.md,
                marginTop: -50,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: spacing.md,
                  gap: spacing.sm,
                }}
              >
                {MATERIAL_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.sm,
                      borderRadius: 20,
                      backgroundColor:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.chipBg,
                      gap: 6,
                    }}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={18}
                      color={
                        selectedCategory === category.id
                          ? colors.textInverse
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        text.caption,
                        {
                          color:
                            selectedCategory === category.id
                              ? colors.textInverse
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Sort Options */}
            <View
              style={{
                backgroundColor: colors.card,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
              >
                {[
                  { id: "popular", label: "Phá»• biáº¿n", icon: "star" },
                  {
                    id: "price-low",
                    label: "GiÃ¡ tháº¥p",
                    icon: "trending-down",
                  },
                  { id: "price-high", label: "GiÃ¡ cao", icon: "trending-up" },
                  { id: "rating", label: "ÄÃ¡nh giÃ¡", icon: "star-half" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: spacing.md,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor:
                        sortBy === option.id ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: colors.primary,
                      gap: 4,
                    }}
                    onPress={() => setSortBy(option.id)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={14}
                      color={
                        sortBy === option.id
                          ? colors.textInverse
                          : colors.primary
                      }
                    />
                    <Text
                      style={[
                        text.buttonSmall,
                        {
                          color:
                            sortBy === option.id
                              ? colors.textInverse
                              : colors.primary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text
                style={[
                  text.caption,
                  { color: colors.textTertiary, marginLeft: spacing.sm },
                ]}
              >
                {sortedMaterials.length} sáº£n pháº©m
              </Text>
            </View>

            {/* Materials Grid */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: spacing.sm,
                paddingTop: spacing.md,
              }}
            >
              {sortedMaterials.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={{
                    width: CARD_WIDTH,
                    backgroundColor: colors.card,
                    borderRadius: radius.lg,
                    margin: 6,
                    overflow: "hidden",
                    ...shadow.sm,
                  }}
                  onPress={() => setSelectedMaterial(material)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={material.image}
                    style={{
                      width: "100%",
                      height: 140,
                      backgroundColor: colors.bgMuted,
                    }}
                  />

                  {/* Badges */}
                  <View
                    style={{
                      position: "absolute",
                      top: spacing.sm,
                      right: spacing.sm,
                      gap: 4,
                    }}
                  >
                    {material.arAvailable && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: colors.danger,
                          paddingHorizontal: 6,
                          paddingVertical: 3,
                          borderRadius: radius.sm,
                          gap: 3,
                        }}
                      >
                        <Ionicons
                          name="cube"
                          size={10}
                          color={colors.textInverse}
                        />
                        <Text
                          style={[text.badge, { color: colors.textInverse }]}
                        >
                          AR
                        </Text>
                      </View>
                    )}
                    {material.inStock && (
                      <View
                        style={{
                          backgroundColor: colors.success,
                          paddingHorizontal: 6,
                          paddingVertical: 3,
                          borderRadius: radius.sm,
                        }}
                      >
                        <Text
                          style={[text.badge, { color: colors.textInverse }]}
                        >
                          CÃ²n hÃ ng
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Card Content */}
                  <View style={{ padding: 10 }}>
                    <Text
                      style={[
                        text.smallBold,
                        { color: colors.primary, marginBottom: 4 },
                      ]}
                    >
                      {material.brand}
                    </Text>
                    <Text
                      style={[
                        text.bodySemibold,
                        {
                          fontSize: 13,
                          color: colors.text,
                          marginBottom: 6,
                          height: 36,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {material.name}
                    </Text>

                    {/* Rating */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: spacing.sm,
                        gap: 4,
                      }}
                    >
                      <Ionicons name="star" size={12} color={colors.gold} />
                      <Text style={[text.smallBold, { color: colors.text }]}>
                        {material.rating}
                      </Text>
                      <Text
                        style={[text.caption, { color: colors.textTertiary }]}
                      >
                        ({material.reviews})
                      </Text>
                    </View>

                    {/* Price */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Text
                          style={[text.bodySemibold, { color: colors.primary }]}
                        >
                          {material.price}
                        </Text>
                        <Text
                          style={[text.caption, { color: colors.textTertiary }]}
                        >
                          /{material.unit}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: colors.primary,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="add"
                          size={18}
                          color={colors.textInverse}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </DSModuleScreen>

      {/* Material Detail Modal */}
      <Modal
        visible={selectedMaterial !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMaterial(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "90%",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: spacing.lg,
                right: spacing.lg,
                zIndex: 10,
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 20,
                padding: 4,
              }}
              onPress={() => setSelectedMaterial(null)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            {selectedMaterial && (
              <ScrollView>
                <Image
                  source={selectedMaterial.image}
                  style={{
                    width: "100%",
                    height: 300,
                    backgroundColor: colors.bgMuted,
                  }}
                />

                <View style={{ padding: spacing.xl }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: spacing.md,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colors.primaryBg,
                        paddingHorizontal: spacing.md,
                        paddingVertical: 6,
                        borderRadius: 16,
                      }}
                    >
                      <Text
                        style={[
                          text.bodySemibold,
                          { fontSize: 13, color: colors.primary },
                        ]}
                      >
                        {selectedMaterial.brand}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="star" size={16} color={colors.gold} />
                      <Text style={[text.bodySemibold, { color: colors.text }]}>
                        {selectedMaterial.rating}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      text.h3,
                      { color: colors.text, marginBottom: spacing.xl },
                    ]}
                  >
                    {selectedMaterial.name}
                  </Text>

                  {/* Specs */}
                  <View
                    style={{
                      backgroundColor: colors.bgMuted,
                      borderRadius: radius.lg,
                      padding: spacing.lg,
                      marginBottom: spacing.xl,
                    }}
                  >
                    <Text
                      style={[
                        text.bodySemibold,
                        { color: colors.text, marginBottom: spacing.md },
                      ]}
                    >
                      ThÃ´ng sá»‘ ká»¹ thuáº­t
                    </Text>
                    {Object.entries(selectedMaterial.specs).map(
                      ([key, value]) => (
                        <View
                          key={key}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: spacing.sm,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.divider,
                          }}
                        >
                          <Text
                            style={[text.body, { color: colors.textSecondary }]}
                          >
                            {key === "size" && "KÃ­ch thÆ°á»›c"}
                            {key === "thickness" && "Äá»™ dÃ y"}
                            {key === "finish" && "HoÃ n thiá»‡n"}
                            {key === "origin" && "Xuáº¥t xá»©"}
                            {key === "waterResist" && "Chá»‘ng nÆ°á»›c"}
                            {key === "warranty" && "Báº£o hÃ nh"}
                            {key === "hardness" && "Äá»™ cá»©ng"}
                            {key === "type" && "Loáº¡i"}
                            {key === "safety" && "An toÃ n"}
                            {key === "grade" && "Cáº¥p"}
                          </Text>
                          <Text
                            style={[
                              text.bodySemibold,
                              { fontSize: 13, color: colors.text },
                            ]}
                          >
                            {String(value)}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>

                  {/* Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: spacing.md,
                      marginBottom: spacing.xl,
                    }}
                  >
                    {selectedMaterial.arAvailable && (
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.primaryBg,
                          borderWidth: 1,
                          borderColor: colors.primary,
                          paddingVertical: spacing.md,
                          borderRadius: radius.md,
                          gap: 6,
                        }}
                        onPress={() => {
                          setSelectedMaterial(null);
                          setShowARPreview(true);
                        }}
                      >
                        <Ionicons
                          name="cube"
                          size={20}
                          color={colors.primary}
                        />
                        <Text
                          style={[text.bodySemibold, { color: colors.primary }]}
                        >
                          Xem AR
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.success,
                        paddingVertical: spacing.md,
                        borderRadius: radius.md,
                        gap: 6,
                      }}
                    >
                      <Ionicons
                        name="call"
                        size={20}
                        color={colors.textInverse}
                      />
                      <Text
                        style={[
                          text.bodySemibold,
                          { color: colors.textInverse },
                        ]}
                      >
                        LiÃªn há»‡
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Price & Add */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: spacing.xl,
                      borderTopWidth: 1,
                      borderTopColor: colors.divider,
                    }}
                  >
                    <View>
                      <Text style={[text.h2, { color: colors.primary }]}>
                        {selectedMaterial.price}
                      </Text>
                      <Text
                        style={[text.caption, { color: colors.textTertiary }]}
                      >
                        /{selectedMaterial.unit}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.primary,
                        paddingHorizontal: 24,
                        paddingVertical: spacing.md,
                        borderRadius: 24,
                        gap: spacing.sm,
                      }}
                    >
                      <Ionicons
                        name="cart"
                        size={20}
                        color={colors.textInverse}
                      />
                      <Text
                        style={[
                          text.bodySemibold,
                          { color: colors.textInverse },
                        ]}
                      >
                        ThÃªm vÃ o giá»
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* AR Preview Modal */}
      <Modal
        visible={showARPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowARPreview(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.text,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 50,
              right: spacing.xl,
              zIndex: 10,
            }}
            onPress={() => setShowARPreview(false)}
          >
            <Ionicons
              name="close-circle"
              size={40}
              color={colors.textInverse}
            />
          </TouchableOpacity>

          <View style={{ alignItems: "center", padding: 40 }}>
            <Ionicons
              name="cube-outline"
              size={100}
              color={colors.textInverse}
            />
            <Text
              style={[
                text.h1,
                { color: colors.textInverse, marginTop: spacing.xl },
              ]}
            >
              AR Preview
            </Text>
            <Text
              style={[
                text.bodyLarge,
                { color: "rgba(255,255,255,0.7)", marginTop: spacing.md },
              ]}
            >
              TÃ­nh nÄƒng AR Ä‘ang phÃ¡t triá»ƒn
            </Text>
            <Text
              style={[
                text.body,
                {
                  color: "rgba(255,255,255,0.5)",
                  marginTop: spacing.sm,
                  textAlign: "center",
                },
              ]}
            >
              Sáº½ cho phÃ©p xem váº­t liá»‡u trÃªn khÃ´ng gian thá»±c táº¿
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
