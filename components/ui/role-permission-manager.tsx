import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import RolePermissionService from '../../services/role-permission';
import { CONSTRUCTION_PERMISSIONS, ConstructionRole } from '../../types/construction-auth';

interface RolePermissionManagerProps {
  visible: boolean;
  onClose: () => void;
  currentUserRole?: string;
}

const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({
  visible,
  onClose,
  currentUserRole = 'admin'
}) => {
  const [roles, setRoles] = useState<ConstructionRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ConstructionRole | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<ConstructionRole | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<Record<string, { permission: string; description: string }[]>>({});

  // Check if current user is admin
  const isAdmin = currentUserRole === 'admin';

  useEffect(() => {
    if (visible) {
      loadRoles();
      loadPermissionGroups();
    }
  }, [visible]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const rolesList = await RolePermissionService.getAllRoles();
      setRoles(rolesList);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissionGroups = () => {
    const groups = RolePermissionService.groupPermissionsByCategory();
    setPermissionGroups(groups);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên vai trò');
      return;
    }

    try {
      await RolePermissionService.createRole({
        name: newRoleName,
        permissions: [],
      });
      setNewRoleName('');
      setShowRoleModal(false);
      loadRoles();
      Alert.alert('Thành công', 'Đã tạo vai trò mới');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo vai trò mới');
    }
  };

  const handleUpdateRole = async (role: ConstructionRole, updates: Partial<ConstructionRole>) => {
    try {
      await RolePermissionService.updateRole(role.roleid, updates);
      loadRoles();
      Alert.alert('Thành công', 'Đã cập nhật vai trò');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật vai trò');
    }
  };

  const handleDeleteRole = (role: ConstructionRole) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa vai trò "${role.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await RolePermissionService.deleteRole(role.roleid);
              loadRoles();
              Alert.alert('Thành công', 'Đã xóa vai trò');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa vai trò');
            }
          },
        },
      ]
    );
  };

  const togglePermission = (role: ConstructionRole, permission: string) => {
    const hasPermission = role.permissions.includes(permission);
    const newPermissions = hasPermission
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    handleUpdateRole(role, { permissions: newPermissions });
  };

  const renderRoleCard = (role: ConstructionRole) => (
    <View key={role.roleid} style={styles.roleCard}>
      <View style={styles.roleHeader}>
        <Text style={styles.roleName}>{role.name}</Text>
        <View style={styles.roleActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSelectedRole(selectedRole?.roleid === role.roleid ? null : role)}
          >
            <Ionicons 
              name={selectedRole?.roleid === role.roleid ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          {isAdmin && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setEditingRole(role)}
              >
                <Ionicons name="pencil" size={16} color="#0066CC" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteRole(role)}
              >
                <Ionicons name="trash" size={16} color="#000000" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Text style={styles.permissionCount}>
        {role.permissions.length} quyền được cấp
      </Text>

      {selectedRole?.roleid === role.roleid && (
        <View style={styles.permissionsContainer}>
          {Object.entries(permissionGroups).map(([category, permissions]) => (
            <View key={category} style={styles.permissionGroup}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {permissions.map(({ permission, description }) => (
                <View key={permission} style={styles.permissionItem}>
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionName}>{description}</Text>
                    <Text style={styles.permissionCode}>{permission}</Text>
                  </View>
                  <Switch
                    value={role.permissions.includes(permission)}
                    onValueChange={() => togglePermission(role, permission)}
                    disabled={!isAdmin}
                    trackColor={{ false: '#E0E0E0', true: '#0066CC' }}
                    thumbColor={role.permissions.includes(permission) ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCreateRoleModal = () => (
    <Modal
      visible={showRoleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo vai trò mới</Text>
            <TouchableOpacity onPress={() => setShowRoleModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Tên vai trò"
            value={newRoleName}
            onChangeText={setNewRoleName}
            autoFocus
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreateRole}
            >
              <Text style={styles.createButtonText}>Tạo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Quản lý phân quyền</Text>
            <Text style={styles.subtitle}>
              {roles.length} vai trò • {Object.values(CONSTRUCTION_PERMISSIONS).length} quyền
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Action Bar */}
        {isAdmin && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowRoleModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Thêm vai trò</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <View style={styles.rolesList}>
              {roles.map(renderRoleCard)}
            </View>
          )}
        </ScrollView>

        {renderCreateRoleModal()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  rolesList: {
    padding: 20,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  roleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#E8F4FF',
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
  permissionCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  permissionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  permissionGroup: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  permissionCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#0066CC',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default RolePermissionManager;
