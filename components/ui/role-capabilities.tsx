/**
 * RoleCapabilities Component
 * Hiển thị chi tiết khả năng của từng vai trò
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getRoleDetails } from '@/constants/roles';
import { UserType } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

interface RoleCapabilitiesProps {
  userType: UserType;
}

export function RoleCapabilities({ userType }: RoleCapabilitiesProps) {
  const role = getRoleDetails(userType);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: role.color + '20' }]}>
          <Ionicons name={role.icon as any} size={32} color={role.color} />
        </View>
        <View style={styles.headerText}>
          <ThemedText style={styles.title}>{role.nameVi}</ThemedText>
          <ThemedText style={styles.subtitle}>{role.description}</ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Khả năng của vai trò này:</ThemedText>
        <ScrollView style={styles.capabilitiesList} showsVerticalScrollIndicator={false}>
          {role.capabilities.map((capability, index) => (
            <View key={index} style={styles.capabilityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
              <ThemedText style={styles.capabilityText}>{capability}</ThemedText>
            </View>
          ))}
        </ScrollView>
      </View>

      {role.verificationRequired && (
        <View style={styles.verificationNote}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#0D9488" />
          <ThemedText style={styles.verificationText}>
            Vai trò này cần xác minh danh tính và chứng chỉ
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  capabilitiesList: {
    maxHeight: 300,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  capabilityText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  verificationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  verificationText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#0D9488',
    flex: 1,
  },
});
