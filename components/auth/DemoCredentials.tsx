/**
 * Demo Credentials Component
 * Hiển thị credentials demo cho testing
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DemoCredentialsProps {
  onFillCredentials: (email: string, password: string) => void;
}

export function DemoCredentials({ onFillCredentials }: DemoCredentialsProps) {
  const demoAccounts = [
    {
      id: 'admin',
      name: 'Admin Account',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'Admin',
      color: '#f44336',
      icon: 'shield-account' as const,
    },
    {
      id: 'user',
      name: 'User Account',
      email: 'user@example.com',
      password: 'User@123',
      role: 'User',
      color: '#4caf50',
      icon: 'account' as const,
    },
  ];

  const handleSelectAccount = (account: typeof demoAccounts[0]) => {
    Alert.alert(
      'Demo Account',
      `Sử dụng tài khoản ${account.role}?\n\nEmail: ${account.email}\nPassword: ${account.password}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Sử dụng', 
          onPress: () => onFillCredentials(account.email, account.password)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="test-tube" size={20} color="#666" />
        <Text style={styles.headerText}>Demo Accounts (API Testing)</Text>
      </View>
      
      <View style={styles.accountsContainer}>
        {demoAccounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[styles.accountButton, { borderColor: account.color }]}
            onPress={() => handleSelectAccount(account)}
          >
            <View style={[styles.iconContainer, { backgroundColor: account.color + '20' }]}>
              <MaterialCommunityIcons 
                name={account.icon} 
                size={16} 
                color={account.color} 
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountRole}>{account.role}</Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={16} 
              color="#999" 
            />
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.note}>
        💡 Tap để auto-fill credentials cho testing
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  accountsContainer: {
    gap: 8,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  accountRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
