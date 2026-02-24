/**
 * Perfex Login Development Helper
 * Quick fill credentials for testing
 * Only visible in development mode
 */

import { TEST_CREDENTIALS } from '@/constants/testCredentials';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DevLoginHelperProps {
  onSelectCredential: (email: string, password: string, userType: 'staff' | 'customer') => void;
}

export default function DevLoginHelper({ onSelectCredential }: DevLoginHelperProps) {
  const [visible, setVisible] = React.useState(false);

  if (!__DEV__) return null;

  const handleSelect = (type: 'staff' | 'customer' | 'admin') => {
    const cred = TEST_CREDENTIALS[type];
    onSelectCredential(cred.email, cred.password, cred.userType);
    setVisible(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="flash" size={16} color="#fff" />
        <Text style={styles.triggerText}>Quick Fill</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Test Credentials</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.options}>
              {/* Staff */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect('staff')}
              >
                <View style={[styles.iconBadge, { backgroundColor: '#03a9f4' }]}>
                  <Ionicons name="briefcase" size={24} color="#fff" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Staff Account</Text>
                  <Text style={styles.optionEmail}>{TEST_CREDENTIALS.staff.email}</Text>
                  <Text style={styles.optionRole}>Role: Staff Member</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
              </TouchableOpacity>

              {/* Customer */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect('customer')}
              >
                <View style={[styles.iconBadge, { backgroundColor: '#0080FF' }]}>
                  <Ionicons name="people" size={24} color="#fff" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Customer Account</Text>
                  <Text style={styles.optionEmail}>{TEST_CREDENTIALS.customer.email}</Text>
                  <Text style={styles.optionRole}>Role: Client</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
              </TouchableOpacity>

              {/* Admin */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect('admin')}
              >
                <View style={[styles.iconBadge, { backgroundColor: '#0D9488' }]}>
                  <Ionicons name="shield-checkmark" size={24} color="#fff" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Admin Account</Text>
                  <Text style={styles.optionEmail}>{TEST_CREDENTIALS.admin.email}</Text>
                  <Text style={styles.optionRole}>Role: Administrator</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Ionicons name="information-circle" size={16} color="#7f8c8d" />
              <Text style={styles.footerText}>Development mode only</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0D9488',
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 12,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  options: {
    padding: 12,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  optionEmail: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  optionRole: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
