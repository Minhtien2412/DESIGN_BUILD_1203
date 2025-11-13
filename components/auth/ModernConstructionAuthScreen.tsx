/**
 * Modern Auth Screen - Construction Industry Design
 * Updated với MySQL Authentication và Real Email Validation
 * Removed outdated authentication methods
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { validateEmailWithSuggestions } from '@/services/emailValidation';

type AuthMode = 'login' | 'register';
type MySQLRole = 'admin' | 'manager' | 'designer' | 'contractor' | 'client';

interface EmailValidationState {
    isValid: boolean;
    message: string;
    suggestions?: string[];
}

export default function ModernConstructionAuthScreen() {
    const { signIn: contextSignIn, signUp: contextSignUp, loading: contextLoading } = useAuth();
    
    // State management
    const [mode, setMode] = React.useState<AuthMode>('login');
    const [selectedRole, setSelectedRole] = React.useState<MySQLRole>('client');
    const [loading, setLoading] = React.useState(false);
    const [emailValidation, setEmailValidation] = React.useState<EmailValidationState>({ isValid: false, message: '' });
    const [formData, setFormData] = React.useState({
        account: '',
        password: '',
        email: '',
        fullName: '',
        phone: '',
        confirmPassword: ''
    });

    // Real-time email validation
    React.useEffect(() => {
        if (mode === 'register' && formData.email) {
            const validation = validateEmailWithSuggestions(formData.email);
            setEmailValidation(validation);
        } else {
            setEmailValidation({ isValid: false, message: '' });
        }
    }, [formData.email, mode]);

    // Handle MySQL login
    const handleLogin = async () => {
        try {
            if (!formData.account.trim() || !formData.password.trim()) {
                Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
                return;
            }

            if (formData.account.trim().length < 3) {
                Alert.alert('Thông báo', 'Tên đăng nhập phải có ít nhất 3 ký tự');
                return;
            }

            setLoading(true);
            
            await contextSignIn(formData.account.trim(), formData.password);
            // Automatically redirect to home screen after successful login
            console.log('✅ Login successful, redirecting to home...');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Đăng nhập thất bại', error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Handle MySQL registration với enhanced validation
    const handleRegister = async () => {
        try {
            // Comprehensive validation
            if (!formData.account.trim() || !formData.email.trim() || !formData.password.trim()) {
                Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin bắt buộc (Tên đăng nhập, Email, Mật khẩu)');
                return;
            }

            // Username validation
            if (formData.account.trim().length < 3) {
                Alert.alert('Lỗi', 'Tên đăng nhập phải có ít nhất 3 ký tự');
                return;
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(formData.account.trim())) {
                Alert.alert('Lỗi', 'Tên đăng nhập chỉ được chứa chữ cái, số, gạch dưới và gạch ngang');
                return;
            }

            // Email validation
            if (!emailValidation.isValid) {
                const message = emailValidation.suggestions?.length ? 
                    `${emailValidation.message}\n\nGợi ý: ${emailValidation.suggestions.join(', ')}` :
                    emailValidation.message;
                Alert.alert('Email không hợp lệ', message);
                return;
            }

            // Password validation  
            if (formData.password.length < 8) {
                Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự');
                return;
            }

            // Password strength check
            const hasUpperCase = /[A-Z]/.test(formData.password);
            const hasLowerCase = /[a-z]/.test(formData.password);
            const hasNumbers = /\d/.test(formData.password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
            
            const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
            
            if (strengthScore < 2) {
                Alert.alert('Mật khẩu yếu', 'Mật khẩu phải chứa ít nhất 2 trong các yếu tố:\n• Chữ hoa (A-Z)\n• Chữ thường (a-z)\n• Số (0-9)\n• Ký tự đặc biệt (!@#$...)');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
                return;
            }

            // Phone validation if provided
            if (formData.phone.trim() && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone.trim())) {
                Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
                return;
            }

            setLoading(true);

            await contextSignUp(
                formData.email.trim(),
                formData.password,
                formData.fullName.trim() || formData.account.trim()
            );
            // Automatically redirect to home screen after successful registration
            console.log('✅ Registration successful, redirecting to home...');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert('Đăng ký thất bại', error.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Demo data fills (chỉ cho admin testing)
    const fillDemoAdmin = () => {
        setFormData(prev => ({
            ...prev,
            account: 'admin',
            password: '123@#'
        }));
        setMode('login');
    };

    const fillDemoRegister = (role: MySQLRole) => {
        setSelectedRole(role);
        setFormData(prev => ({
            ...prev,
            account: `demo_${role}`,
            email: `demo.${role}@designbuild.com`,
            password: 'Demo@123',
            confirmPassword: 'Demo@123',
            fullName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`
        }));
        setMode('register');
    };

    // Filtered roles for MySQL system
    const mysqlRoles: Array<{role: MySQLRole, display: string}> = [
        { role: 'client', display: 'Khách hàng' },
        { role: 'contractor', display: 'Nhà thầu' },
        { role: 'designer', display: 'Kiến trúc sư' },
        { role: 'manager', display: 'Quản lý' }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="cube-outline" size={28} color="#ffffff" />
                    <Text style={styles.logoText}>APP DESIGN BUILD</Text>
                </View>
            </View>

            <KeyboardAvoidingView 
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Mode Tabs - Removed OTP */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'login' && styles.tabActive]}
                            onPress={() => setMode('login')}
                        >
                            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                                Đăng nhập
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'register' && styles.tabActive]}
                            onPress={() => setMode('register')}
                        >
                            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                                Đăng ký
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Form */}
                    {mode === 'login' && (
                        <View style={styles.formContainer}>
                            {/* Demo Admin Access */}
                            <View style={styles.demoSection}>
                                <TouchableOpacity
                                    style={styles.demoButton}
                                    onPress={fillDemoAdmin}
                                >
                                    <MaterialCommunityIcons name="shield-crown" size={20} color="#ff6b35" />
                                    <Text style={styles.demoText}>Demo Admin Login</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Inputs */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="account" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tên đăng nhập hoặc email"
                                        placeholderTextColor="#666"
                                        value={formData.account}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, account: text }))}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mật khẩu"
                                        placeholderTextColor="#666"
                                        value={formData.password}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitButton, (loading || contextLoading) && styles.submitButtonDisabled]} 
                                onPress={handleLogin}
                                disabled={loading || contextLoading}
                            >
                                <Text style={styles.submitButtonText}>
                                    {loading || contextLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Registration Form */}
                    {mode === 'register' && (
                        <View style={styles.formContainer}>
                            {/* Role Selection */}
                            <View style={styles.roleSection}>
                                <Text style={styles.roleTitle}>Chọn loại tài khoản:</Text>
                                <View style={styles.roleContainer}>
                                    {mysqlRoles.map((roleOption) => (
                                        <TouchableOpacity
                                            key={roleOption.role}
                                            style={[
                                                styles.roleButton, 
                                                selectedRole === roleOption.role && styles.roleActive
                                            ]}
                                            onPress={() => setSelectedRole(roleOption.role)}
                                        >
                                            <MaterialCommunityIcons 
                                                name={
                                                    roleOption.role === 'client' ? 'account' :
                                                    roleOption.role === 'contractor' ? 'hammer' : 'pencil-ruler'
                                                } 
                                                size={20} 
                                                color={selectedRole === roleOption.role ? '#fff' : '#666'} 
                                            />
                                            <Text style={[
                                                styles.roleText, 
                                                selectedRole === roleOption.role && styles.roleTextActive
                                            ]}>
                                                {roleOption.display}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                
                                {/* Demo Registration Buttons */}
                                <View style={styles.demoSection}>
                                    <Text style={styles.demoTitle}>Demo nhanh:</Text>
                                    <View style={styles.demoContainer}>
                                        {mysqlRoles.map((roleOption) => (
                                            <TouchableOpacity
                                                key={`demo-${roleOption.role}`}
                                                style={styles.demoBtnSmall}
                                                onPress={() => fillDemoRegister(roleOption.role)}
                                            >
                                                <Text style={styles.demoTextSmall}>{roleOption.display}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Registration Inputs */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="account" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tên đăng nhập (3+ ký tự)"
                                        placeholderTextColor="#666"
                                        value={formData.account}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, account: text }))}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={[
                                            styles.input,
                                            formData.email ? (emailValidation.isValid ? styles.inputValid : styles.inputInvalid) : null
                                        ]}
                                        placeholder="Email (sẽ được kiểm tra thật)"
                                        placeholderTextColor="#666"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                    />
                                </View>
                                
                                {/* Email validation feedback */}
                                {formData.email && emailValidation.message && (
                                    <View style={[styles.validationMessage, emailValidation.isValid ? styles.validationSuccess : styles.validationError]}>
                                        <MaterialCommunityIcons 
                                            name={emailValidation.isValid ? 'check-circle' : 'alert-circle'} 
                                            size={16} 
                                            color={emailValidation.isValid ? '#4CAF50' : '#f44336'} 
                                        />
                                        <Text style={[styles.validationText, emailValidation.isValid ? styles.validationTextSuccess : styles.validationTextError]}>
                                            {emailValidation.message}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="account-details" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Họ và tên (tùy chọn)"
                                        placeholderTextColor="#666"
                                        value={formData.fullName}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="phone" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Số điện thoại (tùy chọn)"
                                        placeholderTextColor="#666"
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mật khẩu (8+ ký tự, ít nhất 2 loại)"
                                        placeholderTextColor="#666"
                                        value={formData.password}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                                        secureTextEntry
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="lock-check" size={20} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Xác nhận mật khẩu"
                                        placeholderTextColor="#666"
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitButton, (loading || contextLoading) && styles.submitButtonDisabled]} 
                                onPress={handleRegister}
                                disabled={loading || contextLoading}
                            >
                                <Text style={styles.submitButtonText}>
                                    {loading || contextLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        backgroundColor: '#1a1a2e',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginLeft: 10,
    },
    content: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    tabTextActive: {
        color: '#1a1a2e',
        fontWeight: '600',
    },
    formContainer: {
        flex: 1,
    },
    demoSection: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#ff6b35',
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ff6b35',
    },
    demoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#ff6b35',
        fontWeight: '500',
    },
    demoTitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    demoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    demoBtnSmall: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 4,
    },
    demoTextSmall: {
        fontSize: 11,
        color: '#495057',
    },
    roleSection: {
        marginBottom: 20,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 12,
    },
    roleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    roleButton: {
        flex: 1,
        minWidth: '30%',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
        alignItems: 'center',
    },
    roleActive: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
    },
    roleText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
    },
    roleTextActive: {
        color: '#fff',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1a1a2e',
    },
    inputValid: {
        borderColor: '#4CAF50',
        borderWidth: 1,
    },
    inputInvalid: {
        borderColor: '#f44336',
        borderWidth: 1,
    },
    validationMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -12,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    validationSuccess: {
        backgroundColor: '#e8f5e8',
        paddingVertical: 8,
        borderRadius: 6,
    },
    validationError: {
        backgroundColor: '#fdeaea',
        paddingVertical: 8,
        borderRadius: 6,
    },
    validationText: {
        fontSize: 12,
        marginLeft: 6,
        flex: 1,
    },
    validationTextSuccess: {
        color: '#2e7d32',
    },
    validationTextError: {
        color: '#c62828',
    },
    submitButton: {
        backgroundColor: '#ff6b35',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#ff6b35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#cccccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
