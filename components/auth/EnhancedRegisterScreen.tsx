/**
 * Enhanced Register Screen
 * S? d?ng API backend th?t
 */

import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../ui/button';
import { Container } from '../ui/container';
import { Loader } from '../ui/loader';
import { Section } from '../ui/section';

export default function EnhancedRegisterScreen() {
  const { signUp, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'khach-hang' as string,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Vui l�ng nh?p h? t�n';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'H? t�n ph?i c� �t nh?t 2 k� t?';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Vui l�ng nh?p email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email kh�ng h?p l?';
      }
    }

    // Phone validation (optional)
    if (formData.phone.trim()) {
      const phoneRegex = /^(\+84|84|0)([3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'S? di?n tho?i kh�ng h?p l?';
      }
    }

    // Username validation (optional)
    if (formData.username.trim()) {
      if (formData.username.length < 3) {
        newErrors.username = 'Username ph?i c� �t nh?t 3 k� t?';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username ch? du?c ch?a ch?, s? v� d?u g?ch du?i';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Vui l�ng nh?p m?t kh?u';
    } else if (formData.password.length < 6) {
      newErrors.password = 'M?t kh?u ph?i c� �t nh?t 6 k� t?';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'M?t kh?u ph?i ch?a �t nh?t 1 ch? v� 1 s?';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui l�ng x�c nh?n m?t kh?u';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'M?t kh?u x�c nh?n kh�ng kh?p';
    }

    // Terms validation
    if (!termsAccepted) {
      newErrors.terms = 'Vui l�ng d?ng � v?i di?u kho?n s? d?ng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle register
   */
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await signUp(formData.email.trim(), formData.password, formData.name.trim());
      Alert.alert(
        '�ang k� th�nh c�ng!', 
        'T�i kho?n c?a b?n d� du?c t?o. Vui l�ng dang nh?p d? ti?p t?c.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/') // Navigate to login
          }
        ]
      );
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('L?i dang k�', error.message || 'C� l?i x?y ra. Vui l�ng th? l?i.');
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Navigate to login
   */
  const handleLogin = () => {
    router.back();
  };

  if (loading) {
    return (
      <Container>
        <Loader />
        <Text style={styles.loadingText}>�ang t?o t�i kho?n...</Text>
      </Container>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Container>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.title}>�ang K�</Text>
            <Text style={styles.subtitle}>
              T?o t�i kho?n m?i d? b?t d?u
            </Text>
          </Section>

          {/* Register Form */}
          <Section>
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>H? v� t�n *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Nh?p h? v� t�n d?y d?"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Nh?p d?a ch? email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>S? di?n tho?i</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Nh?p s? di?n tho?i (t�y ch?n)"
                  autoCapitalize="none"
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  placeholder="T�n dang nh?p (t�y ch?n)"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>M?t kh?u *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="Nh?p m?t kh?u (�t nh?t 6 k� t?)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? '??' : '???'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>X�c nh?n m?t kh?u *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    placeholder="Nh?p l?i m?t kh?u"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showConfirmPassword ? '??' : '???'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => {
                    setTermsAccepted(!termsAccepted);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                >
                  <View style={[styles.checkboxInner, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <Text style={styles.checkboxText}>?</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  T�i d?ng � v?i{' '}
                  <Text style={styles.termsLink}>di?u kho?n s? d?ng</Text>
                  {' '}v�{' '}
                  <Text style={styles.termsLink}>ch�nh s�ch b?o m?t</Text>
                </Text>
              </View>
              {errors.terms && (
                <Text style={styles.errorText}>{errors.terms}</Text>
              )}

              {/* Register Button */}
              <Button
                title="�ang K�"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
              />
            </View>
          </Section>

          {/* Login Link */}
          <Section style={styles.footer}>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                �� c� t�i kho?n? 
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>
                  �ang nh?p ngay
                </Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* API Status */}
          <Section style={styles.apiStatus}>
            <Text style={styles.apiStatusText}>
              ?? K?t n?i v?i API: api.thietkeresort.com.vn
            </Text>
          </Section>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#000000',
    backgroundColor: '#ffebee',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  errorText: {
    color: '#000000',
    fontSize: 14,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#0D9488',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 30,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#0D9488',
    fontWeight: '600',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  apiStatus: {
    marginTop: 20,
    alignItems: 'center',
  },
  apiStatusText: {
    fontSize: 12,
    color: '#0D9488',
    fontFamily: 'monospace',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});
