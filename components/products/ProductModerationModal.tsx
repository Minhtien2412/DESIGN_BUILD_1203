import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { Product } from '@/data/products';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

/**
 * ProductModerationModal - Admin moderation interface
 * Approve or reject pending products
 */

interface ProductModerationModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onApprove: (productId: string) => void;
  onReject: (productId: string, reason: string) => void;
}

export function ProductModerationModal({
  visible,
  product,
  onClose,
  onApprove,
  onReject,
}: ProductModerationModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const surface = useThemeColor({}, 'surface');
  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accent = useThemeColor({}, 'accent');
  const success = '#0D9488';
  const danger = '#000000';
  const warning = '#0D9488';

  if (!product) return null;

  const handleApprove = () => {
    Alert.alert(
      'Xác nhận duyệt',
      `Duyệt sản phẩm "${product.name}"?\n\nSản phẩm sẽ được hiển thị công khai.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          style: 'default',
          onPress: () => {
            onApprove(product.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập lý do từ chối');
      return;
    }

    Alert.alert(
      'Xác nhận từ chối',
      `Từ chối sản phẩm "${product.name}"?\n\nLý do: ${rejectionReason}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => {
            onReject(product.id, rejectionReason);
            setRejectionReason('');
            setShowRejectInput(false);
            onClose();
          },
        },
      ]
    );
  };

  const getStatusInfo = () => {
    switch (product.status) {
      case 'APPROVED':
        return { label: 'Đã duyệt', color: success, icon: 'checkmark-circle' };
      case 'REJECTED':
        return { label: 'Đã từ chối', color: danger, icon: 'close-circle' };
      default:
        return { label: 'Chờ duyệt', color: warning, icon: 'time' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="shield-checkmark" size={24} color={accent} />
              <ThemedText type="subtitle">Kiểm duyệt sản phẩm</ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={textMuted} />
            </Pressable>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={20} color={statusInfo.color} />
            <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </ThemedText>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              {product.name}
            </ThemedText>
            <View style={styles.infoRow}>
              <Ionicons name="pricetag" size={16} color={textMuted} />
              <ThemedText style={{ color: textMuted, fontSize: 13 }}>
                {new Intl.NumberFormat('vi-VN').format(product.price)} ₫
              </ThemedText>
            </View>
            {product.category && (
              <View style={styles.infoRow}>
                <Ionicons name="grid" size={16} color={textMuted} />
                <ThemedText style={{ color: textMuted, fontSize: 13 }}>
                  {product.category}
                </ThemedText>
              </View>
            )}
            {product.createdAt && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color={textMuted} />
                <ThemedText style={{ color: textMuted, fontSize: 13 }}>
                  {new Date(product.createdAt).toLocaleString('vi-VN')}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Rejection Reason (if rejected) */}
          {product.status === 'REJECTED' && (product as any).rejectionReason && (
            <View style={[styles.rejectionBox, { backgroundColor: danger + '15', borderColor: danger + '30' }]}>
              <View style={styles.infoRow}>
                <Ionicons name="alert-circle" size={16} color={danger} />
                <ThemedText style={[styles.rejectionLabel, { color: danger }]}>
                  Lý do từ chối:
                </ThemedText>
              </View>
              <ThemedText style={[styles.rejectionText, { color: text }]}>
                {(product as any).rejectionReason}
              </ThemedText>
            </View>
          )}

          {/* Review Info (if reviewed) */}
          {(product as any).reviewedAt && (
            <View style={[styles.reviewInfo, { backgroundColor: border }]}>
              <ThemedText style={{ fontSize: 12, color: textMuted }}>
                Đã kiểm duyệt: {new Date((product as any).reviewedAt).toLocaleString('vi-VN')}
              </ThemedText>
            </View>
          )}

          {/* Reject Input */}
          {showRejectInput && (
            <View style={styles.rejectInputContainer}>
              <ThemedText style={[styles.inputLabel, { color: text }]}>
                Lý do từ chối:
              </ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: background, borderColor: border, color: text }]}
                placeholder="Nhập lý do từ chối sản phẩm này..."
                placeholderTextColor={textMuted}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
                autoFocus
              />
            </View>
          )}

          {/* Actions */}
          {product.status === 'PENDING' && (
            <View style={styles.actions}>
              {!showRejectInput ? (
                <>
                  <Pressable
                    style={[styles.actionBtn, styles.rejectBtn, { backgroundColor: danger }]}
                    onPress={() => setShowRejectInput(true)}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <ThemedText style={styles.actionBtnText}>Từ chối</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.approveBtn, { backgroundColor: success }]}
                    onPress={handleApprove}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <ThemedText style={styles.actionBtnText}>Duyệt</ThemedText>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: border }]}
                    onPress={() => {
                      setShowRejectInput(false);
                      setRejectionReason('');
                    }}
                  >
                    <ThemedText style={{ color: text }}>Hủy</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: danger }]}
                    onPress={handleReject}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <ThemedText style={styles.actionBtnText}>Xác nhận từ chối</ThemedText>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {/* Close button for approved/rejected */}
          {product.status !== 'PENDING' && (
            <Pressable style={[styles.singleActionBtn, { backgroundColor: accent }]} onPress={onClose}>
              <ThemedText style={styles.actionBtnText}>Đóng</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productInfo: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  rejectionBox: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  rejectionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  rejectionText: {
    fontSize: 13,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  reviewInfo: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  rejectInputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  approveBtn: {
    flex: 1.2,
  },
  rejectBtn: {
    flex: 0.8,
  },
  singleActionBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
