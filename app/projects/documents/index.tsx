/**
 * Project Documents Screen - Tài liệu dự án
 * Quản lý tất cả tài liệu liên quan đến dự án
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

// Document types
const DOC_TYPES = {
  pdf: { icon: "document-text", color: COLORS.danger },
  dwg: { icon: "layers", color: COLORS.secondary },
  excel: { icon: "grid", color: COLORS.success },
  word: { icon: "document", color: COLORS.primary },
  image: { icon: "image", color: COLORS.purple },
  folder: { icon: "folder", color: COLORS.accent },
};

// Document categories
const categories = [
  { id: "all", label: "Tất cả", icon: "albums-outline" },
  { id: "design", label: "Thiết kế", icon: "brush-outline" },
  { id: "permit", label: "Giấy phép", icon: "document-attach-outline" },
  { id: "contract", label: "Hợp đồng", icon: "clipboard-outline" },
  { id: "report", label: "Báo cáo", icon: "bar-chart-outline" },
];

// Mock documents
const documents = [
  {
    id: "1",
    name: "Bản vẽ kiến trúc T1-T3.dwg",
    type: "dwg",
    size: "15.2 MB",
    category: "design",
    uploadedBy: "KTS. Nguyễn A",
    uploadDate: "08/01/2026",
    version: "v2.1",
    project: "Nhà phố Q7",
  },
  {
    id: "2",
    name: "Giấy phép xây dựng.pdf",
    type: "pdf",
    size: "2.5 MB",
    category: "permit",
    uploadedBy: "Admin",
    uploadDate: "05/01/2026",
    version: "v1.0",
    project: "Nhà phố Q7",
  },
  {
    id: "3",
    name: "Hợp đồng thi công.pdf",
    type: "pdf",
    size: "1.8 MB",
    category: "contract",
    uploadedBy: "PM. Trần B",
    uploadDate: "03/01/2026",
    version: "v1.0",
    project: "Nhà phố Q7",
  },
  {
    id: "4",
    name: "Dự toán chi tiết.xlsx",
    type: "excel",
    size: "856 KB",
    category: "report",
    uploadedBy: "Kế toán C",
    uploadDate: "01/01/2026",
    version: "v3.2",
    project: "Nhà phố Q7",
  },
  {
    id: "5",
    name: "Bản vẽ kết cấu móng.dwg",
    type: "dwg",
    size: "8.4 MB",
    category: "design",
    uploadedBy: "KS. Lê D",
    uploadDate: "28/12/2025",
    version: "v1.5",
    project: "Nhà phố Q7",
  },
  {
    id: "6",
    name: "Báo cáo tiến độ T1.docx",
    type: "word",
    size: "1.2 MB",
    category: "report",
    uploadedBy: "PM. Trần B",
    uploadDate: "25/12/2025",
    version: "v1.0",
    project: "Nhà phố Q7",
  },
  {
    id: "7",
    name: "Ảnh công trường 08-01.jpg",
    type: "image",
    size: "3.5 MB",
    category: "report",
    uploadedBy: "Giám sát E",
    uploadDate: "08/01/2026",
    version: "-",
    project: "Nhà phố Q7",
  },
];

// Mock folders
const folders = [
  { id: "f1", name: "Bản vẽ Kiến trúc", count: 12, color: COLORS.secondary },
  { id: "f2", name: "Bản vẽ Kết cấu", count: 8, color: COLORS.primary },
  { id: "f3", name: "Bản vẽ MEP", count: 6, color: COLORS.purple },
  { id: "f4", name: "Hồ sơ Pháp lý", count: 5, color: COLORS.accent },
];

export default function ProjectDocumentsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    if (activeCategory === "all") return matchesSearch;
    return matchesSearch && doc.category === activeCategory;
  });

  const handleUpload = () => {
    Alert.alert("Tải lên", "Chọn tài liệu từ thiết bị để tải lên");
  };

  const handleDocPress = (doc: (typeof documents)[0]) => {
    Alert.alert(
      doc.name,
      `Loại: ${doc.type.toUpperCase()}\nKích thước: ${doc.size}\nPhiên bản: ${doc.version}`,
    );
  };

  const getDocIcon = (type: string) => {
    return DOC_TYPES[type as keyof typeof DOC_TYPES] || DOC_TYPES.pdf;
  };

  const renderFolder = (folder: (typeof folders)[0]) => (
    <TouchableOpacity
      key={folder.id}
      style={[styles.folderCard, { backgroundColor: cardBg }]}
    >
      <View
        style={[styles.folderIcon, { backgroundColor: folder.color + "20" }]}
      >
        <Ionicons name="folder" size={28} color={folder.color} />
      </View>
      <Text style={[styles.folderName, { color: textColor }]} numberOfLines={1}>
        {folder.name}
      </Text>
      <Text style={styles.folderCount}>{folder.count} tệp</Text>
    </TouchableOpacity>
  );

  const renderDocument = ({ item }: { item: (typeof documents)[0] }) => {
    const docStyle = getDocIcon(item.type);

    if (viewMode === "grid") {
      return (
        <TouchableOpacity
          style={[styles.docGridCard, { backgroundColor: cardBg }]}
          onPress={() => handleDocPress(item)}
        >
          <View
            style={[
              styles.docGridIcon,
              { backgroundColor: docStyle.color + "15" },
            ]}
          >
            <Ionicons
              name={docStyle.icon as any}
              size={32}
              color={docStyle.color}
            />
          </View>
          <Text
            style={[styles.docGridName, { color: textColor }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text style={styles.docGridSize}>{item.size}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.docListCard, { backgroundColor: cardBg }]}
        onPress={() => handleDocPress(item)}
      >
        <View
          style={[
            styles.docListIcon,
            { backgroundColor: docStyle.color + "15" },
          ]}
        >
          <Ionicons
            name={docStyle.icon as any}
            size={24}
            color={docStyle.color}
          />
        </View>
        <View style={styles.docListInfo}>
          <Text
            style={[styles.docListName, { color: textColor }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View style={styles.docListMeta}>
            <Text style={styles.docListMetaText}>{item.size}</Text>
            <Text style={styles.docListMetaDot}>•</Text>
            <Text style={styles.docListMetaText}>{item.uploadDate}</Text>
            <Text style={styles.docListMetaDot}>•</Text>
            <Text style={styles.docListMetaText}>{item.version}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.docAction}>
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={COLORS.textLight}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Tài liệu dự án",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: "#fff",
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() =>
                  setViewMode(viewMode === "list" ? "grid" : "list")
                }
              >
                <Ionicons
                  name={viewMode === "list" ? "grid" : "list"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpload}
                style={{ marginLeft: 16 }}
              >
                <Ionicons name="cloud-upload" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm tài liệu..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={activeCategory === cat.id ? "#fff" : COLORS.textLight}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Folders Section */}
        {activeCategory === "all" && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                <Ionicons name="folder" size={16} /> Thư mục
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foldersScroll}
            >
              {folders.map(renderFolder)}
            </ScrollView>
          </>
        )}

        {/* Documents Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            <Ionicons name="documents" size={16} /> Tài liệu (
            {filteredDocs.length})
          </Text>
        </View>

        {viewMode === "grid" ? (
          <View style={styles.docsGrid}>
            {filteredDocs.map((doc) => (
              <View key={doc.id} style={styles.gridItem}>
                {renderDocument({ item: doc })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.docsList}>
            {filteredDocs.map((doc) => (
              <View key={doc.id}>{renderDocument({ item: doc })}</View>
            ))}
          </View>
        )}

        {/* Storage Stats */}
        <View style={[styles.storageCard, { backgroundColor: cardBg }]}>
          <View style={styles.storageHeader}>
            <Ionicons name="cloud" size={20} color={COLORS.secondary} />
            <Text style={[styles.storageTitle, { color: textColor }]}>
              Dung lượng sử dụng
            </Text>
          </View>
          <View style={styles.storageBar}>
            <View style={[styles.storageFill, { width: "35%" }]} />
          </View>
          <View style={styles.storageInfo}>
            <Text style={styles.storageUsed}>350 MB / 1 GB</Text>
            <Text style={styles.storagePercent}>35%</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  foldersScroll: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  folderCard: {
    width: 110,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
  },
  folderIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  folderName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  docsList: {
    paddingHorizontal: 12,
  },
  docListCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  docListIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docListInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docListName: {
    fontSize: 14,
    fontWeight: "500",
  },
  docListMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  docListMetaText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  docListMetaDot: {
    fontSize: 11,
    color: COLORS.textLight,
    marginHorizontal: 6,
  },
  docAction: {
    padding: 8,
  },
  docsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  gridItem: {
    width: (width - 48) / 3,
    padding: 4,
  },
  docGridCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  docGridIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  docGridName: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
    height: 28,
  },
  docGridSize: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  storageCard: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  storageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  storageTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  storageBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  storageFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  storageUsed: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  storagePercent: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.secondary,
  },
});
