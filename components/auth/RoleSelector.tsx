/**
 * RoleSelector Component
 * Cho phép user chọn vai trò khi đăng ký
 */

import { ThemedText } from '@/components/themed-text';
import { MARKETPLACE_ROLES } from '@/constants/roles';
import { UserType } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface RoleSelectorProps {
  selectedRole?: UserType;
  onRoleSelect: (role: UserType) => void;
  excludeRoles?: UserType[];
}

export function RoleSelector({ selectedRole, onRoleSelect, excludeRoles = ['admin'] }: RoleSelectorProps) {
  const availableRoles = (Object.keys(MARKETPLACE_ROLES) as UserType[]).filter(
    (role) => !excludeRoles.includes(role)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.title}>Chọn vai trò của bạn</ThemedText>
      <ThemedText style={styles.subtitle}>
        Vai trò giúp chúng tôi tùy chỉnh trải nghiệm phù hợp với bạn
      </ThemedText>

      <View style={styles.rolesGrid}>
        {availableRoles.map((roleType) => {
          const role = MARKETPLACE_ROLES[roleType];
          const isSelected = selectedRole === roleType;

          return (
            <Pressable
              key={roleType}
              style={[
                styles.roleCard,
                isSelected && styles.roleCardSelected,
              ]}
              onPress={() => onRoleSelect(roleType)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: role.color + '20' },
                  isSelected && { backgroundColor: role.color },
                ]}
              >
                <Ionicons
                  name={role.icon as any}
                  size={32}
                  color={isSelected ? '#FFFFFF' : role.color}
                />
              </View>

              <ThemedText style={styles.roleName}>{role.nameVi}</ThemedText>
              <ThemedText style={styles.roleDescription} numberOfLines={2}>
                {role.description}
              </ThemedText>

              {role.verificationRequired && (
                <View style={styles.verificationBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#0D9488" />
                  <ThemedText style={styles.verificationText}>
                    Cần xác minh
                  </ThemedText>
                </View>
              )}

              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
  },
  rolesGrid: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDF4',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  verificationText: {
    fontSize: 11,
    color: '#0D9488',
    marginLeft: 4,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
