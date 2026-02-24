import { useSuppliers } from '@/hooks/useInventory';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SuppliersScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { suppliers, loading, deleteSupplier } = useSuppliers(projectId);

  const handleDelete = async (supplierId: string, supplierName: string) => {
    Alert.alert(
      'Xóa nhà cung cấp',
      `Bạn có chắc muốn xóa "${supplierName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSupplier(supplierId);
              Alert.alert('Thành công', 'Đã xóa nhà cung cấp');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa nhà cung cấp');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {suppliers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có nhà cung cấp nào</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push(`/inventory/create-supplier?projectId=${projectId}`)
              }
            >
              <Text style={styles.emptyButtonText}>Thêm nhà cung cấp đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          suppliers.map((supplier) => (
            <View key={supplier.id} style={styles.supplierCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name="business" size={24} color="#0D9488" />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  {supplier.rating && (
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= supplier.rating! ? 'star' : 'star-outline'}
                          size={14}
                          color="#0D9488"
                        />
                      ))}
                      <Text style={styles.ratingText}>({supplier.rating})</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Contact Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{supplier.contactPerson}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{supplier.email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{supplier.phone}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.infoText} numberOfLines={2}>
                    {supplier.address}
                  </Text>
                </View>

                {supplier.taxCode && (
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>MST: {supplier.taxCode}</Text>
                  </View>
                )}

                {supplier.paymentTerms && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{supplier.paymentTerms}</Text>
                  </View>
                )}
              </View>

              {/* Notes */}
              {supplier.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesText}>{supplier.notes}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(supplier.id, supplier.name)}>
                  <Ionicons name="trash-outline" size={16} color="#000000" />
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {suppliers.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push(`/inventory/create-supplier?projectId=${projectId}`)
          }
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0D9488',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  supplierCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  infoSection: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  notesSection: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
