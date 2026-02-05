/**
 * Material Management - Quản lý vật liệu xây dựng
 * Thêm mới, sửa, xóa vật liệu tùy chỉnh
 * Design: Modern Minimal - Single accent color
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import {
    CATEGORY_LABELS,
    createMaterial,
    deleteMaterial,
    duplicateMaterial,
    getAllMaterials,
    getMaterialStats,
    MaterialCategory,
    MaterialItem,
    searchMaterials,
    UNIT_OPTIONS,
    updateMaterial,
} from "@/services/materialService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Simple monochrome icons for categories (no colors, just icons)
const SIMPLE_ICONS: Record<MaterialCategory, keyof typeof Ionicons.glyphMap> = {
  brick: "cube-outline",
  cement: "layers-outline",
  sand: "ellipse-outline",
  steel: "construct-outline",
  stone: "triangle-outline",
  wood: "leaf-outline",
  paint: "color-palette-outline",
  tile: "grid-outline",
  electrical: "flash-outline",
  plumbing: "water-outline",
  other: "apps-outline",
};

type ViewMode = "list" | "grid";

export default function MaterialManagementScreen() {
  const insets = useSafeAreaInsets();

  // State
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    MaterialCategory | "all"
  >("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [stats, setStats] = useState<{
    total: number;
    customCount: number;
    defaultCount: number;
    byCategory: Record<string, number>;
  } | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(
    null,
  );

  // Form state
  const [formData, setFormData] = useState({
    category: "other" as MaterialCategory,
    name: "",
    description: "",
    unit: "cái",
    pricePerUnit: "",
    qtyPerM2: "",
    kgPerM: "",
    wastage: "",
    brand: "",
    size: "",
  });

  // Load data
  const loadMaterials = useCallback(async () => {
    try {
      let data: MaterialItem[];
      if (searchQuery.trim()) {
        data = await searchMaterials(searchQuery);
      } else {
        data = await getAllMaterials();
      }

      // Filter by category
      if (selectedCategory !== "all") {
        data = data.filter((m) => m.category === selectedCategory);
      }

      // Only active materials
      data = data.filter((m) => m.isActive);

      setMaterials(data);

      // Load stats
      const s = await getMaterialStats();
      setStats(s);
    } catch (error) {
      console.error("Error loading materials:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [loadMaterials]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaterials();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMaterials();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      category: "other",
      name: "",
      description: "",
      unit: "cái",
      pricePerUnit: "",
      qtyPerM2: "",
      kgPerM: "",
      wastage: "",
      brand: "",
      size: "",
    });
  };

  // Open add modal
  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (material: MaterialItem) => {
    setSelectedMaterial(material);
    setFormData({
      category: material.category,
      name: material.name,
      description: material.description || "",
      unit: material.unit,
      pricePerUnit: material.pricePerUnit.toString(),
      qtyPerM2: material.specs?.qtyPerM2?.toString() || "",
      kgPerM: material.specs?.kgPerM?.toString() || "",
      wastage: material.specs?.wastage?.toString() || "",
      brand: material.specs?.brand || "",
      size: material.specs?.size || "",
    });
    setShowActionModal(false);
    setShowEditModal(true);
  };

  // Save material (create/update)
  const handleSaveMaterial = async (isEdit: boolean) => {
    if (!formData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên vật liệu");
      return;
    }

    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đơn giá hợp lệ");
      return;
    }

    try {
      const specs: Record<string, any> = {};
      if (formData.qtyPerM2) specs.qtyPerM2 = parseFloat(formData.qtyPerM2);
      if (formData.kgPerM) specs.kgPerM = parseFloat(formData.kgPerM);
      if (formData.wastage) specs.wastage = parseFloat(formData.wastage);
      if (formData.brand) specs.brand = formData.brand;
      if (formData.size) specs.size = formData.size;

      if (isEdit && selectedMaterial) {
        await updateMaterial(selectedMaterial.id, {
          name: formData.name,
          description: formData.description || undefined,
          unit: formData.unit,
          pricePerUnit: parseFloat(formData.pricePerUnit),
          specs,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Thành công", "Đã cập nhật vật liệu");
      } else {
        await createMaterial({
          category: formData.category,
          name: formData.name,
          description: formData.description || undefined,
          unit: formData.unit,
          pricePerUnit: parseFloat(formData.pricePerUnit),
          specs,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Thành công", "Đã thêm vật liệu mới");
      }

      setShowAddModal(false);
      setShowEditModal(false);
      loadMaterials();
    } catch (error) {
      console.error("Error saving material:", error);
      Alert.alert("Lỗi", "Không thể lưu vật liệu");
    }
  };

  // Delete material
  const handleDeleteMaterial = (material: MaterialItem) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa "${material.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMaterial(material.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowActionModal(false);
            loadMaterials();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa vật liệu");
          }
        },
      },
    ]);
  };

  // Duplicate material
  const handleDuplicateMaterial = async (material: MaterialItem) => {
    try {
      await duplicateMaterial(material.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowActionModal(false);
      loadMaterials();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể sao chép vật liệu");
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(2)} tr`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toLocaleString("vi-VN");
  };

  // Render material card - Modern minimal design
  const renderMaterialCard = ({ item }: { item: MaterialItem }) => {
    const categoryIcon = SIMPLE_ICONS[item.category] || "apps-outline";
    const categoryLabel = CATEGORY_LABELS[item.category] || "Khác";

    return (
      <TouchableOpacity
        style={styles.materialCard}
        onPress={() => handleOpenEdit(item)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedMaterial(item);
          setShowActionModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={categoryIcon}
              size={14}
              color={MODERN_COLORS.textSecondary}
            />
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          {!item.isDefault && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Tùy chỉnh</Text>
            </View>
          )}
        </View>

        <Text style={styles.materialName} numberOfLines={2}>
          {item.name}
        </Text>

        {item.description && (
          <Text style={styles.materialDesc} numberOfLines={1}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>
              {formatPrice(item.pricePerUnit)}
            </Text>
            <Text style={styles.priceUnit}>/{item.unit}</Text>
          </View>

          {item.specs?.qtyPerM2 && (
            <View style={styles.specBadge}>
              <Text style={styles.specText}>{item.specs.qtyPerM2}/m²</Text>
            </View>
          )}
          {item.specs?.kgPerM && (
            <View style={styles.specBadge}>
              <Text style={styles.specText}>{item.specs.kgPerM} kg/m</Text>
            </View>
          )}
          {item.specs?.wastage && (
            <View style={styles.specBadge}>
              <Text style={styles.specText}>-{item.specs.wastage}%</Text>
            </View>
          )}
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.localId}>#{item.localId}</Text>
          {item.specs?.brand && (
            <Text style={styles.brandText}>{item.specs.brand}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render form modal - Modern minimal design
  const renderFormModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() =>
        isEdit ? setShowEditModal(false) : setShowAddModal(false)
      }
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Sửa vật liệu" : "Thêm vật liệu mới"}
            </Text>
            <TouchableOpacity
              onPress={() =>
                isEdit ? setShowEditModal(false) : setShowAddModal(false)
              }
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={MODERN_COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Selection - Only for new */}
            {!isEdit && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Danh mục *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryRow}>
                    {(Object.keys(CATEGORY_LABELS) as MaterialCategory[]).map(
                      (cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryOption,
                            formData.category === cat &&
                              styles.categoryOptionActive,
                          ]}
                          onPress={() =>
                            setFormData({ ...formData, category: cat })
                          }
                        >
                          <Ionicons
                            name={SIMPLE_ICONS[cat]}
                            size={20}
                            color={
                              formData.category === cat
                                ? MODERN_COLORS.primary
                                : MODERN_COLORS.textTertiary
                            }
                          />
                          <Text
                            style={[
                              styles.categoryOptionText,
                              formData.category === cat &&
                                styles.categoryOptionTextActive,
                            ]}
                          >
                            {CATEGORY_LABELS[cat]}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên vật liệu *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholder="VD: Gạch ống 6 lỗ"
                placeholderTextColor={MODERN_COLORS.textTertiary}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô tả</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(v) =>
                  setFormData({ ...formData, description: v })
                }
                placeholder="Mô tả chi tiết..."
                placeholderTextColor={MODERN_COLORS.textTertiary}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Unit & Price */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Đơn vị</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.unitRow}>
                    {UNIT_OPTIONS.map((u) => (
                      <TouchableOpacity
                        key={u.value}
                        style={[
                          styles.unitOption,
                          formData.unit === u.value && styles.unitOptionActive,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, unit: u.value })
                        }
                      >
                        <Text
                          style={[
                            styles.unitOptionText,
                            formData.unit === u.value &&
                              styles.unitOptionTextActive,
                          ]}
                        >
                          {u.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Đơn giá (VNĐ) *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.pricePerUnit}
                onChangeText={(v) =>
                  setFormData({ ...formData, pricePerUnit: v })
                }
                placeholder="0"
                placeholderTextColor={MODERN_COLORS.textTertiary}
                keyboardType="number-pad"
              />
            </View>

            {/* Specs */}
            <Text style={[styles.formLabel, { marginBottom: 8 }]}>
              Thông số kỹ thuật
            </Text>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabelSmall}>Số lượng/m²</Text>
                <TextInput
                  style={styles.formInputSmall}
                  value={formData.qtyPerM2}
                  onChangeText={(v) =>
                    setFormData({ ...formData, qtyPerM2: v })
                  }
                  placeholder="0"
                  keyboardType="decimal-pad"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabelSmall}>Kg/m (thép)</Text>
                <TextInput
                  style={styles.formInputSmall}
                  value={formData.kgPerM}
                  onChangeText={(v) => setFormData({ ...formData, kgPerM: v })}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabelSmall}>Hao hụt %</Text>
                <TextInput
                  style={styles.formInputSmall}
                  value={formData.wastage}
                  onChangeText={(v) => setFormData({ ...formData, wastage: v })}
                  placeholder="5"
                  keyboardType="decimal-pad"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabelSmall}>Thương hiệu</Text>
                <TextInput
                  style={styles.formInputSmall}
                  value={formData.brand}
                  onChangeText={(v) => setFormData({ ...formData, brand: v })}
                  placeholder="VD: Hoa Sen"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabelSmall}>Kích thước</Text>
                <TextInput
                  style={styles.formInputSmall}
                  value={formData.size}
                  onChangeText={(v) => setFormData({ ...formData, size: v })}
                  placeholder="VD: 6x10x22"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                isEdit ? setShowEditModal(false) : setShowAddModal(false)
              }
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => handleSaveMaterial(isEdit)}
            >
              <Text style={styles.saveBtnText}>
                {isEdit ? "Cập nhật" : "Thêm mới"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Render action modal - Modern minimal
  const renderActionModal = () => (
    <Modal
      visible={showActionModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowActionModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowActionModal(false)}
      >
        <View style={styles.actionModal}>
          <View style={styles.actionModalHeader}>
            <Text style={styles.actionModalTitle} numberOfLines={1}>
              {selectedMaterial?.name}
            </Text>
            <Text style={styles.actionModalSubtitle}>
              #{selectedMaterial?.localId} •{" "}
              {CATEGORY_LABELS[selectedMaterial?.category || "other"]}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => selectedMaterial && handleOpenEdit(selectedMaterial)}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={MODERN_COLORS.textPrimary}
            />
            <Text style={styles.actionText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() =>
              selectedMaterial && handleDuplicateMaterial(selectedMaterial)
            }
          >
            <Ionicons
              name="copy-outline"
              size={22}
              color={MODERN_COLORS.textPrimary}
            />
            <Text style={styles.actionText}>Sao chép</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, styles.actionItemDanger]}
            onPress={() =>
              selectedMaterial && handleDeleteMaterial(selectedMaterial)
            }
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={MODERN_COLORS.error}
            />
            <Text style={[styles.actionText, { color: MODERN_COLORS.error }]}>
              Xóa
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header - Modern minimal */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={MODERN_COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý vật liệu</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={24} color={MODERN_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={MODERN_COLORS.textTertiary}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm vật liệu..."
            placeholderTextColor={MODERN_COLORS.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={MODERN_COLORS.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Tổng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.customCount}</Text>
              <Text style={styles.statLabel}>Tùy chỉnh</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.defaultCount}</Text>
              <Text style={styles.statLabel}>Mặc định</Text>
            </View>
          </View>
        )}
      </View>

      {/* Category Filter - Modern minimal */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === "all" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === "all" && styles.filterChipTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          {(Object.keys(CATEGORY_LABELS) as MaterialCategory[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Ionicons
                name={SIMPLE_ICONS[cat]}
                size={14}
                color={
                  selectedCategory === cat
                    ? MODERN_COLORS.primary
                    : MODERN_COLORS.textTertiary
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat && styles.filterChipTextActive,
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : materials.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cube-outline"
            size={64}
            color={MODERN_COLORS.textTertiary}
          />
          <Text style={styles.emptyText}>Chưa có vật liệu nào</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAdd}>
            <Text style={styles.emptyBtnText}>+ Thêm vật liệu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={materials}
          renderItem={renderMaterialCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[MODERN_COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button - Simple */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      {renderFormModal(false)}
      {renderFormModal(true)}
      {renderActionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
    fontSize: 15,
    color: MODERN_COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.sm,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
    marginTop: 2,
  },
  filterContainer: {
    paddingVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    marginRight: MODERN_SPACING.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  filterChipActive: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    borderColor: MODERN_COLORS.primary,
  },
  filterChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
  listContent: {
    padding: MODERN_SPACING.md,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  materialCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 3) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: MODERN_SPACING.sm,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "500",
    color: MODERN_COLORS.textSecondary,
    marginLeft: 4,
  },
  customBadge: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.sm,
  },
  customBadgeText: {
    fontSize: 9,
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
  materialName: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  materialDesc: {
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: MODERN_SPACING.xs,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  priceUnit: {
    fontSize: 11,
    color: MODERN_COLORS.textTertiary,
    marginLeft: 2,
  },
  specBadge: {
    backgroundColor: MODERN_COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.sm,
  },
  specText: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: MODERN_SPACING.sm,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  localId: {
    fontSize: 11,
    color: MODERN_COLORS.textTertiary,
  },
  brandText: {
    fontSize: 11,
    color: MODERN_COLORS.textTertiary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: MODERN_SPACING.sm,
    color: MODERN_COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: MODERN_SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.md,
  },
  emptyBtn: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
  },
  emptyBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: MODERN_SPACING.lg,
    bottom: MODERN_SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...MODERN_SHADOWS.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  formModal: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    maxHeight: "90%",
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: MODERN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  formContent: {
    padding: MODERN_SPACING.lg,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: MODERN_SPACING.md,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 8,
  },
  formLabelSmall: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    fontSize: 15,
    color: MODERN_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  formInputSmall: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    fontSize: 14,
    color: MODERN_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    marginBottom: MODERN_SPACING.sm,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryOption: {
    alignItems: "center",
    padding: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.lg,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    minWidth: 70,
    backgroundColor: MODERN_COLORS.background,
  },
  categoryOptionActive: {
    backgroundColor: `${MODERN_COLORS.primary}10`,
    borderColor: MODERN_COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  categoryOptionTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
  unitRow: {
    flexDirection: "row",
    gap: 6,
  },
  unitOption: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  unitOptionActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  unitOptionText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  unitOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  formActions: {
    flexDirection: "row",
    padding: MODERN_SPACING.lg,
    paddingTop: 0,
    gap: MODERN_SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  saveBtn: {
    flex: 2,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  actionModal: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.xl,
    marginHorizontal: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.xl,
    overflow: "hidden",
  },
  actionModalHeader: {
    padding: MODERN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  actionModalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  actionModalSubtitle: {
    fontSize: 13,
    color: MODERN_COLORS.textTertiary,
    marginTop: 4,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  actionItemDanger: {
    borderBottomWidth: 0,
  },
  actionText: {
    marginLeft: MODERN_SPACING.md,
    fontSize: 15,
    color: MODERN_COLORS.textPrimary,
  },
});
