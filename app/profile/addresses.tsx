/**
 * Addresses Screen - Enhanced Design
 * Quản lý địa chỉ nhận hàng với giao diện hiện đại
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '456 Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const bg = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleEdit = (id: string) => {
    router.push(`/profile/addresses/${id}/edit` as Href);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa địa chỉ',
      'Bạn có chắc chắn muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    router.push('/profile/addresses/new' as Href);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Địa chỉ nhận hàng',
          headerShown: true,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Addresses List */}
        {addresses.map(address => (
          <View
            key={address.id}
            style={[styles.addressCard, { backgroundColor: surface, borderColor: border }]}
          >
            {/* Header */}
            <View style={styles.addressHeader}>
              <View style={styles.addressInfo}>
                <Text style={[styles.addressName, { color: text }]}>
                  {address.name}
                </Text>
                <Text style={[styles.addressPhone, { color: textMuted }]}>
                  {address.phone}
                </Text>
              </View>
              {address.isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: primary }]}>
                  <Text style={styles.defaultText}>Mặc định</Text>
                </View>
              )}
            </View>

            {/* Address Details */}
            <View style={styles.addressDetails}>
              <Ionicons name="location-outline" size={16} color={textMuted} />
              <Text style={[styles.addressText, { color: text }]}>
                {address.address}, {address.ward}, {address.district}, {address.city}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.addressActions}>
              {!address.isDefault && (
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: border }]}
                  onPress={() => handleSetDefault(address.id)}
                >
                  <Text style={[styles.actionButtonText, { color: text }]}>
                    Đặt làm mặc định
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: border }]}
                onPress={() => handleEdit(address.id)}
              >
                <Ionicons name="create-outline" size={16} color={primary} />
                <Text style={[styles.actionButtonText, { color: primary }]}>
                  Sửa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: border }]}
                onPress={() => handleDelete(address.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                  Xóa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {addresses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={textMuted} />
            <Text style={[styles.emptyTitle, { color: text }]}>
              Chưa có địa chỉ nào
            </Text>
            <Text style={[styles.emptySubtitle, { color: textMuted }]}>
              Thêm địa chỉ để nhận hàng nhanh hơn
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <View style={[styles.footer, { backgroundColor: surface, borderTopColor: border }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primary }]}
          onPress={handleAddNew}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  addressCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
