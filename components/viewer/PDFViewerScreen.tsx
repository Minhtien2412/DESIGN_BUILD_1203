/**
 * PDFViewerScreen.tsx
 *
 * Full-featured PDF viewer with navigation, search, bookmarks,
 * thumbnails, zoom controls, and night mode.
 *
 * Story: VIEW-001 - PDF Viewer
 */

import { Ionicons } from "@expo/vector-icons";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Bookmark,
    calculateProgress,
    formatPageRange,
    PDFViewerSettings,
    SearchResult,
    usePDFSearch,
    usePDFSettings,
    usePDFViewer,
    ZOOM_CONSTRAINTS
} from "../../services/PDFViewerService";

// ============================================================================
// Types
// ============================================================================

interface PDFViewerScreenProps {
  uri: string;
  filename?: string;
  totalPages: number;
  onClose?: () => void;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => Promise<SearchResult[]>;
}

// ============================================================================
// Constants
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  primary: "#007AFF",
  background: "#FFFFFF",
  backgroundDark: "#1C1C1E",
  surface: "#F2F2F7",
  surfaceDark: "#2C2C2E",
  text: "#000000",
  textDark: "#FFFFFF",
  textSecondary: "#8E8E93",
  border: "#E5E5EA",
  borderDark: "#3A3A3C",
  overlay: "rgba(0,0,0,0.5)",
  success: "#34C759",
  warning: "#FF9500",
};

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Top toolbar with navigation and actions
 */
interface ToolbarProps {
  filename: string;
  currentPage: number;
  totalPages: number;
  nightMode: boolean;
  onClose: () => void;
  onSearch: () => void;
  onBookmark: () => void;
  onThumbnails: () => void;
  onSettings: () => void;
  onShare: () => void;
  isBookmarked: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  filename,
  currentPage,
  totalPages,
  nightMode,
  onClose,
  onSearch,
  onBookmark,
  onThumbnails,
  onSettings,
  onShare,
  isBookmarked,
}) => {
  const bgColor = nightMode ? COLORS.backgroundDark : COLORS.background;
  const textColor = nightMode ? COLORS.textDark : COLORS.text;

  return (
    <View style={[styles.toolbar, { backgroundColor: bgColor }]}>
      <TouchableOpacity style={styles.toolbarButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={textColor} />
      </TouchableOpacity>

      <View style={styles.toolbarCenter}>
        <Text
          style={[styles.toolbarTitle, { color: textColor }]}
          numberOfLines={1}
        >
          {filename}
        </Text>
        <Text style={[styles.toolbarSubtitle, { color: COLORS.textSecondary }]}>
          {formatPageRange(currentPage, totalPages)}
        </Text>
      </View>

      <View style={styles.toolbarActions}>
        <TouchableOpacity style={styles.toolbarButton} onPress={onSearch}>
          <Ionicons name="search" size={22} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isBookmarked ? COLORS.warning : textColor}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onThumbnails}>
          <Ionicons name="grid-outline" size={22} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onShare}>
          <Ionicons name="share-outline" size={22} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onSettings}>
          <Ionicons name="settings-outline" size={22} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Bottom navigation bar
 */
