/**
 * Material Estimation Screen
 * AI-generated material quantity estimates
 */

import { useThemeColor } from '@/hooks/use-theme-color';
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
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const { result, loading, error } = useMaterialEstimation();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Chưa có ước tính
      </Text>
      <Text style={styles.emptyText}>
        Sử dụng AI để ước tính số lượng vật liệu cần thiết
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: tintColor }]}
        onPress={() => {
          // Navigate to analysis screen
        }}
      >
        <Ionicons name="camera" size={20} color="#fff" />
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
        <View style={[styles.container, { backgroundColor }]}>
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
      <ScrollView style={[styles.container, { backgroundColor }]}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: textColor }]}>
            Tổng quan ước tính
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="cube" size={32} color={tintColor} />
              <Text style={styles.summaryValue}>
                {result.materials?.length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Loại vật liệu</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={32} color="#4caf50" />
              <Text style={styles.summaryValue}>
                {(totalCost / 1000000).toFixed(1)}M
              </Text>
              <Text style={styles.summaryLabel}>Ước tính giá</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons
                name="speedometer"
                size={32}
                color={(result.confidenceScore || 0.8) > 0.7 ? '#4caf50' : '#ff9800'}
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
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Danh sách vật liệu
          </Text>
          {result.materials?.map((material, index) => (
            <View key={index} style={styles.materialCard}>
              <View style={styles.materialHeader}>
                <Text style={[styles.materialName, { color: textColor }]}>
                  {material.name}
                </Text>
                {material.category && (
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: tintColor + '20' },
                    ]}
                  >
                    <Text style={[styles.categoryText, { color: tintColor }]}>
                      {material.category}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.materialDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="layers-outline" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Số lượng ước tính:</Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {material.estimatedQuantity} {material.unit}
                  </Text>
                </View>

                {material.unitPrice && (
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Đơn giá:</Text>
                    <Text style={[styles.detailValue, { color: textColor }]}>
                      {material.unitPrice.toLocaleString('vi-VN')} ₫/{material.unit}
                    </Text>
                  </View>
                )}

                {material.unitPrice && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calculator-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Thành tiền:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        styles.priceValue,
                        { color: '#4caf50' },
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
                    <Ionicons name="document-text-outline" size={16} color="#666" />
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
              <Ionicons name="information-circle" size={20} color="#ff9800" />
              <Text style={styles.notesTitle}>Ghi chú</Text>
            </View>
            <Text style={[styles.notesText, { color: textColor }]}>
              {result.notes}
            </Text>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: tintColor }]}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Xuất báo cáo Excel</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  materialCard: {
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  materialDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceValue: {
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  specsText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  notesSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff9800',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
