import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RolePermissionService from '../../services/role-permission';
import { CONSTRUCTION_ROLES, ConstructionRole, ConstructionUser } from '../../types/construction-auth';

interface UserRoleManagerProps {
  visible: boolean;
  onClose: () => void;
  currentUserRole?: string;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({
  visible,
  onClose,
  currentUserRole = 'admin'
}) => {
  const [users, setUsers] = useState<Record<string, ConstructionUser[]>>({});
  const [roles, setRoles] = useState<ConstructionRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ConstructionUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Check if current user is admin
  const isAdmin = currentUserRole === 'admin';

  useEffect(() => {
    if (visible) {
      loadRoles();
      loadUsersByRoles();
    }
  }, [visible]);

  const loadRoles = async () => {
    try {
      const rolesList = await RolePermissionService.getAllRoles();
      setRoles(rolesList);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsersByRoles = async () => {
    setLoading(true);
    try {
      const usersByRole: Record<string, ConstructionUser[]> = {};
      
      for (const roleKey of Object.values(CONSTRUCTION_ROLES)) {
        try {
          const roleUsers = await RolePermissionService.getUsersByRole(roleKey);
          usersByRole[roleKey] = roleUsers;
        } catch (error) {
          console.error(`Error loading users for role ${roleKey}:`, error);
          usersByRole[roleKey] = [];
        }
      }
      
      setUsers(usersByRole);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      await RolePermissionService.assignRoleToUser(selectedUser.id, selectedRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      setSelectedRole('');
      loadUsersByRoles();
      Alert.alert('Thành công', 'Đã cập nhật vai trò cho người dùng');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật vai trò');
    }
  };

  const getUserCount = () => {
    return Object.values(users).reduce((total, roleUsers) => total + roleUsers.length, 0);
  };

  const renderUserCard = (user: ConstructionUser) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        </View>
        <View style={styles.userStatus}>
          <View style={[styles.statusBadge, 
            user.status === 'active' ? styles.activeBadge : 
            user.status === 'inactive' ? styles.inactiveBadge : styles.suspendedBadge
          ]}>
            <Text style={[styles.statusText,
              user.status === 'active' ? styles.activeText : 
              user.status === 'inactive' ? styles.inactiveText : styles.suspendedText
            ]}>
              {user.status === 'active' ? 'Hoạt động' : 
               user.status === 'inactive' ? 'Không hoạt động' : 'Tạm khóa'}
            </Text>
          </View>
        </View>
      </View>
      
      {isAdmin && (
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => {
            setSelectedUser(user);
            setSelectedRole(user.role);
            setShowRoleModal(true);
          }}
        >
          <Ionicons name="settings" size={16} color="#0066CC" />
          <Text style={styles.assignButtonText}>Phân quyền</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRoleSection = (roleKey: string, roleUsers: ConstructionUser[]) => {
    const roleName = RolePermissionService.getRoleDisplayName(roleKey);
    
    return (
      <View key={roleKey} style={styles.roleSection}>
        <View style={styles.roleSectionHeader}>
          <Text style={styles.roleSectionTitle}>{roleName}</Text>
          <Text style={styles.userCountBadge}>{roleUsers.length}</Text>
        </View>
        
        {roleUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chưa có người dùng nào</Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {roleUsers.map(renderUserCard)}
          </View>
        )}
      </View>
    );
  };

  const renderRoleAssignModal = () => (
    <Modal
      visible={showRoleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Phân quyền cho {selectedUser?.full_name}</Text>
            <TouchableOpacity onPress={() => setShowRoleModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Chọn vai trò:</Text>
          
          <ScrollView style={styles.rolesContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.roleid}
                style={[
                  styles.roleOption,
                  selectedRole === role.roleid && styles.selectedRoleOption
                ]}
                onPress={() => setSelectedRole(role.roleid)}
              >
                <View style={styles.roleOptionContent}>
                  <Text style={[
                    styles.roleOptionText,
                    selectedRole === role.roleid && styles.selectedRoleText
                  ]}>
                    {role.name}
                  </Text>
                  <Text style={styles.permissionCountText}>
                    {role.permissions.length} quyền
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedRole === role.roleid && styles.selectedRadio
                ]}>
                  {selectedRole === role.roleid && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleAssignRole}
              disabled={!selectedRole}
            >
              <Text style={styles.saveButtonText}>Lưu</Text>
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
            <Text style={styles.title}>Quản lý người dùng</Text>
            <Text style={styles.subtitle}>
              {getUserCount()} người dùng • {roles.length} vai trò
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
            </View>
          ) : (
            <View style={styles.rolesSectionContainer}>
              {Object.entries(users).map(([roleKey, roleUsers]) => 
                renderRoleSection(roleKey, roleUsers)
              )}
            </View>
          )}
        </ScrollView>

        {renderRoleAssignModal()}
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
  rolesSectionContainer: {
    padding: 20,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userCountBadge: {
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14,
  },
  usersList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  userStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#E8F4FF',
  },
  suspendedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#0066CC',
  },
  inactiveText: {
    color: '#0066CC',
  },
  suspendedText: {
    color: '#000000',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F4FF',
    borderRadius: 6,
    marginLeft: 12,
  },
  assignButtonText: {
    color: '#0066CC',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
    maxWidth: 500,
    maxHeight: '80%',
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
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rolesContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  selectedRoleOption: {
    borderColor: '#0066CC',
    backgroundColor: '#F1F8E9',
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedRoleText: {
    color: '#0066CC',
  },
  permissionCountText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
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
  saveButton: {
    backgroundColor: '#0066CC',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default UserRoleManager;
