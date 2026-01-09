/**
 * Modern Auth Screen - K?t h?p giao di?n d?p v?i API backend th?t
 * Giao di?n nh? g?n, ngan n?p, không có text "API" th?a thãi
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/AuthContext';

export default function ModernAuthScreen() {
  const { signIn, signUp, loading, user } = useAuth();
  
  // Auth modes
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = React.useState<'account' | 'phone'>('account');
  
  // Form data
  const [account, setAccount] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  
  // Signup specific
  const [name, setName] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  // Phone login specific  
  const [phone, setPhone] = React.useState('');
  const [step, setStep] = React.useState<'request' | 'verify'>('request');
  const [otp, setOtp] = React.useState('');

  // Demo credentials for quick testing
  const quickFillDemo = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setAccount('admin@example.com');
      setPassword('Admin@123');
    } else {
      setAccount('user@example.com');
      setPassword('User@123');
    }
  };

  // Handle login
  const handleLogin = async () => {
    try {
      if (loginMethod === 'account') {
        if (!account.trim() || !password) {
          Alert.alert('L?i', 'Vui lòng di?n d?y d? thông tin');
          return;
        }

        // Determine field type based on account format
        let loginData: any = { password };
        const accountValue = account.trim();
        
        if (accountValue.includes('@')) {
          loginData.email = accountValue;
        } else if (/^\d+$/.test(accountValue)) {
          loginData.phone = accountValue;
        } else {
          loginData.username = accountValue;
        }

        await signIn(loginData.email || accountValue, loginData.password);
        Alert.alert('Thành công', 'Ðang nh?p thành công!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        // Phone login - simplified for now
        Alert.alert('Thông báo', 'Ðang nh?p b?ng s? di?n tho?i dang du?c phát tri?n');
      }
    } catch (error) {
      Alert.alert('L?i', 'Có l?i x?y ra khi dang nh?p');
    }
  };

  // Handle signup  
  const handleSignup = async () => {
    try {
      if (!name.trim() || !account.trim() || !password || !confirmPassword) {
        Alert.alert('L?i', 'Vui lòng di?n d?y d? thông tin');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('L?i', 'M?t kh?u xác nh?n không kh?p');
        return;
      }

      if (password.length < 6) {
        Alert.alert('L?i', 'M?t kh?u ph?i có ít nh?t 6 ký t?');
        return;
      }

      // Determine field type based on account format
      let signupData: any = { 
        name: name.trim(),
        password,
      };
      const accountValue = account.trim();
      
      if (accountValue.includes('@')) {
        signupData.email = accountValue;
      } else if (/^\d+$/.test(accountValue)) {
        signupData.phone = accountValue;
      } else {
        signupData.username = accountValue;
      }

      await signUp(signupData.email || accountValue, signupData.password, signupData.name);
      Alert.alert('Thành công', 'Ðang ký thành công!', [
        { text: 'OK', onPress: () => setMode('login') }
      ]);
    } catch (error: any) {
      Alert.alert('L?i dang ký', error.message || 'Ðang ký th?t b?i');
    }
  };

  // If user is logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'login' ? 'Ðang Nh?p' : 'Ðang Ký'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login' 
                ? 'Chào m?ng b?n tr? l?i!' 
                : 'T?o tài kho?n m?i'
              }
            </Text>
          </View>

          {/* Mode Selection */}
          <View style={styles.modeContainer}>
            <Pressable
              style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>
                Ðang Nh?p
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>
                Ðang Ký
              </Text>
            </Pressable>
          </View>

          {/* Quick Demo Access */}
          {mode === 'login' && (
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Truy c?p nhanh:</Text>
              <View style={styles.demoButtons}>
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => quickFillDemo('admin')}
                >
                  <Text style={styles.demoButtonText}>?? Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => quickFillDemo('user')}
                >
                  <Text style={styles.demoButtonText}>?? User</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Login Method Selection (only for login) */}
          {mode === 'login' && (
            <View style={styles.methodContainer}>
              <Pressable
                style={[styles.methodButton, loginMethod === 'account' && styles.methodButtonActive]}
                onPress={() => setLoginMethod('account')}
              >
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={loginMethod === 'account' ? '#007AFF' : '#666'} 
                />
                <Text style={[styles.methodText, loginMethod === 'account' && styles.methodTextActive]}>
                  Tài kho?n
                </Text>
              </Pressable>
              <Pressable
                style={[styles.methodButton, loginMethod === 'phone' && styles.methodButtonActive]}
                onPress={() => setLoginMethod('phone')}
              >
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color={loginMethod === 'phone' ? '#007AFF' : '#666'} 
                />
                <Text style={[styles.methodText, loginMethod === 'phone' && styles.methodTextActive]}>
                  S? di?n tho?i
                </Text>
              </Pressable>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name field for signup */}
            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>H? và tên</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nh?p h? và tên"
                  autoCapitalize="words"
                  textContentType="name"
                />
              </View>
            )}

            {/* Account/Phone field */}
            {(mode === 'signup' || loginMethod === 'account') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {mode === 'signup' ? 'Email/Username' : 'Tài kho?n'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={account}
                  onChangeText={setAccount}
                  placeholder={mode === 'signup' ? 'Email ho?c username' : 'Email, username ho?c s? di?n tho?i'}
                  autoCapitalize="none"
                  keyboardType={account.includes('@') ? 'email-address' : 'default'}
                  textContentType="emailAddress"
                />
              </View>
            )}

            {/* Phone field for phone login */}
            {mode === 'login' && loginMethod === 'phone' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>S? di?n tho?i</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nh?p s? di?n tho?i"
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                />
              </View>
            )}

            {/* Password field */}
            {(mode === 'signup' || loginMethod === 'account') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>M?t kh?u</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Nh?p m?t kh?u"
                    secureTextEntry={!showPw}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPw(!showPw)}
                  >
                    <Ionicons
                      name={showPw ? 'eye-outline' : 'eye-off-outline'}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Confirm Password field for signup */}
            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Xác nh?n m?t kh?u</Text>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Nh?p l?i m?t kh?u"
                  secureTextEntry={!showPw}
                  textContentType="password"
                />
              </View>
            )}

            {/* OTP field for phone login */}
            {mode === 'login' && loginMethod === 'phone' && step === 'verify' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mã OTP</Text>
                <TextInput
                  style={styles.textInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Nh?p mã OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Loader />
                <Text style={styles.loadingText}>Ðang x? lý...</Text>
              </View>
            ) : (
              <Button
                title={
                  mode === 'signup' 
                    ? 'Ðang Ký' 
                    : loginMethod === 'phone' && step === 'request'
                      ? 'G?i OTP'
                      : loginMethod === 'phone' && step === 'verify'
                        ? 'Xác th?c OTP'
                        : 'Ðang Nh?p'
                }
                onPress={
                  mode === 'signup' 
                    ? handleSignup 
                    : loginMethod === 'phone'
                      ? () => Alert.alert('Thông báo', 'Ðang nh?p b?ng SÐT dang phát tri?n')
                      : handleLogin
                }
                loading={loading}
                style={styles.actionButton}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {mode === 'login' ? 'Chua có tài kho?n? ' : 'Ðã có tài kho?n? '}
            </Text>
            <TouchableOpacity
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              <Text style={styles.footerLink}>
                {mode === 'login' ? 'Ðang ký ngay' : 'Ðang nh?p'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modeTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  demoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  demoButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  methodContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  methodButtonActive: {
    backgroundColor: '#f0f8ff',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  methodTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  formContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
