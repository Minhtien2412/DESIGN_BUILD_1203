/**
 * Material Estimation Screen
 * AI-generated material quantity estimates
 */

import { useDS } from '@/hooks/useDS';
import { useMaterialEstimation } from '@/hooks/useAI';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MaterialEstimationScreen() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const { colors, spacing, radius } = useDS();

  const { result, loading, error } = useMaterialEstimation();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Chưa có ước tính
      </Text>
      <Text style={styles.emptyText}>
        Sử dụng AI để ước tính số lượng vật liệu cần thiết
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => {
          // Navigate to analysis screen
        }}
      >
        <Ionicons name="camera" size={20} color={colors.textInverse} />
        <Text style={styles.buttonText}>Phân tích ảnh</Text>
      </TouchableOpacity>
    </View>
  );

  if (!result) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Ước tính vật liệu',
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          {renderEmpty()}
        </View>
      </>
    );
  }

  const totalCost =
    result.materials?.reduce(
      (sum, m) => sum + (m.estimatedQuantity || 0) * (m.unitPrice || 0),
      0
    ) || 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ước tính vật liệu',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Tổng quan ước tính
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="cube" size={32} color={colors.primary} />
              <Text style={styles.summaryValue}>
                {result.materials?.length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Loại vật liệu</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={32} color={colors.primary} />
              <Text style={styles.summaryValue}>
                {(totalCost / 1000000).toFixed(1)}M
              </Text>
              <Text style={styles.summaryLabel}>Ước tính giá</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons
                name="speedometer"
                size={32}
                color={(result.confidenceScore || 0.8) > 0.7 ? colors.primary : colors.primary}
              />
              <Text style={styles.summaryValue}>
                {Math.round((result.confidenceScore || 0.8) * 100)}%
              </Text>
              <Text style={styles.summaryLabel}>Độ tin cậy</Text>
            </View>
          </View>
        </View>

        {/* Materials List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Danh sách vật liệu
          </Text>
          {result.materials?.map((material, index) => (
            <View key={index} style={styles.materialCard}>
              <View style={styles.materialHeader}>
                <Text style={[styles.materialName, { color: colors.text }]}>
                  {material.name}
                </Text>
                {material.category && (
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Text style={[styles.categoryText, { color: colors.primary }]}>
                      {material.category}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.materialDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="layers-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>Số lượng ước tính:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {material.estimatedQuantity} {material.unit}
                  </Text>
                </View>

                {material.unitPrice && (
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailLabel}>Đơn giá:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {material.unitPrice.toLocaleString('vi-VN')} ₫/{material.unit}
                    </Text>
                  </View>
                )}

                {material.unitPrice && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calculator-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailLabel}>Thành tiền:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        styles.priceValue,
                        { color: colors.primary },
                      ]}
                    >
                      {(
                        material.estimatedQuantity * material.unitPrice
                      ).toLocaleString('vi-VN')}{' '}
                      ₫
                    </Text>
                  </View>
                )}

                {material.specifications && (
                  <View style={styles.specsRow}>
                    <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.specsText}>
                      {material.specifications}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Notes */}
        {result.notes && (
          <View style={styles.notesSection}>
            <View style={styles.notesHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.notesTitle}>Ghi chú</Text>
            </View>
            <Text style={[styles.notesText, { color: colors.text }]}>
              {result.notes}
            </Text>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="download-outline" size={20} color={colors.textInverse} />
          <Text style={styles.exportButtonText}>Xuất báo cáo Excel</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  summaryCard: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
  },
  summaryItem: {
    alignItems: 'center' as const,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#374151',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  materialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  materialHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  materialDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  priceValue: {
    fontWeight: '600' as const,
  },
  specsRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  specsText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic' as const,
  },
  notesSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0D9488',
  },
  notesHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0D9488',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};
