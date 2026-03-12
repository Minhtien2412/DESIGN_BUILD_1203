import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems?: number;
  /** Items per page */
  pageSize?: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page sizes */
  pageSizes?: number[];
  /** Show page size selector */
  showPageSizeSelector?: boolean;
  /** Show jump to page input */
  showJumpToPage?: boolean;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Show page info (e.g., "Trang 1/10") */
  showPageInfo?: boolean;
  /** Show item range (e.g., "1-20 của 150") */
  showItemRange?: boolean;
}

/**
 * Enhanced Pagination Component
 * 
 * Features:
 * - Previous/Next navigation
 * - First/Last page buttons (optional)
 * - Page size selector (optional)
 * - Jump to page input (optional)
 * - Page info display
 * - Item range display
 * - Theme support
 * 
 * Usage:
 * ```tsx
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   totalItems={total}
 *   pageSize={20}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 *   showPageSizeSelector
 *   showJumpToPage
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 20, 50, 100],
  showPageSizeSelector = false,
  showJumpToPage = false,
  showFirstLast = false,
  showPageInfo = true,
  showItemRange = true,
}: PaginationProps) {
  const [showPageSizeModal, setShowPageSizeModal] = useState(false);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [jumpToPage, setJumpToPage] = useState('');

  const colors = {
    background: useThemeColor({}, 'background'),
    surface: useThemeColor({}, 'surface'),
    text: useThemeColor({}, 'text'),
    textSecondary: useThemeColor({}, 'textMuted'),
    border: useThemeColor({}, 'border'),
    primary: useThemeColor({}, 'primary'),
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  // Calculate item range
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems
    ? Math.min(currentPage * pageSize, totalItems)
    : 0;

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage('');
      setShowJumpModal(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      {/* Top Row: Page Info + Page Size Selector */}
      <View style={styles.topRow}>
        {/* Page Info */}
        {(showPageInfo || showItemRange) && (
          <View style={styles.infoContainer}>
            {showItemRange && totalItems !== undefined && (
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {totalItems > 0
                  ? `${startItem}-${endItem} của ${totalItems}`
                  : 'Không có dữ liệu'}
              </Text>
            )}
            {showPageInfo && (
              <Text
                style={[
                  styles.pageInfo,
                  { color: colors.textSecondary },
                ]}
              >
                Trang {currentPage}/{totalPages || 1}
              </Text>
            )}
          </View>
        )}

        {/* Page Size Selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <TouchableOpacity
            style={[
              styles.pageSizeButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowPageSizeModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pageSizeText, { color: colors.text }]}>
              {pageSize}/trang
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Row: Navigation Buttons */}
      <View style={styles.navigationRow}>
        {/* First Page Button */}
        {showFirstLast && (
          <TouchableOpacity
            style={[
              styles.navButton,
              isFirstPage && styles.navButtonDisabled,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => onPageChange(1)}
            disabled={isFirstPage}
            activeOpacity={0.7}
          >
            <Ionicons
              name="play-back"
              size={16}
              color={isFirstPage ? colors.border : colors.primary}
            />
          </TouchableOpacity>
        )}

        {/* Previous Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            isFirstPage && styles.navButtonDisabled,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={isFirstPage ? colors.border : colors.primary}
          />
          <Text
            style={[
              styles.navButtonText,
              {
                color: isFirstPage ? colors.border : colors.primary,
              },
            ]}
          >
            Trước
          </Text>
        </TouchableOpacity>

        {/* Jump to Page Button */}
        {showJumpToPage && (
          <TouchableOpacity
            style={[
              styles.jumpButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowJumpModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.jumpButtonText, { color: colors.text }]}>
              {currentPage}
            </Text>
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            isLastPage && styles.navButtonDisabled,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.navButtonText,
              {
                color: isLastPage ? colors.border : colors.primary,
              },
            ]}
          >
            Sau
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isLastPage ? colors.border : colors.primary}
          />
        </TouchableOpacity>

        {/* Last Page Button */}
        {showFirstLast && (
          <TouchableOpacity
            style={[
              styles.navButton,
              isLastPage && styles.navButtonDisabled,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => onPageChange(totalPages)}
            disabled={isLastPage}
            activeOpacity={0.7}
          >
            <Ionicons
              name="play-forward"
              size={16}
              color={isLastPage ? colors.border : colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Page Size Selector Modal */}
      <Modal
        visible={showPageSizeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPageSizeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPageSizeModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Số mục mỗi trang
            </Text>
            <ScrollView style={styles.optionsList}>
              {pageSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionItem,
                    size === pageSize && {
                      backgroundColor: colors.primary + '20',
                    },
                  ]}
                  onPress={() => {
                    onPageSizeChange?.(size);
                    setShowPageSizeModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          size === pageSize ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    {size} mục
                  </Text>
                  {size === pageSize && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Jump to Page Modal */}
      <Modal
        visible={showJumpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJumpModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowJumpModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Chuyển đến trang
            </Text>
            <TextInput
              style={[
                styles.jumpInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={`1-${totalPages}`}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={jumpToPage}
              onChangeText={setJumpToPage}
              onSubmitEditing={handleJumpToPage}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonCancel,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setJumpToPage('');
                  setShowJumpModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleJumpToPage}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Chuyển
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: 12,
  },
  pageSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  pageSizeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 44,
    justifyContent: 'center',
  },
  navButtonPrimary: {
    minWidth: 80,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 60,
    justifyContent: 'center',
  },
  jumpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  jumpInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