interface NavigationBarProps {
  currentPage: number;
  totalPages: number;
  nightMode: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  currentPage,
  totalPages,
  nightMode,
  onPrev,
  onNext,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  zoom,
}) => {
  const bgColor = nightMode ? COLORS.backgroundDark : COLORS.background;
  const textColor = nightMode ? COLORS.textDark : COLORS.text;
  const progress = calculateProgress(currentPage, totalPages);

  return (
    <View style={[styles.navigationBar, { backgroundColor: bgColor }]}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%`, backgroundColor: COLORS.primary },
          ]}
        />
      </View>

      <View style={styles.navigationContent}>
        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onZoomOut}
            disabled={zoom <= ZOOM_CONSTRAINTS.MIN}
          >
            <Ionicons
              name="remove-circle-outline"
              size={24}
              color={
                zoom <= ZOOM_CONSTRAINTS.MIN ? COLORS.textSecondary : textColor
              }
            />
          </TouchableOpacity>
          <Text style={[styles.zoomText, { color: textColor }]}>
            {Math.round(zoom * 100)}%
          </Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onZoomIn}
            disabled={zoom >= ZOOM_CONSTRAINTS.MAX}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={
                zoom >= ZOOM_CONSTRAINTS.MAX ? COLORS.textSecondary : textColor
              }
            />
          </TouchableOpacity>
        </View>

        {/* Page navigation */}
        <View style={styles.pageNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onPrev}
            disabled={currentPage <= 1}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={currentPage <= 1 ? COLORS.textSecondary : textColor}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.pageIndicator} onPress={onGoToPage}>
            <Text style={[styles.pageText, { color: textColor }]}>
              {currentPage} / {totalPages}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={onNext}
            disabled={currentPage >= totalPages}
          >
            <Ionicons
              name="chevron-forward"
              size={28}
              color={
                currentPage >= totalPages ? COLORS.textSecondary : textColor
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/**
 * Go to page modal
 */
interface GoToPageModalProps {
  visible: boolean;
  currentPage: number;
  totalPages: number;
  nightMode: boolean;
  onClose: () => void;
  onGoToPage: (page: number) => void;
}

const GoToPageModal: React.FC<GoToPageModalProps> = ({
  visible,
  currentPage,
  totalPages,
  nightMode,
  onClose,
  onGoToPage,
}) => {
  const [page, setPage] = useState(String(currentPage));
  const bgColor = nightMode ? COLORS.surfaceDark : COLORS.surface;
  const textColor = nightMode ? COLORS.textDark : COLORS.text;
  const inputBgColor = nightMode ? COLORS.backgroundDark : COLORS.background;

  useEffect(() => {
    if (visible) {
      setPage(String(currentPage));
    }
  }, [visible, currentPage]);

  const handleSubmit = () => {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onGoToPage(pageNum);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Đi đến trang
          </Text>

          <View style={styles.goToPageInput}>
            <TextInput
              style={[
                styles.pageInput,
                { backgroundColor: inputBgColor, color: textColor },
              ]}
              value={page}
              onChangeText={setPage}
              keyboardType="number-pad"
              selectTextOnFocus
              autoFocus
              maxLength={String(totalPages).length}
            />
            <Text
              style={[styles.totalPagesText, { color: COLORS.textSecondary }]}
            >
              / {totalPages}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: COLORS.textSecondary },
                ]}
              >
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleSubmit}
            >
              <Text style={[styles.modalButtonText, { color: COLORS.primary }]}>
                Đi đến
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Search modal
 */
interface SearchModalProps {
  visible: boolean;
  nightMode: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  results: SearchResult[];
  currentIndex: number;
  totalMatches: number;
  isSearching: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSelectResult: (result: SearchResult) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  nightMode,
  onClose,
  onSearch,
  results,
  currentIndex,
  totalMatches,
  isSearching,
  onNext,
  onPrev,
  onSelectResult,
}) => {
  const [query, setQuery] = useState("");
  const bgColor = nightMode ? COLORS.backgroundDark : COLORS.background;
  const textColor = nightMode ? COLORS.textDark : COLORS.text;
  const inputBgColor = nightMode ? COLORS.surfaceDark : COLORS.surface;

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.searchModal, { backgroundColor: bgColor }]}>
        {/* Search header */}
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>

          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: inputBgColor },
            ]}
          >
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm kiếm trong PDF..."
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={handleSearch}>
            <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
              Tìm
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search status */}
        {isSearching && (
          <View style={styles.searchStatus}>
            <ActivityIndicator color={COLORS.primary} />
            <Text
              style={[styles.searchStatusText, { color: COLORS.textSecondary }]}
            >
              Đang tìm kiếm...
            </Text>
          </View>
        )}

        {!isSearching && totalMatches > 0 && (
          <View style={styles.searchNavigation}>
            <Text style={[styles.searchResultCount, { color: textColor }]}>
              {currentIndex + 1} / {totalMatches} kết quả
            </Text>
            <View style={styles.searchNavButtons}>
              <TouchableOpacity
                style={styles.searchNavButton}
                onPress={onPrev}
                disabled={totalMatches <= 1}
              >
                <Ionicons
                  name="chevron-up"
                  size={24}
                  color={totalMatches <= 1 ? COLORS.textSecondary : textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchNavButton}
                onPress={onNext}
                disabled={totalMatches <= 1}
              >
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={totalMatches <= 1 ? COLORS.textSecondary : textColor}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isSearching && totalMatches === 0 && query.length > 0 && (
          <View style={styles.noResults}>
            <Ionicons
              name="search-outline"
              size={48}
              color={COLORS.textSecondary}
            />
            <Text
              style={[styles.noResultsText, { color: COLORS.textSecondary }]}
            >
              Không tìm thấy kết quả
            </Text>
          </View>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.pageNumber}-${index}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.searchResultItem,
                  index === currentIndex && styles.searchResultItemActive,
                ]}
                onPress={() => onSelectResult(item)}
              >
                <View style={styles.searchResultPage}>
                  <Text
                    style={[
                      styles.searchResultPageText,
                      { color: COLORS.primary },
                    ]}
                  >
                    {item.pageNumber}
                  </Text>
                </View>
                <Text
                  style={[styles.searchResultText, { color: textColor }]}
                  numberOfLines={2}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

/**
 * Thumbnails modal
 */
interface ThumbnailsModalProps {
  visible: boolean;
  totalPages: number;
  currentPage: number;
  bookmarks: Bookmark[];
  nightMode: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
}

const ThumbnailsModal: React.FC<ThumbnailsModalProps> = ({
  visible,
  totalPages,
  currentPage,
  bookmarks,
  nightMode,
  onClose,
  onSelectPage,
}) => {
  const bgColor = nightMode ? COLORS.backgroundDark : COLORS.background;
  const textColor = nightMode ? COLORS.textDark : COLORS.text;
  const [activeTab, setActiveTab] = useState<"pages" | "bookmarks">("pages");

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const bookmarkedPages = useMemo(() => {
    return new Set(bookmarks.map((b) => b.pageNumber));
  }, [bookmarks]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.thumbnailsModal, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.thumbnailsHeader}>
          <Text style={[styles.thumbnailsTitle, { color: textColor }]}>
            Trang
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.thumbnailsTabs}>
          <TouchableOpacity
            style={[
              styles.thumbnailsTab,
              activeTab === "pages" && styles.thumbnailsTabActive,
            ]}
            onPress={() => setActiveTab("pages")}
          >
            <Text
              style={[
                styles.thumbnailsTabText,
                {
                  color:
                    activeTab === "pages"
                      ? COLORS.primary
                      : COLORS.textSecondary,
                },
              ]}
            >
              Tất cả trang
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.thumbnailsTab,
              activeTab === "bookmarks" && styles.thumbnailsTabActive,
            ]}
            onPress={() => setActiveTab("bookmarks")}
          >
            <Text
              style={[
                styles.thumbnailsTabText,
                {
                  color:
                    activeTab === "bookmarks"
                      ? COLORS.primary
                      : COLORS.textSecondary,
                },
              ]}
            >
              Đánh dấu ({bookmarks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pages grid */}
        {activeTab === "pages" && (
          <FlatList
            data={pages}
            numColumns={4}
            keyExtractor={(item) => String(item)}
            contentContainerStyle={styles.thumbnailsGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.thumbnailItem,
                  item === currentPage && styles.thumbnailItemCurrent,
                ]}
                onPress={() => {
                  onSelectPage(item);
                  onClose();
                }}
              >
                <View
                  style={[
                    styles.thumbnailPlaceholder,
                    {
                      backgroundColor: nightMode
                        ? COLORS.surfaceDark
                        : COLORS.surface,
                    },
                  ]}
                >
                  <Text style={[styles.thumbnailPageNum, { color: textColor }]}>
                    {item}
                  </Text>
                  {bookmarkedPages.has(item) && (
                    <View style={styles.thumbnailBookmark}>
                      <Ionicons
                        name="bookmark"
                        size={14}
                        color={COLORS.warning}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Bookmarks list */}
        {activeTab === "bookmarks" && (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.bookmarksList}
            ListEmptyComponent={
              <View style={styles.emptyBookmarks}>
                <Ionicons
                  name="bookmark-outline"
                  size={48}
                  color={COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.emptyBookmarksText,
                    { color: COLORS.textSecondary },
                  ]}
                >
                  Chưa có trang đánh dấu
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.bookmarkItem}
                onPress={() => {
                  onSelectPage(item.pageNumber);
                  onClose();
                }}
              >
                <View
                  style={[
                    styles.bookmarkColor,
                    { backgroundColor: item.color },
                  ]}
                />
                <View style={styles.bookmarkInfo}>
                  <Text style={[styles.bookmarkPage, { color: textColor }]}>
                    Trang {item.pageNumber}
                  </Text>
                  {item.label && (
                    <Text
                      style={[
                        styles.bookmarkLabel,
                        { color: COLORS.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

/**
 * Settings modal
 */
interface SettingsModalProps {
  visible: boolean;
  settings: PDFViewerSettings;
  onClose: () => void;
  onUpdateSettings: (updates: Partial<PDFViewerSettings>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const nightMode = settings.nightMode;
  const bgColor = nightMode ? COLORS.backgroundDark : COLORS.background;
  const textColor = nightMode ? COLORS.textDark : COLORS.text;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.settingsModal, { backgroundColor: bgColor }]}>
        <View style={styles.settingsHeader}>
          <Text style={[styles.settingsTitle, { color: textColor }]}>
            Cài đặt
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContent}>
          {/* Display section */}
          <Text
            style={[styles.settingsSection, { color: COLORS.textSecondary }]}
          >
            HIỂN THỊ
          </Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              Chế độ tối
            </Text>
            <TouchableOpacity
              style={[
                styles.settingToggle,
                settings.nightMode && styles.settingToggleActive,
              ]}
              onPress={() =>
                onUpdateSettings({ nightMode: !settings.nightMode })
              }
            >
              <View
                style={[
                  styles.settingToggleThumb,
                  settings.nightMode && styles.settingToggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              Hiện số trang
            </Text>
            <TouchableOpacity
              style={[
                styles.settingToggle,
                settings.showPageNumbers && styles.settingToggleActive,
              ]}
              onPress={() =>
                onUpdateSettings({ showPageNumbers: !settings.showPageNumbers })
              }
            >
              <View
                style={[
                  styles.settingToggleThumb,
                  settings.showPageNumbers && styles.settingToggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Scroll direction */}
          <Text
            style={[styles.settingsSection, { color: COLORS.textSecondary }]}
          >
            CUỘN TRANG
          </Text>

          <View style={styles.settingOptions}>
            <TouchableOpacity
              style={[
                styles.settingOption,
                settings.scrollDirection === "vertical" &&
                  styles.settingOptionActive,
              ]}
              onPress={() => onUpdateSettings({ scrollDirection: "vertical" })}
            >
              <Ionicons
                name="arrow-down"
                size={20}
                color={
                  settings.scrollDirection === "vertical"
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.settingOptionText,
                  {
                    color:
                      settings.scrollDirection === "vertical"
                        ? COLORS.primary
                        : textColor,
                  },
                ]}
              >
                Dọc
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingOption,
                settings.scrollDirection === "horizontal" &&
                  styles.settingOptionActive,
              ]}
              onPress={() =>
                onUpdateSettings({ scrollDirection: "horizontal" })
              }
            >
              <Ionicons
                name="arrow-forward"
                size={20}
                color={
                  settings.scrollDirection === "horizontal"
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.settingOptionText,
                  {
                    color:
                      settings.scrollDirection === "horizontal"
                        ? COLORS.primary
                        : textColor,
                  },
                ]}
              >
                Ngang
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fit mode */}
          <Text
            style={[styles.settingsSection, { color: COLORS.textSecondary }]}
          >
            TỰ ĐỘNG CĂN
          </Text>

          <View style={styles.settingOptions}>
            <TouchableOpacity
              style={[
                styles.settingOption,
                settings.fitMode === "width" && styles.settingOptionActive,
              ]}
              onPress={() => onUpdateSettings({ fitMode: "width" })}
            >
              <Text
                style={[
                  styles.settingOptionText,
                  {
                    color:
                      settings.fitMode === "width" ? COLORS.primary : textColor,
                  },
                ]}
              >
                Chiều rộng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingOption,
                settings.fitMode === "height" && styles.settingOptionActive,
              ]}
              onPress={() => onUpdateSettings({ fitMode: "height" })}
            >
              <Text
                style={[
                  styles.settingOptionText,
                  {
                    color:
                      settings.fitMode === "height"
                        ? COLORS.primary
                        : textColor,
                  },
                ]}
              >
                Chiều cao
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingOption,
                settings.fitMode === "page" && styles.settingOptionActive,
              ]}
              onPress={() => onUpdateSettings({ fitMode: "page" })}
            >
              <Text
                style={[
                  styles.settingOptionText,
                  {
                    color:
                      settings.fitMode === "page" ? COLORS.primary : textColor,
                  },
                ]}
              >
                Toàn trang
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reading section */}
          <Text
            style={[styles.settingsSection, { color: COLORS.textSecondary }]}
          >
            ĐỌC
          </Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              Giữ màn hình sáng
            </Text>
            <TouchableOpacity
              style={[
                styles.settingToggle,
                settings.keepScreenAwake && styles.settingToggleActive,
              ]}
              onPress={() =>
                onUpdateSettings({ keepScreenAwake: !settings.keepScreenAwake })
              }
            >
              <View
                style={[
                  styles.settingToggleThumb,
                  settings.keepScreenAwake && styles.settingToggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: textColor }]}>
              Zoom khi double tap
            </Text>
            <TouchableOpacity
              style={[
                styles.settingToggle,
                settings.enableDoubleTapZoom && styles.settingToggleActive,
              ]}
              onPress={() =>
                onUpdateSettings({
                  enableDoubleTapZoom: !settings.enableDoubleTapZoom,
                })
              }
            >
              <View
                style={[
                  styles.settingToggleThumb,
                  settings.enableDoubleTapZoom &&
                    styles.settingToggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

/**
 * PDF placeholder (represents where react-native-pdf would render)
 */
interface PDFPlaceholderProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  nightMode: boolean;
  onPageChange: (page: number) => void;
}

const PDFPlaceholder: React.FC<PDFPlaceholderProps> = ({
  currentPage,
  totalPages,
  zoom,
  nightMode,
  onPageChange,
}) => {
  const bgColor = nightMode ? "#2C2C2E" : "#F5F5F5";
  const textColor = nightMode ? "#FFFFFF" : "#000000";

  return (
    <View style={[styles.pdfContainer, { backgroundColor: bgColor }]}>
      <View
        style={[
          styles.pdfPage,
          {
            transform: [{ scale: zoom }],
            backgroundColor: nightMode ? "#3A3A3C" : "#FFFFFF",
          },
        ]}
      >
        <Text style={[styles.pdfPageText, { color: textColor }]}>
          Trang {currentPage}
        </Text>
        <Text
          style={[styles.pdfPlaceholderText, { color: COLORS.textSecondary }]}
        >
          PDF content would render here
        </Text>
        <Text
          style={[styles.pdfPlaceholderText, { color: COLORS.textSecondary }]}
        >
          using react-native-pdf
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const PDFViewerScreen: React.FC<PDFViewerScreenProps> = ({
  uri,
  filename = "document.pdf",
  totalPages,
  onClose,
  onPageChange,
  onSearch,
}) => {
  // Viewer state
  const {
    currentPage,
    zoom,
    isLoading,
    bookmarks,
    settings,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    toggleBookmark,
    isCurrentPageBookmarked,
  } = usePDFViewer(uri, totalPages);

  // Search state
  const searchState = usePDFSearch();

  // Settings hook
  const { updateSettings } = usePDFSettings();

  // Modals
  const [showGoToPage, setShowGoToPage] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Toolbar visibility
  const [showToolbar, setShowToolbar] = useState(true);
  const toolbarOpacity = useRef(new Animated.Value(1)).current;

  // Handle close
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Handle page change
  const handleGoToPage = useCallback(
    (page: number) => {
      goToPage(page);
      onPageChange?.(page);
    },
    [goToPage, onPageChange]
  );

  // Handle search
  const handleSearch = useCallback(
    async (query: string) => {
      searchState.startSearch(query);
      if (onSearch) {
        const results = await onSearch(query);
        searchState.search(query, results);
        if (results.length > 0) {
          handleGoToPage(results[0].pageNumber);
        }
      } else {
        // Mock search for testing
        searchState.search(query, []);
      }
    },
    [onSearch, searchState, handleGoToPage]
  );

  // Handle search result selection
  const handleSelectSearchResult = useCallback(
    (result: SearchResult) => {
      handleGoToPage(result.pageNumber);
    },
    [handleGoToPage]
  );

  // Handle share
  const handleShare = useCallback(() => {
    Alert.alert("Chia sẻ", "Chia sẻ PDF đang được phát triển");
  }, []);

  // Handle bookmark
  const handleBookmark = useCallback(async () => {
    const isMarked = await toggleBookmark();
    // Toast or feedback could be added here
  }, [toggleBookmark]);

  // Toggle toolbar
  const toggleToolbar = useCallback(() => {
    const toValue = showToolbar ? 0 : 1;
    Animated.timing(toolbarOpacity, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowToolbar(!showToolbar);
  }, [showToolbar, toolbarOpacity]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải PDF...</Text>
      </View>
    );
  }

  const nightMode = settings.nightMode;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: nightMode ? "#000" : "#FFF" },
      ]}
    >
      <StatusBar barStyle={nightMode ? "light-content" : "dark-content"} />

      {/* PDF Content */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.contentArea}
        onPress={toggleToolbar}
      >
        <PDFPlaceholder
          currentPage={currentPage}
          totalPages={totalPages}
          zoom={zoom}
          nightMode={nightMode}
          onPageChange={handleGoToPage}
        />
      </TouchableOpacity>

      {/* Toolbar */}
      <Animated.View
        style={[styles.toolbarContainer, { opacity: toolbarOpacity }]}
      >
        <Toolbar
          filename={filename}
          currentPage={currentPage}
          totalPages={totalPages}
          nightMode={nightMode}
          onClose={handleClose}
          onSearch={() => setShowSearch(true)}
          onBookmark={handleBookmark}
          onThumbnails={() => setShowThumbnails(true)}
          onSettings={() => setShowSettings(true)}
          onShare={handleShare}
          isBookmarked={isCurrentPageBookmarked()}
        />
      </Animated.View>

      {/* Navigation Bar */}
      <Animated.View
        style={[styles.navBarContainer, { opacity: toolbarOpacity }]}
      >
        <NavigationBar
          currentPage={currentPage}
          totalPages={totalPages}
          nightMode={nightMode}
          onPrev={prevPage}
          onNext={nextPage}
          onGoToPage={() => setShowGoToPage(true)}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          zoom={zoom}
        />
      </Animated.View>

      {/* Modals */}
      <GoToPageModal
        visible={showGoToPage}
        currentPage={currentPage}
        totalPages={totalPages}
        nightMode={nightMode}
        onClose={() => setShowGoToPage(false)}
        onGoToPage={handleGoToPage}
      />

      <SearchModal
        visible={showSearch}
        nightMode={nightMode}
        onClose={() => setShowSearch(false)}
        onSearch={handleSearch}
        results={searchState.results}
        currentIndex={searchState.currentIndex}
        totalMatches={searchState.totalMatches}
        isSearching={searchState.isSearching}
        onNext={searchState.next}
        onPrev={searchState.prev}
        onSelectResult={handleSelectSearchResult}
      />

      <ThumbnailsModal
        visible={showThumbnails}
        totalPages={totalPages}
        currentPage={currentPage}
        bookmarks={bookmarks}
        nightMode={nightMode}
        onClose={() => setShowThumbnails(false)}
        onSelectPage={handleGoToPage}
      />

      <SettingsModal
        visible={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onUpdateSettings={updateSettings}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  contentArea: {
    flex: 1,
  },

  // Toolbar
  toolbarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 20,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  toolbarButton: {
    padding: 8,
  },
  toolbarCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  toolbarSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toolbarActions: {
    flexDirection: "row",
  },

  // Navigation bar
  navBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navigationBar: {
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  progressContainer: {
    height: 3,
    backgroundColor: COLORS.border,
  },
  progressBar: {
    height: "100%",
  },
  navigationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  zoomControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  zoomText: {
    fontSize: 14,
    marginHorizontal: 8,
    minWidth: 45,
    textAlign: "center",
  },
  pageNavigation: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    padding: 8,
  },
  pageIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Go to page modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.8,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  goToPageInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pageInput: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    width: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  totalPagesText: {
    fontSize: 24,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Search modal
  searchModal: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 20,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  searchStatusText: {
    fontSize: 14,
  },
  searchNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  searchResultCount: {
    fontSize: 14,
  },
  searchNavButtons: {
    flexDirection: "row",
    gap: 8,
  },
  searchNavButton: {
    padding: 4,
  },
  noResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  noResultsText: {
    fontSize: 16,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  searchResultItemActive: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  searchResultPage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchResultPageText: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Thumbnails modal
  thumbnailsModal: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 20,
  },
  thumbnailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  thumbnailsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  thumbnailsTabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  thumbnailsTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  thumbnailsTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  thumbnailsTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  thumbnailsGrid: {
    padding: 8,
  },
  thumbnailItem: {
    width: (SCREEN_WIDTH - 48) / 4,
    aspectRatio: 0.75,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnailItemCurrent: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumbnailPageNum: {
    fontSize: 16,
    fontWeight: "600",
  },
  thumbnailBookmark: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  bookmarksList: {
    padding: 16,
  },
  emptyBookmarks: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyBookmarksText: {
    fontSize: 16,
  },
  bookmarkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  bookmarkColor: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkPage: {
    fontSize: 16,
    fontWeight: "500",
  },
  bookmarkLabel: {
    fontSize: 14,
    marginTop: 2,
  },

  // Settings modal
  settingsModal: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 20,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingsContent: {
    flex: 1,
    padding: 16,
  },
  settingsSection: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingToggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    padding: 2,
  },
  settingToggleActive: {
    backgroundColor: COLORS.success,
  },
  settingToggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  settingToggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  settingOptions: {
    flexDirection: "row",
    gap: 12,
  },
  settingOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  settingOptionActive: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  settingOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // PDF placeholder
  pdfContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pdfPage: {
    width: SCREEN_WIDTH - 40,
    height: (SCREEN_WIDTH - 40) * 1.4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfPageText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  pdfPlaceholderText: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default PDFViewerScreen;
