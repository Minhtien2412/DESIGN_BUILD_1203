/**
 * Advanced Auth System
 * - Login: Phone/Email/Username + Password + Forgot Password (OTP)
 * - Signup: User role selection (Client vs Contractor)  
 * - Admin: Detailed permission management
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { useEnhancedAuth } from '@/context/EnhancedAuthContext';

// User roles and permissions
export const USER_ROLES = {
    CLIENT: 'client', // Khách hàng có nhu cầu thiết kế nhà
    CONTRACTOR: 'contractor', // Nhà thầu xây dựng
    ADMIN: 'admin', // Quản trị viên
} as const;

export const PERMISSIONS = {
    VIEW_BIDS: 'view_bids', // Xem gói thầu
    VIEW_PROGRESS: 'view_progress', // Xem tiến độ
    VIEW_PAYMENTS: 'view_payments', // Xem thanh toán
    VIEW_PRICING: 'view_pricing', // Xem giá tiền
    CHAT_CUSTOMERS: 'chat_customers', // Chat với khách hàng
    POST_ARTICLES: 'post_articles', // Đăng bài viết
    LIVE_STREAM: 'live_stream', // Live stream
    POST_PRODUCTS: 'post_products', // Đăng sản phẩm
    BID_PROJECTS: 'bid_projects', // Đấu thầu
    VIEW_CUSTOMER_INFO: 'view_customer_info', // Xem thông tin khách hàng
} as const;

export default function AdvancedAuthScreen() {
    const { signIn, signUp, loading, user } = useEnhancedAuth();

    // Main navigation state
    const [screen, setScreen] = React.useState<'login' | 'signup' | 'forgot'>('login');

    // Login state
    const [loginData, setLoginData] = React.useState({
        account: '', // Phone/Email/Username
        password: '',
    });
    const [showPassword, setShowPassword] = React.useState(false);

    // Signup state
    const [signupData, setSignupData] = React.useState({
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: USER_ROLES.CLIENT as keyof typeof USER_ROLES | string, // Allow both roles
    });

    // Forgot password state
    const [forgotData, setForgotData] = React.useState({
        contact: '', // Email or Phone
        method: 'email' as 'email' | 'phone',
        otp: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [forgotStep, setForgotStep] = React.useState<'request' | 'verify' | 'reset'>('request');

    // Role selection modal
    const [showRoleModal, setShowRoleModal] = React.useState(false);

    // Auto-detect account type for login
    const detectAccountType = (account: string) => {
        if (account.includes('@')) return 'email';
        if (/^\d+$/.test(account)) return 'phone';
        return 'username';
    };

    // Handle login
    const handleLogin = async () => {
        try {
            if (!loginData.account.trim() || !loginData.password) {
                Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
                return;
            }

            // Determine field type
            const accountType = detectAccountType(loginData.account.trim());
            let apiData: any = { password: loginData.password };

            switch (accountType) {
                case 'email':
                    apiData.email = loginData.account.trim();
                    break;
                case 'phone':
                    apiData.phone = loginData.account.trim();
                    break;
                case 'username':
                    apiData.username = loginData.account.trim();
                    break;
            }

            const result = await signIn(apiData);

            if (result.success) {
                Alert.alert('Thành công', 'Đăng nhập thành công!', [
                    { text: 'OK', onPress: () => router.replace('/(tabs)') }
                ]);
            } else {
                Alert.alert('Lỗi đăng nhập', result.error || 'Đăng nhập thất bại');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng nhập');
        }
    };

    // Handle signup
    const handleSignup = async () => {
        try {
            // Validation
            if (!signupData.name.trim() || !signupData.email.trim() || 
                !signupData.phone.trim() || !signupData.username.trim() || 
                !signupData.password || !signupData.confirmPassword) {
                Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
                return;
            }

            if (signupData.password !== signupData.confirmPassword) {
                Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
                return;
            }

            if (signupData.password.length < 6) {
                Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(signupData.email.trim())) {
                Alert.alert('Lỗi', 'Email không hợp lệ');
                return;
            }

            // Phone validation
            if (!/^\d{10,11}$/.test(signupData.phone.trim())) {
                Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
                return;
            }

            const result = await signUp({
                name: signupData.name.trim(),
                email: signupData.email.trim(),
                phone: signupData.phone.trim(),
                username: signupData.username.trim(),
                password: signupData.password,
                role: signupData.role,
            });

            if (result.success) {
                Alert.alert('Thành công', 'Đăng ký thành công!', [
                    { text: 'OK', onPress: () => setScreen('login') }
                ]);
            } else {
                Alert.alert('Lỗi đăng ký', result.error || 'Đăng ký thất bại');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng ký');
        }
    };

    // Handle forgot password - Request OTP
    const handleForgotRequest = async () => {
        try {
            if (!forgotData.contact.trim()) {
                Alert.alert('Lỗi', 'Vui lòng nhập email hoặc số điện thoại');
                return;
            }

            // TODO: Integrate with real OTP API
            // For now, simulate OTP request
            Alert.alert('OTP đã gửi', 
                `Mã OTP đã được gửi đến ${forgotData.contact}. ` +
                `Vui lòng kiểm tra ${forgotData.method === 'email' ? 'email' : 'tin nhắn'} của bạn.`
            );
            setForgotStep('verify');
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi OTP');
        }
    };

    // Handle forgot password - Verify OTP
    const handleForgotVerify = async () => {
        try {
            if (!forgotData.otp.trim()) {
                Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
                return;
            }

            // TODO: Integrate with real OTP verification API
            // For now, simulate OTP verification
            if (forgotData.otp === '123456') { // Demo OTP
                setForgotStep('reset');
            } else {
                Alert.alert('Lỗi', 'Mã OTP không chính xác');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác thực OTP');
        }
    };

    // Handle forgot password - Reset password
    const handlePasswordReset = async () => {
        try {
            if (!forgotData.newPassword || !forgotData.confirmNewPassword) {
                Alert.alert('Lỗi', 'Vui lòng điền đầy đủ mật khẩu mới');
                return;
            }

            if (forgotData.newPassword !== forgotData.confirmNewPassword) {
                Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
                return;
            }

            if (forgotData.newPassword.length < 6) {
                Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }

            // TODO: Integrate with real password reset API
            Alert.alert('Thành công', 'Đặt lại mật khẩu thành công!', [
                { 
                    text: 'OK', 
                    onPress: () => {
                        setScreen('login');
                        setForgotStep('request');
                        setForgotData({ contact: '', method: 'email', otp: '', newPassword: '', confirmNewPassword: '' });
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt lại mật khẩu');
        }
    };

    // Quick demo fill
    const quickFillDemo = (type: 'admin' | 'client' | 'contractor') => {
        if (type === 'admin') {
            setLoginData({ account: 'admin@example.com', password: 'Admin@123' });
        } else if (type === 'client') {
            setLoginData({ account: 'client@example.com', password: 'Client@123' });
        } else {
            setLoginData({ account: 'contractor@example.com', password: 'Contractor@123' });
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
                            {screen === 'login' ? 'Đăng Nhập' : 
                             screen === 'signup' ? 'Đăng Ký' : 'Quên Mật Khẩu'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {screen === 'login' ? 'Chào mừng bạn trở lại!' : 
                             screen === 'signup' ? 'Tạo tài khoản mới' : 'Khôi phục mật khẩu'}
                        </Text>
                    </View>

                    {/* Screen Navigation */}
                    <View style={styles.screenNavContainer}>
                        <Pressable
                            style={[styles.screenNavButton, screen === 'login' && styles.screenNavButtonActive]}
                            onPress={() => setScreen('login')}
                        >
                            <Text style={[styles.screenNavText, screen === 'login' && styles.screenNavTextActive]}>
                                Đăng Nhập
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.screenNavButton, screen === 'signup' && styles.screenNavButtonActive]}
                            onPress={() => setScreen('signup')}
                        >
                            <Text style={[styles.screenNavText, screen === 'signup' && styles.screenNavTextActive]}>
                                Đăng Ký
                            </Text>
                        </Pressable>
                    </View>

                    {/* LOGIN SCREEN */}
                    {screen === 'login' && (
                        <>
                            {/* Quick Demo Access */}
                            <View style={styles.demoContainer}>
                                <Text style={styles.demoTitle}>Truy cập nhanh (Demo):</Text>
                                <View style={styles.demoButtons}>
                                    <TouchableOpacity 
                                        style={[styles.demoButton, { backgroundColor: '#FFE5E5' }]}
                                        onPress={() => quickFillDemo('admin')}
                                    >
                                        <Text style={styles.demoButtonText}>👑 Admin</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.demoButton, { backgroundColor: '#E5F3FF' }]}
                                        onPress={() => quickFillDemo('client')}
                                    >
                                        <Text style={styles.demoButtonText}>🏠 Khách hàng</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.demoButton, { backgroundColor: '#E5FFE5' }]}
                                        onPress={() => quickFillDemo('contractor')}
                                    >
                                        <Text style={styles.demoButtonText}>🔨 Nhà thầu</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Login Form */}
                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Tài khoản</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={loginData.account}
                                        onChangeText={(text) => setLoginData({ ...loginData, account: text })}
                                        placeholder="Email, Số điện thoại hoặc Username"
                                        autoCapitalize="none"
                                        keyboardType={loginData.account.includes('@') ? 'email-address' : 'default'}
                                    />
                                    <Text style={styles.inputHint}>
                                        Phát hiện: {detectAccountType(loginData.account) === 'email' ? '📧 Email' : 
                                                  detectAccountType(loginData.account) === 'phone' ? '📱 Số điện thoại' : 
                                                  '👤 Username'}
                                    </Text>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Mật khẩu</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={loginData.password}
                                            onChangeText={(text) => setLoginData({ ...loginData, password: text })}
                                            placeholder="Nhập mật khẩu"
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                                size={22}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Forgot Password Link */}
                                <TouchableOpacity 
                                    style={styles.forgotLink}
                                    onPress={() => setScreen('forgot')}
                                >
                                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Button */}
                            <Button
                                title="Đăng Nhập"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.actionButton}
                            />
                        </>
                    )}

                    {/* SIGNUP SCREEN */}
                    {screen === 'signup' && (
                        <>
                            {/* Role Selection */}
                            <View style={styles.roleContainer}>
                                <Text style={styles.roleTitle}>Bạn là:</Text>
                                <View style={styles.roleButtons}>
                                    <Pressable
                                        style={[
                                            styles.roleButton,
                                            signupData.role === USER_ROLES.CLIENT && styles.roleButtonActive
                                        ]}
                                        onPress={() => setSignupData({ ...signupData, role: USER_ROLES.CLIENT })}
                                    >
                                        <MaterialCommunityIcons 
                                            name="home-heart" 
                                            size={24} 
                                            color={signupData.role === USER_ROLES.CLIENT ? '#007AFF' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.roleButtonText,
                                            signupData.role === USER_ROLES.CLIENT && styles.roleButtonTextActive
                                        ]}>
                                            Khách hàng
                                        </Text>
                                        <Text style={styles.roleButtonDesc}>
                                            Có nhu cầu thiết kế nhà
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={[
                                            styles.roleButton,
                                            signupData.role === USER_ROLES.CONTRACTOR && styles.roleButtonActive
                                        ]}
                                        onPress={() => setSignupData({ ...signupData, role: USER_ROLES.CONTRACTOR })}
                                    >
                                        <MaterialCommunityIcons 
                                            name="hammer-wrench" 
                                            size={24} 
                                            color={signupData.role === USER_ROLES.CONTRACTOR ? '#007AFF' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.roleButtonText,
                                            signupData.role === USER_ROLES.CONTRACTOR && styles.roleButtonTextActive
                                        ]}>
                                            Nhà thầu
                                        </Text>
                                        <Text style={styles.roleButtonDesc}>
                                            Xây dựng & kết nối khách hàng
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Signup Form */}
                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Họ và tên *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.name}
                                        onChangeText={(text) => setSignupData({ ...signupData, name: text })}
                                        placeholder="Nhập họ và tên đầy đủ"
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={[styles.inputContainer, styles.inputHalf]}>
                                        <Text style={styles.inputLabel}>Email *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={signupData.email}
                                            onChangeText={(text) => setSignupData({ ...signupData, email: text })}
                                            placeholder="your@email.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, styles.inputHalf]}>
                                        <Text style={styles.inputLabel}>Số điện thoại *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={signupData.phone}
                                            onChangeText={(text) => setSignupData({ ...signupData, phone: text })}
                                            placeholder="0123456789"
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Username *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.username}
                                        onChangeText={(text) => setSignupData({ ...signupData, username: text })}
                                        placeholder="username (không dấu, không khoảng trắng)"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Mật khẩu *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.password}
                                        onChangeText={(text) => setSignupData({ ...signupData, password: text })}
                                        placeholder="Tối thiểu 6 ký tự"
                                        secureTextEntry={!showPassword}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.confirmPassword}
                                        onChangeText={(text) => setSignupData({ ...signupData, confirmPassword: text })}
                                        placeholder="Nhập lại mật khẩu"
                                        secureTextEntry={!showPassword}
                                    />
                                </View>
                            </View>

                            {/* Signup Button */}
                            <Button
                                title="Đăng Ký Tài Khoản"
                                onPress={handleSignup}
                                loading={loading}
                                style={styles.actionButton}
                            />
                        </>
                    )}

                    {/* FORGOT PASSWORD SCREEN */}
                    {screen === 'forgot' && (
                        <>
                            {forgotStep === 'request' && (
                                <>
                                    <View style={styles.forgotInfo}>
                                        <MaterialCommunityIcons name="lock-reset" size={48} color="#007AFF" />
                                        <Text style={styles.forgotInfoText}>
                                            Nhập email hoặc số điện thoại để nhận mã OTP khôi phục mật khẩu
                                        </Text>
                                    </View>

                                    <View style={styles.formContainer}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Email hoặc Số điện thoại</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={forgotData.contact}
                                                onChangeText={(text) => {
                                                    setForgotData({ 
                                                        ...forgotData, 
                                                        contact: text,
                                                        method: text.includes('@') ? 'email' : 'phone'
                                                    });
                                                }}
                                                placeholder="Nhập email hoặc số điện thoại"
                                                keyboardType={forgotData.contact.includes('@') ? 'email-address' : 'phone-pad'}
                                            />
                                            <Text style={styles.inputHint}>
                                                OTP sẽ được gửi qua: {forgotData.method === 'email' ? '📧 Email' : '📱 SMS'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Button
                                        title="Gửi mã OTP"
                                        onPress={handleForgotRequest}
                                        loading={loading}
                                        style={styles.actionButton}
                                    />
                                </>
                            )}

                            {forgotStep === 'verify' && (
                                <>
                                    <View style={styles.forgotInfo}>
                                        <MaterialCommunityIcons name="message-processing" size={48} color="#007AFF" />
                                        <Text style={styles.forgotInfoText}>
                                            Mã OTP đã được gửi đến {forgotData.contact}
                                        </Text>
                                        <Text style={styles.forgotSubText}>
                                            Vui lòng kiểm tra {forgotData.method === 'email' ? 'email' : 'tin nhắn'} và nhập mã OTP
                                        </Text>
                                    </View>

                                    <View style={styles.formContainer}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Mã OTP</Text>
                                            <TextInput
                                                style={[styles.textInput, styles.otpInput]}
                                                value={forgotData.otp}
                                                onChangeText={(text) => setForgotData({ ...forgotData, otp: text })}
                                                placeholder="Nhập mã OTP (Demo: 123456)"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                            />
                                        </View>
                                    </View>

                                    <Button
                                        title="Xác thực OTP"
                                        onPress={handleForgotVerify}
                                        loading={loading}
                                        style={styles.actionButton}
                                    />

                                    <TouchableOpacity 
                                        style={styles.backButton}
                                        onPress={() => setForgotStep('request')}
                                    >
                                        <Text style={styles.backButtonText}>← Quay lại</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {forgotStep === 'reset' && (
                                <>
                                    <View style={styles.forgotInfo}>
                                        <MaterialCommunityIcons name="lock-open" size={48} color="#4CAF50" />
                                        <Text style={styles.forgotInfoText}>
                                            OTP chính xác! Bây giờ bạn có thể đặt mật khẩu mới
                                        </Text>
                                    </View>

                                    <View style={styles.formContainer}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={forgotData.newPassword}
                                                onChangeText={(text) => setForgotData({ ...forgotData, newPassword: text })}
                                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                                secureTextEntry={!showPassword}
                                            />
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={forgotData.confirmNewPassword}
                                                onChangeText={(text) => setForgotData({ ...forgotData, confirmNewPassword: text })}
                                                placeholder="Nhập lại mật khẩu mới"
                                                secureTextEntry={!showPassword}
                                            />
                                        </View>
                                    </View>

                                    <Button
                                        title="Đặt lại mật khẩu"
                                        onPress={handlePasswordReset}
                                        loading={loading}
                                        style={styles.actionButton}
                                    />
                                </>
                            )}

                            <TouchableOpacity 
                                style={styles.backToLoginButton}
                                onPress={() => {
                                    setScreen('login');
                                    setForgotStep('request');
                                }}
                            >
                                <Text style={styles.backToLoginText}>← Quay lại đăng nhập</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Loading Overlay */}
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <Loader />
                            <Text style={styles.loadingText}>Đang xử lý...</Text>
                        </View>
                    )}
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
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
    screenNavContainer: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    screenNavButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    screenNavButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    screenNavText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    screenNavTextActive: {
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
        gap: 8,
    },
    demoButton: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    demoButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#495057',
    },
    roleContainer: {
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
    roleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e9ecef',
        alignItems: 'center',
        gap: 8,
    },
    roleButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    roleButtonTextActive: {
        color: '#007AFF',
    },
    roleButtonDesc: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    forgotInfo: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    forgotInfoText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    forgotSubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    formContainer: {
        gap: 20,
        marginBottom: 24,
    },
    inputContainer: {
        gap: 8,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4,
    },
    inputHint: {
        fontSize: 12,
        color: '#007AFF',
        marginLeft: 4,
        fontStyle: 'italic',
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
    otpInput: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    forgotLink: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    forgotText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
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
        marginBottom: 16,
    },
    backButton: {
        alignSelf: 'center',
        paddingVertical: 12,
    },
    backButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    backToLoginButton: {
        alignSelf: 'center',
        paddingVertical: 16,
    },
    backToLoginText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});
